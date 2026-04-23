import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export function RequestUpdate() {
  const teams = useQuery(api.updates.getLatestForAllTeams);
  const allTags = useQuery(api.tags.list);
  const allTeamTags = useQuery(api.tags.getAllTeamTags);
  const pendingRequests = useQuery(api.updateRequests.getUnresolved);
  const createRequest = useMutation(api.updateRequests.create);
  const cancelRequest = useMutation(api.updateRequests.cancel);
  const sendReminders = useMutation(api.updateRequests.sendReminders);
  const { toast } = useToast();

  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [sending, setSending] = useState(false);
  const [reminding, setReminding] = useState<null | "all" | "overdue">(null);

  if (!teams || !allTags || !allTeamTags || pendingRequests === undefined) {
    return (
      <div className="container py-8">
        <p className="text-ink/55">Loading…</p>
      </div>
    );
  }

  const tagById = new Map(allTags.map((t) => [t._id as string, t]));
  const tagMap = new Map<string, Doc<"tags">[]>();
  for (const tt of allTeamTags) {
    const tag = tagById.get(tt.tagId as string);
    if (!tag) continue;
    const existing = tagMap.get(tt.teamId as string) ?? [];
    existing.push(tag);
    tagMap.set(tt.teamId as string, existing);
  }

  const filteredTeams =
    selectedTagIds.size === 0
      ? teams
      : teams.filter(({ team }) => {
          const teamTags = tagMap.get(team._id as string) ?? [];
          return teamTags.some((t) => selectedTagIds.has(t._id as string));
        });

  const allFilteredSelected =
    filteredTeams.length > 0 &&
    filteredTeams.every(({ team }) => selectedTeamIds.has(team._id as string));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      const next = new Set(selectedTeamIds);
      for (const { team } of filteredTeams) next.delete(team._id as string);
      setSelectedTeamIds(next);
    } else {
      const next = new Set(selectedTeamIds);
      for (const { team } of filteredTeams) next.add(team._id as string);
      setSelectedTeamIds(next);
    }
  }

  function toggleTag(tagId: string) {
    const next = new Set(selectedTagIds);
    if (next.has(tagId)) next.delete(tagId);
    else next.add(tagId);
    setSelectedTagIds(next);
  }

  function toggleTeam(teamId: string) {
    const next = new Set(selectedTeamIds);
    if (next.has(teamId)) next.delete(teamId);
    else next.add(teamId);
    setSelectedTeamIds(next);
  }

  async function handleSend() {
    if (selectedTeamIds.size === 0 || !title.trim()) return;
    setSending(true);
    try {
      await createRequest({
        teamIds: [...selectedTeamIds] as Id<"users">[],
        title: title.trim(),
        message: message.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate + "T00:00:00").getTime() : undefined,
      });
      toast({ title: `Request sent to ${selectedTeamIds.size} team(s)` });
      setSelectedTeamIds(new Set());
      setTitle("");
      setMessage("");
      setDueDate("");
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  async function handleRemind(onlyOverdue: boolean) {
    const mode = onlyOverdue ? "overdue" : "all";
    const confirmMsg = onlyOverdue
      ? "Send a reminder email to every team with overdue requests?"
      : "Send a reminder email to every team with open requests?";
    if (!window.confirm(confirmMsg)) return;

    setReminding(mode);
    try {
      const result = await sendReminders({ onlyOverdue });
      if (result.teamsEmailed === 0) {
        toast({
          title: "No reminders sent",
          description:
            result.pendingTeams === 0
              ? "There are no teams with pending requests."
              : `Skipped ${result.teamsSkipped} team(s) without an email address.`,
        });
      } else {
        toast({
          title: `Reminded ${result.teamsEmailed} team${result.teamsEmailed === 1 ? "" : "s"}`,
          description:
            result.teamsSkipped > 0
              ? `${result.teamsSkipped} team(s) skipped — no email on file.`
              : undefined,
        });
      }
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setReminding(null);
    }
  }

  async function handleCancel(requestId: Id<"updateRequests">) {
    try {
      await cancelRequest({ requestId });
      toast({ title: "Request cancelled" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  }

  const canSend = selectedTeamIds.size > 0 && title.trim().length > 0;

  return (
    <div className="container max-w-3xl space-y-6 py-8">
      {/* Breadcrumb + title */}
      <div>
        <div className="mb-1 flex items-center gap-1.5 text-[11px] text-ink/55">
          <span className="font-mono uppercase tracking-[0.14em]">Admin</span>
          <span className="opacity-40">/</span>
          <span className="font-mono uppercase tracking-[0.14em] text-ink-deep">
            Request update
          </span>
        </div>
        <h2 className="font-display text-2xl tracking-tight text-ink-deep">
          Request an update
        </h2>
        <p className="mt-1 text-[13px] text-ink/60">
          Send a request to one or more teams. They'll be nudged until they
          submit an update or a SEP commit.
        </p>
      </div>

      {/* Compose */}
      <div className="rounded-lg border border-ink/15 bg-cream-paper shadow-sm">
        <div className="border-b border-ink/10 bg-cream-warm/40 px-4 py-2.5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55">
            Compose
          </span>
        </div>
        <div className="space-y-4 px-4 py-4">
          <FieldLabel label="Title" required>
            <Input
              placeholder="e.g. Week 3 Update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 border-ink/20 bg-cream-paper/70 text-ink-deep placeholder:text-ink/40 focus-visible:ring-ink/30"
              maxLength={80}
            />
          </FieldLabel>
          <FieldLabel label="Message (optional)">
            <Textarea
              placeholder="Context to include with the request…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="border-ink/20 bg-cream-paper/70 text-ink-deep placeholder:text-ink/40 focus-visible:ring-ink/30"
            />
          </FieldLabel>
          <FieldLabel label="Due date (optional)">
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 w-[200px] border-ink/20 bg-cream-paper/70 text-ink-deep focus-visible:ring-ink/30"
            />
          </FieldLabel>
        </div>
      </div>

      {/* Recipients */}
      <div className="rounded-lg border border-ink/15 bg-cream-paper shadow-sm">
        <div className="flex items-center justify-between border-b border-ink/10 bg-cream-warm/40 px-4 py-2.5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55">
            Recipients
          </span>
          <span className="font-mono text-[10px] text-ink/45">
            {selectedTeamIds.size} of {filteredTeams.length} selected
          </span>
        </div>

        {/* Tag filter chips */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 px-4 py-3">
            <span className="mr-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink/55">
              Filter by tag
            </span>
            {allTags.map((tag) => {
              const active = selectedTagIds.has(tag._id as string);
              return (
                <button
                  key={tag._id as string}
                  type="button"
                  onClick={() => toggleTag(tag._id as string)}
                  className={cn(
                    "inline-flex h-7 items-center rounded-full border px-3 text-[12px] font-medium transition-colors",
                    active
                      ? "border-ink bg-ink text-cream-paper"
                      : "border-ink/15 bg-cream-paper text-ink/70 hover:border-ink/30 hover:bg-ink/5 hover:text-ink-deep"
                  )}
                >
                  {tag.name}
                </button>
              );
            })}
            {selectedTagIds.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTagIds(new Set())}
                className="inline-flex h-7 items-center rounded-full border border-vermilion/40 px-3 text-[12px] font-medium text-vermilion hover:bg-vermilion/10"
              >
                Clear ×
              </button>
            )}
          </div>
        )}

        {/* Select all + team list */}
        <div className="flex items-center justify-between px-4 py-2 text-[11.5px] text-ink/55">
          <span>
            {filteredTeams.length} team{filteredTeams.length === 1 ? "" : "s"}{" "}
            matching
          </span>
          {filteredTeams.length > 0 && (
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAll}
                className="h-3.5 w-3.5 cursor-pointer accent-ink"
              />
              <span className="font-medium text-ink-deep">Select all</span>
            </label>
          )}
        </div>

        <ul className="divide-y divide-ink/10">
          {filteredTeams.length === 0 ? (
            <li className="px-4 py-8 text-center text-[13px] text-ink/55">
              No teams match the selected filter.
            </li>
          ) : (
            filteredTeams.map(({ team }) => {
              const checked = selectedTeamIds.has(team._id as string);
              const teamTags = tagMap.get(team._id as string) ?? [];
              return (
                <li key={team._id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors",
                      checked
                        ? "bg-sage/10 hover:bg-sage/15"
                        : "hover:bg-ink/[0.025]"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTeam(team._id as string)}
                      className="h-3.5 w-3.5 cursor-pointer accent-sage"
                    />
                    <span className="text-[13px] font-semibold text-ink-deep">
                      {team.teamName ?? team.name ?? "Unnamed team"}
                    </span>
                    <div className="ml-auto flex flex-wrap gap-1">
                      {teamTags.map((tag) => (
                        <span
                          key={tag._id as string}
                          className="inline-flex h-5 items-center rounded-full border border-ink/15 bg-cream-warm/60 px-2 text-[10.5px] font-medium text-ink/70"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </label>
                </li>
              );
            })
          )}
        </ul>

        {/* Send action row */}
        <div className="flex items-center justify-between gap-3 border-t border-ink/10 bg-cream-warm/25 px-4 py-3">
          <span className="text-[12px] text-ink/60">
            {!title.trim()
              ? "Add a title above to continue."
              : selectedTeamIds.size === 0
              ? "Pick at least one team."
              : `Ready to send to ${selectedTeamIds.size} team${
                  selectedTeamIds.size === 1 ? "" : "s"
                }.`}
          </span>
          <Button
            onClick={() => void handleSend()}
            disabled={!canSend || sending}
            className="h-9 bg-ink text-cream-paper hover:bg-ink-deep disabled:opacity-50"
          >
            {sending
              ? "Sending…"
              : `Send request${
                  selectedTeamIds.size > 0 ? ` · ${selectedTeamIds.size}` : ""
                }`}
          </Button>
        </div>
      </div>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (() => {
        const nowMs = Date.now();
        const overdueTeamIds = new Set(
          pendingRequests
            .filter((r) => r.dueDate !== undefined && r.dueDate < nowMs)
            .map((r) => r.teamId as string)
        );
        const pendingTeamIds = new Set(
          pendingRequests.map((r) => r.teamId as string)
        );
        return (
        <div className="rounded-lg border border-ink/15 bg-cream-paper shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-cream-warm/40 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55">
                Pending requests
              </span>
              <span className="font-mono text-[10px] text-ink/45">
                {pendingRequests.length} open · {pendingTeamIds.size} team
                {pendingTeamIds.size === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {overdueTeamIds.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleRemind(true)}
                  disabled={reminding !== null}
                  className="h-7 border-vermilion/40 px-3 text-[11.5px] text-vermilion hover:bg-vermilion/10 hover:text-vermilion-deep"
                >
                  {reminding === "overdue"
                    ? "Sending…"
                    : `Remind overdue · ${overdueTeamIds.size}`}
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => void handleRemind(false)}
                disabled={reminding !== null}
                className="h-7 bg-ink px-3 text-[11.5px] text-cream-paper hover:bg-ink-deep disabled:opacity-50"
              >
                {reminding === "all"
                  ? "Sending…"
                  : `Remind all · ${pendingTeamIds.size}`}
              </Button>
            </div>
          </div>
          <ul className="divide-y divide-ink/10">
            {pendingRequests.map((req) => {
              const isOverdue =
                req.dueDate !== undefined && req.dueDate < Date.now();
              return (
                <li
                  key={req._id}
                  className="flex items-start justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-semibold text-ink-deep">
                        {req.team?.teamName ?? req.team?.name ?? "Unknown team"}
                      </span>
                      <span className="text-ink/30">·</span>
                      <span className="text-[13px] text-ink/75">
                        {req.title}
                      </span>
                      {isOverdue && (
                        <span className="inline-flex h-5 items-center rounded-full border border-vermilion/40 bg-vermilion/10 px-2 text-[10px] font-medium text-vermilion">
                          Overdue
                        </span>
                      )}
                    </div>
                    {req.message && (
                      <p className="mt-0.5 text-[12px] text-ink/55">
                        {req.message}
                      </p>
                    )}
                    <p className="mt-0.5 font-mono text-[10.5px] text-ink/45">
                      Requested{" "}
                      {new Date(req.requestedAt).toLocaleDateString("en-SG", {
                        month: "short",
                        day: "numeric",
                      })}
                      {req.dueDate && (
                        <>
                          {" · Due "}
                          {new Date(req.dueDate).toLocaleDateString("en-SG", {
                            month: "short",
                            day: "numeric",
                          })}
                        </>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleCancel(req._id)}
                    className="h-7 flex-shrink-0 border-vermilion/40 px-3 text-[11.5px] text-vermilion hover:bg-vermilion/10 hover:text-vermilion-deep"
                  >
                    Cancel
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
        );
      })()}
    </div>
  );
}

function FieldLabel({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55">
        {label}
        {required && <span className="ml-1 text-vermilion">*</span>}
      </span>
      {children}
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Cross2Icon,
  Pencil1Icon,
  CheckIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export function AdminTagManagement() {
  const tags = useQuery(api.tags.list);
  const teamTags = useQuery(api.tags.getAllTeamTags);
  const teams = useQuery(api.users.listTeams);
  const createTag = useMutation(api.tags.create);
  const renameTag = useMutation(api.tags.rename);
  const removeTag = useMutation(api.tags.remove);
  const assignToTeam = useMutation(api.tags.assignToTeam);
  const removeFromTeam = useMutation(api.tags.removeFromTeam);
  const { toast } = useToast();

  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<Id<"tags"> | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [teamSearch, setTeamSearch] = useState("");

  const usageByTag = new Map<string, number>();
  const assignedKey = (tagId: string, teamId: string) => `${tagId}:${teamId}`;
  const assignedSet = new Set<string>();
  if (teamTags) {
    for (const tt of teamTags) {
      const tagId = tt.tagId as string;
      usageByTag.set(tagId, (usageByTag.get(tagId) ?? 0) + 1);
      assignedSet.add(assignedKey(tagId, tt.teamId as string));
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newTagName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await createTag({ name });
      setNewTagName("");
      toast({ title: "Tag created" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (tagId: Id<"tags">) => {
    const name = editName.trim();
    if (!name) return;
    try {
      await renameTag({ tagId, name });
      setEditingId(null);
      toast({ title: "Tag renamed" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removeTag({ tagId: deleteId });
      toast({ title: "Tag deleted" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
    setDeleteId(null);
  };

  const handleToggleAssignment = async (
    tagId: Id<"tags">,
    teamId: Id<"users">,
    isAssigned: boolean
  ) => {
    try {
      if (isAssigned) {
        await removeFromTeam({ tagId, teamId });
      } else {
        await assignToTeam({ tagId, teamId });
      }
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  };

  const toggleExpanded = (tagId: string) => {
    setExpandedId((prev) => (prev === tagId ? null : tagId));
    setTeamSearch("");
  };

  const deletingTag = tags?.find((t) => t._id === deleteId);
  const deletingUsage = deleteId ? usageByTag.get(deleteId as string) ?? 0 : 0;

  return (
    <div className="container max-w-2xl space-y-6 py-8">
      {/* Breadcrumb + title */}
      <div>
        <div className="mb-1 flex items-center gap-1.5 text-[11px] text-ink/55">
          <span className="font-mono uppercase tracking-[0.14em]">Admin</span>
          <span className="opacity-40">/</span>
          <span className="font-mono uppercase tracking-[0.14em] text-ink-deep">
            Tags
          </span>
        </div>
        <h2 className="font-display text-2xl tracking-tight text-ink-deep">
          Manage Tags
        </h2>
        <p className="mt-1 text-[13px] text-ink/60">
          Tags group teams for filtering on the dashboard and for targeting
          update requests. Click a tag to assign it to teams.
        </p>
      </div>

      {/* Create new tag */}
      <div className="rounded-lg border border-ink/15 bg-cream-paper shadow-sm">
        <div className="border-b border-ink/10 bg-cream-warm/40 px-4 py-2.5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55">
            Create new tag
          </span>
        </div>
        <form
          onSubmit={(e) => void handleCreate(e)}
          className="flex items-center gap-2 px-4 py-4"
        >
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="e.g. ML, Design, Platform…"
            className="h-9 flex-1 border-ink/20 bg-cream-paper/70 text-ink-deep placeholder:text-ink/40 focus-visible:ring-ink/30"
            maxLength={40}
          />
          <Button
            type="submit"
            disabled={!newTagName.trim() || creating}
            className="h-9 bg-ink text-cream-paper hover:bg-ink-deep"
          >
            Create tag
          </Button>
        </form>
      </div>

      {/* Existing tags */}
      <div className="rounded-lg border border-ink/15 bg-cream-paper shadow-sm">
        <div className="flex items-center justify-between border-b border-ink/10 bg-cream-warm/40 px-4 py-2.5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55">
            All tags
          </span>
          <span className="font-mono text-[10px] text-ink/45">
            {tags === undefined ? "…" : `${tags.length} total`}
          </span>
        </div>

        {tags === undefined ? (
          <p className="px-4 py-8 text-center text-[13px] text-ink/55">
            Loading…
          </p>
        ) : tags.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-[13px] text-ink/55">No tags yet.</p>
            <p className="mt-1 text-[12px] text-ink/40">
              Create your first tag above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {tags.map((tag) => {
              const isEditing = editingId === (tag._id as string);
              const isExpanded = expandedId === (tag._id as string);
              const usage = usageByTag.get(tag._id as string) ?? 0;
              return (
                <li key={tag._id} className="group">
                  {/* Row header */}
                  <div
                    role={isEditing ? undefined : "button"}
                    tabIndex={isEditing ? undefined : 0}
                    aria-expanded={isEditing ? undefined : isExpanded}
                    onClick={
                      isEditing
                        ? undefined
                        : () => toggleExpanded(tag._id as string)
                    }
                    onKeyDown={
                      isEditing
                        ? undefined
                        : (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleExpanded(tag._id as string);
                            }
                          }
                    }
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors",
                      !isEditing &&
                        "cursor-pointer hover:bg-ink/[0.025] focus:bg-ink/[0.03] focus:outline-none",
                      isExpanded && "bg-ink/[0.02]"
                    )}
                  >
                    {isEditing ? (
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 flex-1 border-ink/25 bg-cream-paper/70 text-ink-deep focus-visible:ring-ink/30"
                          autoFocus
                          maxLength={40}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleRename(tag._id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-sage hover:bg-sage/10 hover:text-sage"
                          onClick={() => void handleRename(tag._id)}
                          title="Save"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-ink/55 hover:bg-ink/5 hover:text-ink-deep"
                          onClick={() => setEditingId(null)}
                          title="Cancel"
                        >
                          <Cross2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <ChevronDownIcon
                          className={cn(
                            "h-4 w-4 flex-shrink-0 text-ink/45 transition-transform",
                            isExpanded && "rotate-0",
                            !isExpanded && "-rotate-90"
                          )}
                        />
                        <span
                          className={cn(
                            "inline-flex h-7 items-center rounded-full border px-3 text-[12px] font-medium",
                            "border-ink/15 bg-cream-warm/60 text-ink-deep"
                          )}
                        >
                          {tag.name}
                        </span>
                        <span className="text-[11px] text-ink/50">
                          {usage === 0
                            ? "Unused"
                            : `Assigned to ${usage} team${usage === 1 ? "" : "s"}`}
                        </span>
                        <div
                          className="ml-auto flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-ink/60 hover:bg-ink/5 hover:text-ink-deep"
                            onClick={() => {
                              setEditingId(tag._id as string);
                              setEditName(tag.name);
                            }}
                            title="Rename"
                          >
                            <Pencil1Icon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-vermilion hover:bg-vermilion/10 hover:text-vermilion-deep"
                            onClick={() => setDeleteId(tag._id)}
                            title="Delete"
                          >
                            <Cross2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Accordion panel */}
                  {isExpanded && !isEditing && (
                    <AssignmentPanel
                      tagId={tag._id}
                      tagName={tag.name}
                      teams={teams}
                      teamTagsLoaded={teamTags !== undefined}
                      assignedSet={assignedSet}
                      search={teamSearch}
                      onSearch={setTeamSearch}
                      onToggle={(teamId, isAssigned) =>
                        void handleToggleAssignment(tag._id, teamId, isAssigned)
                      }
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="border-ink/15 bg-cream-paper">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-tight text-ink-deep">
              Delete tag
              {deletingTag && (
                <span className="ml-2 inline-flex h-6 items-center rounded-full border border-ink/15 bg-cream-warm/60 px-2.5 align-middle text-[12px] font-medium text-ink-deep">
                  {deletingTag.name}
                </span>
              )}
              ?
            </DialogTitle>
            <DialogDescription className="text-ink/65">
              {deletingUsage === 0
                ? "This tag is not assigned to any team. This action cannot be undone."
                : `This will remove the tag from ${deletingUsage} team${
                    deletingUsage === 1 ? "" : "s"
                  }. This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              className="border-ink/20 text-ink-deep hover:bg-ink/5"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-vermilion text-cream-paper hover:bg-vermilion-deep"
              onClick={() => void handleDelete()}
            >
              Delete tag
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type TeamDoc = NonNullable<
  ReturnType<typeof useQuery<typeof api.users.listTeams>>
>[number];

function AssignmentPanel({
  tagId,
  tagName,
  teams,
  teamTagsLoaded,
  assignedSet,
  search,
  onSearch,
  onToggle,
}: {
  tagId: Id<"tags">;
  tagName: string;
  teams: TeamDoc[] | undefined;
  teamTagsLoaded: boolean;
  assignedSet: Set<string>;
  search: string;
  onSearch: (s: string) => void;
  onToggle: (teamId: Id<"users">, isAssigned: boolean) => void;
}) {
  if (teams === undefined || !teamTagsLoaded) {
    return (
      <div className="border-t border-ink/10 bg-cream-warm/25 px-4 py-4 text-[12px] text-ink/55">
        Loading teams…
      </div>
    );
  }

  const filtered = teams.filter((t) => {
    if (!search.trim()) return true;
    const name = (t.teamName ?? t.name ?? t.email ?? "").toLowerCase();
    return name.includes(search.trim().toLowerCase());
  });

  return (
    <div className="border-t border-ink/10 bg-cream-warm/25 px-4 py-3">
      <div className="mb-2.5 flex items-center gap-3">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55">
          Assign to teams
        </span>
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search teams…"
          className="ml-auto h-7 w-44 border-ink/15 bg-cream-paper text-[12px] text-ink-deep placeholder:text-ink/40 focus-visible:ring-ink/30"
        />
      </div>

      {teams.length === 0 ? (
        <p className="py-3 text-center text-[12px] text-ink/50">
          No teams yet.
        </p>
      ) : filtered.length === 0 ? (
        <p className="py-3 text-center text-[12px] text-ink/50">
          No teams match “{search}”.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {filtered.map((team) => {
            const name =
              team.teamName ?? team.name ?? team.email ?? "Unnamed team";
            const isAssigned = assignedSet.has(
              `${tagId as string}:${team._id as string}`
            );
            return (
              <li key={team._id as string}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors",
                    isAssigned
                      ? "border-sage/40 bg-sage/10 text-ink-deep hover:bg-sage/15"
                      : "border-ink/10 bg-cream-paper text-ink-deep/80 hover:border-ink/25 hover:bg-ink/[0.03]"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isAssigned}
                    onChange={() => onToggle(team._id, isAssigned)}
                    className="h-3.5 w-3.5 cursor-pointer accent-sage"
                    aria-label={`Assign ${tagName} to ${name}`}
                  />
                  <span className="truncate text-[12.5px] font-medium">
                    {name}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

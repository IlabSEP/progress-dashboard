import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { UpdateCard } from "@/components/UpdateCard";
import { TagSelector } from "@/components/TagSelector";
import { CommitList } from "@/components/CommitList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Id } from "../../../convex/_generated/dataModel";

export function AdminTeamDetail() {
  const { teamId } = useParams<{ teamId: string }>();
  const team = useQuery(
    api.users.getTeam,
    teamId ? { teamId: teamId as Id<"users"> } : "skip"
  );
  const updates = useQuery(
    api.updates.listByTeam,
    teamId ? { teamId: teamId as Id<"users"> } : "skip"
  );
  const nameHistory = useQuery(
    api.users.getTeamNameHistory,
    teamId ? { teamId: teamId as Id<"users"> } : "skip"
  );
  const profileImageUrl = useQuery(
    api.files.getImageUrl,
    team?.profileImage ? { storageId: team.profileImage } : { storageId: undefined }
  );
  const unlockMutation = useMutation(api.updates.unlock);
  const deleteUserMutation = useMutation(api.users.deleteUser);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!team || updates === undefined) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const latestUpdate = updates.length > 0 ? updates[0] : null;
  const olderUpdates = updates.slice(1);

  const handleUnlock = async (updateId: Id<"updates">) => {
    try {
      await unlockMutation({ updateId });
      toast({ title: "Update unlocked" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUserMutation({ userId: team._id });
      toast({ title: `${team.teamName ?? "Team"} removed` });
      navigate("/admin");
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
      setDeleting(false);
    }
  };

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <Button variant="outline" asChild>
        <Link to="/admin">Back to Dashboard</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Team profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg text-muted-foreground">
                  {(team.teamName ?? team.name ?? "T").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <CardTitle>{team.teamName ?? "Unnamed Team"}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {team.email ?? "No email"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {team.website && (
            <div>
              <h4 className="text-sm font-medium mb-1">Website</h4>
              <a
                href={team.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {team.website}
              </a>
            </div>
          )}
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-2">Tags</h4>
            <TagSelector teamId={team._id} />
          </div>
          {nameHistory && nameHistory.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Name History</h4>
                <div className="space-y-1">
                  {[...nameHistory]
                    .sort((a, b) => b.changedAt - a.changedAt)
                    .map((entry) => (
                      <div key={entry._id} className="text-sm text-muted-foreground">
                        <span className="line-through">{entry.oldName}</span>
                        {" → "}
                        <span>{entry.newName}</span>
                        <span className="text-xs ml-2">
                          ({new Date(entry.changedAt).toLocaleDateString()})
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {team.githubRepoUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">GitHub Commits</h3>
            <a
              href={team.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {team.githubRepoUrl}
            </a>
          </div>
          <CommitList teamId={team._id} limit={20} />
        </div>
      )}

      {latestUpdate && (
        <>
          <h3 className="text-lg font-medium">Latest Update</h3>
          <UpdateCard
            update={latestUpdate}
            actions={
              latestUpdate.isLocked ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnlock(latestUpdate._id)}
                >
                  Unlock for Editing
                </Button>
              ) : (
                <Badge variant="outline">Unlocked</Badge>
              )
            }
          />
        </>
      )}

      {!latestUpdate && (
        <p className="text-muted-foreground">No updates submitted by this team.</p>
      )}

      {olderUpdates.length > 0 && (
        <>
          <Separator />
          <h3 className="text-lg font-medium">Update History</h3>
          <div className="space-y-4">
            {olderUpdates.map((update) => (
              <UpdateCard
                key={update._id}
                update={update}
                actions={
                  update.isLocked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnlock(update._id)}
                    >
                      Unlock
                    </Button>
                  ) : (
                    <Badge variant="outline">Unlocked</Badge>
                  )
                }
              />
            ))}
          </div>
        </>
      )}

      <section className="mt-12 space-y-5">
        <div className="border-b border-vermilion/30 pb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-vermilion">
            Danger zone
          </p>
          <h2 className="font-display mt-1 text-2xl italic text-ink-deep">
            Remove this team.
          </h2>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-vermilion/30 bg-vermilion-soft/40 p-6">
          <p className="max-w-md text-sm text-ink/75">
            Permanently delete this team's account, updates, commits,
            requests, and uploaded files.{" "}
            <span className="font-display italic text-vermilion-deep">
              This cannot be undone.
            </span>
          </p>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-sm bg-vermilion px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-cream-paper transition-colors hover:bg-vermilion-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove team →
          </button>
        </div>
      </section>

      <Dialog open={confirmOpen} onOpenChange={(o) => !deleting && setConfirmOpen(o)}>
        <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl border-ink/20 bg-cream-paper p-0 sm:rounded-2xl">
          <div className="px-8 pt-8 pb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-vermilion">
              Confirm removal
            </p>
            <DialogTitle className="font-display mt-2 text-2xl italic text-ink-deep">
              Remove {team.teamName ?? "this team"}?
            </DialogTitle>
            <DialogDescription className="mt-3 text-sm text-ink/70">
              This permanently deletes the team account, all submitted
              updates, GitHub commit history, update requests, and uploaded
              files. This action cannot be undone.
            </DialogDescription>
          </div>
          <DialogFooter className="flex items-center justify-end gap-2 border-t border-ink/15 bg-cream/40 px-8 py-4 sm:justify-end">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
              className="rounded-md border border-ink/25 bg-transparent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-deep transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md bg-vermilion px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-cream-paper transition-colors hover:bg-vermilion-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Removing…" : "Yes, remove team"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

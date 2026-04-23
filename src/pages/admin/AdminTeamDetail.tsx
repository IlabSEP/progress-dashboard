import { useQuery, useMutation } from "convex/react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { UpdateCard } from "@/components/UpdateCard";
import { TagSelector } from "@/components/TagSelector";
import { CommitList } from "@/components/CommitList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  const { toast } = useToast();

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
    </div>
  );
}

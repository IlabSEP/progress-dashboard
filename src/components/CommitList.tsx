import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";

export function CommitList({
  teamId,
  limit,
}: {
  teamId?: Id<"users">;
  limit?: number;
}) {
  const commits = useQuery(api.githubWebhook.listByTeam, {
    teamId,
    limit,
  });

  if (commits === undefined) {
    return <p className="text-sm text-muted-foreground">Loading commits...</p>;
  }

  if (commits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No commits recorded yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {commits.map((commit) => {
        const isSep = commit.message.trim().toLowerCase().startsWith("sep:");
        return (
          <div
            key={commit._id}
            className="flex items-start gap-3 rounded-md border p-3 text-sm"
          >
            <a
              href={commit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-blue-600 hover:underline shrink-0"
            >
              {commit.sha.slice(0, 7)}
            </a>
            <Badge variant="outline" className="shrink-0 text-xs">
              {commit.branch}
            </Badge>
            {isSep && (
              <Badge
                variant="outline"
                className="shrink-0 text-xs border-blue-500 text-blue-600"
              >
                SEP
              </Badge>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate">{commit.message.split("\n")[0]}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {commit.author} &middot;{" "}
                {new Date(commit.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

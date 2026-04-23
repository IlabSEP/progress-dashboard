import { useQuery } from "convex/react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

export function AdminViewCommit() {
  const { commitId } = useParams<{ commitId: string }>();
  const commit = useQuery(
    api.githubWebhook.getById,
    commitId ? { commitId: commitId as Id<"githubCommitEvents"> } : "skip"
  );

  if (commit === undefined) {
    return (
      <div className="container max-w-3xl py-8">
        <p className="text-ink/55">Loading...</p>
      </div>
    );
  }

  if (!commit) {
    return (
      <div className="container max-w-3xl py-8">
        <p>Commit not found.</p>
      </div>
    );
  }

  const occurredAt = new Date(commit.timestamp);
  const shortSha = commit.sha.slice(0, 7);

  return (
    <div className="container max-w-3xl py-8 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" asChild>
          <Link to="/admin/timelines">Back to Timelines</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/admin/team/${commit.teamId}`}>View Team</Link>
        </Button>
      </div>

      <div className="rounded-lg border border-ink/15 bg-cream-paper p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">
              SEP Commit · {commit.teamName}
            </div>
            <h2 className="font-display text-xl tracking-tight text-ink-deep">
              <span className="font-mono text-[0.9em]">{shortSha}</span>
            </h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={commit.url} target="_blank" rel="noreferrer">
              Open on GitHub ↗
            </a>
          </Button>
        </div>

        <pre className="whitespace-pre-wrap break-words rounded-md border border-ink/10 bg-cream/50 p-4 font-mono text-[13px] leading-relaxed text-ink-deep">
{commit.message}
        </pre>

        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-2">
          <Field label="Author" value={commit.author} />
          <Field
            label="Timestamp"
            value={occurredAt.toLocaleString("en-SG", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          />
          <Field label="Repository" value={commit.repo} mono />
          <Field label="Branch" value={commit.branch} mono />
        </dl>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55">
        {label}
      </dt>
      <dd
        className={
          "mt-0.5 text-ink-deep " + (mono ? "font-mono text-[12px]" : "")
        }
      >
        {value}
      </dd>
    </div>
  );
}

import { useQuery } from "convex/react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { UpdateCard } from "@/components/UpdateCard";
import { Button } from "@/components/ui/button";
import { Id } from "../../../convex/_generated/dataModel";

export function ViewUpdate() {
  const { updateId } = useParams<{ updateId: string }>();
  const update = useQuery(
    api.updates.getById,
    updateId ? { updateId: updateId as Id<"updates"> } : "skip"
  );

  if (update === undefined) {
    return (
      <div className="container max-w-3xl px-6 py-12 text-ink-deep">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink/50">
          Loading record…
        </p>
      </div>
    );
  }

  if (!update) {
    return (
      <div className="container max-w-3xl px-6 py-12 text-ink-deep">
        <p className="font-display text-2xl italic">Record not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-cream-paper text-ink-deep">
      <div className="paper-texture">
        <div className="container max-w-3xl px-6 py-12 space-y-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55 hover:text-vermilion transition-colors"
          >
            ← Back to the dashboard
          </Link>
          <header className="border-b-2 border-ink pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/60">
              Field Report · Single Entry
            </p>
          </header>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-vermilion">
              Filed entry
            </p>
            <h1 className="font-display mt-1 text-4xl italic leading-tight text-ink-deep">
              {new Date(update.submissionDate).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h1>
          </div>
          <UpdateCard
            update={update}
            actions={
              !update.isLocked ? (
                <Button
                  asChild
                  className="bg-vermilion text-cream-paper hover:bg-vermilion-deep font-mono text-[11px] uppercase tracking-[0.22em]"
                >
                  <Link to="/dashboard/submit">Edit entry</Link>
                </Button>
              ) : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}

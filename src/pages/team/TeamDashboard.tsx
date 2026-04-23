import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UpdateRequestBanner } from "@/components/UpdateRequestBanner";
import { GithubSetupBanner } from "@/components/GithubSetupBanner";
import { UpdateTimeline } from "@/components/UpdateTimeline";
import { Link } from "react-router-dom";

function daysBetween(a: number, b: number) {
  return Math.floor(Math.abs(a - b) / (1000 * 60 * 60 * 24));
}

function formatShortDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLongDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function issueNumber(ts: number) {
  const start = new Date(new Date(ts).getFullYear(), 0, 0);
  const diff = ts - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  return String(day).padStart(3, "0");
}

export function TeamDashboard() {
  const user = useQuery(api.users.viewer);
  const timeline = useQuery(api.updates.getTimelineForMyTeam);
  const pendingRequests = useQuery(api.updateRequests.getMyPending);

  const now = Date.now();
  const teamName = user?.teamName ?? "Team";

  const submittedCount =
    timeline?.filter((i) => i.kind === "update").length ?? 0;
  const sepCount =
    timeline?.filter((i) => i.kind === "sepCommit").length ?? 0;
  const pendingCount = pendingRequests?.length ?? 0;
  const latestItem = timeline?.[0];
  const daysSinceLatest = latestItem
    ? daysBetween(now, latestItem.occurredAt)
    : null;

  return (
    <div className="bg-cream-paper text-ink-deep">
      <div className="paper-texture">
        <div className="container max-w-5xl px-6 py-12">
          {/* Masthead */}
          <header className="animate-rise" style={{ animationDelay: "40ms" }}>
            <div className="flex items-baseline justify-between gap-6 border-b-2 border-ink pb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/60">
                Field Report · Issue № {issueNumber(now)}
              </p>
              <p className="hidden font-mono text-[10px] uppercase tracking-[0.32em] text-ink/60 sm:block">
                {formatLongDate(now)}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-vermilion">
                  Good day,
                </p>
                <h1 className="font-display mt-1 text-5xl italic leading-[1.02] tracking-tight text-ink-deep sm:text-6xl">
                  {teamName}.
                </h1>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-ink/70">
                A standing record of what you&rsquo;ve filed, what&rsquo;s been
                asked of you, and the work that speaks for itself.
              </p>
            </div>
          </header>

          {/* Status Ledger */}
          <section
            className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-ink/20 bg-ink/20 sm:grid-cols-3 animate-rise"
            style={{ animationDelay: "120ms" }}
          >
            <LedgerCell
              label="Pending"
              value={String(pendingCount).padStart(2, "0")}
              caption={
                pendingCount === 0
                  ? "Nothing outstanding"
                  : "Awaiting response"
              }
              accent={pendingCount > 0}
            />
            <LedgerCell
              label="Submitted"
              value={String(submittedCount).padStart(2, "0")}
              caption={submittedCount === 1 ? "Full update" : "Full updates"}
            />
            <LedgerCell
              label="Last Filed"
              value={
                daysSinceLatest === null
                  ? "—"
                  : daysSinceLatest === 0
                    ? "Today"
                    : `${daysSinceLatest}d`
              }
              caption={
                latestItem
                  ? `Since ${formatShortDate(latestItem.occurredAt)}`
                  : "No filings on record"
              }
            />
          </section>

          {/* Pending Attention Zone */}
          <section
            className="mt-12 animate-rise"
            style={{ animationDelay: "200ms" }}
          >
            {pendingCount > 0 ? (
              <div>
                <SectionHeading
                  eyebrow="01 · Requires your attention"
                  title="The editors have asked for an update."
                  accent
                />
                <div className="mt-6">
                  <UpdateRequestBanner />
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-sm border border-ink/15 bg-cream p-8">
                <div className="absolute inset-y-0 left-0 w-1 bg-sage" />
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sage">
                  01 · All caught up
                </p>
                <p className="font-display mt-2 text-2xl italic text-ink-deep">
                  No outstanding requests. Steady work.
                </p>
                <p className="mt-1 text-sm text-ink/65">
                  You&rsquo;ll be notified here the moment something is asked of
                  you.
                </p>
              </div>
            )}
          </section>

          {/* GitHub nudge — subtler footnote when repo not connected */}
          {user && !user.githubRepoUrl && (
            <section
              className="mt-6 animate-rise"
              style={{ animationDelay: "260ms" }}
            >
              <GithubSetupBanner />
            </section>
          )}

          {/* Timeline (full) */}
          <section
            className="mt-14 animate-rise"
            style={{ animationDelay: "320ms" }}
          >
            <SectionHeading
              eyebrow="02 · The ledger"
              title="Every entry on record, newest first."
            />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/50">
                {sepCount} SEP commit{sepCount === 1 ? "" : "s"} ·{" "}
                {submittedCount} formal update{submittedCount === 1 ? "" : "s"}
              </p>
              <Link
                to="/dashboard/submit"
                className="inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-cream-paper transition-colors hover:bg-ink-deep"
              >
                + File a new update
              </Link>
            </div>

            <div className="mt-8">
              <UpdateTimeline />
            </div>
          </section>

          <footer
            className="mt-20 border-t border-ink/15 pt-6 animate-fade-in"
            style={{ animationDelay: "600ms" }}
          >
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.32em] text-ink/40">
              Innovation Lab · NTU CCDS · Published from the dashboard press
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function LedgerCell({
  label,
  value,
  caption,
  accent,
}: {
  label: string;
  value: string;
  caption: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-cream-paper px-6 py-7">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55">
        {label}
      </p>
      <p
        className={`font-display mt-3 text-[56px] leading-none tracking-tight ${
          accent ? "text-vermilion" : "text-ink-deep"
        }`}
      >
        {value}
      </p>
      <p
        className={`mt-3 text-sm ${accent ? "text-vermilion-deep" : "text-ink/60"}`}
      >
        {caption}
      </p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  accent,
}: {
  eyebrow: string;
  title: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/20 pb-3">
      <div>
        <p
          className={`font-mono text-[10px] uppercase tracking-[0.28em] ${
            accent ? "text-vermilion" : "text-ink/55"
          }`}
        >
          {eyebrow}
        </p>
        <h2 className="font-display mt-1 text-2xl italic text-ink-deep">
          {title}
        </h2>
      </div>
    </div>
  );
}

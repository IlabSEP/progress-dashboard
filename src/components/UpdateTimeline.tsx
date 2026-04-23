import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";

function stripSepPrefix(message: string): string {
  const firstLine = message.split("\n")[0].trim();
  if (firstLine.toLowerCase().startsWith("sep:")) {
    return firstLine.slice(4).trim();
  }
  return firstLine;
}

function formatDateLong(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function UpdateTimeline() {
  const items = useQuery(api.updates.getTimelineForMyTeam);

  if (items === undefined) {
    return (
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/50">
        Loading ledger…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-ink/30 bg-cream px-8 py-12 text-center">
        <p className="font-display text-2xl italic text-ink/70">
          The ledger is empty.
        </p>
        <p className="mt-3 text-sm text-ink/60">
          File an update, or push a commit prefixed with{" "}
          <code className="rounded-sm border border-ink/15 bg-cream-paper px-1.5 py-0.5 font-mono text-[11px] text-ink-deep">
            SEP:
          </code>{" "}
          to open your timeline.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative border-l-2 border-ink/20 pl-8">
      {items.map((item, idx) => {
        const isUpdate = item.kind === "update";
        const isLast = idx === items.length - 1;

        const dateLong = formatDateLong(item.occurredAt);
        const timeShort = formatTime(item.occurredAt);

        return (
          <li
            key={isUpdate ? item.update._id : item.commit._id}
            className={`relative ${isLast ? "" : "pb-8"}`}
          >
            {/* Dot on the rail */}
            <span
              className={`absolute -left-[41px] top-4 block h-3 w-3 rounded-full ring-4 ring-cream-paper ${
                isUpdate ? "bg-ink-deep" : "bg-vermilion"
              }`}
            />
            {/* Tiny date rail-tick */}
            <span className="absolute -left-[90px] top-3 hidden w-11 text-right font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45 md:block">
              {timeShort}
            </span>

            {isUpdate ? (
              <UpdateEntry
                id={item.update._id}
                dateLong={dateLong}
                isLocked={item.update.isLocked}
                preview={
                  item.update.writtenUpdate ||
                  item.update.githubCommits ||
                  item.update.videoUrl ||
                  "Documents only"
                }
              />
            ) : (
              <CommitEntry
                dateLong={dateLong}
                message={stripSepPrefix(item.commit.message)}
                author={item.commit.author}
                sha={item.commit.sha}
                url={item.commit.url}
                branch={item.commit.branch}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function UpdateEntry({
  id,
  dateLong,
  isLocked,
  preview,
}: {
  id: string;
  dateLong: string;
  isLocked: boolean;
  preview: string;
}) {
  return (
    <Link
      to={`/dashboard/update/${id}`}
      className="group block rounded-sm border border-ink/20 bg-cream-paper transition-colors hover:border-ink"
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-ink/10 px-5 py-3">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-ink/60">
            Filing
          </span>
          <span className="font-display truncate text-base italic text-ink-deep">
            {dateLong}
          </span>
        </div>
        <span
          className={`shrink-0 font-mono text-[9px] uppercase tracking-[0.24em] ${
            isLocked ? "text-sage" : "text-vermilion"
          }`}
        >
          {isLocked ? "Locked" : "Open"}
        </span>
      </div>
      <div className="px-5 py-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-ink/80">
          {preview}
        </p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40 transition-colors group-hover:text-vermilion">
          Open record →
        </p>
      </div>
    </Link>
  );
}

function CommitEntry({
  dateLong,
  message,
  author,
  sha,
  url,
  branch,
}: {
  dateLong: string;
  message: string;
  author: string;
  sha: string;
  url: string;
  branch: string;
}) {
  return (
    <article className="rounded-sm border border-ink/15 bg-cream">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/10 px-5 py-3">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-vermilion">
            SEP Commit
          </span>
          <span className="font-display truncate text-base italic text-ink-deep">
            {dateLong}
          </span>
        </div>
        <span className="shrink-0 rounded-sm border border-ink/20 bg-cream-paper px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/70">
          {branch}
        </span>
      </div>
      <div className="px-5 py-4 space-y-2">
        <p className="text-sm leading-relaxed text-ink/85">{message}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50">
          {author}
          <span className="px-2 text-ink/30">·</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-transparent text-ink-deep transition-colors hover:border-vermilion hover:text-vermilion"
          >
            {sha.slice(0, 7)}
          </a>
        </p>
      </div>
    </article>
  );
}

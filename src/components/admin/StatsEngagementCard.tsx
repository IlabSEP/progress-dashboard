import { cn } from "@/lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";

export type BucketKey = "0-14" | "15-30" | "31-60" | "60+" | "never";

type Bucket = {
  key: BucketKey;
  label: string;
  count: number;
  teamIds: Id<"users">[];
};

const COLORS: Record<BucketKey, string> = {
  "0-14": "bg-sage",
  "15-30": "bg-sage/70",
  "31-60": "bg-stone",
  "60+": "bg-vermilion/70",
  never: "bg-vermilion",
};

export function StatsEngagementCard({
  buckets,
  activeBucket,
  onBucketToggle,
  staleGithub,
}: {
  buckets: Bucket[];
  activeBucket: BucketKey | null;
  onBucketToggle: (key: BucketKey) => void;
  staleGithub: Array<{ teamId: Id<"users">; teamName: string; daysStale: number }>;
}) {
  const maxCount = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="rounded-lg border border-ink/15 bg-cream-paper p-5">
      <div className="mb-3 flex items-end justify-between">
        <h3 className="font-display text-lg text-ink-deep">Engagement</h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
          days since last update
        </p>
      </div>

      <div className="space-y-1.5">
        {buckets.map((b) => {
          const isActive = activeBucket === b.key;
          const widthPct = (b.count / maxCount) * 100;
          const disabled = b.count === 0;
          return (
            <button
              key={b.key}
              type="button"
              disabled={disabled}
              onClick={() => onBucketToggle(b.key)}
              className={cn(
                "group flex w-full items-center gap-3 rounded px-2 py-1.5 text-left transition-colors",
                !disabled && "hover:bg-ink/[0.04]",
                isActive && "bg-ink/5 ring-1 ring-ink/40",
                disabled && "opacity-55"
              )}
            >
              <span className="w-20 shrink-0 font-mono text-[11px] text-ink/70">
                {b.label}
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-ink/[0.05]">
                <div
                  className={cn("h-full rounded-sm transition-all", COLORS[b.key])}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-mono text-xs text-ink-deep">
                {b.count}
              </span>
            </button>
          );
        })}
      </div>

      {activeBucket && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55">
          Filter active · click again to clear
        </p>
      )}

      {staleGithub.length > 0 && (
        <div className="mt-4 border-t border-ink/10 pt-3">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
            Stale GitHub · no commit in 30+ days
          </p>
          <ul className="space-y-0.5">
            {staleGithub.map((t) => (
              <li
                key={t.teamId as string}
                className="flex items-center justify-between text-[12px]"
              >
                <span className="truncate text-ink-deep">{t.teamName}</span>
                <span className="font-mono text-[11px] text-vermilion">
                  {t.daysStale < 0 ? "never" : `${t.daysStale}d`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

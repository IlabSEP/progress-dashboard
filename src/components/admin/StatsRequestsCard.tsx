import { cn } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDuration(ms: number | null): string {
  if (ms === null || ms < 0) return "—";
  const days = Math.floor(ms / DAY_MS);
  const hours = Math.floor((ms % DAY_MS) / (60 * 60 * 1000));
  if (days >= 1) return `${days}d ${hours}h`;
  const minutes = Math.floor(ms / (60 * 1000));
  if (hours >= 1) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

function formatMonth(ms: number): string {
  return new Date(ms).toLocaleDateString("en-SG", {
    month: "short",
    timeZone: "Asia/Singapore",
  });
}

export function StatsRequestsCard({
  total,
  fulfilled,
  fulfillmentRate,
  avgTimeToFulfillMs,
  medianTimeToFulfillMs,
  fulfilledByBreakdown,
  monthlyTrend,
}: {
  total: number;
  fulfilled: number;
  fulfillmentRate: number;
  avgTimeToFulfillMs: number | null;
  medianTimeToFulfillMs: number | null;
  fulfilledByBreakdown: {
    update: number;
    sepCommit: number;
    cancelled: number;
  };
  monthlyTrend: Array<{ monthStartMs: number; sent: number; fulfilled: number }>;
}) {
  const pctLabel =
    total === 0 ? "—" : `${Math.round(fulfillmentRate * 100)}%`;
  const maxSent = Math.max(1, ...monthlyTrend.map((m) => m.sent));

  return (
    <div className="flex h-full flex-col rounded-lg border border-ink/15 bg-cream-paper p-5">
      <div className="mb-3 flex items-end justify-between">
        <h3 className="font-display text-lg text-ink-deep">Request performance</h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
          all time
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-ink/10 bg-cream-warm/40 px-3 py-2.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/55">
            Fulfillment
          </p>
          <p className="mt-1 font-display text-2xl leading-none text-ink-deep">
            {pctLabel}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-ink/45">
            {fulfilled}/{total}
          </p>
        </div>
        <div className="rounded-md border border-ink/10 bg-cream-warm/40 px-3 py-2.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/55">
            Avg time
          </p>
          <p className="mt-1 font-mono text-[15px] text-ink-deep">
            {formatDuration(avgTimeToFulfillMs)}
          </p>
        </div>
        <div className="rounded-md border border-ink/10 bg-cream-warm/40 px-3 py-2.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/55">
            Median
          </p>
          <p className="mt-1 font-mono text-[15px] text-ink-deep">
            {formatDuration(medianTimeToFulfillMs)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill
          color="sage"
          label="update"
          count={fulfilledByBreakdown.update}
        />
        <Pill
          color="ink"
          label="SEP commit"
          count={fulfilledByBreakdown.sepCommit}
        />
        <Pill
          color="stone"
          label="cancelled"
          count={fulfilledByBreakdown.cancelled}
        />
      </div>

      <div className="mt-4 border-t border-ink/10 pt-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
          Requests · last 6 months
        </p>
        <div className="flex h-16 items-end gap-2">
          {monthlyTrend.map((m) => {
            const sentPct = (m.sent / maxSent) * 100;
            const fulfilledPct = m.sent === 0 ? 0 : (m.fulfilled / maxSent) * 100;
            return (
              <div
                key={m.monthStartMs}
                className="flex flex-1 flex-col items-center gap-1"
                title={`${formatMonth(m.monthStartMs)}: ${m.sent} sent, ${m.fulfilled} fulfilled`}
              >
                <div className="relative flex h-12 w-full items-end">
                  <div
                    className="w-full rounded-t-sm bg-ink/15"
                    style={{ height: `${sentPct}%` }}
                  />
                  <div
                    className="absolute bottom-0 w-full rounded-t-sm bg-sage"
                    style={{ height: `${fulfilledPct}%` }}
                  />
                </div>
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink/55">
                  {formatMonth(m.monthStartMs)}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-ink/55">
          <LegendDot className="bg-ink/15" /> sent
          <LegendDot className="bg-sage" /> fulfilled
        </div>
      </div>
    </div>
  );
}

function Pill({
  color,
  label,
  count,
}: {
  color: "sage" | "ink" | "stone";
  label: string;
  count: number;
}) {
  const bg =
    color === "sage"
      ? "bg-sage/15 text-sage border-sage/40"
      : color === "ink"
        ? "bg-ink/10 text-ink-deep border-ink/30"
        : "bg-stone/30 text-ink-soft border-stone";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px]",
        bg
      )}
    >
      <span className="font-mono">{count}</span>
      <span className="text-[10.5px] uppercase tracking-[0.08em]">{label}</span>
    </span>
  );
}

function LegendDot({ className }: { className: string }) {
  return <span className={cn("inline-block h-2 w-2 rounded-sm", className)} />;
}

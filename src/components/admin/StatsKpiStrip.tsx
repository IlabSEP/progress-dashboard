import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Kpi = {
  totalTeams: number;
  overdueTeams: number;
  pendingRequests: number;
  updatesThisWeek: number;
  commitsThisWeek: number;
  updatesLastWeek: number;
  commitsLastWeek: number;
};

function Trend({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (diff === 0) {
    return (
      <span className="font-mono text-[10px] tracking-[0.14em] text-ink/45">
        · {previous} last wk
      </span>
    );
  }
  const up = diff > 0;
  return (
    <span
      className={cn(
        "font-mono text-[10px] tracking-[0.14em]",
        up ? "text-sage" : "text-vermilion"
      )}
      title={`${previous} last week`}
    >
      {up ? "↑" : "↓"} {Math.abs(diff)} vs last wk
    </span>
  );
}

function Card({
  label,
  value,
  emphasis,
  trend,
  href,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
  trend?: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-lg border border-ink/15 bg-cream-paper px-4 py-3 transition-colors",
        href && "hover:border-ink/30 hover:bg-ink/[0.03]"
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
        {label}
      </p>
      <p
        className={cn(
          "font-display text-3xl leading-none",
          emphasis ? "text-vermilion" : "text-ink-deep"
        )}
      >
        {value}
      </p>
      <div className="h-[14px]">{trend ?? null}</div>
    </div>
  );
  return href ? <Link to={href}>{inner}</Link> : inner;
}

export function StatsKpiStrip({ kpi }: { kpi: Kpi }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Card label="Teams" value={kpi.totalTeams} />
      <Card
        label="Overdue"
        value={kpi.overdueTeams}
        emphasis={kpi.overdueTeams > 0}
      />
      <Card
        label="Pending requests"
        value={kpi.pendingRequests}
        href="/admin/request-update"
      />
      <Card
        label="Updates / week"
        value={kpi.updatesThisWeek}
        trend={
          <Trend current={kpi.updatesThisWeek} previous={kpi.updatesLastWeek} />
        }
      />
      <Card
        label="SEP commits / week"
        value={kpi.commitsThisWeek}
        trend={
          <Trend current={kpi.commitsThisWeek} previous={kpi.commitsLastWeek} />
        }
      />
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { OverdueBanner } from "@/components/OverdueBanner";
import { StatsKpiStrip } from "@/components/admin/StatsKpiStrip";
import {
  StatsEngagementCard,
  type BucketKey,
} from "@/components/admin/StatsEngagementCard";
import { StatsRequestsCard } from "@/components/admin/StatsRequestsCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

type TimelineData = NonNullable<
  ReturnType<typeof useQuery<typeof api.updates.getTimelineAllTeams>>
>;
type TimelineTeam = TimelineData["teams"][number];
type TimelineEvent = TimelineTeam["events"][number];

type Anchor = { x: number; y: number };
type PopoverState = {
  key: string;
  teamName: string;
  weekLabel: string;
  requestTitle?: string;
  events: TimelineEvent[];
  anchor: Anchor;
};

const COL_W = 52;
const ROW_H = 44;
const NAME_W = 200;

function formatShort(ts: number): string {
  return new Date(ts).toLocaleDateString("en-SG", {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString("en-SG", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function relativeTime(ts: number, now: number): string {
  const diff = now - ts;
  if (diff < 0) return "just now";
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  if (diff < MIN) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MIN)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`;
  return `${Math.floor(diff / WEEK)}w ago`;
}

function StatusBadge({ status }: { status: "active" | "overdue" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 gap-1 rounded-full px-2 text-[10px] font-medium",
        status === "active"
          ? "border-sage/50 bg-sage/15 text-sage"
          : "border-vermilion/40 bg-vermilion/10 text-vermilion"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active" ? "bg-sage" : "bg-vermilion"
        )}
      />
      {status === "active" ? "Active" : "Overdue"}
    </Badge>
  );
}

function EventPopover({
  data,
  onClose,
  now,
}: {
  data: PopoverState | null;
  onClose: () => void;
  now: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!data || !ref.current) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const { x, y } = data.anchor;
    let top = y - r.height - 8;
    let left = x - r.width / 2;
    if (top < 8) top = y + 28;
    if (left + r.width > vw - 8) left = vw - r.width - 8;
    if (left < 8) left = 8;
    setPos({ top, left });
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onScrollOrResize = () => onClose();
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [data, onClose]);

  if (!data) return null;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      className="fixed z-50 min-w-[220px] max-w-[280px] overflow-hidden rounded-lg border border-ink/15 bg-cream-paper shadow-lg"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="border-b border-ink/10 px-3 py-2.5">
        <div className="text-[12px] font-semibold tracking-tight text-ink-deep">
          {data.teamName}
        </div>
        <div className="mt-0.5 text-[11px] text-ink/55">
          Week of {data.weekLabel}
          {data.requestTitle && (
            <span className="ml-1.5 text-vermilion">· {data.requestTitle}</span>
          )}
        </div>
      </div>
      <div className="py-1.5">
        {data.events.length === 0 ? (
          <div className="px-3 py-2 text-[12px] text-ink/55">
            No response to this request.
          </div>
        ) : (
          data.events.map((ev) => {
            const href =
              ev.kind === "update"
                ? `/admin/update/${ev.id}`
                : `/admin/commit/${ev.id}`;
            return (
              <Link
                key={ev.id}
                to={href}
                className="flex items-center gap-2.5 px-3 py-1.5 text-[12px] no-underline transition-colors hover:bg-ink/5"
              >
                <span
                  className={cn(
                    "h-2 w-2 flex-shrink-0 rounded-full",
                    ev.kind === "update" ? "bg-sage" : "bg-ink"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-ink-deep">{ev.label}</div>
                  <div className="text-[10.5px] text-ink/55">
                    {formatDateTime(ev.occurredAt)} · {relativeTime(ev.occurredAt, now)}
                  </div>
                </div>
                <span className="flex-shrink-0 text-[11px] text-ink/40">↗</span>
              </Link>
            );
          })
        )}
      </div>
    </div>,
    document.body
  );
}

type WeekBucket = {
  events: TimelineEvent[];
  hasUpdate: boolean;
  hasCommit: boolean;
  unfulfilledRequestTitle?: string;
};

function bucketize(
  team: TimelineTeam,
  originMs: number,
  weekMs: number,
  numWeeks: number
): WeekBucket[] {
  const buckets: WeekBucket[] = Array.from({ length: numWeeks }, () => ({
    events: [],
    hasUpdate: false,
    hasCommit: false,
  }));

  for (const ev of team.events) {
    const wi = Math.floor((ev.occurredAt - originMs) / weekMs);
    if (wi < 0 || wi >= numWeeks) continue;
    buckets[wi].events.push(ev);
    if (ev.kind === "update") buckets[wi].hasUpdate = true;
    else buckets[wi].hasCommit = true;
  }

  for (const req of team.requests) {
    if (req.fulfilledAt) continue;
    const wi = Math.floor((req.requestedAt - originMs) / weekMs);
    if (wi < 0 || wi >= numWeeks) continue;
    if (buckets[wi].events.length === 0) {
      buckets[wi].unfulfilledRequestTitle = req.title;
    }
  }

  for (const b of buckets) {
    b.events.sort((a, b2) => a.occurredAt - b2.occurredAt);
  }
  return buckets;
}

type RequestColHeader = {
  week: number;
  title: string;
  requestedAt: number;
};

function requestHeaders(data: TimelineData): Map<number, RequestColHeader> {
  const map = new Map<number, RequestColHeader>();
  for (const team of data.teams) {
    for (const r of team.requests) {
      const wi = Math.floor((r.requestedAt - data.originMs) / data.weekMs);
      if (wi < 0 || wi >= data.weeks) continue;
      const existing = map.get(wi);
      if (!existing || r.requestedAt < existing.requestedAt) {
        map.set(wi, { week: wi, title: r.title, requestedAt: r.requestedAt });
      }
    }
  }
  return map;
}

export function AdminDashboard() {
  const data = useQuery(api.updates.getTimelineAllTeams, {});
  const stats = useQuery(api.adminStats.getAdminStats, {});
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [bucketFilter, setBucketFilter] = useState<BucketKey | null>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const now = Date.now();

  const bucketTeamIds = useMemo(() => {
    if (!stats || !bucketFilter) return null;
    const b = stats.engagement.buckets.find((x) => x.key === bucketFilter);
    return b ? new Set(b.teamIds as string[]) : null;
  }, [stats, bucketFilter]);

  const filteredTeams = useMemo(() => {
    if (!data) return [];
    return data.teams.filter((t) => {
      if (selectedTagIds.size > 0) {
        if (!t.tagIds.some((id) => selectedTagIds.has(id))) return false;
      }
      if (bucketTeamIds) {
        if (!bucketTeamIds.has(t.teamId as string)) return false;
      }
      return true;
    });
  }, [data, selectedTagIds, bucketTeamIds]);

  const reqHeaders = useMemo(
    () => (data ? requestHeaders(data) : new Map<number, RequestColHeader>()),
    [data]
  );

  const weekLabels = useMemo(() => {
    if (!data) return [];
    return Array.from({ length: data.weeks }, (_, i) =>
      formatShort(data.originMs + i * data.weekMs)
    );
  }, [data]);

  const teamsForBanner = useMemo(() => {
    const map = new Map<string, Doc<"users">>();
    if (!data) return map;
    // OverdueBanner expects Doc<"users"> objects; it reads _id, teamName, name, email.
    for (const t of data.teams) {
      map.set(t.teamId as string, {
        _id: t.teamId,
        _creationTime: 0,
        teamName: t.teamName,
      } as Doc<"users">);
    }
    return map;
  }, [data]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const handleBucketClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    team: TimelineTeam,
    weekIndex: number,
    bucket: WeekBucket
  ) => {
    e.stopPropagation();
    if (bucket.events.length === 0 && !bucket.unfulfilledRequestTitle) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const anchor: Anchor = {
      x: rect.left + rect.width / 2,
      y: rect.top,
    };
    const key = `${team.teamId}/${weekIndex}`;
    setPopover((prev) =>
      prev?.key === key
        ? null
        : {
            key,
            teamName: team.teamName,
            weekLabel: weekLabels[weekIndex],
            requestTitle:
              reqHeaders.get(weekIndex)?.title ?? bucket.unfulfilledRequestTitle,
            events: bucket.events,
            anchor,
          }
    );
  };

  if (data === undefined) {
    return (
      <div className="container py-8">
        <p className="text-ink/55">Loading dashboard...</p>
      </div>
    );
  }

  const totalGridW = NAME_W + COL_W * data.weeks;

  return (
    <div className="container space-y-6 py-8" onClick={() => setPopover(null)}>
      <OverdueBanner teams={teamsForBanner} />

      {/* Stats section */}
      {stats === undefined ? (
        <StatsSkeleton />
      ) : (
        <div className="space-y-4">
          <StatsKpiStrip kpi={stats.kpi} />
          <div className="grid gap-4 lg:grid-cols-2">
            <StatsEngagementCard
              buckets={stats.engagement.buckets}
              activeBucket={bucketFilter}
              onBucketToggle={(k) =>
                setBucketFilter((prev) => (prev === k ? null : k))
              }
              staleGithub={stats.engagement.staleGithub}
            />
            <StatsRequestsCard
              total={stats.requests.total}
              fulfilled={stats.requests.fulfilled}
              fulfillmentRate={stats.requests.fulfillmentRate}
              avgTimeToFulfillMs={stats.requests.avgTimeToFulfillMs}
              medianTimeToFulfillMs={stats.requests.medianTimeToFulfillMs}
              fulfilledByBreakdown={stats.requests.fulfilledByBreakdown}
              monthlyTrend={stats.requests.monthlyTrend}
            />
          </div>
        </div>
      )}

      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-tight text-ink-deep">
            Team Update Timelines
          </h2>
          <p className="mt-1 text-[13px] text-ink/60">
            Last {data.weeks} weeks · each column represents one week
          </p>
        </div>
      </div>

      {/* Tag filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink/55">
          Filter by tag
        </span>
        {data.tags.length === 0 ? (
          <span className="text-[12px] text-ink/45">No tags defined yet.</span>
        ) : (
          data.tags.map((tag) => {
            const active = selectedTagIds.has(tag._id as string);
            return (
              <button
                key={tag._id as string}
                onClick={() => toggleTag(tag._id as string)}
                className={cn(
                  "inline-flex h-7 items-center rounded-full border px-3 text-[12px] font-medium transition-colors",
                  active
                    ? "border-ink bg-ink text-cream-paper"
                    : "border-ink/15 bg-cream-paper text-ink/70 hover:border-ink/30 hover:bg-ink/5 hover:text-ink-deep"
                )}
              >
                {tag.name}
              </button>
            );
          })
        )}
        {selectedTagIds.size > 0 && (
          <button
            onClick={() => setSelectedTagIds(new Set())}
            className="inline-flex h-7 items-center rounded-full border border-vermilion/40 px-3 text-[12px] font-medium text-vermilion hover:bg-vermilion/10"
          >
            Clear ×
          </button>
        )}
        {bucketFilter && (
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-ink/30 bg-ink/5 px-3 text-[12px] font-medium text-ink-deep">
            Engagement: {bucketFilter}
            <button
              onClick={() => setBucketFilter(null)}
              aria-label="Clear engagement filter"
              className="-mr-1 text-ink/55 hover:text-vermilion"
            >
              ×
            </button>
          </span>
        )}
      </div>

      {/* Timeline card */}
      <div className="overflow-hidden rounded-lg border border-ink/15 bg-cream-paper shadow-sm">
        <div className="overflow-x-auto">
          <div style={{ minWidth: totalGridW }}>
            {/* Header row */}
            <div className="sticky top-0 z-10 flex border-b border-ink/15 bg-cream-warm/60">
              <div
                className="flex-shrink-0 border-r border-ink/15 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/55"
                style={{ width: NAME_W, minWidth: NAME_W }}
              >
                Team
              </div>
              {weekLabels.map((wk, wi) => {
                const req = reqHeaders.get(wi);
                const showDate = wi % 2 === 0 || req;
                const cellContent = req ? (
                  <>
                    <div className="truncate text-[10px] font-semibold leading-tight text-vermilion">
                      {req.title}
                    </div>
                    <div className="mt-0.5 text-[10px] text-ink/55">{wk}</div>
                  </>
                ) : (
                  <div className="font-mono text-[10px] leading-[22px] text-ink/50">
                    {showDate ? wk : ""}
                  </div>
                );
                return (
                  <div
                    key={wi}
                    className={cn(
                      "relative flex-shrink-0",
                      wi < data.weeks - 1 && "border-r border-ink/10",
                      req && "bg-vermilion/5 border-b-2 border-vermilion"
                    )}
                    style={{ width: COL_W, minWidth: COL_W }}
                  >
                    {req ? (
                      <Link
                        to={`/admin/request/${req.requestedAt}`}
                        className="block px-1 py-1.5 text-center transition-colors hover:bg-vermilion/10"
                        title={`View request batch · ${req.title}`}
                      >
                        {cellContent}
                      </Link>
                    ) : (
                      <div className="px-1 py-1.5 text-center">{cellContent}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Team rows */}
            {filteredTeams.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] text-ink/55">
                {data.teams.length === 0
                  ? "No teams yet."
                  : "No teams match the selected tags."}
              </div>
            ) : (
              filteredTeams.map((team, ti) => {
                const buckets = bucketize(
                  team,
                  data.originMs,
                  data.weekMs,
                  data.weeks
                );
                return (
                  <div
                    key={team.teamId as string}
                    className={cn(
                      "flex transition-colors hover:bg-ink/[0.025]",
                      ti < filteredTeams.length - 1 && "border-b border-ink/10",
                      ti % 2 === 1 && "bg-cream/40"
                    )}
                  >
                    <div
                      className="flex flex-shrink-0 flex-col justify-center gap-1 border-r border-ink/15 px-4"
                      style={{ width: NAME_W, minWidth: NAME_W, height: ROW_H }}
                    >
                      <Link
                        to={`/admin/team/${team.teamId}`}
                        className="truncate text-[13px] font-semibold leading-tight text-ink-deep hover:underline"
                      >
                        {team.teamName}
                      </Link>
                      <StatusBadge status={team.status} />
                    </div>

                    {buckets.map((bucket, wi) => {
                      const isReqCol = reqHeaders.has(wi);
                      const popKey = `${team.teamId}/${wi}`;
                      const isOpen = popover?.key === popKey;
                      const count = bucket.events.length;
                      const hasActivity = count > 0;
                      const mixed = bucket.hasUpdate && bucket.hasCommit;
                      const isUnfulfilled = !!bucket.unfulfilledRequestTitle;

                      return (
                        <div
                          key={wi}
                          className={cn(
                            "relative flex-shrink-0",
                            wi < data.weeks - 1 && "border-r border-ink/10",
                            isReqCol && "bg-vermilion/[0.04]"
                          )}
                          style={{ width: COL_W, minWidth: COL_W, height: ROW_H }}
                        >
                          {hasActivity && (
                            <button
                              type="button"
                              aria-label={`${count} event${count > 1 ? "s" : ""} in week of ${weekLabels[wi]} for ${team.teamName}`}
                              onClick={(e) => handleBucketClick(e, team, wi, bucket)}
                              className={cn(
                                "absolute inset-[5px_4px] cursor-pointer rounded transition-all focus:outline-none",
                                bucket.hasUpdate ? "bg-sage" : "bg-ink",
                                "hover:opacity-90 hover:ring-2 hover:ring-ink-deep",
                                isOpen && "ring-2 ring-ink-deep"
                              )}
                            >
                              {count > 1 && (
                                <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold text-cream-paper">
                                  {count}
                                </span>
                              )}
                              {mixed && (
                                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-ink ring-1 ring-cream-paper/80" />
                              )}
                            </button>
                          )}
                          {!hasActivity && isUnfulfilled && (
                            <button
                              type="button"
                              aria-label={`No response to ${bucket.unfulfilledRequestTitle}`}
                              onClick={(e) => handleBucketClick(e, team, wi, bucket)}
                              className={cn(
                                "absolute inset-[5px_4px] cursor-pointer rounded border-2 border-dashed border-vermilion bg-vermilion/10 transition-colors hover:bg-vermilion/15 focus:outline-none",
                                isOpen && "ring-2 ring-vermilion"
                              )}
                              title={`No response to ${bucket.unfulfilledRequestTitle}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 border-t border-ink/15 bg-cream-warm/40 px-4 py-2.5">
          <LegendItem
            swatch={<span className="h-3.5 w-3.5 rounded-sm bg-sage" />}
            label="Submitted update"
          />
          <LegendItem
            swatch={<span className="h-3.5 w-3.5 rounded-sm bg-ink" />}
            label="SEP commit"
          />
          <LegendItem
            swatch={
              <span className="h-3.5 w-3.5 rounded-sm border-2 border-dashed border-vermilion bg-vermilion/10" />
            }
            label="Request — no response"
          />
          <LegendItem
            swatch={
              <span className="h-3.5 w-3.5 rounded-sm border-2 border-vermilion bg-vermilion/5" />
            }
            label="Admin request week"
          />
          <div className="ml-auto text-[11.5px] text-ink/55">
            Click a block to view details
          </div>
        </div>
      </div>

      <EventPopover data={popover} onClose={() => setPopover(null)} now={now} />
    </div>
  );
}

function LegendItem({
  swatch,
  label,
}: {
  swatch: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {swatch}
      <span className="text-[11.5px] text-ink/60">{label}</span>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] rounded-lg border border-ink/15 bg-cream-warm/40"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-52 rounded-lg border border-ink/15 bg-cream-warm/40" />
        <div className="h-52 rounded-lg border border-ink/15 bg-cream-warm/40" />
      </div>
    </div>
  );
}

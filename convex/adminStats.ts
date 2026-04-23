import { query } from "./_generated/server";
import { requireAdmin, mondayOfWeekSgt } from "./helpers";
import { Id } from "./_generated/dataModel";

// keep in sync with convex/overdueFlags.ts:4
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;

type BucketKey = "0-14" | "15-30" | "31-60" | "60+" | "never";

function monthStartSgt(ms: number): number {
  const sgt = new Date(ms + SGT_OFFSET_MS);
  return (
    Date.UTC(sgt.getUTCFullYear(), sgt.getUTCMonth(), 1) - SGT_OFFSET_MS
  );
}

function addMonthsSgt(ms: number, months: number): number {
  const sgt = new Date(ms + SGT_OFFSET_MS);
  return (
    Date.UTC(sgt.getUTCFullYear(), sgt.getUTCMonth() + months, 1) -
    SGT_OFFSET_MS
  );
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const weekStartMs = mondayOfWeekSgt(now);
    const lastWeekStartMs = weekStartMs - WEEK_MS;
    const nextWeekStartMs = weekStartMs + WEEK_MS;

    const [teams, allRequests] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "team"))
        .collect(),
      ctx.db.query("updateRequests").collect(),
    ]);

    // Latest update + all SEP commit activity per team.
    const perTeam = await Promise.all(
      teams.map(async (team) => {
        const [latestUpdate, commits] = await Promise.all([
          ctx.db
            .query("updates")
            .withIndex("by_team_and_date", (q) => q.eq("teamId", team._id))
            .order("desc")
            .first(),
          ctx.db
            .query("githubCommitEvents")
            .withIndex("by_team_and_time", (q) => q.eq("teamId", team._id))
            .order("desc")
            .collect(),
        ]);
        return { team, latestUpdate, commits };
      })
    );

    // --- Cluster A: KPI strip ---
    let overdueTeams = 0;
    let updatesThisWeek = 0;
    let updatesLastWeek = 0;
    let commitsThisWeek = 0;
    let commitsLastWeek = 0;

    // Pull all updates across teams in the 2-week window for the KPI counts.
    // Simpler than iterating `perTeam` for updates because we only stored latest.
    const twoWeekUpdates = await ctx.db
      .query("updates")
      .filter((q) => q.gte(q.field("submissionDate"), lastWeekStartMs))
      .collect();
    for (const u of twoWeekUpdates) {
      if (u.submissionDate >= weekStartMs && u.submissionDate < nextWeekStartMs) {
        updatesThisWeek++;
      } else if (
        u.submissionDate >= lastWeekStartMs &&
        u.submissionDate < weekStartMs
      ) {
        updatesLastWeek++;
      }
    }

    for (const { team, latestUpdate, commits } of perTeam) {
      if (
        !latestUpdate ||
        now - latestUpdate.submissionDate > SIXTY_DAYS_MS
      ) {
        overdueTeams++;
      }

      for (const c of commits) {
        if (!c.message.trim().toLowerCase().startsWith("sep:")) continue;
        const ts = new Date(c.timestamp).getTime();
        if (ts >= weekStartMs && ts < nextWeekStartMs) {
          commitsThisWeek++;
        } else if (ts >= lastWeekStartMs && ts < weekStartMs) {
          commitsLastWeek++;
        }
      }

      void team;
    }

    const pendingRequests = allRequests.filter((r) => !r.fulfilledAt).length;

    // --- Cluster B: Engagement distribution ---
    const bucketMap: Record<BucketKey, { count: number; teamIds: Id<"users">[] }> =
      {
        "0-14": { count: 0, teamIds: [] },
        "15-30": { count: 0, teamIds: [] },
        "31-60": { count: 0, teamIds: [] },
        "60+": { count: 0, teamIds: [] },
        never: { count: 0, teamIds: [] },
      };

    for (const { team, latestUpdate } of perTeam) {
      let key: BucketKey;
      if (!latestUpdate) {
        key = "never";
      } else {
        const ageDays = (now - latestUpdate.submissionDate) / DAY_MS;
        if (ageDays <= 14) key = "0-14";
        else if (ageDays <= 30) key = "15-30";
        else if (ageDays <= 60) key = "31-60";
        else key = "60+";
      }
      bucketMap[key].count++;
      bucketMap[key].teamIds.push(team._id);
    }

    const buckets = (
      [
        { key: "0-14", label: "0–14 days" },
        { key: "15-30", label: "15–30 days" },
        { key: "31-60", label: "31–60 days" },
        { key: "60+", label: "60+ days" },
        { key: "never", label: "Never" },
      ] as const
    ).map((b) => ({
      key: b.key,
      label: b.label,
      count: bucketMap[b.key].count,
      teamIds: bucketMap[b.key].teamIds,
    }));

    const staleGithub: Array<{
      teamId: Id<"users">;
      teamName: string;
      daysStale: number;
    }> = [];

    for (const { team, commits } of perTeam) {
      if (!team.githubRepoUrl) continue;
      const latestCommit = commits[0];
      const latestTs = latestCommit
        ? new Date(latestCommit.timestamp).getTime()
        : null;
      if (!latestTs || now - latestTs > 30 * DAY_MS) {
        const daysStale = latestTs
          ? Math.floor((now - latestTs) / DAY_MS)
          : -1;
        staleGithub.push({
          teamId: team._id,
          teamName:
            team.teamName ?? team.name ?? team.email ?? "Unnamed team",
          daysStale,
        });
      }
    }
    staleGithub.sort((a, b) => b.daysStale - a.daysStale);

    // --- Cluster C: Request performance ---
    const totalRequests = allRequests.length;
    const fulfilled = allRequests.filter((r) => r.fulfilledAt);
    const fulfilledCount = fulfilled.length;
    const fulfillmentRate =
      totalRequests === 0 ? 0 : fulfilledCount / totalRequests;

    const deltas: number[] = [];
    let fulfilledByUpdate = 0;
    let fulfilledBySepCommit = 0;
    let cancelled = 0;
    for (const r of fulfilled) {
      if (r.fulfilledByUpdateId) {
        fulfilledByUpdate++;
        deltas.push(r.fulfilledAt! - r.requestedAt);
      } else if (r.fulfilledBySepCommitId) {
        fulfilledBySepCommit++;
        deltas.push(r.fulfilledAt! - r.requestedAt);
      } else {
        cancelled++;
      }
    }
    const avgTimeToFulfillMs =
      deltas.length === 0
        ? null
        : deltas.reduce((a, b) => a + b, 0) / deltas.length;
    const medianTimeToFulfillMs = median(deltas);

    // Monthly trend — last 6 full calendar months (SGT), oldest first.
    const currentMonthStart = monthStartSgt(now);
    const monthlyTrend: Array<{
      monthStartMs: number;
      sent: number;
      fulfilled: number;
    }> = [];
    for (let i = 5; i >= 0; i--) {
      const start = addMonthsSgt(currentMonthStart, -i);
      const end = addMonthsSgt(currentMonthStart, -i + 1);
      let sent = 0;
      let fulfilledInMonth = 0;
      for (const r of allRequests) {
        if (r.requestedAt >= start && r.requestedAt < end) {
          sent++;
          if (r.fulfilledAt) fulfilledInMonth++;
        }
      }
      monthlyTrend.push({ monthStartMs: start, sent, fulfilled: fulfilledInMonth });
    }

    return {
      weekStartMs,
      weekMs: WEEK_MS,
      generatedAt: now,
      kpi: {
        totalTeams: teams.length,
        overdueTeams,
        pendingRequests,
        updatesThisWeek,
        commitsThisWeek,
        updatesLastWeek,
        commitsLastWeek,
      },
      engagement: {
        buckets,
        staleGithub: staleGithub.slice(0, 10),
      },
      requests: {
        total: totalRequests,
        fulfilled: fulfilledCount,
        fulfillmentRate,
        avgTimeToFulfillMs,
        medianTimeToFulfillMs,
        fulfilledByBreakdown: {
          update: fulfilledByUpdate,
          sepCommit: fulfilledBySepCommit,
          cancelled,
        },
        monthlyTrend,
      },
    };
  },
});

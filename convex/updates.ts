import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireAdmin, mondayOfWeekSgt } from "./helpers";

export const submit = mutation({
  args: {
    githubCommits: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    documents: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          fileName: v.string(),
          mimeType: v.string(),
        })
      )
    ),
    writtenUpdate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (user.role !== "team") {
      throw new Error("Only team users can submit updates");
    }

    const hasContent =
      args.githubCommits?.trim() ||
      args.videoUrl?.trim() ||
      (args.documents && args.documents.length > 0) ||
      args.writtenUpdate?.trim();

    if (!hasContent) {
      throw new Error("At least one field must have content");
    }

    const updateId = await ctx.db.insert("updates", {
      teamId: user._id,
      githubCommits: args.githubCommits || undefined,
      videoUrl: args.videoUrl || undefined,
      documents: args.documents || undefined,
      writtenUpdate: args.writtenUpdate || undefined,
      submissionDate: Date.now(),
      isLocked: true,
    });

    // Resolve any overdue flags for this team
    const overdueFlags = await ctx.db
      .query("overdueFlags")
      .withIndex("by_team", (q) => q.eq("teamId", user._id))
      .collect();

    for (const flag of overdueFlags) {
      if (!flag.resolvedAt) {
        await ctx.db.patch(flag._id, { resolvedAt: Date.now() });
      }
    }

    // Resolve any pending update requests for this team
    const updateRequests = await ctx.db
      .query("updateRequests")
      .withIndex("by_team", (q) => q.eq("teamId", user._id))
      .collect();

    for (const request of updateRequests) {
      if (!request.fulfilledAt) {
        await ctx.db.patch(request._id, {
          fulfilledAt: Date.now(),
          fulfilledByUpdateId: updateId,
        });
      }
    }

    return updateId;
  },
});

export const edit = mutation({
  args: {
    updateId: v.id("updates"),
    githubCommits: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    documents: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          fileName: v.string(),
          mimeType: v.string(),
        })
      )
    ),
    writtenUpdate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const update = await ctx.db.get(args.updateId);
    if (!update) throw new Error("Update not found");
    if (update.teamId !== user._id) throw new Error("Not your update");
    if (update.isLocked) throw new Error("Update is locked");

    const hasContent =
      args.githubCommits?.trim() ||
      args.videoUrl?.trim() ||
      (args.documents && args.documents.length > 0) ||
      args.writtenUpdate?.trim();

    if (!hasContent) {
      throw new Error("At least one field must have content");
    }

    await ctx.db.patch(args.updateId, {
      githubCommits: args.githubCommits || undefined,
      videoUrl: args.videoUrl || undefined,
      documents: args.documents || undefined,
      writtenUpdate: args.writtenUpdate || undefined,
      submissionDate: Date.now(),
      isLocked: true,
    });
  },
});

export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    return await ctx.db
      .query("updates")
      .withIndex("by_team_and_date", (q) => q.eq("teamId", user._id))
      .order("desc")
      .first();
  },
});

export const listByTeam = query({
  args: { teamId: v.optional(v.id("users")) },
  handler: async (ctx, { teamId }) => {
    const user = await requireAuth(ctx);
    const targetTeamId = teamId ?? user._id;

    // Non-admin can only see own updates
    if (targetTeamId !== user._id && user.role !== "admin") {
      throw new Error("Access denied");
    }

    return await ctx.db
      .query("updates")
      .withIndex("by_team_and_date", (q) => q.eq("teamId", targetTeamId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { updateId: v.id("updates") },
  handler: async (ctx, { updateId }) => {
    const user = await requireAuth(ctx);
    const update = await ctx.db.get(updateId);
    if (!update) throw new Error("Update not found");

    if (update.teamId !== user._id && user.role !== "admin") {
      throw new Error("Access denied");
    }

    return update;
  },
});

export const unlock = mutation({
  args: { updateId: v.id("updates") },
  handler: async (ctx, { updateId }) => {
    await requireAdmin(ctx);
    const update = await ctx.db.get(updateId);
    if (!update) throw new Error("Update not found");
    await ctx.db.patch(updateId, { isLocked: false });
  },
});

export const getTimelineForMyTeam = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    const updates = await ctx.db
      .query("updates")
      .withIndex("by_team_and_date", (q) => q.eq("teamId", user._id))
      .order("desc")
      .collect();

    const commits = await ctx.db
      .query("githubCommitEvents")
      .withIndex("by_team_and_time", (q) => q.eq("teamId", user._id))
      .order("desc")
      .collect();

    const sepCommits = commits.filter((c) =>
      c.message.trim().toLowerCase().startsWith("sep:")
    );

    const items = [
      ...updates.map((u) => ({
        kind: "update" as const,
        occurredAt: u.submissionDate,
        update: u,
      })),
      ...sepCommits.map((c) => ({
        kind: "sepCommit" as const,
        occurredAt: new Date(c.timestamp).getTime(),
        commit: c,
      })),
    ];

    items.sort((a, b) => b.occurredAt - a.occurredAt);
    return items;
  },
});

export const getLatestForAllTeams = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const teams = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "team"))
      .collect();

    const results = await Promise.all(
      teams.map(async (team) => {
        const latestUpdate = await ctx.db
          .query("updates")
          .withIndex("by_team_and_date", (q) => q.eq("teamId", team._id))
          .order("desc")
          .first();
        return { team, latestUpdate };
      })
    );

    return results;
  },
});

// keep in sync with convex/overdueFlags.ts:4
const TIMELINE_SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

export const getTimelineAllTeams = query({
  args: { weeks: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const numWeeks = args.weeks ?? 13;
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const currentWeekStart = mondayOfWeekSgt(now);
    const originMs = currentWeekStart - (numWeeks - 1) * WEEK_MS;
    const windowEndMs = currentWeekStart + WEEK_MS;

    const teams = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "team"))
      .collect();

    const [allTags, allTeamTags, allRequests] = await Promise.all([
      ctx.db.query("tags").collect(),
      ctx.db.query("teamTags").collect(),
      ctx.db.query("updateRequests").collect(),
    ]);

    const tagIdsByTeam = new Map<string, string[]>();
    for (const tt of allTeamTags) {
      const key = tt.teamId as string;
      const list = tagIdsByTeam.get(key) ?? [];
      list.push(tt.tagId as string);
      tagIdsByTeam.set(key, list);
    }

    const requestsByTeam = new Map<string, typeof allRequests>();
    for (const r of allRequests) {
      const key = r.teamId as string;
      const list = requestsByTeam.get(key) ?? [];
      list.push(r);
      requestsByTeam.set(key, list);
    }

    const teamPayloads = await Promise.all(
      teams.map(async (team) => {
        const [updates, commits] = await Promise.all([
          ctx.db
            .query("updates")
            .withIndex("by_team_and_date", (q) => q.eq("teamId", team._id))
            .order("desc")
            .collect(),
          ctx.db
            .query("githubCommitEvents")
            .withIndex("by_team_and_time", (q) => q.eq("teamId", team._id))
            .order("desc")
            .collect(),
        ]);

        const latestSubmission = updates[0]?.submissionDate;
        const status: "active" | "overdue" =
          !latestSubmission || now - latestSubmission > TIMELINE_SIXTY_DAYS_MS
            ? "overdue"
            : "active";

        const updateEvents = updates
          .filter((u) => u.submissionDate >= originMs && u.submissionDate < windowEndMs)
          .map((u) => {
            const written = (u.writtenUpdate ?? "").trim();
            const firstLine = written.split(/\r?\n/)[0] ?? "";
            const label = firstLine
              ? firstLine.length > 60
                ? firstLine.slice(0, 57) + "…"
                : firstLine
              : `Update – ${new Date(u.submissionDate).toLocaleDateString("en-SG", {
                  month: "short",
                  day: "numeric",
                })}`;
            return {
              kind: "update" as const,
              id: u._id,
              occurredAt: u.submissionDate,
              label,
            };
          });

        const sepCommitEvents = commits
          .filter((c) => c.message.trim().toLowerCase().startsWith("sep:"))
          .map((c) => {
            const ts = new Date(c.timestamp).getTime();
            const msg = c.message.trim().replace(/^sep:\s*/i, "");
            const firstLine = msg.split(/\r?\n/)[0] ?? c.sha.slice(0, 7);
            const label =
              firstLine.length > 60 ? firstLine.slice(0, 57) + "…" : firstLine;
            return {
              kind: "sepCommit" as const,
              id: c._id,
              occurredAt: ts,
              label,
              url: c.url,
            };
          })
          .filter((e) => e.occurredAt >= originMs && e.occurredAt < windowEndMs);

        const teamRequests = (requestsByTeam.get(team._id as string) ?? [])
          .filter((r) => r.requestedAt >= originMs && r.requestedAt < windowEndMs)
          .map((r) => ({
            id: r._id,
            requestedAt: r.requestedAt,
            title: r.title,
            fulfilledAt: r.fulfilledAt,
          }));

        return {
          teamId: team._id,
          teamName: team.teamName ?? team.name ?? team.email ?? "Unnamed Team",
          status,
          tagIds: tagIdsByTeam.get(team._id as string) ?? [],
          events: [...updateEvents, ...sepCommitEvents],
          requests: teamRequests,
        };
      })
    );

    return {
      weeks: numWeeks,
      originMs,
      weekMs: WEEK_MS,
      tags: allTags.map((t) => ({ _id: t._id, name: t.name })),
      teams: teamPayloads,
    };
  },
});

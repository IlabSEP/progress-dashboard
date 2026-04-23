import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireAuth } from "./helpers";
import { internal } from "./_generated/api";

export const create = mutation({
  args: {
    teamIds: v.array(v.id("users")),
    title: v.string(),
    message: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();

    for (const teamId of args.teamIds) {
      await ctx.db.insert("updateRequests", {
        teamId,
        requestedBy: admin._id,
        title: args.title,
        message: args.message || undefined,
        dueDate: args.dueDate,
        requestedAt: now,
      });

      const team = await ctx.db.get(teamId);
      if (team?.email) {
        await ctx.scheduler.runAfter(
          0,
          internal.emails.sendUpdateRequest.send,
          {
            to: team.email,
            teamName: team.teamName ?? team.name ?? "there",
            title: args.title,
            message: args.message || undefined,
            dueDate: args.dueDate,
          }
        );
      }
    }
  },
});

export const getUnresolved = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("updateRequests").collect();
    const pending = all.filter((r) => !r.fulfilledAt);

    // Join team info
    const results = await Promise.all(
      pending.map(async (request) => {
        const team = await ctx.db.get(request.teamId);
        return { ...request, team };
      })
    );

    return results;
  },
});

export const getMyPending = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    const requests = await ctx.db
      .query("updateRequests")
      .withIndex("by_team", (q) => q.eq("teamId", user._id))
      .collect();
    return requests.filter((r) => !r.fulfilledAt);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("updateRequests").collect();
  },
});

export const getByBatch = query({
  args: { requestedAt: v.number() },
  handler: async (ctx, { requestedAt }) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("updateRequests").collect();
    const batch = all.filter((r) => r.requestedAt === requestedAt);

    const results = await Promise.all(
      batch.map(async (request) => {
        const team = await ctx.db.get(request.teamId);
        return { ...request, team };
      })
    );

    return results;
  },
});

export const cancel = mutation({
  args: { requestId: v.id("updateRequests") },
  handler: async (ctx, { requestId }) => {
    await requireAdmin(ctx);
    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Request not found");
    if (request.fulfilledAt) throw new Error("Request already resolved");
    await ctx.db.patch(requestId, { fulfilledAt: Date.now() });
  },
});

export const sendReminders = mutation({
  args: {
    onlyOverdue: v.optional(v.boolean()),
  },
  handler: async (ctx, { onlyOverdue }) => {
    await requireAdmin(ctx);
    const now = Date.now();

    const all = await ctx.db.query("updateRequests").collect();
    const pending = all.filter((r) => {
      if (r.fulfilledAt) return false;
      if (onlyOverdue) {
        return r.dueDate !== undefined && r.dueDate < now;
      }
      return true;
    });

    const byTeam = new Map<string, typeof pending>();
    for (const r of pending) {
      const key = r.teamId as string;
      const bucket = byTeam.get(key) ?? [];
      bucket.push(r);
      byTeam.set(key, bucket);
    }

    let emailed = 0;
    let skipped = 0;
    const teamsRemindedIds: string[] = [];

    for (const [teamId, requests] of byTeam) {
      const team = await ctx.db.get(teamId as (typeof pending)[number]["teamId"]);
      if (!team || !team.email) {
        skipped += 1;
        continue;
      }
      const sorted = [...requests].sort(
        (a, b) => a.requestedAt - b.requestedAt
      );
      await ctx.scheduler.runAfter(0, internal.emails.sendReminder.send, {
        to: team.email,
        teamName: team.teamName ?? team.name ?? "there",
        requests: sorted.map((r) => ({
          title: r.title,
          message: r.message,
          dueDate: r.dueDate,
          requestedAt: r.requestedAt,
        })),
      });
      emailed += 1;
      teamsRemindedIds.push(teamId);
    }

    return {
      teamsEmailed: emailed,
      teamsSkipped: skipped,
      pendingTeams: byTeam.size,
      teamsRemindedIds,
    };
  },
});

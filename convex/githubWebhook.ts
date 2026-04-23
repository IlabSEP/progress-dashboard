import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requireAuth, requireAdmin } from "./helpers";
import { getAuthUserId } from "@convex-dev/auth/server";

// --- Internal functions used by the HTTP action ---

export const getTeamWebhookSecret = internalQuery({
  args: { teamId: v.id("users") },
  handler: async (ctx, { teamId }) => {
    const user = await ctx.db.get(teamId);
    if (!user || user.role !== "team") return null;
    return user.webhookSecret ?? null;
  },
});

function isSepMessage(message: string): boolean {
  return message.trim().toLowerCase().startsWith("sep:");
}

export const storeCommits = internalMutation({
  args: {
    commits: v.array(
      v.object({
        teamId: v.id("users"),
        sha: v.string(),
        message: v.string(),
        author: v.string(),
        timestamp: v.string(),
        url: v.string(),
        repo: v.string(),
        branch: v.string(),
      })
    ),
  },
  handler: async (ctx, { commits }) => {
    let stored = 0;
    const teamsWithNewSep = new Map<Id<"users">, Id<"githubCommitEvents">>();

    for (const commit of commits) {
      const existing = await ctx.db
        .query("githubCommitEvents")
        .withIndex("by_sha", (q) => q.eq("sha", commit.sha))
        .first();
      if (existing) continue;

      const insertedId = await ctx.db.insert("githubCommitEvents", {
        ...commit,
        receivedAt: Date.now(),
      });
      stored++;

      if (isSepMessage(commit.message) && !teamsWithNewSep.has(commit.teamId)) {
        teamsWithNewSep.set(commit.teamId, insertedId);
      }
    }

    for (const [teamId, sepCommitId] of teamsWithNewSep) {
      const now = Date.now();

      const overdueFlags = await ctx.db
        .query("overdueFlags")
        .withIndex("by_team", (q) => q.eq("teamId", teamId))
        .collect();
      for (const flag of overdueFlags) {
        if (!flag.resolvedAt) {
          await ctx.db.patch(flag._id, { resolvedAt: now });
        }
      }

      const requests = await ctx.db
        .query("updateRequests")
        .withIndex("by_team", (q) => q.eq("teamId", teamId))
        .collect();
      for (const request of requests) {
        if (!request.fulfilledAt) {
          await ctx.db.patch(request._id, {
            fulfilledAt: now,
            fulfilledBySepCommitId: sepCommitId,
          });
        }
      }
    }

    return stored;
  },
});

// --- Team-facing mutations ---

export const setupGithubRepo = mutation({
  args: { repoUrl: v.string() },
  handler: async (ctx, { repoUrl }) => {
    const user = await requireAuth(ctx);
    const secret = crypto.randomUUID();
    await ctx.db.patch(user._id, {
      githubRepoUrl: repoUrl.trim(),
      webhookSecret: secret,
    });
    return { secret };
  },
});

export const clearGithubRepo = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    await ctx.db.patch(user._id, {
      githubRepoUrl: undefined,
      webhookSecret: undefined,
    });
  },
});

export const regenerateWebhookSecret = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    if (!user.githubRepoUrl) {
      throw new Error("No GitHub repo configured");
    }
    const secret = crypto.randomUUID();
    await ctx.db.patch(user._id, { webhookSecret: secret });
    return { secret };
  },
});

// --- Query ---

export const listByTeam = query({
  args: {
    teamId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { teamId, limit }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    const viewer = await ctx.db.get(userId);
    if (!viewer) throw new Error("User not found");

    // Determine which team to query
    let targetTeamId = teamId;
    if (!targetTeamId) {
      // Default to own commits
      targetTeamId = viewer._id;
    } else if (targetTeamId !== viewer._id && viewer.role !== "admin") {
      throw new Error("Not authorized");
    }

    const commits = await ctx.db
      .query("githubCommitEvents")
      .withIndex("by_team_and_time", (q) => q.eq("teamId", targetTeamId))
      .order("desc")
      .take(limit ?? 50);

    return commits;
  },
});

export const getById = query({
  args: { commitId: v.id("githubCommitEvents") },
  handler: async (ctx, { commitId }) => {
    await requireAdmin(ctx);
    const commit = await ctx.db.get(commitId);
    if (!commit) return null;
    const team = await ctx.db.get(commit.teamId);
    return {
      ...commit,
      teamName: team?.teamName ?? team?.name ?? team?.email ?? "Unknown team",
    };
  },
});

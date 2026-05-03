import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAuth, requireAdmin } from "./helpers";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return userId !== null ? ctx.db.get(userId) : null;
  },
});

export const setTeamName = mutation({
  args: { teamName: v.string() },
  handler: async (ctx, { teamName }) => {
    const user = await requireAuth(ctx);
    const oldName = user.teamName;
    await ctx.db.patch(user._id, { teamName, role: "team" });
    if (oldName && oldName !== teamName) {
      await ctx.db.insert("teamNameHistory", {
        teamId: user._id,
        oldName,
        newName: teamName,
        changedAt: Date.now(),
      });
    }
  },
});

export const updateProfile = mutation({
  args: {
    teamName: v.optional(v.string()),
    website: v.optional(v.string()),
    profileImage: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const patch: Record<string, unknown> = {};

    if (args.teamName !== undefined && args.teamName.trim()) {
      const newName = args.teamName.trim();
      if (user.teamName && user.teamName !== newName) {
        await ctx.db.insert("teamNameHistory", {
          teamId: user._id,
          oldName: user.teamName,
          newName,
          changedAt: Date.now(),
        });
      }
      patch.teamName = newName;
    }

    if (args.website !== undefined) {
      patch.website = args.website.trim() || undefined;
    }

    if (args.profileImage !== undefined) {
      patch.profileImage = args.profileImage;
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(user._id, patch);
    }
  },
});

export const getTeamNameHistory = query({
  args: { teamId: v.id("users") },
  handler: async (ctx, { teamId }) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("teamNameHistory")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();
  },
});

export const listTeams = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "team"))
      .collect();
  },
});

export const getTeam = query({
  args: { teamId: v.id("users") },
  handler: async (ctx, { teamId }) => {
    await requireAdmin(ctx);
    const team = await ctx.db.get(teamId);
    if (!team || team.role !== "team") {
      throw new Error("Team not found");
    }
    return team;
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const admin = await requireAdmin(ctx);
    if (admin._id === userId) {
      throw new Error("You cannot delete your own account");
    }

    const target = await ctx.db.get(userId);
    if (!target) {
      throw new Error("User not found");
    }
    if (target.role === "admin") {
      throw new Error("Admins cannot be deleted from the dashboard");
    }

    if (target.profileImage) {
      try {
        await ctx.storage.delete(target.profileImage);
      } catch {}
    }

    const updates = await ctx.db
      .query("updates")
      .withIndex("by_team", (q) => q.eq("teamId", userId))
      .collect();
    for (const update of updates) {
      for (const doc of update.documents ?? []) {
        try {
          await ctx.storage.delete(doc.storageId);
        } catch {}
      }
      await ctx.db.delete(update._id);
    }

    const nameHistory = await ctx.db
      .query("teamNameHistory")
      .withIndex("by_team", (q) => q.eq("teamId", userId))
      .collect();
    for (const row of nameHistory) await ctx.db.delete(row._id);

    const teamTags = await ctx.db
      .query("teamTags")
      .withIndex("by_team", (q) => q.eq("teamId", userId))
      .collect();
    for (const row of teamTags) await ctx.db.delete(row._id);

    const overdue = await ctx.db
      .query("overdueFlags")
      .withIndex("by_team", (q) => q.eq("teamId", userId))
      .collect();
    for (const row of overdue) await ctx.db.delete(row._id);

    const commits = await ctx.db
      .query("githubCommitEvents")
      .withIndex("by_team", (q) => q.eq("teamId", userId))
      .collect();
    for (const row of commits) await ctx.db.delete(row._id);

    const requests = await ctx.db
      .query("updateRequests")
      .withIndex("by_team", (q) => q.eq("teamId", userId))
      .collect();
    for (const row of requests) await ctx.db.delete(row._id);

    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    for (const row of messages) await ctx.db.delete(row._id);

    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
    for (const session of sessions) {
      const refreshTokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const t of refreshTokens) await ctx.db.delete(t._id);

      const verifiers = await ctx.db
        .query("authVerifiers")
        .filter((q) => q.eq(q.field("sessionId"), session._id))
        .collect();
      for (const ver of verifiers) await ctx.db.delete(ver._id);

      await ctx.db.delete(session._id);
    }

    const accounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect();
    for (const account of accounts) {
      const codes = await ctx.db
        .query("authVerificationCodes")
        .withIndex("accountId", (q) => q.eq("accountId", account._id))
        .collect();
      for (const code of codes) await ctx.db.delete(code._id);
      await ctx.db.delete(account._id);
    }

    await ctx.db.delete(userId);
  },
});

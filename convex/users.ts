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

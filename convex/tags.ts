import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireAuth } from "./helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("tags").collect();
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const user = await requireAdmin(ctx);
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", name.trim()))
      .unique();
    if (existing) throw new Error("Tag already exists");
    return await ctx.db.insert("tags", { name: name.trim(), createdBy: user._id });
  },
});

export const rename = mutation({
  args: { tagId: v.id("tags"), name: v.string() },
  handler: async (ctx, { tagId, name }) => {
    await requireAdmin(ctx);
    const tag = await ctx.db.get(tagId);
    if (!tag) throw new Error("Tag not found");
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", name.trim()))
      .unique();
    if (existing && existing._id !== tagId) throw new Error("Tag name already taken");
    await ctx.db.patch(tagId, { name: name.trim() });
  },
});

export const remove = mutation({
  args: { tagId: v.id("tags") },
  handler: async (ctx, { tagId }) => {
    await requireAdmin(ctx);
    // Cascade: remove all teamTags with this tag
    const teamTags = await ctx.db
      .query("teamTags")
      .withIndex("by_tag", (q) => q.eq("tagId", tagId))
      .collect();
    for (const tt of teamTags) {
      await ctx.db.delete(tt._id);
    }
    await ctx.db.delete(tagId);
  },
});

export const assignToTeam = mutation({
  args: { teamId: v.id("users"), tagId: v.id("tags") },
  handler: async (ctx, { teamId, tagId }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("teamTags")
      .withIndex("by_team_and_tag", (q) => q.eq("teamId", teamId).eq("tagId", tagId))
      .unique();
    if (existing) return; // Already assigned
    await ctx.db.insert("teamTags", { teamId, tagId });
  },
});

export const removeFromTeam = mutation({
  args: { teamId: v.id("users"), tagId: v.id("tags") },
  handler: async (ctx, { teamId, tagId }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("teamTags")
      .withIndex("by_team_and_tag", (q) => q.eq("teamId", teamId).eq("tagId", tagId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getTagsForTeam = query({
  args: { teamId: v.id("users") },
  handler: async (ctx, { teamId }) => {
    await requireAuth(ctx);
    const teamTags = await ctx.db
      .query("teamTags")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();
    const tags = await Promise.all(
      teamTags.map((tt) => ctx.db.get(tt.tagId))
    );
    return tags.filter(Boolean);
  },
});

export const getAllTeamTags = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("teamTags").collect();
  },
});

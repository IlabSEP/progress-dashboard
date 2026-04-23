import { internalMutation, query } from "./_generated/server";
import { requireAdmin } from "./helpers";

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

export const checkOverdue = internalMutation({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "team"))
      .collect();

    const now = Date.now();

    for (const team of teams) {
      const latestUpdate = await ctx.db
        .query("updates")
        .withIndex("by_team_and_date", (q) => q.eq("teamId", team._id))
        .order("desc")
        .first();

      const isOverdue = !latestUpdate || now - latestUpdate.submissionDate > SIXTY_DAYS_MS;

      if (isOverdue) {
        // Check if already flagged and unresolved
        const existingFlag = await ctx.db
          .query("overdueFlags")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .order("desc")
          .first();

        if (!existingFlag || existingFlag.resolvedAt) {
          await ctx.db.insert("overdueFlags", {
            teamId: team._id,
            flaggedAt: now,
          });
        }
      }
    }
  },
});

export const getUnresolved = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const allFlags = await ctx.db.query("overdueFlags").collect();
    return allFlags.filter((flag) => !flag.resolvedAt);
  },
});

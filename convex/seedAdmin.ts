import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const provisionAdmin = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();
    if (!user) {
      throw new Error(`No user found with email: ${email}`);
    }
    await ctx.db.patch(user._id, { role: "admin" });
    return { success: true, userId: user._id };
  },
});

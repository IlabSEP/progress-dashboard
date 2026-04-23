import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "./_generated/server";

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Not signed in");
  }
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireAuth(ctx);
  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return user;
}

// Monday 00:00 in Singapore time (UTC+8) for the week that contains `nowMs`.
export function mondayOfWeekSgt(nowMs: number): number {
  const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;
  const sgt = new Date(nowMs + SGT_OFFSET_MS);
  const dayOfWeek = sgt.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const mondaySgtMidnight = Date.UTC(
    sgt.getUTCFullYear(),
    sgt.getUTCMonth(),
    sgt.getUTCDate() - daysSinceMonday
  );
  return mondaySgtMidnight - SGT_OFFSET_MS;
}

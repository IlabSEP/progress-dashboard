import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "check overdue teams",
  { hourUTC: 8, minuteUTC: 0 },
  internal.overdueFlags.checkOverdue
);

export default crons;

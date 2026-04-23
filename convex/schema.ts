import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    role: v.optional(v.union(v.literal("team"), v.literal("admin"))),
    teamName: v.optional(v.string()),
    website: v.optional(v.string()),
    profileImage: v.optional(v.id("_storage")),
    githubRepoUrl: v.optional(v.string()),
    webhookSecret: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("by_role", ["role"]),
  teamNameHistory: defineTable({
    teamId: v.id("users"),
    oldName: v.string(),
    newName: v.string(),
    changedAt: v.number(),
  }).index("by_team", ["teamId"]),
  messages: defineTable({
    userId: v.id("users"),
    body: v.string(),
  }),
  tags: defineTable({
    name: v.string(),
    createdBy: v.id("users"),
  }).index("by_name", ["name"]),
  teamTags: defineTable({
    teamId: v.id("users"),
    tagId: v.id("tags"),
  })
    .index("by_team", ["teamId"])
    .index("by_tag", ["tagId"])
    .index("by_team_and_tag", ["teamId", "tagId"]),
  updates: defineTable({
    teamId: v.id("users"),
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
    submissionDate: v.number(),
    isLocked: v.boolean(),
  })
    .index("by_team", ["teamId"])
    .index("by_team_and_date", ["teamId", "submissionDate"]),
  overdueFlags: defineTable({
    teamId: v.id("users"),
    flaggedAt: v.number(),
    resolvedAt: v.optional(v.number()),
  }).index("by_team", ["teamId"]),
  githubCommitEvents: defineTable({
    teamId: v.id("users"),
    sha: v.string(),
    message: v.string(),
    author: v.string(),
    timestamp: v.string(),
    url: v.string(),
    repo: v.string(),
    branch: v.string(),
    receivedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_team_and_time", ["teamId", "receivedAt"])
    .index("by_sha", ["sha"]),
  updateRequests: defineTable({
    teamId: v.id("users"),
    requestedBy: v.id("users"),
    title: v.string(),
    message: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    requestedAt: v.number(),
    fulfilledAt: v.optional(v.number()),
    fulfilledByUpdateId: v.optional(v.id("updates")),
    fulfilledBySepCommitId: v.optional(v.id("githubCommitEvents")),
  }).index("by_team", ["teamId"]),
});

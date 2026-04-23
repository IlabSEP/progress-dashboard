/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminStats from "../adminStats.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as emails_ReminderEmail from "../emails/ReminderEmail.js";
import type * as emails_UpdateRequestEmail from "../emails/UpdateRequestEmail.js";
import type * as emails_sendReminder from "../emails/sendReminder.js";
import type * as emails_sendUpdateRequest from "../emails/sendUpdateRequest.js";
import type * as emails_theme from "../emails/theme.js";
import type * as files from "../files.js";
import type * as githubWebhook from "../githubWebhook.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as otp_ResendOTP from "../otp/ResendOTP.js";
import type * as otp_VerificationCodeEmail from "../otp/VerificationCodeEmail.js";
import type * as overdueFlags from "../overdueFlags.js";
import type * as seedAdmin from "../seedAdmin.js";
import type * as tags from "../tags.js";
import type * as updateRequests from "../updateRequests.js";
import type * as updates from "../updates.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminStats: typeof adminStats;
  auth: typeof auth;
  crons: typeof crons;
  "emails/ReminderEmail": typeof emails_ReminderEmail;
  "emails/UpdateRequestEmail": typeof emails_UpdateRequestEmail;
  "emails/sendReminder": typeof emails_sendReminder;
  "emails/sendUpdateRequest": typeof emails_sendUpdateRequest;
  "emails/theme": typeof emails_theme;
  files: typeof files;
  githubWebhook: typeof githubWebhook;
  helpers: typeof helpers;
  http: typeof http;
  messages: typeof messages;
  "otp/ResendOTP": typeof otp_ResendOTP;
  "otp/VerificationCodeEmail": typeof otp_VerificationCodeEmail;
  overdueFlags: typeof overdueFlags;
  seedAdmin: typeof seedAdmin;
  tags: typeof tags;
  updateRequests: typeof updateRequests;
  updates: typeof updates;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

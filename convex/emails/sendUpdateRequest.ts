"use node";

import { Resend } from "resend";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { UpdateRequestEmail } from "./UpdateRequestEmail";

export const send = internalAction({
  args: {
    to: v.string(),
    teamName: v.string(),
    title: v.string(),
    message: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.AUTH_RESEND_KEY;
    if (!apiKey) {
      throw new Error("AUTH_RESEND_KEY is not set");
    }
    const from =
      process.env.AUTH_EMAIL ?? "iLab SEP <noreply@pingw.me>";
    const appUrl = process.env.SITE_URL ?? "https://ilab-sep.pingw.me";

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [args.to],
      subject: `Update requested: ${args.title}`,
      react: UpdateRequestEmail({
        teamName: args.teamName,
        title: args.title,
        message: args.message,
        dueDate: args.dueDate,
        appUrl,
      }),
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});

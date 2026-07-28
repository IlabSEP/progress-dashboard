import { Email } from "@convex-dev/auth/providers/Email";
import { renderAsync } from "@react-email/components";
import { alphabet, generateRandomString } from "oslo/crypto";
import { Resend as ResendAPI } from "resend";
import { VerificationCodeEmail } from "./VerificationCodeEmail";

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 20,
  async generateVerificationToken() {
    return generateRandomString(4, alphabet("0-9"));
  },
  async sendVerificationRequest({
    identifier: email,
    provider,
    token,
    expires,
  }) {
    const minutes = Math.max(
      1,
      Math.floor((+new Date(expires) - Date.now()) / (60 * 1000))
    );
    const html = await renderAsync(
      VerificationCodeEmail({ code: token, expires })
    );
    const text = [
      `Your iLab sign-in code is ${token}.`,
      "",
      `Enter this code on the sign-in page to access your iLab SEP dashboard. It is valid for ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`,
      "",
      "If you didn't request this code, you can safely ignore this email.",
      "",
      "— iLab SEP Tracker",
    ].join("\n");

    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: process.env.AUTH_EMAIL ?? "iLab SEP Tracker <noreply@pingw.me>",
      to: [email],
      subject: `Your iLab sign-in code is ${token}`,
      html,
      text,
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

auth.addHttpRoutes(http);

// --- GitHub Webhook ---

async function verifyGitHubSignature(
  secret: string,
  payload: string,
  signatureHeader: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const expectedHex =
    "sha256=" +
    Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  // Constant-time-ish comparison
  if (expectedHex.length !== signatureHeader.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    mismatch |= expectedHex.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  }
  return mismatch === 0;
}

http.route({
  path: "/api/github-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const teamId = url.searchParams.get("teamId");
    if (!teamId) {
      return new Response(JSON.stringify({ error: "Missing teamId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Look up webhook secret
    let secret: string | null;
    try {
      secret = await ctx.runQuery(internal.githubWebhook.getTeamWebhookSecret, {
        teamId: teamId as Id<"users">,
      });
    } catch {
      return new Response(JSON.stringify({ error: "Invalid teamId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!secret) {
      return new Response(
        JSON.stringify({ error: "Webhook not configured for this team" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify HMAC signature
    const body = await request.text();
    const signatureHeader = request.headers.get("x-hub-signature-256") ?? "";
    const valid = await verifyGitHubSignature(secret, body, signatureHeader);
    if (!valid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle event type
    const event = request.headers.get("x-github-event");

    if (event === "ping") {
      return new Response(JSON.stringify({ message: "pong" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (event !== "push") {
      return new Response(
        JSON.stringify({ message: "Event ignored", event }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse push payload
    const payload = JSON.parse(body);
    const branch = (payload.ref ?? "").replace("refs/heads/", "");
    const repo = payload.repository?.full_name ?? "";
    const commits = (payload.commits ?? []).map(
      (c: { id: string; message: string; author: { name: string }; timestamp: string; url: string }) => ({
        teamId: teamId as Id<"users">,
        sha: c.id,
        message: c.message,
        author: c.author?.name ?? "unknown",
        timestamp: c.timestamp,
        url: c.url,
        repo,
        branch,
      })
    );

    if (commits.length > 0) {
      await ctx.runMutation(internal.githubWebhook.storeCommits, { commits });
    }

    return new Response(
      JSON.stringify({ message: "OK", commitsReceived: commits.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }),
});

export default http;

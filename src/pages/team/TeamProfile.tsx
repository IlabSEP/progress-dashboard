import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-mono text-[10px] uppercase tracking-[0.24em] text-ink/60"
    >
      {children}
    </label>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-baseline justify-between gap-4 border-b border-ink/20 pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55">
            {eyebrow}
          </p>
          <h2 className="font-display mt-1 text-2xl italic text-ink-deep">
            {title}
          </h2>
        </div>
      </div>
      <div className="rounded-sm border border-ink/15 bg-cream-paper p-6">
        {children}
      </div>
    </section>
  );
}

function MonoButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  variant?: "primary" | "outline" | "vermilion";
  type?: "button" | "submit";
}) {
  const styles =
    variant === "primary"
      ? "bg-ink text-cream-paper hover:bg-ink-deep"
      : variant === "vermilion"
        ? "bg-vermilion text-cream-paper hover:bg-vermilion-deep"
        : "border border-ink/25 bg-transparent text-ink-deep hover:bg-cream";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-sm px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}

function CopyField({ value, label }: { value: string; label: string }) {
  const { toast } = useToast();
  return (
    <div className="flex items-stretch gap-2">
      <code className="min-w-0 flex-1 break-all rounded-sm border border-ink/15 bg-cream px-3 py-2 font-mono text-xs text-ink-deep">
        {value}
      </code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast({ title: `${label} copied` });
        }}
        className="shrink-0 rounded-sm border border-ink/25 bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-deep transition-colors hover:bg-cream"
      >
        Copy
      </button>
    </div>
  );
}

export function TeamProfile() {
  const user = useQuery(api.users.viewer);
  const profileImageUrl = useQuery(
    api.files.getImageUrl,
    user?.profileImage
      ? { storageId: user.profileImage }
      : { storageId: undefined }
  );
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const setupGithubRepo = useMutation(api.githubWebhook.setupGithubRepo);
  const clearGithubRepo = useMutation(api.githubWebhook.clearGithubRepo);
  const regenerateSecret = useMutation(api.githubWebhook.regenerateWebhookSecret);
  const { toast } = useToast();

  const [teamName, setTeamName] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [repoUrlInput, setRepoUrlInput] = useState("");
  const [connectingRepo, setConnectingRepo] = useState(false);

  if (!user) {
    return (
      <div className="container max-w-xl px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-ink/50">
          Loading…
        </p>
      </div>
    );
  }

  const currentTeamName = teamName ?? user.teamName ?? "";
  const currentWebsite = website ?? user.website ?? "";

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({
        teamName: currentTeamName || undefined,
        website: currentWebsite,
      });
      setTeamName(null);
      setWebsite(null);
      toast({ title: "Profile updated" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const result = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await updateProfile({
        profileImage: storageId as Id<"_storage">,
      });
      toast({ title: "Profile picture updated" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const hasChanges =
    (teamName !== null && teamName !== (user.teamName ?? "")) ||
    (website !== null && website !== (user.website ?? ""));

  const webhookUrl =
    (import.meta.env.VITE_CONVEX_SITE_URL as string).replace(/\/$/, "") +
    "/api/github-webhook?teamId=" +
    user._id;

  return (
    <div className="bg-cream-paper text-ink-deep">
      <div className="paper-texture">
        <div className="container max-w-2xl px-6 py-12 space-y-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-vermilion">
              Team record
            </p>
            <h1 className="font-display mt-1 text-4xl italic leading-tight text-ink-deep sm:text-5xl">
              Your profile.
            </h1>
            <p className="mt-3 max-w-lg text-sm text-ink/70">
              The name on the byline, where you publish, and how your commits
              find their way to this ledger.
            </p>
          </div>

          <Section eyebrow="01 · Byline" title="Profile picture">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-ink/20 bg-cream">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Team profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-display text-3xl italic text-ink/50">
                    {(user.teamName ?? user.name ?? "T").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <FieldLabel>Upload image</FieldLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-ink/75"
                  disabled={uploading}
                />
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
                  {uploading ? "Uploading…" : "PNG or JPG · under 5MB"}
                </p>
              </div>
            </div>
          </Section>

          <Section eyebrow="02 · Identity" title="Team information">
            <div className="space-y-5">
              <div className="space-y-2">
                <FieldLabel htmlFor="teamName">Team name</FieldLabel>
                <Input
                  id="teamName"
                  value={currentTeamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Your team name"
                  className="border-ink/20 bg-cream"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="website">Website</FieldLabel>
                <Input
                  id="website"
                  type="url"
                  value={currentWebsite}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourproject.com"
                  className="border-ink/20 bg-cream"
                />
              </div>
              <MonoButton
                onClick={handleSave}
                disabled={!hasChanges || !currentTeamName.trim() || saving}
              >
                {saving ? "Saving…" : "Save changes →"}
              </MonoButton>
            </div>
          </Section>

          <Section eyebrow="03 · Wire" title="GitHub integration">
            {!user.githubRepoUrl ? (
              <div className="space-y-4">
                <p className="text-sm text-ink/70">
                  Link your repository so any push with a commit message
                  prefixed <code className="rounded-sm border border-ink/15 bg-cream px-1.5 py-0.5 text-[11px]">SEP:</code> is
                  logged to your timeline as an auto-update.
                </p>
                <div className="space-y-2">
                  <FieldLabel htmlFor="repoUrl">Repository URL</FieldLabel>
                  <Input
                    id="repoUrl"
                    value={repoUrlInput}
                    onChange={(e) => setRepoUrlInput(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="border-ink/20 bg-cream"
                  />
                </div>
                <MonoButton
                  onClick={async () => {
                    if (!repoUrlInput.trim()) return;
                    setConnectingRepo(true);
                    try {
                      await setupGithubRepo({ repoUrl: repoUrlInput.trim() });
                      setRepoUrlInput("");
                      toast({ title: "Repository connected" });
                    } catch (err: any) {
                      toast({ title: err.message, variant: "destructive" });
                    } finally {
                      setConnectingRepo(false);
                    }
                  }}
                  disabled={!repoUrlInput.trim() || connectingRepo}
                  variant="vermilion"
                >
                  {connectingRepo ? "Connecting…" : "Connect repository →"}
                </MonoButton>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <FieldLabel>Repository</FieldLabel>
                  <a
                    href={user.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-b border-ink/30 font-mono text-xs text-ink-deep transition-colors hover:border-vermilion hover:text-vermilion"
                  >
                    {user.githubRepoUrl}
                  </a>
                </div>

                <div className="space-y-2">
                  <FieldLabel>Webhook URL</FieldLabel>
                  <CopyField value={webhookUrl} label="Webhook URL" />
                </div>

                <div className="space-y-2">
                  <FieldLabel>Webhook secret</FieldLabel>
                  <CopyField value={user.webhookSecret ?? ""} label="Secret" />
                </div>

                <div className="rounded-sm border border-ink/15 bg-cream p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55">
                    Setup instructions
                  </p>
                  <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink/75 marker:font-mono marker:text-[11px] marker:text-ink/50">
                    <li>
                      In your GitHub repo, go to{" "}
                      <span className="font-display italic">
                        Settings › Webhooks › Add webhook
                      </span>
                      .
                    </li>
                    <li>Paste the Webhook URL above into &ldquo;Payload URL&rdquo;.</li>
                    <li>
                      Set Content type to{" "}
                      <code className="rounded-sm border border-ink/15 bg-cream-paper px-1.5 py-0.5 text-[11px]">
                        application/json
                      </code>
                      .
                    </li>
                    <li>Paste the Webhook Secret into &ldquo;Secret&rdquo;.</li>
                    <li>
                      Select <span className="font-display italic">&ldquo;Just the push event&rdquo;</span> and save.
                    </li>
                  </ol>
                </div>

                <div className="flex flex-wrap gap-3">
                  <MonoButton
                    variant="outline"
                    onClick={async () => {
                      try {
                        await regenerateSecret();
                        toast({
                          title: "Secret regenerated — update it in GitHub",
                        });
                      } catch (err: any) {
                        toast({ title: err.message, variant: "destructive" });
                      }
                    }}
                  >
                    Regenerate secret
                  </MonoButton>
                  <MonoButton
                    variant="outline"
                    onClick={async () => {
                      try {
                        await clearGithubRepo();
                        toast({ title: "Repository disconnected" });
                      } catch (err: any) {
                        toast({ title: err.message, variant: "destructive" });
                      }
                    }}
                  >
                    Disconnect
                  </MonoButton>
                </div>
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}


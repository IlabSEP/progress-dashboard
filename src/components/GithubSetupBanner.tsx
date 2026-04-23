import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";

export function GithubSetupBanner() {
  const user = useQuery(api.users.viewer);

  if (!user || user.githubRepoUrl) return null;

  return (
    <aside className="group relative flex flex-col items-start gap-3 rounded-sm border border-ink/20 bg-cream px-5 py-4 text-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-[3px] font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55">
          Footnote
        </span>
        <p className="text-ink/75">
          Link your GitHub repository — commits prefixed{" "}
          <code className="rounded-sm border border-ink/15 bg-cream-paper px-1.5 py-0.5 font-mono text-[11px] text-ink-deep">
            SEP:
          </code>{" "}
          are logged to your timeline automatically.
        </p>
      </div>
      <Link
        to="/dashboard/profile"
        className="inline-flex shrink-0 items-center gap-2 border-b border-ink/50 pb-0.5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/80 transition-colors hover:text-vermilion hover:border-vermilion"
      >
        Configure webhook →
      </Link>
    </aside>
  );
}

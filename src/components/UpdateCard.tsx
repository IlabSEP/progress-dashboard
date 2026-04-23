import { Doc } from "../../convex/_generated/dataModel";
import { DocumentPreview } from "@/components/DocumentPreview";
import { VideoEmbed } from "@/components/VideoEmbed";

function formatDateLong(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function EntryHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55">
      {children}
    </p>
  );
}

export function UpdateCard({
  update,
  showTeamName,
  actions,
}: {
  update: Doc<"updates">;
  showTeamName?: string;
  actions?: React.ReactNode;
}) {
  const hasGithub = Boolean(update.githubCommits);
  const hasVideo = Boolean(update.videoUrl);
  const hasDocs = update.documents && update.documents.length > 0;
  const hasWritten = Boolean(update.writtenUpdate);

  return (
    <article className="rounded-sm border border-ink/20 bg-cream-paper">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/15 px-6 py-5">
        <div className="min-w-0">
          {showTeamName ? (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-vermilion">
                {showTeamName}
              </p>
              <h2 className="font-display mt-1 text-2xl italic leading-tight text-ink-deep">
                Filed {formatDateLong(update.submissionDate)}
              </h2>
            </>
          ) : (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55">
                Filing
              </p>
              <h2 className="font-display mt-1 text-2xl italic leading-tight text-ink-deep">
                {formatDateLong(update.submissionDate)}
              </h2>
            </>
          )}
          <p
            className={`mt-2 font-mono text-[10px] uppercase tracking-[0.24em] ${
              update.isLocked ? "text-sage" : "text-vermilion"
            }`}
          >
            {update.isLocked ? "Locked · on record" : "Open for edit"}
          </p>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </header>

      <div className="divide-y divide-ink/10">
        {hasGithub && (
          <Section title="GitHub commits">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
              {update.githubCommits}
            </p>
          </Section>
        )}

        {hasVideo && (
          <Section title="Video update">
            <VideoEmbed url={update.videoUrl!} />
          </Section>
        )}

        {hasDocs && (
          <Section title="Documents">
            <ul className="space-y-4">
              {update.documents!.map((doc, i) => (
                <li key={i}>
                  <DocumentPreview
                    storageId={doc.storageId}
                    fileName={doc.fileName}
                    mimeType={doc.mimeType}
                  />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {hasWritten && (
          <Section title="Written update">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/85">
              {update.writtenUpdate}
            </p>
          </Section>
        )}

        {!hasGithub && !hasVideo && !hasDocs && !hasWritten && (
          <div className="px-6 py-6 text-center">
            <p className="font-display text-lg italic text-ink/50">
              No content on record.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-5">
      <EntryHeading>{title}</EntryHeading>
      <div className="mt-3">{children}</div>
    </div>
  );
}

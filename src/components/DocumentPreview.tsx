import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

function FileLabel({
  fileName,
  url,
}: {
  fileName: string;
  url?: string | null;
}) {
  const base =
    "inline-flex items-center gap-2 font-mono text-[11px] text-ink-deep";

  if (!url) {
    return (
      <span className={`${base} text-ink/50`}>
        <span aria-hidden className="text-ink/30">
          ◇
        </span>
        <span className="truncate">{fileName}</span>
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} group transition-colors hover:text-vermilion`}
    >
      <span aria-hidden className="text-ink/50 group-hover:text-vermilion">
        ◇
      </span>
      <span className="truncate">{fileName}</span>
      <span
        aria-hidden
        className="text-ink/40 transition-colors group-hover:text-vermilion"
      >
        ↓
      </span>
    </a>
  );
}

export function DocumentPreview({
  storageId,
  fileName,
  mimeType,
}: {
  storageId: Id<"_storage">;
  fileName: string;
  mimeType: string;
}) {
  const url = useQuery(api.files.getUrl, { storageId });

  const isVideo = mimeType.startsWith("video/");
  const isPdf = mimeType === "application/pdf";

  if (!isVideo && !isPdf) {
    return <FileLabel fileName={fileName} url={url} />;
  }

  return (
    <div className="space-y-2">
      <FileLabel fileName={fileName} url={url} />
      {isVideo && url && (
        <video
          controls
          preload="metadata"
          src={url}
          className="aspect-video w-full rounded-sm border border-ink/20 bg-ink-deep"
        />
      )}
      {isPdf && url && (
        <iframe
          src={url}
          title={fileName}
          loading="lazy"
          className="h-[70vh] w-full rounded-sm border border-ink/20 bg-cream"
        />
      )}
      {!url && (
        <div
          className={`${
            isVideo ? "aspect-video" : "h-[70vh]"
          } w-full rounded-sm border border-ink/15 bg-cream`}
        />
      )}
    </div>
  );
}

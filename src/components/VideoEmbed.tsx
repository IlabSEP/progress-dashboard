type Embed =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "drive"; embedUrl: string }
  | null;

function detect(url: string): Embed {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1).split("/")[0];
    return id ? { kind: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` } : null;
  }

  if (host.endsWith("youtube.com") || host === "youtube-nocookie.com") {
    const segments = parsed.pathname.split("/").filter(Boolean);
    let id: string | null = null;
    if (parsed.pathname === "/watch") {
      id = parsed.searchParams.get("v");
    } else if (segments[0] === "shorts" || segments[0] === "embed" || segments[0] === "live") {
      id = segments[1] ?? null;
    }
    return id ? { kind: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` } : null;
  }

  if (host === "drive.google.com") {
    const segments = parsed.pathname.split("/").filter(Boolean);
    let id: string | null = null;
    const fileIdx = segments.indexOf("d");
    if (segments[0] === "file" && fileIdx !== -1 && segments[fileIdx + 1]) {
      id = segments[fileIdx + 1];
    } else if (parsed.pathname === "/open" || parsed.pathname === "/uc") {
      id = parsed.searchParams.get("id");
    }
    return id ? { kind: "drive", embedUrl: `https://drive.google.com/file/d/${id}/preview` } : null;
  }

  return null;
}

export function VideoEmbed({ url }: { url: string }) {
  const embed = detect(url);

  if (!embed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block break-all border-b border-ink/30 font-mono text-xs text-ink-deep transition-colors hover:border-vermilion hover:text-vermilion"
      >
        {url}
      </a>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-sm border border-ink/20 bg-ink-deep">
      <iframe
        src={embed.embedUrl}
        title="Video update"
        loading="lazy"
        allowFullScreen
        allow={
          embed.kind === "youtube"
            ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            : undefined
        }
        className="h-full w-full border-0"
      />
    </div>
  );
}

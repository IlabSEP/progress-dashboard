import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const NTU_SEP_URL =
  "https://www.ntu.edu.sg/i-lab/research-focus/student-entrepreneurship-program-(sep)";

export function LoginPage() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-cream-paper paper-texture text-ink-deep">
      <header className="shrink-0 border-b border-ink/15">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}ccds_innovation_lab_logo.jpeg`}
              alt="Innovation Lab @ NTU CCDS"
              className="h-10 w-10 rounded-sm object-cover ring-1 ring-ink/20"
            />
            <div className="leading-tight">
              <p className="font-display text-[17px] italic text-ink-deep">
                iLab SEP
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink/55">
                Progress tracker
              </p>
            </div>
          </div>
          <a
            href={NTU_SEP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60 transition-colors hover:text-vermilion"
          >
            NTU iLab ↗
          </a>
        </div>
      </header>

      <section className="flex grow items-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:gap-16">
            <div>
              <h1 className="font-display text-5xl italic leading-[0.95] text-ink-deep md:text-7xl">
                A ledger for ventures,
                <br />
                <span className="text-vermilion">from vision to action.</span>
              </h1>
              <p className="mt-8 max-w-[52ch] text-base leading-relaxed text-ink/75 md:text-lg">
                The standing record of NTU iLab's Student Entrepreneurship
                Program — where teams file monthly progress.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link
                  to="/signin"
                  className="group inline-flex items-center gap-3 rounded-sm bg-vermilion px-8 py-4 font-mono text-[13px] font-medium uppercase tracking-[0.22em] text-cream-paper shadow-[0_8px_24px_-12px_rgba(199,62,29,0.55)] transition-all hover:bg-ink-deep hover:shadow-[0_10px_28px_-10px_rgba(7,40,73,0.5)]"
                >
                  Sign in
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
                <a
                  href={NTU_SEP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 border-b border-ink/30 pb-1 font-mono text-[11px] uppercase tracking-[0.24em] text-ink/70 transition-colors hover:border-vermilion hover:text-vermilion"
                >
                  NTU prospectus
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </a>
              </div>
            </div>
            <VentureSketch />
          </div>
        </div>
      </section>
    </div>
  );
}

const SPARK_TITLES = [
  "Loop",
  "Ember",
  "Atlas",
  "Cinder",
  "Beacon",
  "Rivet",
  "Forge",
  "Quill",
];
const VERBS = ["build", "ship", "prototype", "launch", "iterate"];

function VentureSketch() {
  const [sparkIdx, setSparkIdx] = useState(0);
  const [title, setTitle] = useState("");
  const [verbIdx, setVerbIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setVerbIdx((v) => (v + 1) % VERBS.length),
      2400,
    );
    return () => window.clearInterval(id);
  }, []);

  const placeholder = SPARK_TITLES[sparkIdx];
  const hasTitle = title.trim().length > 0;

  return (
    <aside className="flex flex-col">
      <div className="relative rounded-sm border border-ink/20 bg-cream p-7 shadow-[0_18px_36px_-28px_rgba(7,40,73,0.35)]">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-ink/55">
            Working draft
          </p>
          <button
            type="button"
            onClick={() =>
              setSparkIdx((i) => (i + 1) % SPARK_TITLES.length)
            }
            className="group inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.24em] text-ink/55 transition-colors hover:text-vermilion"
            aria-label="Spark a new working title"
          >
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:rotate-180"
            >
              ↻
            </span>
            Spark
          </button>
        </div>

        <div className="mt-7">
          <label
            htmlFor="venture-sketch-title"
            className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink/45"
          >
            Working title
          </label>
          <input
            id="venture-sketch-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={placeholder}
            maxLength={32}
            className="mt-2 w-full border-b border-ink/30 bg-transparent pb-2 font-display text-4xl italic text-ink-deep placeholder:text-ink/25 focus:border-vermilion focus:outline-none"
          />
        </div>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/55">
          Something to{" "}
          <span
            key={verbIdx}
            className="inline-block animate-[fadeIn_300ms_ease-out] text-vermilion"
          >
            {VERBS[verbIdx]}
          </span>
          .
        </p>

        <div className="mt-7 h-px w-12 bg-vermilion" />
        <p className="mt-4 text-[13px] leading-relaxed text-ink/65">
          {hasTitle
            ? "Good. File it once you sign in — the ledger is open."
            : "Every venture begins as a name on a page."}
        </p>
      </div>
    </aside>
  );
}

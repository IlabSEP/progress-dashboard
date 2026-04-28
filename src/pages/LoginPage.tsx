import { SignInWithEmailCode } from "@/auth/SignInWithEmailCode";

const NTU_SEP_URL =
  "https://www.ntu.edu.sg/i-lab/research-focus/student-entrepreneurship-program-(sep)";

export function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-cream-paper paper-texture text-ink-deep">
      <Masthead />
      <Hero />
      <Prospectus />
      <Rhythm />
      <SignInSection />
      <Colophon />
    </div>
  );
}

function Masthead() {
  return (
    <header className="border-b border-ink/20">
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
              Tracker · Est. 2026
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#prospectus"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60 transition-colors hover:text-vermilion"
          >
            Prospectus
          </a>
          <a
            href="#rhythm"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60 transition-colors hover:text-vermilion"
          >
            Rhythm
          </a>
          <a
            href="#enter"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-deep transition-colors hover:text-vermilion"
          >
            Enter tracker →
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="border-b border-ink/15">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:gap-16">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-vermilion">
              Vol. I · Issue № 01
            </p>
            <h1 className="font-display mt-4 text-5xl italic leading-[0.95] text-ink-deep md:text-7xl">
              A ledger for ventures,
              <br />
              <span className="text-vermilion">from vision to action.</span>
            </h1>
            <p className="mt-8 max-w-[52ch] text-base leading-relaxed text-ink/75 md:text-lg">
              The Innovation Lab Student Entrepreneurship Program is a 360°
              development track for the next generation of technology founders
              at NTU. This tracker is its record of work — the standing
              document where teams file monthly progress, and where editors
              keep the ledger current.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <a
                href="#enter"
                className="group inline-flex items-center gap-2 rounded-sm bg-ink-deep px-5 py-3 font-mono text-[11px] uppercase tracking-[0.24em] text-cream-paper transition-colors hover:bg-vermilion"
              >
                Sign in to file
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
              <a
                href={NTU_SEP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 border-b border-ink/30 pb-1 font-mono text-[11px] uppercase tracking-[0.24em] text-ink-deep transition-colors hover:border-vermilion hover:text-vermilion"
              >
                Read the NTU prospectus
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-1"
                >
                  ↗
                </span>
              </a>
            </div>
          </div>

          <aside className="flex flex-col justify-end">
            <div className="rounded-sm border border-ink/20 bg-cream p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-ink/55">
                Dispatch
              </p>
              <p className="font-display mt-3 text-2xl italic leading-snug text-ink-deep">
                “Encouraging CCDS students’ innovation spirits.”
              </p>
              <div className="mt-5 h-px w-12 bg-vermilion" />
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                — NTU Innovation Lab
              </p>
            </div>
            <dl className="mt-6 grid grid-cols-3 divide-x divide-ink/15 rounded-sm border border-ink/20 bg-cream-paper">
              <Stat label="Team size" value="2–5" />
              <Stat label="Weekly" value="10 hr" />
              <Stat label="To MVP" value="≤ 1 yr" />
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-4 text-center">
      <dt className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink/55">
        {label}
      </dt>
      <dd className="font-display mt-1 text-2xl italic text-ink-deep">
        {value}
      </dd>
    </div>
  );
}

function Prospectus() {
  return (
    <section id="prospectus" className="border-b border-ink/15">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <SectionHeader
          mark="§ 01"
          eyebrow="Prospectus"
          title="The program, in brief."
        />

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-14">
          <Column
            index="01"
            heading="What it is"
            body="A 360-degree development initiative for future technology leaders — equal parts workshop, studio, and funding vehicle. Built to take student ideas from a sketch to a shipping product."
          />
          <Column
            index="02"
            heading="Who it’s for"
            body="All matriculated NTU students, with preference for CCDS. Teams run 2 to 5 people, at least half drawn from CCDS. Graduate applicants apply with supervisor endorsement."
          />
          <Column
            index="03"
            heading="What you get"
            body="Seed funding for accepted teams, mentorship from school and industry, access to the Innovation Lab’s facilities, and a pipeline into commercialization — pitch coaching, competition entry, and follow-on capital."
          />
        </div>
      </div>
    </section>
  );
}

function Column({
  index,
  heading,
  body,
}: {
  index: string;
  heading: string;
  body: string;
}) {
  return (
    <div className="relative border-t-2 border-ink-deep pt-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-vermilion">
        {index}
      </p>
      <h3 className="font-display mt-2 text-2xl italic leading-tight text-ink-deep">
        {heading}
      </h3>
      <p className="mt-4 text-[15px] leading-relaxed text-ink/75">{body}</p>
    </div>
  );
}

function Rhythm() {
  const rows = [
    {
      k: "Weekly",
      v: "Ten hours, minimum",
      note: "Dedicated time on the venture. No filler.",
    },
    {
      k: "Monthly",
      v: "Progress filing",
      note: "A standing update to your mentor — logged here in the tracker.",
    },
    {
      k: "Year one",
      v: "Ship an MVP",
      note: "A working minimum viable product and a business plan worth defending.",
    },
    {
      k: "Rolling",
      v: "Twice-yearly intake",
      note: "Applications open each cycle; decisions within a month of close.",
    },
  ];

  return (
    <section id="rhythm" className="border-b border-ink/15 bg-cream">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <SectionHeader
          mark="§ 02"
          eyebrow="Rhythm of work"
          title="The cadence teams keep."
        />

        <dl className="mt-10 divide-y divide-ink/15 border-y border-ink/15">
          {rows.map((row) => (
            <div
              key={row.k}
              className="grid grid-cols-1 gap-2 py-5 md:grid-cols-[160px_220px_1fr] md:items-baseline md:gap-8"
            >
              <dt className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55">
                {row.k}
              </dt>
              <dd className="font-display text-xl italic text-ink-deep">
                {row.v}
              </dd>
              <p className="text-[15px] leading-relaxed text-ink/70">
                {row.note}
              </p>
            </div>
          ))}
        </dl>

        <p className="mt-10 max-w-[60ch] text-sm leading-relaxed text-ink/65">
          Once admitted, teams file a monthly update through this tracker.
          Commits prefixed{" "}
          <code className="rounded-sm border border-ink/15 bg-cream-paper px-1.5 py-0.5 font-mono text-[11px] text-ink-deep">
            SEP:
          </code>{" "}
          are captured automatically from GitHub; manual filings cover video,
          written, and document updates. The ledger stays current.
        </p>
      </div>
    </section>
  );
}

function SignInSection() {
  return (
    <section id="enter" className="border-b border-ink/15">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-vermilion">
              § 03 · Enter
            </p>
            <h2 className="font-display mt-4 text-4xl italic leading-tight text-ink-deep md:text-5xl">
              Already in the program?
            </h2>
            <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-ink/70">
              Sign in with the email on record. A single-use code will be
              dispatched; no passwords kept on file.
            </p>

            <div className="mt-8 rounded-sm border border-ink/20 bg-cream p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55">
                Not yet admitted?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                Applications open on a rolling basis, twice a year. Admission
                is decided within a month of each close.
              </p>
              <a
                href={NTU_SEP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 border-b border-ink/30 pb-0.5 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-deep transition-colors hover:border-vermilion hover:text-vermilion"
              >
                How to apply
                <span aria-hidden>↗</span>
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-sm border border-ink/20 bg-cream-paper shadow-[0_12px_32px_-18px_rgba(7,40,73,0.35)]">
              <div className="flex items-center justify-between border-b border-ink/15 px-6 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55">
                  Sign-in counter
                </p>
                <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink/45">
                  No. 01
                </span>
              </div>
              <div className="px-6 py-7">
                <SignInWithEmailCode />
              </div>
              <div className="border-t border-ink/15 bg-cream px-6 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink/50">
                  A one-time code arrives by email — valid for a few minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  mark,
  eyebrow,
  title,
}: {
  mark: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-vermilion">
          {mark} · {eyebrow}
        </p>
        <h2 className="font-display mt-3 text-4xl italic leading-tight text-ink-deep md:text-5xl">
          {title}
        </h2>
      </div>
      <div className="hidden h-px flex-1 bg-ink/15 md:block" aria-hidden />
    </div>
  );
}

function Colophon() {
  return (
    <footer>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}ccds_innovation_lab_logo.jpeg`}
            alt=""
            aria-hidden
            className="h-8 w-8 rounded-sm object-cover ring-1 ring-ink/20"
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55">
            Published from the dashboard press · Innovation Lab, NTU CCDS
          </p>
        </div>
        <div className="flex items-center gap-5">
          <a
            href={NTU_SEP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/60 transition-colors hover:text-vermilion"
          >
            NTU iLab ↗
          </a>
          <a
            href="#enter"
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/60 transition-colors hover:text-vermilion"
          >
            Sign in
          </a>
        </div>
      </div>
    </footer>
  );
}

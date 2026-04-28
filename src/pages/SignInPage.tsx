import { Link } from "react-router-dom";
import { SignInWithEmailCode } from "@/auth/SignInWithEmailCode";

export function SignInPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-cream-paper paper-texture text-ink-deep">
      <header className="border-b border-ink/15">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}ccds_innovation_lab_logo.jpeg`}
              alt="Innovation Lab @ NTU CCDS"
              className="h-9 w-9 rounded-sm object-cover ring-1 ring-ink/20"
            />
            <div className="leading-tight">
              <p className="font-display text-[17px] italic text-ink-deep">
                iLab SEP
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink/55">
                Progress tracker
              </p>
            </div>
          </Link>
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/60 transition-colors hover:text-vermilion"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="flex grow items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-sm border border-ink/20 bg-cream-paper shadow-[0_12px_32px_-18px_rgba(7,40,73,0.35)]">
            <div className="border-b border-ink/15 px-6 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/55">
                Sign in
              </p>
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
      </main>
    </div>
  );
}

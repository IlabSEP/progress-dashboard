import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";

function daysUntil(ts: number): number {
  const diff = ts - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function UpdateRequestBanner() {
  const pendingRequests = useQuery(api.updateRequests.getMyPending);

  if (!pendingRequests || pendingRequests.length === 0) return null;

  return (
    <div className="space-y-4">
      {pendingRequests.map((req, idx) => {
        const overdue = req.dueDate ? req.dueDate < Date.now() : false;
        const days = req.dueDate ? daysUntil(req.dueDate) : null;
        const status = overdue
          ? "Overdue"
          : days === null
            ? "Open"
            : days === 0
              ? "Due today"
              : days === 1
                ? "Due tomorrow"
                : `${days} days left`;

        return (
          <article
            key={req._id}
            className="relative overflow-hidden rounded-sm border border-vermilion/40 bg-vermilion-soft/70"
          >
            <span className="absolute inset-y-0 left-0 w-1 bg-vermilion animate-pulse-bar" />
            <div className="grid grid-cols-1 gap-8 p-7 pl-8 md:grid-cols-[1fr_auto]">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-vermilion-deep">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em]">
                    Request {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px w-10 bg-vermilion/50" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] font-semibold">
                    {status}
                  </span>
                </div>
                <h3 className="font-display text-[32px] italic leading-tight text-ink-deep">
                  {req.title}
                </h3>
                {req.message && (
                  <p className="max-w-xl text-sm leading-relaxed text-ink/75">
                    {req.message}
                  </p>
                )}
                <dl className="flex flex-wrap gap-x-8 gap-y-2 text-xs">
                  {req.dueDate && (
                    <div>
                      <dt className="font-mono uppercase tracking-[0.22em] text-ink/50">
                        Due by
                      </dt>
                      <dd
                        className={`mt-1 font-display italic text-lg ${
                          overdue ? "text-vermilion-deep" : "text-ink-deep"
                        }`}
                      >
                        {new Date(req.dueDate).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-mono uppercase tracking-[0.22em] text-ink/50">
                      Requested
                    </dt>
                    <dd className="mt-1 font-display italic text-lg text-ink-deep">
                      {new Date(req.requestedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-col items-start justify-between gap-3 md:items-end md:text-right">
                <Link
                  to="/dashboard/submit"
                  className="inline-flex items-center gap-2 rounded-sm bg-vermilion px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-cream-paper shadow-[0_1px_0_rgba(7,40,73,0.2)] transition-colors hover:bg-vermilion-deep"
                >
                  Respond now →
                </Link>
                <p className="max-w-[14ch] font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45 md:text-right">
                  A formal update satisfies this request.
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UpdateForm } from "@/components/UpdateForm";

export function SubmitUpdate() {
  const latestUpdate = useQuery(api.updates.getLatest);
  const pendingRequests = useQuery(api.updateRequests.getMyPending);

  const editableUpdate =
    latestUpdate && !latestUpdate.isLocked ? latestUpdate : null;

  return (
    <div className="bg-cream-paper text-ink-deep">
      <div className="paper-texture">
        <div className="container max-w-3xl px-6 py-12">
          <header className="border-b-2 border-ink pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/60">
              Field Report · New Entry
            </p>
          </header>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-vermilion">
                {editableUpdate ? "Editing draft" : "File an update"}
              </p>
              <h1 className="font-display mt-1 text-4xl italic leading-[1.05] text-ink-deep sm:text-5xl">
                {editableUpdate
                  ? "Refine & re-file."
                  : "Put it on the record."}
              </h1>
            </div>
          </div>
          {editableUpdate && (
            <p className="mt-4 text-sm text-ink/70">
              Your most recent entry has been unlocked. Saving will re-file it
              and lock it again.
            </p>
          )}

          {pendingRequests && pendingRequests.length > 0 && (
            <div className="mt-8 rounded-sm border border-vermilion/40 bg-vermilion-soft/60 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-vermilion-deep">
                Outstanding request{pendingRequests.length > 1 ? "s" : ""}
              </p>
              <div className="mt-2 space-y-3">
                {pendingRequests.map((req) => {
                  const overdue = req.dueDate && req.dueDate < Date.now();
                  return (
                    <div key={req._id}>
                      <p className="font-display text-lg italic text-ink-deep">
                        {req.title}
                      </p>
                      {req.dueDate && (
                        <p
                          className={`font-mono text-[11px] uppercase tracking-[0.22em] ${
                            overdue ? "text-vermilion-deep" : "text-ink/60"
                          }`}
                        >
                          {overdue ? "Overdue · " : "Due "}
                          {new Date(req.dueDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                      {req.message && (
                        <p className="mt-1 text-sm text-ink/75">{req.message}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-10">
            <UpdateForm existing={editableUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}

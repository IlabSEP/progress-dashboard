import { useQuery, useMutation } from "convex/react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export function AdminViewRequest() {
  const { requestedAt } = useParams<{ requestedAt: string }>();
  const batch = useQuery(
    api.updateRequests.getByBatch,
    requestedAt ? { requestedAt: Number(requestedAt) } : "skip"
  );
  const cancelRequest = useMutation(api.updateRequests.cancel);
  const { toast } = useToast();

  if (batch === undefined) {
    return (
      <div className="container max-w-3xl py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (batch.length === 0) {
    return (
      <div className="container max-w-3xl py-8 space-y-4">
        <Button variant="outline" asChild>
          <Link to="/admin">Back to Dashboard</Link>
        </Button>
        <p>Request batch not found.</p>
      </div>
    );
  }

  const first = batch[0];
  const title = first.title;
  const dueDate = first.dueDate;
  const message = first.message;
  const createdAt = first.requestedAt;

  const pending = batch.filter((r) => !r.fulfilledAt);
  const fulfilled = batch.filter((r) => r.fulfilledAt && r.fulfilledByUpdateId);
  const cancelled = batch.filter((r) => r.fulfilledAt && !r.fulfilledByUpdateId);

  const isOverdue = dueDate && dueDate < Date.now();

  async function handleCancel(requestId: typeof first._id) {
    try {
      await cancelRequest({ requestId });
      toast({ title: "Request cancelled" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <Button variant="outline" asChild>
        <Link to="/admin">Back to Dashboard</Link>
      </Button>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
          <span>Created {new Date(createdAt).toLocaleDateString()}</span>
          {dueDate && (
            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
              {isOverdue ? "Overdue" : "Due"}: {new Date(dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
          <span>{batch.length} team{batch.length !== 1 ? "s" : ""}</span>
        </div>
        {message && (
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        )}
      </div>

      {/* Summary badges */}
      <div className="flex gap-3">
        {fulfilled.length > 0 && (
          <Badge variant="default" className="bg-green-600">
            {fulfilled.length} submitted
          </Badge>
        )}
        {pending.length > 0 && (
          <Badge variant="default" className="bg-orange-500">
            {pending.length} pending
          </Badge>
        )}
        {cancelled.length > 0 && (
          <Badge variant="secondary">
            {cancelled.length} cancelled
          </Badge>
        )}
      </div>

      {/* Fulfilled */}
      {fulfilled.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Submitted</h3>
          <div className="rounded-lg border divide-y">
            {fulfilled.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  <span className="text-sm font-medium">
                    {req.team?.teamName ?? req.team?.name ?? "Unknown Team"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(req.fulfilledAt!).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/update/${req.fulfilledByUpdateId}`}>
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Pending</h3>
          <div className="rounded-lg border divide-y">
            {pending.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  </span>
                  <span className="text-sm font-medium">
                    {req.team?.teamName ?? req.team?.name ?? "Unknown Team"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancel(req._id)}
                >
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancelled */}
      {cancelled.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-muted-foreground">Cancelled</h3>
          <div className="rounded-lg border divide-y">
            {cancelled.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {req.team?.teamName ?? req.team?.name ?? "Unknown Team"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { Doc } from "../../convex/_generated/dataModel";

export function OverdueBanner({
  teams,
}: {
  teams: Map<string, Doc<"users">>;
}) {
  const overdueFlags = useQuery(api.overdueFlags.getUnresolved);

  if (!overdueFlags || overdueFlags.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertTitle>Overdue Teams</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          {overdueFlags.map((flag) => {
            const team = teams.get(flag.teamId as string);
            return (
              <li key={flag._id}>
                <Link
                  to={`/admin/team/${flag.teamId}`}
                  className="underline hover:no-underline"
                >
                  {team?.teamName ?? "Unknown Team"}
                </Link>
                <span className="text-sm ml-2">
                  (flagged {new Date(flag.flaggedAt).toLocaleDateString()})
                </span>
              </li>
            );
          })}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

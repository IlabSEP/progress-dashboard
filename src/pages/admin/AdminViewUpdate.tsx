import { useQuery, useMutation } from "convex/react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { UpdateCard } from "@/components/UpdateCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Id } from "../../../convex/_generated/dataModel";

export function AdminViewUpdate() {
  const { updateId } = useParams<{ updateId: string }>();
  const update = useQuery(
    api.updates.getById,
    updateId ? { updateId: updateId as Id<"updates"> } : "skip"
  );
  const unlockMutation = useMutation(api.updates.unlock);
  const { toast } = useToast();

  if (update === undefined) {
    return (
      <div className="container max-w-3xl py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!update) {
    return (
      <div className="container max-w-3xl py-8">
        <p>Update not found.</p>
      </div>
    );
  }

  const handleUnlock = async () => {
    try {
      await unlockMutation({ updateId: update._id });
      toast({ title: "Update unlocked" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="container max-w-3xl py-8 space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link to="/admin">Back to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/admin/team/${update.teamId}`}>View Team</Link>
        </Button>
      </div>
      <UpdateCard
        update={update}
        actions={
          update.isLocked ? (
            <Button variant="outline" size="sm" onClick={handleUnlock}>
              Unlock for Editing
            </Button>
          ) : (
            <Badge variant="outline">Unlocked</Badge>
          )
        }
      />
    </div>
  );
}

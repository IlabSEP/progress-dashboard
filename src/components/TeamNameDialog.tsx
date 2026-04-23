import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function TeamNameDialog() {
  const [teamName, setTeamName] = useState("");
  const setTeamNameMutation = useMutation(api.users.setTeamName);
  const [submitting, setSubmitting] = useState(false);

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome! Set your team name</DialogTitle>
          <DialogDescription>
            Enter your project team name. This will be visible to the admin.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!teamName.trim()) return;
            setSubmitting(true);
            try {
              await setTeamNameMutation({ teamName: teamName.trim() });
            } finally {
              setSubmitting(false);
            }
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Project Alpha"
              autoFocus
            />
          </div>
          <Button type="submit" disabled={!teamName.trim() || submitting}>
            {submitting ? "Saving..." : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

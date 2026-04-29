import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TUTORIAL_VIDEOS, type TutorialKey } from "@/lib/tutorialVideos";

type Step = {
  video: TutorialKey;
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel?: string;
  onPrimary?: () => void;
};

function TutorialVideo({ storageId }: { storageId: Id<"_storage"> }) {
  const url = useQuery(api.files.getUrl, { storageId });

  if (url === undefined) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cream-paper/60">
          Loading…
        </p>
      </div>
    );
  }

  if (url === null) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cream-paper/60">
          Video unavailable
        </p>
      </div>
    );
  }

  return (
    <video
      key={storageId}
      src={url}
      controls
      autoPlay
      className="h-full w-full"
    />
  );
}

export function TutorialDialog({
  open,
  onOpenChange,
  steps,
  stepIndex,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: Step[];
  stepIndex: number;
}) {
  const step = steps[stepIndex];
  if (!step) return null;

  const storageId = TUTORIAL_VIDEOS[step.video] as Id<"_storage">;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-2xl border-ink/20 bg-cream-paper p-0 sm:rounded-2xl">
        <div className="px-8 pt-8 pb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-vermilion">
            {step.eyebrow}
          </p>
          <DialogTitle className="font-display mt-2 text-2xl italic text-ink-deep">
            {step.title}
          </DialogTitle>
          <DialogDescription className="mt-3 text-sm text-ink/70">
            {step.description}
          </DialogDescription>
        </div>

        <div className="px-8">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-ink-deep">
            <TutorialVideo storageId={storageId} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-8 pt-6 pb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
            {stepIndex + 1} / {steps.length}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-ink/25 bg-transparent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-deep transition-colors hover:bg-cream"
            >
              Close
            </button>
            {step.onPrimary && (
              <button
                type="button"
                onClick={step.onPrimary}
                className="rounded-md bg-vermilion px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-cream-paper transition-colors hover:bg-vermilion-deep"
              >
                {step.primaryLabel ?? "Next →"}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

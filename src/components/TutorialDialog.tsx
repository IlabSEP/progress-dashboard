import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TUTORIAL_VIDEOS, type TutorialKey, loomEmbedUrl } from "@/lib/tutorialVideos";

type Step = {
  video: TutorialKey;
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel?: string;
  onPrimary?: () => void;
};

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 border-ink/20 bg-cream-paper p-0 sm:rounded-sm">
        <div className="border-b border-ink/15 px-6 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-vermilion">
            {step.eyebrow}
          </p>
          <DialogTitle className="font-display mt-1 text-2xl italic text-ink-deep">
            {step.title}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-ink/70">
            {step.description}
          </DialogDescription>
        </div>

        <div className="aspect-video w-full overflow-hidden bg-ink-deep">
          <iframe
            key={step.video}
            src={loomEmbedUrl(TUTORIAL_VIDEOS[step.video])}
            title={step.video}
            allowFullScreen
            allow="autoplay; fullscreen"
            className="h-full w-full border-0"
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-ink/15 px-6 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
            {stepIndex + 1} / {steps.length}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-sm border border-ink/25 bg-transparent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-deep transition-colors hover:bg-cream"
            >
              Close
            </button>
            {step.onPrimary && (
              <button
                type="button"
                onClick={step.onPrimary}
                className="rounded-sm bg-vermilion px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-cream-paper transition-colors hover:bg-vermilion-deep"
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

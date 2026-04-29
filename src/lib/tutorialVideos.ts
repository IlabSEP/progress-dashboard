export const TUTORIAL_VIDEOS = {
  AccountCreation: "kg26s9nekkmhhv5fsfwcwbwvs985rt8y",
  ManualUpdate: "kg20btyvga5cd4hg84r37jy5fn85rq2b",
  WebhookSetup: "kg28t2bz2ay97v22nk48y4421d85s461",
  WebhookShowcase: "kg2232fth1bca1fhdtpjgnq73h85r9e6",
} as const;

export type TutorialKey = keyof typeof TUTORIAL_VIDEOS;

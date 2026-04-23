import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { ilabTailwindConfig } from "./theme";

export function UpdateRequestEmail({
  teamName,
  title,
  message,
  dueDate,
  appUrl,
}: {
  teamName: string;
  title: string;
  message?: string;
  dueDate?: number;
  appUrl: string;
}) {
  const dueDateLabel = dueDate
    ? new Date(dueDate).toLocaleDateString("en-SG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Html>
      <Tailwind config={ilabTailwindConfig}>
        <Head />
        <Preview>Update requested: {title}</Preview>
        <Body className="bg-cream m-0 p-0 font-sans">
          <Container className="max-w-[560px] mx-auto my-10 bg-creamPaper border border-solid border-[rgba(11,59,102,0.15)] rounded-md overflow-hidden">
            <Section className="bg-creamWarm px-8 py-5 border-b border-solid border-[rgba(11,59,102,0.15)]">
              <Text className="font-mono text-[10px] uppercase tracking-[0.24em] text-inkSoft m-0">
                iLab SEP · Tracker
              </Text>
              <Text className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermilion m-0 mt-1">
                Update requested
              </Text>
            </Section>

            <Section className="px-8 py-8">
              <Heading className="font-display italic text-[26px] leading-tight text-inkDeep m-0">
                Hi {teamName},
              </Heading>
              <Text className="text-[14px] leading-6 text-ink mt-4 mb-0">
                An admin at the Innovation Lab has requested a progress update
                from your team.
              </Text>

              <Section className="mt-6 mb-2 border-l-2 border-solid border-vermilion bg-creamWarm px-5 py-4 rounded-r">
                <Text className="font-mono text-[10px] uppercase tracking-[0.2em] text-inkSoft m-0">
                  Request
                </Text>
                <Text className="font-display text-[18px] text-inkDeep m-0 mt-1 mb-0">
                  {title}
                </Text>
                {message && (
                  <Text className="text-[14px] leading-6 text-ink mt-3 mb-0 whitespace-pre-wrap">
                    {message}
                  </Text>
                )}
                {dueDateLabel && (
                  <Text className="text-[13px] text-inkSoft mt-3 mb-0">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-inkSoft">
                      Due
                    </span>
                    <span className="mx-2 text-[rgba(11,59,102,0.4)]">·</span>
                    <span className="text-ink">{dueDateLabel}</span>
                  </Text>
                )}
              </Section>

              <Section className="mt-8">
                <Button
                  href={`${appUrl}/dashboard/submit`}
                  className="inline-block bg-ink text-creamPaper font-mono text-[11px] uppercase tracking-[0.18em] px-6 py-3 rounded no-underline"
                >
                  File an update →
                </Button>
              </Section>

              <Hr className="border-0 border-t border-solid border-[rgba(11,59,102,0.15)] my-8" />

              <Text className="font-mono text-[10px] uppercase tracking-[0.2em] text-inkSoft m-0">
                Signed in as a team
              </Text>
              <Text className="text-[12px] leading-5 text-inkSoft mt-2 mb-0">
                You received this because your team is tracked in the iLab SEP
                dashboard. Sign in at{" "}
                <a href={appUrl} className="text-vermilion no-underline">
                  {appUrl.replace(/^https?:\/\//, "")}
                </a>{" "}
                to view every pending request.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

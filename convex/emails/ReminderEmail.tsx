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

export type ReminderEmailRequest = {
  title: string;
  message?: string;
  dueDate?: number;
  requestedAt: number;
};

export function ReminderEmail({
  teamName,
  requests,
  appUrl,
}: {
  teamName: string;
  requests: ReminderEmailRequest[];
  appUrl: string;
}) {
  const now = Date.now();
  const overdueCount = requests.filter(
    (r) => r.dueDate !== undefined && r.dueDate < now
  ).length;

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-SG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <Html>
      <Tailwind config={ilabTailwindConfig}>
        <Head />
        <Preview>{`Reminder: ${requests.length} update${requests.length === 1 ? "" : "s"} still pending`}</Preview>
        <Body className="bg-cream m-0 p-0 font-sans">
          <Container className="max-w-[560px] mx-auto my-10 bg-creamPaper border border-solid border-[rgba(11,59,102,0.15)] rounded-md overflow-hidden">
            <Section className="bg-creamWarm px-8 py-5 border-b border-solid border-[rgba(11,59,102,0.15)]">
              <Text className="font-mono text-[10px] uppercase tracking-[0.24em] text-inkSoft m-0">
                iLab SEP · Tracker
              </Text>
              <Text className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermilion m-0 mt-1">
                Reminder · pending updates
              </Text>
            </Section>

            <Section className="px-8 py-8">
              <Heading className="font-display italic text-[26px] leading-tight text-inkDeep m-0">
                Hi {teamName},
              </Heading>
              <Text className="text-[14px] leading-6 text-ink mt-4 mb-0">
                This is a friendly nudge from the Innovation Lab. Your team has{" "}
                {requests.length} open update request
                {requests.length === 1 ? "" : "s"} that{" "}
                {requests.length === 1 ? "has" : "have"} not been submitted yet
                {overdueCount > 0 && (
                  <>
                    {" "}— <span className="text-vermilion">{overdueCount} overdue</span>
                  </>
                )}
                .
              </Text>

              <Section className="mt-6 mb-2">
                <Text className="font-mono text-[10px] uppercase tracking-[0.2em] text-inkSoft m-0 mb-2">
                  Still pending
                </Text>
                {requests.map((request, idx) => {
                  const isOverdue =
                    request.dueDate !== undefined && request.dueDate < now;
                  return (
                    <Section
                      key={idx}
                      className={`border-l-2 border-solid ${
                        isOverdue ? "border-vermilion" : "border-ink"
                      } bg-creamWarm px-5 py-4 rounded-r mb-2`}
                    >
                      <Text className="font-display text-[16px] text-inkDeep m-0">
                        {request.title}
                      </Text>
                      {request.message && (
                        <Text className="text-[13px] leading-5 text-ink mt-2 mb-0 whitespace-pre-wrap">
                          {request.message}
                        </Text>
                      )}
                      <Text className="text-[12px] text-inkSoft mt-2 mb-0">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-inkSoft">
                          Requested
                        </span>
                        <span className="mx-2 text-[rgba(11,59,102,0.4)]">·</span>
                        <span className="text-ink">
                          {formatDate(request.requestedAt)}
                        </span>
                        {request.dueDate && (
                          <>
                            <span className="mx-2 text-[rgba(11,59,102,0.4)]">
                              ·
                            </span>
                            <span
                              className={
                                isOverdue ? "text-vermilion" : "text-ink"
                              }
                            >
                              {isOverdue ? "Overdue" : "Due"}{" "}
                              {formatDate(request.dueDate)}
                            </span>
                          </>
                        )}
                      </Text>
                    </Section>
                  );
                })}
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
                You received this reminder because your team still has pending
                update requests in the iLab SEP dashboard. Sign in at{" "}
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

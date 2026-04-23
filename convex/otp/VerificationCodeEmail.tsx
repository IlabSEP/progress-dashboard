import {
  Body,
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
import { ilabTailwindConfig } from "../emails/theme";

export function VerificationCodeEmail({
  code,
  expires,
}: {
  code: string;
  expires: Date;
}) {
  const minutes = Math.max(
    1,
    Math.floor((+expires - Date.now()) / (60 * 1000))
  );

  return (
    <Html>
      <Tailwind config={ilabTailwindConfig}>
        <Head />
        <Preview>Your iLab sign-in code: {code}</Preview>
        <Body className="bg-cream m-0 p-0 font-sans">
          <Container className="max-w-[560px] mx-auto my-10 bg-creamPaper border border-solid border-[rgba(11,59,102,0.15)] rounded-md overflow-hidden">
            <Section className="bg-creamWarm px-8 py-5 border-b border-solid border-[rgba(11,59,102,0.15)]">
              <Text className="font-mono text-[10px] uppercase tracking-[0.24em] text-inkSoft m-0">
                iLab SEP · Tracker
              </Text>
              <Text className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermilion m-0 mt-1">
                Sign-in code
              </Text>
            </Section>

            <Section className="px-8 py-8">
              <Heading className="font-display italic text-[26px] leading-tight text-inkDeep m-0">
                Welcome back.
              </Heading>
              <Text className="text-[14px] leading-6 text-ink mt-4 mb-0">
                Enter the code below on the sign-in page to access your iLab
                SEP dashboard.
              </Text>

              <Section className="mt-6 mb-2 bg-creamWarm border border-solid border-[rgba(11,59,102,0.15)] rounded px-6 py-6 text-center">
                <Text className="font-mono text-[10px] uppercase tracking-[0.24em] text-inkSoft m-0">
                  Verification code
                </Text>
                <Text className="font-mono text-[40px] tracking-[0.3em] text-inkDeep m-0 mt-3">
                  {code}
                </Text>
                <Text className="font-mono text-[11px] uppercase tracking-[0.18em] text-vermilion m-0 mt-4">
                  Valid for {minutes} {minutes === 1 ? "minute" : "minutes"}
                </Text>
              </Section>

              <Hr className="border-0 border-t border-solid border-[rgba(11,59,102,0.15)] my-8" />

              <Text className="text-[12px] leading-5 text-inkSoft m-0">
                If you didn't request this code, you can safely ignore this
                email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

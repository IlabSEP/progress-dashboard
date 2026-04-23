import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";

export function SignInWithEmailCode() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn("resend-otp", { email });
      setStep("code");
    } catch (error) {
      console.error(error);
      toast({
        title: "Could not send code. Please check your email and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn("resend-otp", { email, code });
    } catch (error) {
      console.error(error);
      toast({
        title: "Invalid code. Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  if (step === "email") {
    return (
      <form onSubmit={handleSendCode} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/60"
          >
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@ntu.edu.sg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="bg-cream-paper border-ink/20"
          />
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-ink text-cream-paper hover:bg-ink-deep font-mono text-[11px] uppercase tracking-[0.22em]"
        >
          {submitting ? "Sending…" : "Send verification code →"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
      <p className="text-sm text-ink/70">
        A 4-digit code has been dispatched to{" "}
        <span className="font-display italic text-ink-deep">{email}</span>.
      </p>
      <div className="flex justify-center">
        <InputOTP
          maxLength={4}
          value={code}
          onChange={(value) => setCode(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button
        type="submit"
        disabled={submitting || code.length < 4}
        className="bg-ink text-cream-paper hover:bg-ink-deep font-mono text-[11px] uppercase tracking-[0.22em]"
      >
        {submitting ? "Verifying…" : "Verify & enter →"}
      </Button>
      <button
        type="button"
        onClick={() => {
          setStep("email");
          setCode("");
        }}
        className="self-center font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55 hover:text-vermilion transition-colors"
      >
        ← Use a different address
      </button>
    </form>
  );
}

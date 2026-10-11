"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Lock, Mail, ShieldCheck } from "@/components/icons";
import { Button, Callout, Field, Input } from "@/components/ui";
import {
  SOCIAL_UNAVAILABLE_NOTE,
  SocialButtons,
} from "@/components/auth/social-buttons";
import type { SocialProvider } from "@/lib/api";
import {
  sendSecondFactorCode,
  signIn,
  redeemRecoveryCode,
  verifySecondFactorCode,
  type Challenge,
  type PendingSecondFactor,
} from "@/lib/auth-client";

/**
 * Signing in.
 *
 * Three steps in one component, because they are one sign-in: the password, then
 * — only when the account has a second factor enrolled — a code, and a recovery
 * code as the way out when the device that receives codes is gone. Which of them
 * a visitor sees is decided by the API's answers, not by this form.
 *
 * Errors are shown in Bangla with the API's own sentence under them. The lead
 * line is what the status means to a person; the API's message is the specific
 * rule that was broken, and dropping it would leave someone guessing which of
 * "email is wrong" and "password is wrong" it was.
 */

type Step = "credentials" | "code" | "recovery";

function leadFor(status: number): string {
  if (status === 401) return "ইমেইল বা পাসওয়ার্ড সঠিক নয়।";
  if (status === 403) return "এই অ্যাকাউন্টটি স্থগিত করা হয়েছে।";
  if (status === 404) return "অ্যাকাউন্টটি খুঁজে পাওয়া যায়নি।";
  if (status === 409) return "এই ইমেইলে আগেই একটি অ্যাকাউন্ট আছে।";
  if (status === 429) return "অনেকবার চেষ্টা করা হয়েছে — কিছুক্ষণ পরে আবার চেষ্টা করুন।";
  if (status === 0) return "সার্ভারে পৌঁছানো যায়নি।";
  return "প্রবেশ করা যায়নি।";
}

/**
 * `providers` is the enabled social set, resolved on the server. It is shown only
 * on the first step: someone halfway through a second factor has already chosen
 * how they are signing in, and offering them another way in underneath is noise.
 */
export function LoginForm({
  providers,
  next = "/",
}: {
  providers: SocialProvider[];
  /** Where to land afterwards, already validated by the page that rendered this. */
  next?: string;
}) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");

  const [pending, setPending] = useState(false);
  const [lead, setLead] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  const [secondFactor, setSecondFactor] = useState<PendingSecondFactor | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  /** A signed-in visitor is handed to the app; the layout re-reads the session. */
  function finish() {
    router.replace(next);
    router.refresh();
  }

  function fail(status: number, message: string) {
    setLead(leadFor(status));
    setDetail(message);
    setPending(false);
  }

  async function onSubmitCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setLead(null);
    setDetail(null);

    const result = await signIn({ email: email.trim(), password, remember });
    if (!result.ok) {
      fail(result.status, result.message);
      return;
    }

    if (result.data.secondFactor) {
      const factor = result.data.secondFactor;
      setSecondFactor(factor);
      setPending(false);
      // If the only way forward is a code, send it without making the visitor
      // press a button that has no other choice in it.
      const channel = firstCodeChannel(factor);
      if (channel) await sendCode(channel);
      else setStep("code");
      return;
    }

    finish();
  }

  function firstCodeChannel(factor: PendingSecondFactor): "email" | "sms" | null {
    if (factor.factors.some((item) => item.kind === "email")) return "email";
    if (factor.factors.some((item) => item.kind === "sms")) return "sms";
    return null;
  }

  async function sendCode(kind: "email" | "sms") {
    if (!secondFactor) return;
    setPending(true);
    setLead(null);
    setDetail(null);

    const result = await sendSecondFactorCode({
      pendingToken: secondFactor.pendingToken,
      kind,
      factorId: secondFactor.factors.find((item) => item.kind === kind)?.id,
    });

    if (!result.ok) {
      fail(result.status, result.message);
      return;
    }

    setChallenge(result.data);
    setCode("");
    setStep("code");
    setPending(false);
  }

  async function onSubmitCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!secondFactor || !challenge) return;
    setPending(true);
    setLead(null);
    setDetail(null);

    const result = await verifySecondFactorCode({
      pendingToken: secondFactor.pendingToken,
      challengeId: challenge.challengeId,
      code: code.trim(),
    });

    if (!result.ok) {
      fail(result.status, result.message);
      return;
    }

    finish();
  }

  async function onSubmitRecovery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!secondFactor) return;
    setPending(true);
    setLead(null);
    setDetail(null);

    const result = await redeemRecoveryCode({
      pendingToken: secondFactor.pendingToken,
      code: recoveryCode.trim(),
    });

    if (!result.ok) {
      fail(result.status, result.message);
      return;
    }

    finish();
  }

  const error = lead ? (
    <Callout tone="danger" icon={AlertTriangle} title={lead}>
      {detail}
    </Callout>
  ) : null;

  /* ---------------------------------------------------------------- step 2 */

  if (step === "code" && secondFactor) {
    const codeFactors = secondFactor.factors.filter((item) => item.kind === "email" || item.kind === "sms");
    const hasPasskey = secondFactor.factors.some((item) => item.kind === "passkey");

    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-soft-foreground">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">দুই ধাপের যাচাই</h1>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
              পাসওয়ার্ড ঠিক আছে। অ্যাকাউন্টে দ্বিতীয় ধাপ চালু আছে, তাই একটি কোড দিয়ে শেষ করুন।
            </p>
          </div>
        </div>

        {error}

        {hasPasskey && codeFactors.length === 0 ? (
          <Callout tone="warning" icon={AlertTriangle} title="পাসকি দিয়ে প্রবেশ এখনো অ্যাপে আসেনি">
            এই অ্যাকাউন্টটি পাসকি দিয়ে সুরক্ষিত, আর এই অ্যাপ থেকে পাসকি যাচাই এখনো যুক্ত হয়নি। নিচের “রিকভারি কোড”
            দিয়ে প্রবেশ করুন।
          </Callout>
        ) : null}

        {challenge ? (
          <form onSubmit={onSubmitCode} className="space-y-4">
            <Field
              label="কোড"
              htmlFor="code"
              required
              hint={
                <span>
                  {challenge.destination ? `${challenge.destination} — ` : ""}
                  কোডটি {challenge.minutes} মিনিটের জন্য বৈধ
                </span>
              }
            >
              <Input
                id="code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="••••••"
              />
            </Field>

            {challenge.devCode ? (
              <p className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-3.5 py-2.5 text-[0.75rem] leading-relaxed text-muted-foreground">
                ডেভেলপমেন্ট: কোডটি আসলে পাঠানো হয়নি (console driver), তাই এখানেই দেখানো হচ্ছে —{" "}
                <span className="font-semibold tabular text-foreground">{challenge.devCode}</span>
              </p>
            ) : null}

            <Button size="lg" full iconRight={ArrowRight} type="submit" loading={pending}>
              যাচাই ও প্রবেশ করুন
            </Button>

            <div className="flex items-center justify-between gap-3 text-[0.8125rem]">
              {codeFactors.length > 1 ? (
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => sendCode(challenge.kind === "email" ? "sms" : "email")}
                  disabled={pending}
                >
                  {challenge.kind === "email" ? "SMS-এ কোড পাঠান" : "ইমেইলে কোড পাঠান"}
                </button>
              ) : (
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => sendCode(challenge.kind)}
                  disabled={pending}
                >
                  আবার কোড পাঠান
                </button>
              )}
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setStep("recovery");
                  setLead(null);
                  setDetail(null);
                }}
              >
                রিকভারি কোড
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {codeFactors.map((factor) => (
              <Button
                key={factor.id}
                variant="outline"
                size="lg"
                full
                loading={pending}
                onClick={() => sendCode(factor.kind as "email" | "sms")}
              >
                {factor.kind === "email" ? "ইমেইলে কোড পাঠান" : "SMS-এ কোড পাঠান"}
                {factor.destination ? ` (${factor.destination})` : ""}
              </Button>
            ))}
            <button
              type="button"
              className="text-[0.8125rem] text-muted-foreground hover:text-foreground"
              onClick={() => setStep("recovery")}
            >
              রিকভারি কোড দিয়ে প্রবেশ
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------------- step 3 */

  if (step === "recovery") {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">রিকভারি কোড</h1>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
            দ্বিতীয় ধাপ চালু করার সময় যে কোডগুলো দেওয়া হয়েছিল, তার একটি লিখুন। প্রতিটি কোড একবারই কাজ করে।
          </p>
        </div>

        {error}

        <form onSubmit={onSubmitRecovery} className="space-y-4">
          <Field label="রিকভারি কোড" htmlFor="recovery-code" required>
            <Input
              id="recovery-code"
              name="recovery"
              autoFocus
              autoComplete="one-time-code"
              value={recoveryCode}
              onChange={(event) => setRecoveryCode(event.target.value)}
              placeholder="XXXX-XXXX"
            />
          </Field>

          <Button size="lg" full iconRight={ArrowRight} type="submit" loading={pending}>
            প্রবেশ করুন
          </Button>

          <button
            type="button"
            className="w-full text-center text-[0.8125rem] text-muted-foreground hover:text-foreground"
            onClick={() => {
              setStep(secondFactor && firstCodeChannel(secondFactor) ? "code" : "credentials");
              setLead(null);
              setDetail(null);
            }}
          >
            ফিরে যান
          </button>
        </form>
      </div>
    );
  }

  /* ---------------------------------------------------------------- step 1 */

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">আসসালামু আলাইকুম</h1>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-muted-foreground">
        আপনার অ্যাকাউন্টে প্রবেশ করুন — প্রশ্ন, সংরক্ষিত জ্ঞান ও শেখার যাত্রা যেখানে ছেড়েছিলেন সেখান থেকেই।
      </p>

      <form className="mt-7 space-y-4" onSubmit={onSubmitCredentials}>
        {error}

        <Field label="ইমেইল" htmlFor="email" required>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
              aria-hidden
            />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="apnar.email@example.com"
              className="pl-10"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </Field>

        <Field label="পাসওয়ার্ড" htmlFor="password" required>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
              aria-hidden
            />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="pl-10"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
        </Field>

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-[0.8125rem] text-muted-foreground">
            <input
              type="checkbox"
              name="remember"
              className="size-4 cursor-pointer accent-[var(--primary)]"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            মনে রাখুন
          </label>
          {/*
            No password reset exists yet — the API has no route for one — so this
            points at the same page rather than at a form that cannot work.
          */}
          <Link href="/login" className="text-[0.8125rem] font-medium text-primary hover:underline">
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>
        </div>

        <Button size="lg" full iconRight={ArrowRight} type="submit" loading={pending}>
          প্রবেশ করুন
        </Button>
      </form>

      <p className="mt-5 text-center text-[0.8125rem] text-muted-foreground">
        আগে অ্যাকাউন্ট নেই?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          নতুন অ্যাকাউন্ট খুলুন
        </Link>
      </p>

      {providers.length > 0 ? (
        <>
          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" aria-hidden />
            <span className="text-[0.75rem] font-medium text-subtle-foreground">অথবা</span>
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>            <SocialButtons providers={providers} verb="প্রবেশ করুন" returnTo={next} />
        </>
      ) : (
        <p className="mt-7 rounded-xl border border-dashed border-border-strong bg-surface-2 px-3.5 py-2.5 text-[0.75rem] leading-relaxed text-muted-foreground">
          {SOCIAL_UNAVAILABLE_NOTE}
        </p>
      )}
    </div>
  );
}

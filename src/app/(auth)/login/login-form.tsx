"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Fingerprint, Lock, Mail, ShieldCheck } from "@/components/icons";
import { Button, Callout, Field, Input } from "@/components/ui";
import {
  SOCIAL_UNAVAILABLE_NOTE,
  SocialButtons,
} from "@/components/auth/social-buttons";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";
import type { SocialProvider } from "@/lib/api";
import {
  sendSecondFactorCode,
  signIn,
  redeemRecoveryCode,
  startAutofillPasskeySignIn,
  startPasskeySignIn,
  verifyAutofillPasskeySignIn,
  verifyPasskeySignIn,
  verifySecondFactorCode,
  type Challenge,
  type PendingSecondFactor,
} from "@/lib/auth-client";

/**
 * Signing in.
 *
 * Three steps in one component, because they are one sign-in: the password, then
 * — only when the account has a second factor enrolled — a passkey assertion, a
 * code, or a recovery code as the way out when the device that holds the factor
 * is gone. Which of them a visitor is *offered* is decided by the API's answer;
 * which one they take is theirs, because an account with both a passkey and a
 * code channel can use either — they prove the same thing.
 *
 * Errors are shown in Bangla with the API's own sentence under them. The lead
 * line is what the status means to a person; the API's message is the specific
 * rule that was broken, and dropping it would leave someone guessing which of
 * "email is wrong" and "password is wrong" it was.
 */

type Step = "credentials" | "code" | "recovery";

/**
 * How long a fallback challenge is left in place before it is replaced.
 *
 * An unattributed challenge outlives the visitor's patience by a good margin, but
 * a tab can be left open overnight, and replacing the challenge before it lapses
 * means the entry they finally choose is still answerable — the new ceremony
 * supersedes the old one.
 */
const AUTOFILL_REFRESH_MS = 10 * 60 * 1000;

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
 * What a return from a provider without a session means.
 *
 * The API sends only the status — so this is where the words live, and they are
 * ours: a provider's own error text, or anything else a crafted link might carry,
 * never reaches the page.
 */
function socialFailure(status: string): { lead: string; detail: string } {
  if (status === "409") {
    return {
      lead: "এই ইমেইলের একটি অ্যাকাউন্ট আগেই আছে",
      detail:
        "প্রোভাইডার নিশ্চিত করেনি যে ঠিকানাটি আপনার, তাই সরাসরি যুক্ত করা হয়নি। পাসওয়ার্ড দিয়ে প্রবেশ করে অ্যাকাউন্ট সেটিংস থেকে প্রোভাইডারটি যুক্ত করুন।",
    };
  }
  if (status === "502") {
    return {
      lead: "প্রোভাইডারের সাথে কথা বলা যায়নি",
      detail: "প্রোভাইডার সাইন-ইন প্রত্যাখ্যান করেছে বা এই মুহূর্তে অনুপলব্ধ। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
    };
  }
  if (status === "403") {
    return {
      lead: "এই অ্যাকাউন্টটি স্থগিত করা হয়েছে।",
      detail: "অ্যাডমিনের সাথে যোগাযোগ করুন।",
    };
  }
  if (status === "404") {
    return {
      lead: "প্রোভাইডারটি এখন চালু নেই",
      detail: "কনফিগারেশন বদলে গেছে বা প্রোভাইডারটি বন্ধ করা হয়েছে। অন্য কোনো উপায়ে প্রবেশ করুন।",
    };
  }
  return {
    lead: "সোশ্যাল সাইন-ইন সম্পন্ন হয়নি",
    detail:
      "প্রোভাইডারে অনুমোদন বাতিল হয়েছে বা সময় শেষ হয়ে গেছে। আবার চেষ্টা করুন, অথবা ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন।",
  };
}

/**
 * `providers` is the enabled social set, resolved on the server. It is shown only
 * on the first step: someone halfway through a second factor has already chosen
 * how they are signing in, and offering them another way in underneath is noise.
 */
export function LoginForm({
  providers,
  next = "/",
  socialError,
}: {
  providers: SocialProvider[];
  /** Where to land afterwards, already validated by the page that rendered this. */
  next?: string;
  /** The status a social sign-in failed with, if this page is where it came back. */
  socialError?: string;
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
  /** True once this browser's autofill is actually being offered a passkey. */
  const [autofillReady, setAutofillReady] = useState(false);

  /** A signed-in visitor is handed to the app; the layout re-reads the session. */
  const finish = useCallback(() => {
    router.replace(next);
    router.refresh();
  }, [router, next]);

  const fail = useCallback((status: number, message: string) => {
    setLead(leadFor(status));
    setDetail(message);
    setPending(false);
  }, []);

  /**
   * Conditional UI: the passkey, offered in the browser's own autofill.
   *
   * A returning visitor with an enrolled passkey types nothing — not an address,
   * not a password. The browser lists their passkey under the email field and
   * choosing it signs them in. What makes that possible is that this ceremony is
   * *credential-first*: the options are asked for with an empty allow list, so no
   * account is named up front, and the account is settled only when the chosen
   * assertion comes back and names a credential.
   *
   * Everything about it is best-effort. A browser without conditional UI, an
   * account with no passkey, a request that fails: none of it raises anything,
   * because none of it takes away the way in that is already on screen. Only an
   * assertion the API actually refuses is reported — where a wrong password would
   * be, but with its own lead line, because nothing was typed here.
   */
  useEffect(() => {
    if (step !== "credentials") return;

    let cancelled = false;
    /** Bumped on every arm, so a superseded ceremony's rejection is ignored. */
    let generation = 0;

    async function arm() {
      const mine = ++generation;

      const options = await startAutofillPasskeySignIn();
      if (cancelled || mine !== generation || !options.ok) return;

      let assertion: AuthenticationResponseJSON;
      let refresh: ReturnType<typeof setTimeout> | undefined;
      try {
        // Loaded here rather than at the top of the file for the same reason the
        // second-factor step loads it: it is a browser-only module, and a static
        // import would pull it into the server render of this page.
        const { browserSupportsWebAuthnAutofill, startAuthentication } = await import(
          "@simplewebauthn/browser"
        );
        if (!(await browserSupportsWebAuthnAutofill())) return;
        if (cancelled || mine !== generation) return;

        setAutofillReady(true);
        // Keeps the challenge behind the autofill entry fresh. Re-arming aborts
        // this ceremony, whose rejection is ignored because `generation` moved on.
        refresh = setTimeout(() => {
          if (!cancelled) void arm();
        }, AUTOFILL_REFRESH_MS);

        assertion = await startAuthentication({
          optionsJSON: options.data.options,
          useBrowserAutofill: true,
        });
      } catch {
        if (refresh) clearTimeout(refresh);
        // A menu the visitor dismissed, a passkey they deleted elsewhere, a
        // ceremony we just replaced: all ordinary outcomes, none of them worth a
        // message.
        if (cancelled || mine !== generation) return;
        setAutofillReady(false);
        return;
      }

      if (refresh) clearTimeout(refresh);
      if (cancelled || mine !== generation) return;

      setPending(true);
      const verified = await verifyAutofillPasskeySignIn({
        challengeId: options.data.challengeId,
        response: assertion,
      });

      if (!verified.ok) {
        // Deliberately not `fail`: that lead line is chosen by status, and "the
        // email or password is wrong" is not what happened here — nothing was
        // typed at all. The API's own sentence is the specific reason.
        setLead("পাসকি দিয়ে প্রবেশ করা যায়নি");
        setDetail(verified.message);
        setPending(false);
        return;
      }

      finish();
    }

    void arm();

    return () => {
      cancelled = true;
      generation += 1;
    };
  }, [step, fail, finish]);

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

  /**
   * The other half of the second step: prove the passkey instead of a code.
   *
   * The ceremony has two halves. The server generates the challenge and owns the
   * credential (`/auth/mfa/passkey/options`); the browser signs it, and only then
   * does the signature come back to be verified. Nothing here decides whether the
   * assertion is good — that is the server's answer to `verify`, and it issues the
   * session when it says yes.
   */
  async function signInWithPasskey() {
    if (!secondFactor) return;
    setPending(true);
    setLead(null);
    setDetail(null);

    const options = await startPasskeySignIn({ pendingToken: secondFactor.pendingToken });
    if (!options.ok) {
      fail(options.status, options.message);
      return;
    }

    let assertion: AuthenticationResponseJSON;
    try {
      // Loaded here rather than at the top of the file: it is a browser-only
      // module, most visitors never reach this step, and a static import would
      // pull it into the server render of a page they do reach.
      const { startAuthentication } = await import("@simplewebauthn/browser");
      assertion = await startAuthentication({ optionsJSON: options.data.options });
    } catch (error) {
      // A cancelled prompt or a device that does not hold this passkey lands here,
      // and both are ordinary outcomes rather than server failures.
      setLead("পাসকি যাচাই করা যায়নি");
      setDetail(
        error instanceof Error && error.message
          ? error.message
          : "এই ব্রাউজার বা ডিভাইস এই পাসকিটি চিনতে পারেনি। কোড বা রিকভারি কোড দিয়ে প্রবেশ করুন।",
      );
      setPending(false);
      return;
    }

    const verified = await verifyPasskeySignIn({
      pendingToken: secondFactor.pendingToken,
      challengeId: options.data.challengeId,
      response: assertion,
    });

    if (!verified.ok) {
      fail(verified.status, verified.message);
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
    const codeFactors = secondFactor.factors.filter(
      (item) => item.kind === "email" || item.kind === "sms",
    );
    const hasPasskey = secondFactor.factors.some((item) => item.kind === "passkey");
    // An account whose only factor is a passkey has no code to fall back on, so
    // the copy has to name the one thing that will actually work here.
    const onlyPasskey = hasPasskey && codeFactors.length === 0;

    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-soft-foreground">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">দুই ধাপের যাচাই</h1>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
              {onlyPasskey
                ? "পাসওয়ার্ড ঠিক আছে। অ্যাকাউন্টটি একটি পাসকি দিয়ে সুরক্ষিত — ডিভাইসেই যাচাই করে শেষ করুন।"
                : "পাসওয়ার্ড ঠিক আছে। অ্যাকাউন্টে দ্বিতীয় ধাপ চালু আছে, তাই আরেকটি যাচাই দিয়ে শেষ করুন।"}
            </p>
          </div>
        </div>

        {error}

        {hasPasskey ? (
          <Button
            size="lg"
            full
            icon={Fingerprint}
            type="button"
            loading={pending}
            onClick={signInWithPasskey}
          >
            পাসকি দিয়ে প্রবেশ করুন
          </Button>
        ) : null}

        {hasPasskey && (challenge || codeFactors.length > 0) ? (
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" aria-hidden />
            <span className="text-[0.75rem] font-medium text-subtle-foreground">অথবা কোড দিয়ে</span>
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>
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
        ) : codeFactors.length > 0 ? (
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
          </div>
        ) : null}

        {/*
          Always reachable rather than tucked inside the code form: an account
          with only a passkey has no code branch at all, and a recovery code is
          precisely the way in when the device holding the passkey is gone.
        */}
        {!challenge ? (
          <button
            type="button"
            className="w-full text-center text-[0.8125rem] text-muted-foreground hover:text-foreground"
            onClick={() => {
              setStep("recovery");
              setLead(null);
              setDetail(null);
            }}
          >
            রিকভারি কোড দিয়ে প্রবেশ
          </button>
        ) : null}
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
              // Back to the second-factor step, which now offers whatever the
              // account actually has — a passkey, a code channel, or both.
              setStep(secondFactor ? "code" : "credentials");
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

      {/*
        A social sign-in that came back without a session. Placed above the form
        rather than inside it, because it explains the page itself: the visitor
        arrived here from a provider, not from anything they typed.
      */}
      {socialError ? (
        <Callout
          tone="danger"
          icon={AlertTriangle}
          title={socialFailure(socialError).lead}
          className="mt-6"
        >
          {socialFailure(socialError).detail}
        </Callout>
      ) : null}

      <form className="mt-7 space-y-4" onSubmit={onSubmitCredentials}>
        {error}

        <Field
          label="ইমেইল"
          htmlFor="email"
          required
          hint={
            autofillReady
              ? "পাসকি থাকলে এই ঘরেই ব্রাউজারের পরামর্শ থেকে সরাসরি প্রবেশ করা যায়।"
              : undefined
          }
        >
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
              aria-hidden
            />
            {/*
              `webauthn` last is what marks this field as the one conditional UI
              attaches to: the browser offers the passkey in the same autofill menu
              as the saved addresses, and the WebAuthn library finds the field by it.
              `username` in front keeps password managers filling it as before.
            */}
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username webauthn"
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

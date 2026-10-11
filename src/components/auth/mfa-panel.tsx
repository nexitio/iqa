"use client";

import { useCallback, useEffect, useState } from "react";
import type { RegistrationResponseJSON } from "@simplewebauthn/browser";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  Fingerprint,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "@/components/icons";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  Field,
  Input,
  softTone,
  type Tone,
} from "@/components/ui";
import { useSession } from "@/components/auth/session-provider";
import {
  confirmEmailFactor,
  confirmPasskeyEnrollment,
  confirmSmsFactor,
  fetchMfaStatus,
  regenerateRecoveryCodes,
  removeMfaFactor,
  startEmailFactor,
  startPasskeyEnrollment,
  startSmsFactor,
  type AuthResult,
  type Challenge,
  type EnrolledFactor,
  type MfaFactor,
  type MfaStatus,
} from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/**
 * Two-factor authentication, managed from account settings.
 *
 * Everything here is the API's own surface (see `server/src/routes/mfa.ts`): this
 * component only drives it. That split is why the panel re-asks for the account
 * password on every change — the API requires it, because a session cookie alone
 * must never be enough to add a factor an attacker controls or to remove the one
 * the real owner depends on.
 *
 * The stages below are one small state machine rather than four separate forms,
 * because they are one task seen from different moments: choose a channel, prove
 * the password, prove the code (or the authenticator), and then — when the first
 * factor was enrolled — write down the recovery codes that are shown exactly once.
 *
 * Passkeys are the one ceremony the browser performs rather than the server, so
 * `@simplewebauthn/browser` is imported *inside* the handler: it is a
 * browser-only module, and a static import would drag it into the server render
 * of a page that only ever uses it after a click.
 */

type Channel = "email" | "sms";

type Stage =
  | { name: "idle" }
  | { name: "enrol-email" }
  | { name: "enrol-sms" }
  | { name: "enrol-passkey" }
  | { name: "confirm"; kind: Channel; challenge: Challenge }
  | { name: "remove"; factor: MfaFactor }
  | { name: "regenerate" }
  | { name: "codes"; codes: string[] };

/** A coarse lead line; the API's own message is shown beneath it as the detail. */
function leadFor(status: number): string {
  if (status === 401) return "পাসওয়ার্ড সঠিক নয়, অথবা সেশন শেষ হয়ে গেছে।";
  if (status === 400) return "তথ্যে সমস্যা আছে।";
  if (status === 404) return "কিছু পাওয়া যায়নি।";
  if (status === 429) return "অনেকবার চেষ্টা করা হয়েছে — কিছুক্ষণ পরে আবার চেষ্টা করুন।";
  if (status === 0) return "সার্ভারে পৌঁছানো যায়নি।";
  return "কাজটি সম্পন্ন করা যায়নি।";
}

const CHANNEL: Record<MfaFactor["kind"], { label: string; hint: string; icon: typeof Mail; tone: Tone }> = {
  email: { label: "ইমেইল কোড", hint: "সাইন-ইনের সময় ওই ঠিকানায় কোড পাঠানো হবে", icon: Mail, tone: "info" },
  sms: { label: "SMS কোড", hint: "সাইন-ইনের সময় ওই নম্বরে কোড পাঠানো হবে", icon: Smartphone, tone: "accent" },
  passkey: { label: "পাসকি", hint: "এই ডিভাইসে সংরক্ষিত — কোনো কোডের অপেক্ষা নেই", icon: Fingerprint, tone: "success" },
};

export function MfaPanel() {
  const { user } = useSession();

  const [status, setStatus] = useState<MfaStatus | null>(null);
  const [loading, setLoading] = useState(Boolean(user));
  const [busy, setBusy] = useState(false);
  const [lead, setLead] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  const [stage, setStage] = useState<Stage>({ name: "idle" });
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [copied, setCopied] = useState(false);

  /** Applies one answer from the API: either the factors, or the reason there are none. */
  const apply = useCallback((result: AuthResult<MfaStatus>) => {
    if (!result.ok) {
      setLead(leadFor(result.status));
      setDetail(result.message);
      return;
    }
    setStatus(result.data);
  }, []);

  /** Re-reads the enrolled factors — the only source of truth for the panel. */
  const refresh = useCallback(async () => {
    apply(await fetchMfaStatus());
  }, [apply]);

  useEffect(() => {
    // Signed out already settles as "loaded": there is nothing to fetch, and
    // `loading` starts false for that case. The state writes sit in the `then`
    // callback rather than the effect body, so they land when the request answers
    // instead of triggering a second synchronous render.
    if (!user) return;
    let active = true;
    void fetchMfaStatus().then((result) => {
      if (!active) return;
      apply(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user, apply]);

  function open(next: Stage) {
    setLead(null);
    setDetail(null);
    // The password is never carried from one ceremony to the next.
    setPassword("");
    setCode("");
    setStage(next);
  }

  function fail(result: { status: number; message: string }) {
    setLead(leadFor(result.status));
    setDetail(result.message);
    setBusy(false);
  }

  /** Enrolment is done: refresh, then show the codes if this was the first factor. */
  function afterEnrol(data: EnrolledFactor) {
    setPassword("");
    setCode("");
    setLabel("");
    setBusy(false);
    void refresh();
    setStage(data.recoveryCodes && data.recoveryCodes.length > 0 ? { name: "codes", codes: data.recoveryCodes } : { name: "idle" });
  }

  /* ------------------------------------------------------------------ actions */

  async function enrolChannel(event: React.FormEvent<HTMLFormElement>, kind: Channel) {
    event.preventDefault();
    setBusy(true);
    setLead(null);
    setDetail(null);

    const result =
      kind === "email"
        ? await startEmailFactor({ password, email: email.trim() })
        : await startSmsFactor({ password, phone: phone.trim() });

    if (!result.ok) {
      fail(result);
      return;
    }

    setCode("");
    setStage({ name: "confirm", kind, challenge: result.data });
    setBusy(false);
  }

  async function confirmChannel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (stage.name !== "confirm") return;

    const { kind, challenge } = stage;
    setBusy(true);
    setLead(null);
    setDetail(null);

    const result =
      kind === "email"
        ? await confirmEmailFactor({ challengeId: challenge.challengeId, code: code.trim() })
        : await confirmSmsFactor({ challengeId: challenge.challengeId, code: code.trim() });

    if (!result.ok) {
      fail(result);
      return;
    }
    afterEnrol(result.data);
  }

  async function enrolPasskey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setLead(null);
    setDetail(null);

    const begin = await startPasskeyEnrollment({ password });
    if (!begin.ok) {
      fail(begin);
      return;
    }

    // The browser's half of the ceremony. A cancelled or unsupported attempt is a
    // normal outcome, not a server error, so it is worded as one.
    let registration: RegistrationResponseJSON;
    try {
      const { startRegistration } = await import("@simplewebauthn/browser");
      registration = await startRegistration({ optionsJSON: begin.data.options });
    } catch (error) {
      setLead("পাসকি তৈরি করা যায়নি");
      setDetail(
        error instanceof Error && error.message
          ? error.message
          : "এই ব্রাউজার বা ডিভাইস পাসকি সমর্থন করে না।",
      );
      setBusy(false);
      return;
    }

    const done = await confirmPasskeyEnrollment({
      challengeId: begin.data.challengeId,
      response: registration,
      label: label.trim() || undefined,
    });

    if (!done.ok) {
      fail(done);
      return;
    }
    afterEnrol(done.data);
  }

  async function removeFactor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (stage.name !== "remove") return;

    const { factor } = stage;
    setBusy(true);
    setLead(null);
    setDetail(null);

    const result = await removeMfaFactor({ factorId: factor.id, password });
    if (!result.ok) {
      fail(result);
      return;
    }

    await refresh();
    setPassword("");
    setBusy(false);
    setStage({ name: "idle" });
  }

  async function regenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setLead(null);
    setDetail(null);

    const result = await regenerateRecoveryCodes({ password });
    if (!result.ok) {
      fail(result);
      return;
    }

    setPassword("");
    setBusy(false);
    setStage({ name: "codes", codes: result.data.recoveryCodes });
  }

  async function copyCodes(codes: string[]) {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setLead("কোডগুলো কপি করা যায়নি");
      setDetail("ব্রাউজার ক্লিপবোর্ডে লেখার অনুমতি দেয়নি — কোডগুলো হাতে লিখে রাখুন।");
    }
  }

  /* ------------------------------------------------------------------- render */

  const error = lead ? (
    <Callout tone="danger" icon={AlertTriangle} title={lead} className="mt-5">
      {detail}
    </Callout>
  ) : null;

  const factors = status?.factors ?? [];

  const passwordField = (id: string) => (
    <Field label="অ্যাকাউন্টের পাসওয়ার্ড" htmlFor={id} required>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
          aria-hidden
        />
        <Input
          id={id}
          type="password"
          autoComplete="current-password"
          className="pl-10"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
    </Field>
  );

  function stagePanel() {
    switch (stage.name) {
      case "enrol-email":
      case "enrol-sms": {
        const kind: Channel = stage.name === "enrol-email" ? "email" : "sms";
        return (
          <form
            onSubmit={(event) => enrolChannel(event, kind)}
            className="space-y-4 rounded-panel border border-border bg-surface-2 p-4"
          >
            <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
              {kind === "email"
                ? "একটি ইমেইল ঠিকানা দিন। সেখানে পাঠানো কোড দিয়ে যাচাই হলে সাইন-ইনের সময় ওই ঠিকানায় কোড আসবে।"
                : "একটি মোবাইল নম্বর দিন (যেমন 01712345678)। যাচাই হলে সাইন-ইনের সময় ওই নম্বরে কোড আসবে।"}
            </p>

            {kind === "email" ? (
              <Field label="ইমেইল" htmlFor="mfa-email" required>
                <Input
                  id="mfa-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="apnar.email@example.com"
                  required
                />
              </Field>
            ) : (
              <Field label="মোবাইল নম্বর" htmlFor="mfa-phone" required hint="বাংলাদেশি মোবাইল নম্বর, দেশের কোডসহ">
                <Input
                  id="mfa-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="01712345678"
                  required
                />
              </Field>
            )}

            {passwordField("mfa-enrol-password")}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" icon={ArrowRight} loading={busy}>
                কোড পাঠান
              </Button>
              <Button type="button" variant="ghost" onClick={() => open({ name: "idle" })} disabled={busy}>
                বাতিল
              </Button>
            </div>
          </form>
        );
      }

      case "confirm":
        return (
          <form
            onSubmit={confirmChannel}
            className="space-y-4 rounded-panel border border-border bg-surface-2 p-4"
          >
            <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
              {stage.challenge.destination ? (
                <>
                  <span className="font-medium text-foreground">{stage.challenge.destination}</span> —{" "}
                </>
              ) : null}
              পাঠানো ৬ সংখ্যার কোডটি লিখুন।
            </p>

            {stage.challenge.devCode ? (
              <p className="rounded-xl border border-dashed border-border-strong bg-surface px-3.5 py-2.5 text-[0.75rem] leading-relaxed text-muted-foreground">
                ডেভেলপমেন্ট: কোডটি আসলে পাঠানো হয়নি (console driver), তাই এখানেই দেখানো হচ্ছে —{" "}
                <span className="font-semibold tabular text-foreground">{stage.challenge.devCode}</span>
              </p>
            ) : null}

            <Field
              label="কোড"
              htmlFor="mfa-code"
              required
              hint={`কোডটি ${stage.challenge.minutes} মিনিটের জন্য বৈধ`}
            >
              <Input
                id="mfa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="••••••"
              />
            </Field>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" icon={Check} loading={busy}>
                যাচাই করে চালু করুন
              </Button>
              <Button type="button" variant="ghost" onClick={() => open({ name: "idle" })} disabled={busy}>
                বাতিল
              </Button>
            </div>
          </form>
        );

      case "enrol-passkey":
        return (
          <form
            onSubmit={enrolPasskey}
            className="space-y-4 rounded-panel border border-border bg-surface-2 p-4"
          >
            <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
              পাসকি হলো এই ডিভাইসের ফিঙ্গারপ্রিন্ট, মুখ বা PIN দিয়ে সুরক্ষিত চাবি — সাইন-ইনের সময় কোনো কোড
              টাইপ করতে হয় না। ব্রাউজার জিজ্ঞাসা করলে অনুমতি দিন।
            </p>

            <Field label="পাসকির নাম (ঐচ্ছিক)" htmlFor="mfa-passkey-label" hint="পরে চিনতে সুবিধা হয় — যেমন “আমার ফোন”">
              <Input
                id="mfa-passkey-label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="আমার ফোন"
              />
            </Field>

            {passwordField("mfa-passkey-password")}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" icon={Fingerprint} loading={busy}>
                পাসকি তৈরি করুন
              </Button>
              <Button type="button" variant="ghost" onClick={() => open({ name: "idle" })} disabled={busy}>
                বাতিল
              </Button>
            </div>
          </form>
        );

      case "remove":
        return (
          <form
            onSubmit={removeFactor}
            className="space-y-4 rounded-panel border border-border bg-surface-2 p-4"
          >
            <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">{stage.factor.label ?? CHANNEL[stage.factor.kind].label}</span>{" "}
              সরিয়ে ফেললে সাইন-ইনের সময় আর এটি ব্যবহার করা যাবে না।
            </p>

            {passwordField("mfa-remove-password")}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="danger" icon={Trash2} loading={busy}>
                সরিয়ে ফেলুন
              </Button>
              <Button type="button" variant="ghost" onClick={() => open({ name: "idle" })} disabled={busy}>
                বাতিল
              </Button>
            </div>
          </form>
        );

      case "regenerate":
        return (
          <form
            onSubmit={regenerate}
            className="space-y-4 rounded-panel border border-border bg-surface-2 p-4"
          >
            <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
              নতুন কোড তৈরি করলে পুরোনো সব রিকভারি কোড আর কাজ করবে না। নতুনগুলো আবার হাতে লিখে রাখুন।
            </p>

            {passwordField("mfa-regenerate-password")}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" icon={KeyRound} loading={busy}>
                নতুন কোড তৈরি করুন
              </Button>
              <Button type="button" variant="ghost" onClick={() => open({ name: "idle" })} disabled={busy}>
                বাতিল
              </Button>
            </div>
          </form>
        );

      case "codes":
        return (
          <div className="space-y-4 rounded-panel border border-warning/40 bg-warning-soft/40 p-4">
            <Callout tone="warning" icon={KeyRound} title="রিকভারি কোড — এই একবারই দেখা যাবে">
              ফোন বা পাসকি হারালে এই কোডগুলোর একটি দিয়ে সাইন-ইন করতে পারবেন। প্রতিটি কোড কেবল একবার কাজ করে,
              তাই নিরাপদ জায়গায় লিখে রাখুন — এখান থেকে চলে গেলে আর দেখানো হবে না।
            </Callout>

            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-2">
              {stage.codes.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-center font-mono text-[0.8125rem] tabular text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                icon={copied ? Check : Copy}
                onClick={() => copyCodes(stage.codes)}
              >
                {copied ? "কপি হয়েছে" : "সব কপি করুন"}
              </Button>
              <Button onClick={() => open({ name: "idle" })}>সংরক্ষণ করেছি</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader
          title="দুই ধাপের যাচাই"
          subtitle="পাসওয়ার্ডের পর একটি কোড বা পাসকি দিয়ে অ্যাকাউন্ট সুরক্ষিত রাখুন"
          icon={ShieldCheck}
          tone="primary"
        />
        <Callout tone="info" icon={Lock} className="mt-5">
          দুই ধাপের যাচাই আপনার অ্যাকাউন্টের সাথে যুক্ত — এটি চালু বা বদলাতে আগে প্রবেশ করুন।
        </Callout>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="দুই ধাপের যাচাই"
        subtitle="পাসওয়ার্ডের পর একটি কোড বা পাসকি দিয়ে অ্যাকাউন্ট সুরক্ষিত রাখুন"
        icon={ShieldCheck}
        tone={status?.enabled ? "success" : "primary"}
        action={
          <Badge tone={status?.enabled ? "success" : "neutral"} size="sm" dot>
            {loading ? "দেখা হচ্ছে…" : status?.enabled ? "চালু" : "বন্ধ"}
          </Badge>
        }
      />

      {error}

      {loading ? (
        <p className="mt-5 text-[0.8125rem] text-muted-foreground">দ্বিতীয় ধাপের তথ্য আনা হচ্ছে…</p>
      ) : (
        <>
          {factors.length > 0 ? (
            <ul className="mt-5 space-y-3">
              {factors.map((factor) => {
                const meta = CHANNEL[factor.kind];
                const Icon = meta.icon;
                return (
                  <li
                    key={factor.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3.5"
                  >
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", softTone[meta.tone])}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.875rem] font-medium text-foreground">
                        {factor.label ?? meta.label}
                      </p>
                      <p className="text-[0.75rem] text-muted-foreground">{factor.destination ?? meta.hint}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => open({ name: "remove", factor })}
                      disabled={busy}
                    >
                      সরান
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-5 text-[0.8125rem] leading-relaxed text-muted-foreground">
              এখনো কোনো দ্বিতীয় ধাপ চালু করা হয়নি। নিচের যেকোনো একটি যোগ করে শুরু করুন — যে চ্যানেলটি আপনার
              সবচেয়ে সহজে হাতে থাকে, সেটিই বেছে নিন।
            </p>
          )}

          {stage.name === "idle" ? (
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Button variant="outline" full icon={Mail} onClick={() => open({ name: "enrol-email" })} disabled={busy}>
                  ইমেইল কোড
                </Button>
                <Button variant="outline" full icon={Smartphone} onClick={() => open({ name: "enrol-sms" })} disabled={busy}>
                  SMS কোড
                </Button>
                <Button variant="outline" full icon={Fingerprint} onClick={() => open({ name: "enrol-passkey" })} disabled={busy}>
                  পাসকি
                </Button>
              </div>

              {status?.enabled ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 p-3.5">
                  <p className="text-[0.8125rem] text-muted-foreground">
                    রিকভারি কোড বাকি আছে{" "}
                    <span className="font-semibold tabular text-foreground">
                      {status.recoveryCodesRemaining}
                    </span>
                    টি
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={KeyRound}
                    onClick={() => open({ name: "regenerate" })}
                    disabled={busy}
                  >
                    নতুন কোড তৈরি করুন
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-5">{stagePanel()}</div>
          )}
        </>
      )}
    </Card>
  );
}

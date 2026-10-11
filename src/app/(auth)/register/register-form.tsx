"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Lock, Mail, UserRound } from "@/components/icons";
import { Button, Callout, Field, Input } from "@/components/ui";
import { signUp } from "@/lib/auth-client";
import { DistrictField } from "./district-field";

/**
 * Creating an account.
 *
 * The fields are read from the form rather than mirrored in state: the district
 * picker is a client island that already carries its own value in a hidden input,
 * and the terms box is checked by the browser. What is mirrored is only what has
 * to be shown back — the error and whether a request is in flight.
 *
 * There is no "confirm your email" step because the API does not ask for one: an
 * account is created active and signed in, which is the honest state of the
 * backend today rather than a promise this form pretends to keep.
 */

function leadFor(status: number): string {
  if (status === 409) return "এই ইমেইলে আগেই একটি অ্যাকাউন্ট আছে।";
  if (status === 429) return "অনেকবার চেষ্টা করা হয়েছে — একটু পরে আবার চেষ্টা করুন।";
  if (status === 0) return "সার্ভারে পৌঁছানো যায়নি।";
  return "অ্যাকাউন্ট খোলা যায়নি।";
}

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [lead, setLead] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setLead(null);
    setDetail(null);

    const form = new FormData(event.currentTarget);
    const result = await signUp({
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      district: String(form.get("district") ?? ""),
    });

    if (!result.ok) {
      setLead(leadFor(result.status));
      setDetail(result.message);
      setPending(false);
      return;
    }

    // The API answers with a session as well as an account, so this lands signed
    // in — no second call, and no window where the account exists but nobody is.
    router.replace("/");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {lead ? (
        <Callout tone="danger" icon={AlertTriangle} title={lead}>
          {detail}
        </Callout>
      ) : null}

      <Field label="পূর্ণ নাম" htmlFor="name" required>
        <div className="relative">
          <UserRound
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
            aria-hidden
          />
          <Input id="name" name="name" autoComplete="name" placeholder="আপনার নাম" className="pl-10" required />
        </div>
      </Field>

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
            required
          />
        </div>
      </Field>

      <Field
        label="পাসওয়ার্ড"
        htmlFor="password"
        required
        hint="অন্তত ৮ অক্ষর, একটি সংখ্যা ও একটি বড় হাতের অক্ষর"
      >
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
            aria-hidden
          />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="pl-10"
            required
          />
        </div>
      </Field>

      <DistrictField />

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-3.5">
        <input
          type="checkbox"
          name="terms"
          className="mt-0.5 size-4 cursor-pointer accent-[var(--primary)]"
          required
        />
        <span className="text-[0.75rem] leading-relaxed text-muted-foreground">
          আমি সম্মত যে আমি প্ল্যাটফর্মের আলোচনা নীতিমালা মেনে চলব — আদব রক্ষা করব, দলিলসহ কথা বলব এবং ব্যক্তিগত
          আক্রমণ এড়িয়ে চলব।
        </span>
      </label>

      <Button size="lg" full iconRight={ArrowRight} type="submit" loading={pending}>
        অ্যাকাউন্ট তৈরি করুন
      </Button>

      <p className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-3.5 py-2.5 text-[0.75rem] leading-relaxed text-muted-foreground">
        অ্যাকাউন্ট তৈরি হলে আপনি সরাসরি প্রবেশ করবেন। ইমেইল যাচাইয়ের ধাপ এখনো নেই — ইমেইল ঠিকানা যাচাই করে অ্যাকাউন্ট
        সক্রিয় করার ব্যবস্থা পরের ধাপে যোগ হবে।
      </p>
    </form>
  );
}

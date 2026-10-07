import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap, Lock, Mail, MapPin, UserRound } from "@/components/icons";
import { DISTRICTS } from "@/lib/bn";
import { Button, Callout, Field, Input, Select } from "@/components/ui";

export const metadata: Metadata = {
  title: "নতুন অ্যাকাউন্ট",
  description:
    "ইলমে অ্যাকাউন্ট খুলে প্রশ্ন করুন, আয়াত ও হাদীস সংরক্ষণ করুন এবং কাঠামোবদ্ধ শিক্ষা যাত্রা শুরু করুন।",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden focusable="false">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z"
      />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">অ্যাকাউন্ট খুলুন</h1>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-muted-foreground">
        বিনামূল্যে অ্যাকাউন্ট — প্রশ্ন করুন, আয়াত ও হাদীস সংরক্ষণ করুন, আর নিজের গতিতে ইলম অর্জন করুন।
      </p>

      {/* Social first: it is the fastest path and has no password to invent. */}
      <div className="mt-7 space-y-3">
        <a
          href={`${API_URL}/api/auth/google`}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border-strong bg-surface text-[0.875rem] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-surface-2"
        >
          <GoogleMark />
          Google দিয়ে শুরু করুন
        </a>
        <a
          href={`${API_URL}/api/auth/facebook`}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border-strong bg-surface text-[0.875rem] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-surface-2"
        >
          <FacebookMark />
          Facebook দিয়ে শুরু করুন
        </a>
      </div>

      <div className="my-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" aria-hidden />
        <span className="text-[0.75rem] font-medium text-subtle-foreground">অথবা ইমেইল দিয়ে</span>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>

      <div className="space-y-4">
        <Field label="পূর্ণ নাম" htmlFor="name" required>
          <div className="relative">
            <UserRound
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
              aria-hidden
            />
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="আপনার নাম"
              className="pl-10"
            />
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
            />
          </div>
        </Field>

        <Field
          label="আপনার জেলা"
          htmlFor="district"
          hint="নামাজের সময়সূচি ও স্থানীয় কনটেন্টের জন্য — পরে সেটিংসে বদলাতে পারবেন"
        >
          <div className="relative">
            <MapPin
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
              aria-hidden
            />
            <Select id="district" name="district" defaultValue="dhaka" className="pl-10">
              {DISTRICTS.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name.bn}
                </option>
              ))}
            </Select>
          </div>
        </Field>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-3.5">
          <input type="checkbox" name="terms" className="mt-0.5 size-4 cursor-pointer accent-[var(--primary)]" />
          <span className="text-[0.75rem] leading-relaxed text-muted-foreground">
            আমি সম্মত যে আমি প্ল্যাটফর্মের আলোচনা নীতিমালা মেনে চলব — আদব রক্ষা করব, দলিলসহ কথা বলব এবং ব্যক্তিগত
            আক্রমণ এড়িয়ে চলব।
          </span>
        </label>

        <Button size="lg" full iconRight={ArrowRight} type="submit" disabled>
          অ্যাকাউন্ট তৈরি করুন
        </Button>

        <p className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-3.5 py-2.5 text-[0.75rem] leading-relaxed text-muted-foreground">
          ইমেইল দিয়ে রেজিস্ট্রেশন ব্যাকএন্ড যুক্ত হলে সক্রিয় হবে। এখন সোশ্যাল লগইন দিয়ে অ্যাকাউন্ট খুলতে পারবেন।
        </p>
      </div>

      <Callout
        tone="accent"
        icon={GraduationCap}
        title="আলেমরা নিজে রেজিস্ট্রেশন করেন না"
        className="mt-6"
      >
        প্ল্যাটফর্মে আলেম ও মুফতিদের প্রোফাইল যাচাই করে অ্যাডমিন যোগ করেন — যোগ্যতা, মাদরাসা ও বিভাগ যাচাইয়ের পর।
        আপনি যদি আলেম হন এবং যুক্ত হতে চান,{" "}
        <Link href="/scholars" className="font-medium text-primary hover:underline">
          আলেমদের তালিকা ও যাচাই প্রক্রিয়া
        </Link>{" "}
        দেখুন।
      </Callout>

      <p className="mt-6 text-center text-[0.8125rem] text-muted-foreground">
        আগেই অ্যাকাউন্ট আছে?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          প্রবেশ করুন
        </Link>
      </p>
    </div>
  );
}

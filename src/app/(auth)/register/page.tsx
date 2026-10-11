import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap } from "@/components/icons";
import { Callout } from "@/components/ui";
import {
  SOCIAL_UNAVAILABLE_NOTE,
  SocialButtons,
} from "@/components/auth/social-buttons";
import { enabledSocialProviders } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "নতুন অ্যাকাউন্ট",
  description:
    "ইলমে অ্যাকাউন্ট খুলে প্রশ্ন করুন, আয়াত ও হাদীস সংরক্ষণ করুন এবং কাঠামোবদ্ধ শিক্ষা যাত্রা শুরু করুন।",
};

/**
 * Registration.
 *
 * Social providers come first because signing up with one has no password to
 * invent, and because the API treats it as the same kind of account — a social
 * sign-in that finds no identity and no conflicting address creates the same row
 * this form's `POST /auth/register` does.
 */
export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect("/");

  const providers = await enabledSocialProviders();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">অ্যাকাউন্ট খুলুন</h1>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-muted-foreground">
        বিনামূল্যে অ্যাকাউন্ট — প্রশ্ন করুন, আয়াত ও হাদীস সংরক্ষণ করুন, আর নিজের গতিতে ইলম অর্জন করুন।
      </p>

      {providers.length > 0 ? (
        <div className="mt-7">
          <SocialButtons providers={providers} verb="শুরু করুন" />
        </div>
      ) : (
        <p className="mt-7 rounded-xl border border-dashed border-border-strong bg-surface-2 px-3.5 py-2.5 text-[0.75rem] leading-relaxed text-muted-foreground">
          {SOCIAL_UNAVAILABLE_NOTE}
        </p>
      )}

      <div className="my-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" aria-hidden />
        <span className="text-[0.75rem] font-medium text-subtle-foreground">
          {providers.length > 0 ? "অথবা ইমেইল দিয়ে" : "ইমেইল দিয়ে"}
        </span>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>

      <RegisterForm />

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

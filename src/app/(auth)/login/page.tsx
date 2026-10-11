import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { enabledSocialProviders } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { safeNext } from "@/lib/utils";

export const metadata: Metadata = {
  title: "প্রবেশ করুন",
  description: "ইলমে প্রবেশ করে আপনার প্রশ্ন, সংরক্ষিত জ্ঞান ও শেখার যাত্রা চালিয়ে যান।",
};

/**
 * Signing in.
 *
 * Two things are resolved on the server before the form is sent: whether the
 * visitor already has a session (in which case this page has nothing to offer
 * them), and which social providers an admin has enabled. The form itself is a
 * client component because it submits, shows errors and — for an account with a
 * second factor — becomes a different form halfway through.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; socialError?: string | string[] }>;
}) {
  const params = await searchParams;

  // A console that refused you sends you here with where you were going, so a
  // successful sign-in resumes it instead of dropping you on the home page.
  const next = safeNext(params.next);

  /**
   * A social sign-in that came back without a session — a cancelled consent, a
   * refused one, an address already in use.
   *
   * The API sends only the status, and only a plausible status is shown: the page
   * supplies its own wording for each case, so nothing that arrived in a URL is
   * ever rendered here.
   */
  const rawSocialError = Array.isArray(params.socialError)
    ? params.socialError[0]
    : params.socialError;
  const socialError = rawSocialError && /^\d{3}$/.test(rawSocialError) ? rawSocialError : undefined;

  const user = await getSessionUser();
  if (user) redirect(next);

  const providers = await enabledSocialProviders();

  return (
    <div>
      <LoginForm providers={providers} next={next} socialError={socialError} />

      <p className="mt-6 border-t border-border pt-5 text-center text-[0.6875rem] leading-relaxed text-subtle-foreground">
        সোশ্যাল লগইনে আমরা কেবল আপনার নাম, ইমেইল ও প্রোফাইল ছবি গ্রহণ করি — কোনো পোস্ট বা বন্ধু তালিকার অনুমতি নয়।
        আপনার পরিচয় কখনো তৃতীয় পক্ষের কাছে বিক্রি করা হয় না।
      </p>
    </div>
  );
}

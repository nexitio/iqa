import { LogIn } from "@/components/icons";
import { socialStartUrl, type SocialProvider } from "@/lib/api";

/**
 * The provider buttons on the sign-in and registration pages.
 *
 * Both pages offer the same thing and differ only in the verb, so the buttons
 * live here rather than twice over. Which buttons exist is not decided in this
 * file — that is whatever an admin has enabled in the console, and the label is
 * the name configured on the row, so adding a provider later is a form rather
 * than a code change. Google and Facebook get their own marks because their brand
 * rules ask for them; anything else gets a neutral one.
 */

/** Google's official four-colour "G". Drawn inline to avoid an image asset. */
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

/** Facebook's brand "f". */
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

/**
 * The mark for a provider slug.
 *
 * Exported because the admin console lists the same providers and has the same
 * reason to show the brand: a row is recognised by its logo before its slug is
 * read. Everything unknown gets a neutral mark rather than a guess.
 */
export function providerMark(slug: string) {
  if (slug === "google") return <GoogleMark />;
  if (slug === "facebook") return <FacebookMark />;
  return <LogIn className="size-4 shrink-0 text-muted-foreground" aria-hidden />;
}

export function SocialButtons({
  providers,
  verb,
  returnTo = "/",
}: {
  providers: SocialProvider[];
  /** "প্রবেশ করুন" on the sign-in page, "শুরু করুন" on registration. */
  verb: string;
  returnTo?: string;
}) {
  if (providers.length === 0) return null;

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <a
          key={provider.slug}
          href={socialStartUrl(provider.slug, returnTo)}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border-strong bg-surface text-[0.875rem] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-surface-2"
        >
          {providerMark(provider.slug)}
          {provider.name.bn} দিয়ে {verb}
        </a>
      ))}
    </div>
  );
}

/**
 * Shown in the buttons' place when nothing is enabled, so the page explains the
 * absence instead of leaving a visitor to wonder where the social sign-in went.
 * One sentence, one place: the two pages cannot drift apart.
 */
export const SOCIAL_UNAVAILABLE_NOTE =
  "সোশ্যাল লগইন এই মুহূর্তে চালু করা হয়নি — প্রোভাইডার কনফিগার করা হলে এখানে বোতাম দেখা যাবে।";

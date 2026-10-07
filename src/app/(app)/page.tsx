import type { Metadata } from "next";
import { Sparkles } from "@/components/icons";
import { Num, T } from "@/components/i18n-text";
import { PrayerTimesWidget } from "@/components/personal";
import { AskCtaCard } from "@/components/knowledge";
import { KnowledgeStories, resolveFeedItems } from "@/components/social";
import { FeedStream } from "./feed-stream";
import { FEED } from "@/lib/data/feed";

export const metadata: Metadata = {
  title: "হোম",
  description:
    "আজকের আয়াত ও হাদীস, নামাজের সময়সূচি, আপনার ফিড এবং প্রশ্নের উত্তর — এক জায়গায়।",
};

/** The whole feed resolved once, with anything stale dropped. */
const POSTS = resolveFeedItems(FEED);

export default function HomePage() {
  return (
    // No welcome bar: the feed itself is the first thing on the page. The
    // greeting, the Islamic date and the next-prayer countdown used to open the
    // page here; the schedule lives in the rail below and on /daily, and today's
    // content is a better greeting than a salutation.
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
      {/* ---------------------------------------------------------- feed */}
      <div className="min-w-0 space-y-4">
        <KnowledgeStories composer />

        <section aria-label="আপনার ফিড" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            {/* The feed is the page's subject, so its heading is the page's h1. */}
            <h1 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" aria-hidden />
              <T k="label.yourFeed" />
            </h1>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[0.6875rem] font-semibold text-primary-soft-foreground">
              <Num value={POSTS.length} /> টি নতুন
            </span>
          </div>

          <FeedStream posts={POSTS} />
        </section>

        {/* Nothing follows the feed. Every block that used to sit here —
            continue-reading, journeys, scholar suggestions — already lives on
            the page that owns it (/library, /journey, /scholars). Home is the
            feed, and the feed is endless. */}
      </div>

      {/* ---------------------------------------------------------- rail */}
      <aside className="hidden xl:block">
        {/* Same rule as the shell sidebar: a pinned column taller than the
            viewport must scroll inside itself, or its lower cards can never be
            reached. */}
        <div className="no-scrollbar sticky top-[var(--pin-top)] max-h-[var(--pin-room)] space-y-4 overflow-y-auto">
          {/* Two cards, in this order: the next salah is the most time-sensitive
              thing on a page people open several times a day, and the moment a
              reader has just checked it is the moment they are most likely to
              have a question about it. The progress, trending, scholar-network
              and saved-items cards that used to fill this column each restated a
              page that already exists (/profile, /topics, /scholars, /library). */}
          <PrayerTimesWidget />

          <AskCtaCard />
        </div>
      </aside>
    </div>
  );
}

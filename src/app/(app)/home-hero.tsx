"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flame, PenLine, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { bdDateParts, toBnDigits } from "@/lib/bn";
import { CURRENT_USER, USER_STREAK_DAYS } from "@/lib/data/personal";
import { Avatar, Button } from "@/components/ui";
import { NextPrayerChip, TodayStrip } from "@/components/personal";

/**
 * Greeting by Dhaka's local hour.
 *
 * The hour must come from the visitor's own clock, which means it cannot be
 * baked at build time — a statically prerendered page would otherwise greet
 * everyone with the build machine's morning forever. The lazy state initialiser
 * runs on both server and client so the first paint already has a greeting, and
 * `suppressHydrationWarning` covers the one-in-a-thousand case where the two
 * renders straddle an hour boundary.
 */
function greetingKeyFor(hour: number) {
  if (hour < 5) return "home.greetingNight";
  if (hour < 12) return "home.greetingMorning";
  if (hour < 16) return "home.greetingAfternoon";
  if (hour < 19) return "home.greetingEvening";
  return "home.greetingNight";
}

/**
 * The top of the home feed.
 *
 * One row, four things: who you are, what today is, when the next salah is, and
 * the two actions worth taking. Everything here is something the reader needs
 * before scrolling — anything else belonged to a different surface, and three
 * separate date/prayer panels used to say the same thing three times.
 */
export function HomeHero() {
  const { t } = useI18n();
  const [greeting, setGreeting] = useState(() =>
    greetingKeyFor(bdDateParts(new Date()).hour),
  );

  useEffect(() => {
    // Keep the greeting honest for a tab left open across the day.
    const update = () => setGreeting(greetingKeyFor(bdDateParts(new Date()).hour));
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const firstName = CURRENT_USER.name.split(/\s+/)[0];

  return (
    <section className="rounded-panel border border-border bg-surface p-4 shadow-card sm:px-5 sm:py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Avatar
          name={CURRENT_USER.name}
          color={CURRENT_USER.avatarColor}
          size="md"
          verified
          ring
        />

        <div className="min-w-0 flex-1 basis-[10rem]">
          <h1
            className="truncate font-display text-lg font-bold leading-tight text-foreground sm:text-xl"
            suppressHydrationWarning
          >
            {t(greeting)}, <span className="text-primary">{firstName}</span>
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.75rem] text-muted-foreground">
            <TodayStrip />
            {/* A streak is the one number worth showing here; the library count
                lives on the rail so this line stays on a single row. The
                separator leads the item so wrapping never orphans it. */}
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 font-medium text-warning transition-colors hover:text-warning/80"
            >
              <span className="pr-1.5 text-border-strong" aria-hidden>
                ·
              </span>
              <Flame className="size-3.5" aria-hidden />
              {toBnDigits(USER_STREAK_DAYS)} দিন
            </Link>
          </div>
        </div>

        <NextPrayerChip />

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button
            href="/questions/ask"
            icon={Plus}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            {t("action.askScholar")}
          </Button>
          <Button
            href="/discussions"
            variant="outline"
            icon={PenLine}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            {t("discussions.title")}
          </Button>
        </div>
      </div>
    </section>
  );
}

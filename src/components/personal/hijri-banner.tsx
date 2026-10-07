"use client";

import { useMemo } from "react";
import { CalendarDays, Moon, Sparkles } from "lucide-react";
import {
  gregorianDateBn,
  hijriDate,
  hijriMonthName,
  isJumuah,
  isRamadan,
  weekdayBn,
} from "@/lib/bn";
import { useI18n } from "@/lib/i18n";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import { Badge, Callout, Card, Skeleton } from "@/components/ui";

/**
 * "Today", from the visitor's own clock.
 *
 * `useNow` returns 0 until hydration, so both banners render their skeleton on
 * the server and on the first client render and only then show a date — which
 * is what keeps a build-time date from being frozen into the markup. It also
 * re-reads every minute so a tab left open overnight stays correct.
 */
function useToday(): Date | null {
  const tickMs = useNow(60_000);
  return useMemo(() => (tickMs > 0 ? new Date(tickMs) : null), [tickMs]);
}

export function HijriDateBanner({ className }: { className?: string }) {
  const { t, locale } = useI18n();
  const today = useToday();

  if (!today) {
    return (
      <Card className={className}>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-3 w-56" />
      </Card>
    );
  }

  const ramadan = isRamadan(today);
  const friday = isJumuah(today);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-panel border p-5 shadow-card sm:p-6",
        ramadan ? "border-accent/40 bg-accent-soft/50" : "border-border bg-surface",
        className,
      )}
    >
      {ramadan ? (
        <span className="pattern-girih pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      ) : null}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-2xl",
              ramadan ? "bg-accent text-accent-foreground" : "bg-primary-soft text-primary",
            )}
          >
            {ramadan ? <Moon className="size-5" /> : <CalendarDays className="size-5" />}
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                "font-display text-lg font-bold leading-snug",
                ramadan ? "text-accent-soft-foreground" : "text-foreground",
              )}
            >
              {hijriDate(today, locale)}
            </p>
            <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">{gregorianDateBn(today, locale)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ramadan ? (
            <Badge tone="accent" icon={Moon}>
              {hijriMonthName(today, locale)}
            </Badge>
          ) : null}
          {friday ? (
            <Badge tone="primary" icon={Sparkles}>
              জুমার দিন
            </Badge>
          ) : null}
          {!ramadan && !friday ? (
            <Badge tone="neutral" icon={CalendarDays}>
              {weekdayBn(today, false)}
            </Badge>
          ) : null}
        </div>
      </div>

      {friday ? (
        <Callout tone="primary" className="relative mt-4" icon={Sparkles}>
          {t("home.jumuahNote")}
        </Callout>
      ) : null}
    </section>
  );
}

/** Single-line variant for page headers and tight rails. */
export function TodayStrip({ className }: { className?: string }) {
  const { locale } = useI18n();
  const today = useToday();

  if (!today) {
    return <Skeleton className={cn("h-5 w-64", className)} />;
  }

  return (
    <p className={cn("flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.75rem] text-muted-foreground", className)}>
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
        <CalendarDays className="size-3.5 text-primary" aria-hidden />
        {gregorianDateBn(today, locale)}
      </span>
      {/* The separator leads the Hijri date rather than trailing the Gregorian
          one, so a narrow screen never wraps it onto a line of its own. */}
      <span className="font-medium text-accent">
        <span className="pr-1.5 text-border-strong" aria-hidden>
          ·
        </span>
        {hijriDate(today, locale)}
      </span>
    </p>
  );
}

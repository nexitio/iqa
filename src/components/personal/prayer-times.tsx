"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  CloudSun,
  Compass,
  MoonStar,
  Sun,
  SunDim,
  Sunrise,
  Sunset,
} from "lucide-react";
import {
  computePrayerTimes,
  countdownBn,
  districtOptions,
  findDistrict,
  formatNumber,
  gregorianDateBn,
  hijriDate,
  isJumuah,
  toBnDigits,
} from "@/lib/bn";
import {
  daySegments,
  describePrayerCard,
  prayerRowTag,
  secondsUntil,
  segmentAt,
  type DaySegment,
  type PrayerCardPhase,
} from "@/lib/prayer-day";
import { useI18n } from "@/lib/i18n";
import { useNow } from "@/lib/use-now";
import {
  madhabName,
  useDistrictPreference,
  useMadhab,
  type Madhab,
} from "@/lib/prayer-prefs";
import { cn } from "@/lib/utils";
import type { PrayerSchedule, PrayerTime } from "@/lib/types";
import { Badge, Card, Chip, Progress, Select, Skeleton, type Tone } from "@/components/ui";

/**
 * One icon per row of the day — every salah, and the intervals between them.
 *
 * Sunrise carries its own icon rather than sharing Dhuhr's sun: in this list it
 * is not a prayer at all but the moment Fajr's window closes.
 */
const SEGMENT_ICONS: Record<DaySegment["key"], LucideIcon> = {
  fajr: Sunrise,
  sunrise: Sunrise,
  duha: CloudSun,
  zenith: SunDim,
  dhuhr: Sun,
  asr: Sun,
  maghrib: Sunset,
  sunset: Sunset,
  isha: MoonStar,
};

/**
 * How the headline reads in each phase.
 *
 * The tone is the point: a running salah window is the card's normal state, a
 * forbidden stretch is a warning the reader must not miss, and the forenoon is
 * deliberately quiet because nothing is wrong — there is simply no obligation.
 */
interface PhaseStyle {
  panel: string;
  accent: string;
  dot: string;
  ping: string;
  note: string;
  tone: Tone;
  /** True while a window is running, so the eyebrow's dot pulses. */
  live: boolean;
}

/** A running salah and a running fast are the same state, visually. */
const ACTIVE_WINDOW: PhaseStyle = {
  panel: "border-primary/15 bg-gradient-to-br from-primary-soft via-primary-soft/40 to-surface",
  accent: "text-primary",
  dot: "bg-primary",
  ping: "bg-primary/50",
  note: "text-subtle-foreground",
  tone: "primary",
  live: true,
};

const PHASE_STYLE: Record<PrayerCardPhase, PhaseStyle> = {
  salah: ACTIVE_WINDOW,
  fasting: ACTIVE_WINDOW,
  suhoor: ACTIVE_WINDOW,
  forbidden: {
    panel: "border-warning/25 bg-gradient-to-br from-warning-soft via-warning-soft/40 to-surface",
    accent: "text-warning-soft-foreground",
    dot: "bg-warning",
    ping: "bg-warning/50",
    note: "text-warning-soft-foreground",
    tone: "warning",
    live: false,
  },
  duha: {
    panel: "border-border bg-gradient-to-br from-surface-2 via-surface-2/50 to-surface",
    accent: "text-muted-foreground",
    dot: "bg-border-strong",
    ping: "bg-border-strong",
    note: "text-subtle-foreground",
    tone: "neutral",
    live: false,
  },
};

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

function clockFromSeconds(total: number) {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return toBnDigits(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
}

/**
 * Prayer schedule for today plus a live tick.
 *
 * The clock is read through `useNow`, which has an explicit server snapshot
 * (0) — so the shell renders its skeleton on the server and on the first client
 * render, then fills in. That is what keeps the countdown honest without a
 * setState-in-effect and without a hydration mismatch.
 *
 * The madhab is a dependency rather than a constant: it moves Asr by an hour or
 * two, so a schedule memoised without it would keep counting down to the wrong
 * time after the reader changes the setting.
 */
function usePrayerClock(districtId: string, madhab: Madhab) {
  const tickMs = useNow(1000);
  const now = useMemo(() => (tickMs > 0 ? new Date(tickMs) : null), [tickMs]);

  // Recomputed as the clock ticks rather than frozen per day: the schedule is a
  // handful of trig calls, and "next prayer" has to roll over the moment one
  // passes — anchoring it to a fixed instant would leave the widget counting
  // down to a prayer that has already happened.
  const schedule = useMemo<PrayerSchedule | null>(
    () => (now ? computePrayerTimes(findDistrict(districtId), now, madhab) : null),
    [districtId, madhab, now],
  );

  return { schedule, now };
}

/* -------------------------------------------------------------------------- */

export function PrayerTimesWidget({
  districtId,
  className,
}: {
  districtId?: string;
  className?: string;
}) {
  const { t, pick, locale, isBn } = useI18n();
  const [selected, setSelected] = useDistrictPreference(districtId);
  const [madhab] = useMadhab();
  const { schedule, now } = usePrayerClock(selected, madhab);
  // The card opens compact. It sits in a pinned rail, where a nine-row table of
  // the whole day is a wall; the reader who wants the day asks for it, and the
  // panel above answers everything the compact card is for.
  const [expanded, setExpanded] = useState(false);
  const dayListId = useId();

  if (!schedule || !now) {
    return (
      <Card className={cn("overflow-hidden", className)} padding="none">
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <Skeleton className="size-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
        {/* The skeleton is the compact card's shape, not the expanded one: the
            card must not promise nine rows and then hand over one. */}
        <div className="space-y-2 px-4 py-3">
          <Skeleton className="h-[5.75rem] w-full rounded-xl" />
          <Skeleton className="h-7 w-full rounded-lg" />
        </div>
      </Card>
    );
  }

  // Everything the day decides lives in one value: which salah the headline
  // names (Jumu'ah on Fridays), and whether the card is measuring a salah
  // window, the fast, or the night that ends at suhoor.
  const day = describePrayerCard(schedule, now, locale);
  const style = PHASE_STYLE[day.phase];
  const countdown = clockFromSeconds(day.remaining);
  // The whole day as intervals, plus which one is running: the list and the
  // headline are then two readings of a single model rather than two opinions.
  const segments = daySegments(schedule);
  const activeKey = segmentAt(segments, now).key;

  return (
    <Card className={cn("overflow-hidden", className)} padding="none">
      {/* Header. The district picker already names the place, so the subline
          carries the date instead — the panel doubles as the day's anchor. */}
      <div className="flex items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
            <MoonStar className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="truncate font-display text-[0.875rem] font-semibold leading-tight text-foreground">
              {t("label.prayerTimes")}
            </h2>
            <p className="mt-0.5 truncate text-[0.6875rem] text-subtle-foreground">
              {hijriDate(now, locale)}
            </p>
          </div>
        </div>
        <Select
          aria-label={t("settings.location")}
          value={selected}
          onChange={setSelected}
          options={districtOptions(locale)}
          className="h-8 w-[6.75rem] shrink-0 text-[0.75rem]"
        />
      </div>

      {/* Now. One row answers the whole question — which salah we are in, how long
          its own window still has, and how much of that window has gone. When no
          salah is running it answers the next best thing: the forbidden stretch or
          the forenoon the reader is standing in, and the clock that ends it. */}
      <div className="px-4 py-3">
        <div className={cn("rounded-xl border px-3.5 py-2.5", style.panel)}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={cn("flex items-center gap-1.5 text-[0.6875rem] font-semibold", style.accent)}>
                <span className="relative flex size-1.5" aria-hidden>
                  {/* A running salah (or fast) pulses; a closed stretch is a fact,
                      not a clock, so it holds still. */}
                  {style.live ? (
                    <span
                      className={cn("absolute inline-flex size-full animate-ping rounded-full", style.ping)}
                    />
                  ) : null}
                  <span className={cn("relative inline-flex size-1.5 rounded-full", style.dot)} />
                </span>
                {day.stateLabel}
              </p>
              <p className="mt-0.5 font-display text-[1.0625rem] font-bold leading-tight text-foreground">
                {day.eventLabel}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={cn("font-mono text-[1.0625rem] font-bold leading-tight tabular", style.accent)}>
                {countdown}
              </p>
              <p className="mt-0.5 text-[0.6875rem] font-medium text-muted-foreground">
                {isBn ? "বাকি" : "left"}
              </p>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2.5">
            <Progress
              value={day.percent}
              tone={style.tone}
              size="sm"
              className="flex-1"
              label={
                isBn
                  ? "চলতি সময়ের কতটা পেরিয়ে গেছে"
                  : "How much of the current window has passed"
              }
            />
            <span className={cn("shrink-0 text-[0.6875rem] font-semibold tabular", style.accent)}>
              {formatNumber(Math.round(day.percent), locale)}%
            </span>
          </div>

          {/* Both ends of the bar, so the fill means something: it started at one
              clock and the next interval opens at the other. */}
          <div className="mt-1 flex items-baseline justify-between gap-3 text-[0.6875rem]">
            <span className="truncate text-subtle-foreground">{day.startAnchor}</span>
            <span className={cn("truncate font-semibold tabular", style.accent)}>
              {day.endAnchor}
            </span>
          </div>

          {/* Why the stretch is closed — the one line that turns a clock into an
              instruction. */}
          {day.note ? <p className={cn("mt-1 text-[0.6875rem]", style.note)}>{pick(day.note)}</p> : null}
        </div>

        {/* One control, two heights. Collapsed is the answer to "now" — the panel
            above; expanded adds the rest of the day as the timeline it is. */}
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={dayListId}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2/60 px-2 py-1.5 text-[0.6875rem] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          {expanded ? t("action.collapse") : t("action.expand")}
          <ChevronDown
            className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
            aria-hidden
          />
        </button>
      </div>

      {/* Kept in the DOM while collapsed and hidden, rather than unmounted: the
          toggle's `aria-controls` has to name something that exists, and a row
          that was never rendered cannot be the target of that reference. */}
      <div id={dayListId} hidden={!expanded}>
        {/* The day in order, as the intervals it is made of. Passed rows recede, the
            interval you are standing in is filled, and the next salah is outlined,
            so the list answers "where am I" and "when does this end" at a glance. */}
        <ul className="space-y-0.5 px-2 py-3">
          {segments.map((segment) => (
            <DayRow
              key={segment.key}
              segment={segment}
              time={schedule.times.find((entry) => entry.name === segment.key)}
              activeKey={activeKey}
              nextName={schedule.nextPrayer.name}
              jumuah={day.jumuah}
              tag={
                day.phase === "fasting" || day.phase === "suhoor"
                  ? prayerRowTag(segment.key, locale)
                  : null
              }
            />
          ))}
        </ul>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-surface-2/60 px-4 py-2">
          {/* Friday's one line is about the day itself; the calculation method can
              wait for a day that is not Jumu'ah. */}
          <p className="truncate text-[0.6875rem] text-subtle-foreground">
            {day.jumuah
              ? isBn
                ? "জুমার জামাত যোহরের ওয়াক্তে"
                : "Jumu'ah jama'ah falls in the Dhuhr window"
              : isBn
                ? `${madhabName(madhab, locale)} মাযহাব অনুসারে`
                : `${madhabName(madhab, locale)} calculation`}
          </p>
          <Link
            href="/daily#qibla"
            className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-primary hover:underline"
          >
            <Compass className="size-3" aria-hidden />
            {t("label.qibla")}
          </Link>
        </div>
      </div>
    </Card>
  );
}

/**
 * One row of the day.
 *
 * Salehs and the stretches between them share a row shape on purpose: the list is
 * a single timeline, so a forbidden stretch has to sit in the same column as the
 * prayers around it. And every row carries its *own* window — the clock it opens
 * at and the clock the next interval opens at — because a start time without an
 * end time is only half of what a reader looking at a clock needs.
 */
function DayRow({
  segment,
  time,
  activeKey,
  nextName,
  jumuah,
  tag,
}: {
  segment: DaySegment;
  /** The schedule row behind a salah segment; absent for the intervals between. */
  time?: PrayerTime;
  /** The segment `now` falls in. Exactly one row is highlighted, ever. */
  activeKey: DaySegment["key"];
  nextName: PrayerTime["name"];
  /** Friday: the Dhuhr row is Jumu'ah, not a name of its own in the data. */
  jumuah: boolean;
  /** Ramadan only: the row's fasting meaning (suhoor ends, iftar). */
  tag: string | null;
}) {
  const { pick, isBn } = useI18n();
  const Icon = SEGMENT_ICONS[segment.key];
  const name =
    time && jumuah && time.name === "dhuhr" ? (isBn ? "জুমা" : "Jumu'ah") : pick(segment.label);
  const isCurrent = segment.key === activeKey;
  const forbidden = segment.kind === "forbidden";
  // Identity, not the row's own flags: after Isha the next prayer is tomorrow's
  // Fajr — the same row that already flashed past this morning — and sunrise is
  // never "next" at all because nobody prays at it.
  const isNext = !isCurrent && segment.kind === "salah" && time?.name === nextName;

  return (
    <li
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors",
        isCurrent && (forbidden ? "bg-warning-soft" : "bg-primary-soft"),
        !isCurrent && isNext && "bg-surface-2/70",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          isCurrent
            ? forbidden
              ? "text-warning-soft-foreground"
              : "text-primary"
            : isNext
              ? "text-foreground"
              : "text-subtle-foreground",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[0.8125rem]",
          isCurrent
            ? forbidden
              ? "font-semibold text-warning-soft-foreground"
              : "font-semibold text-primary-soft-foreground"
            : isNext
              ? "font-medium text-foreground"
              : "text-muted-foreground",
        )}
      >
        {name}
      </span>
      {isCurrent && !forbidden && segment.kind === "salah" ? (
        <Badge tone="primary" size="xs">
          {isBn ? "চলছে" : "Now"}
        </Badge>
      ) : isNext ? (
        <Badge tone="accent" size="xs">
          {isBn ? "পরবর্তী" : "Next"}
        </Badge>
      ) : null}
      {forbidden ? (
        <Badge tone="warning" size="xs">
          {isBn ? "নিষিদ্ধ" : "Forbidden"}
        </Badge>
      ) : null}
      {segment.kind === "duha" ? (
        <Badge tone="neutral" size="xs">
          {isBn ? "নফল" : "Nafl"}
        </Badge>
      ) : null}
      {tag ? (
        // A fasting fact, so it is tinted apart from the prayer-state chips
        // above it in the same row.
        <Badge tone="info" size="xs">
          {tag}
        </Badge>
      ) : null}
      {/* Only the window's start carries weight; its end reads as a limit. */}
      <span className="shrink-0 whitespace-nowrap text-[0.75rem] tabular text-subtle-foreground">
        <span
          className={cn(
            "font-semibold",
            isCurrent
              ? forbidden
                ? "text-warning-soft-foreground"
                : "text-primary"
              : isNext
                ? "text-foreground"
                : "text-muted-foreground",
          )}
        >
          {toBnDigits(segment.start)}
        </span>
        <span className="mx-1" aria-hidden>
          –
        </span>
        {toBnDigits(segment.end)}
      </span>
    </li>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * One-line next-prayer pill for dense headers.
 *
 * The full schedule already has two homes — the sidebar widget and /daily — so a
 * third full panel on the home feed was pure duplication. This answers the only
 * question the header needs to: how long until the next salah?
 */
export function NextPrayerChip({
  districtId,
  className,
}: {
  districtId?: string;
  className?: string;
}) {
  const { t, pick } = useI18n();
  const [selected] = useDistrictPreference(districtId);
  const [madhab] = useMadhab();
  const { schedule, now } = usePrayerClock(selected, madhab);

  const secondsLeft =
    schedule && now ? secondsUntil(schedule.nextPrayer.time, now) : null;

  if (!schedule || secondsLeft === null) {
    // A calm placeholder instead of an ellipsis: the schedule is deliberately
    // client-only (a prerendered time would be frozen at build time).
    return <Skeleton className={cn("h-8 w-44 shrink-0 rounded-full", className)} />;
  }

  return (
    <Link
      href="/daily"
      title={t("label.prayerTimes")}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-border bg-surface-2 px-3 text-[0.75rem] font-medium transition-colors hover:border-primary/40 hover:bg-surface",
        className,
      )}
    >
      <MoonStar className="size-3.5 shrink-0 text-primary" aria-hidden />
      <span className="text-subtle-foreground">{t("label.nextPrayer")}</span>
      <span className="font-semibold text-foreground">{pick(schedule.nextPrayer.label)}</span>
      <span className="tabular text-primary">{clockFromSeconds(secondsLeft)}</span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Wide, patterned banner used at the top of the daily page. Combines the next
 * prayer countdown with the Islamic date.
 */
export function NextPrayerBanner({
  districtId,
  className,
}: {
  districtId?: string;
  className?: string;
}) {
  const { t, pick, locale } = useI18n();
  const [selected] = useDistrictPreference(districtId);
  const [madhab] = useMadhab();
  const { schedule, now } = usePrayerClock(selected, madhab);

  const isFriday = useMemo(() => (now ? isJumuah(now) : false), [now]);

  // One source of truth for the countdown: the clock above and the "h m left"
  // line below are the same number, so they can never disagree.
  const secondsLeft =
    schedule && now ? secondsUntil(schedule.nextPrayer.time, now) : null;

  return (
    <section
      className={cn(
        "pattern-girih relative overflow-hidden rounded-panel border border-border bg-surface p-5 shadow-card sm:p-6",
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-surface/80 via-surface/92 to-primary-soft/70"
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-primary">
            {isFriday ? "জুমার দিন" : t("label.todaysDate")}
          </p>
          <p className="mt-1 font-display text-lg font-bold leading-snug text-foreground">
            {now ? gregorianDateBn(now) : "…"}
          </p>
          <p className="mt-0.5 text-[0.8125rem] font-medium text-accent">{now ? hijriDate(now) : "…"}</p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="rounded-panel border border-border bg-surface/80 px-4 py-3 text-center backdrop-blur-sm">
            <p className="text-[0.625rem] font-semibold uppercase tracking-wide text-subtle-foreground">
              {t("label.nextPrayer")}
            </p>
            <p className="mt-1 font-display text-base font-bold leading-none text-foreground">
              {schedule ? pick(schedule.nextPrayer.label) : "…"}
            </p>
            <p className="mt-1.5 font-mono text-[0.9375rem] font-bold tabular text-primary">
              {secondsLeft !== null ? clockFromSeconds(secondsLeft) : "…"}
            </p>
            <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
              {schedule ? toBnDigits(schedule.nextPrayer.time) : ""}
            </p>
          </div>
          <div className="hidden flex-col gap-2 sm:flex">
            <Chip href="/daily" tone="primary" size="sm" icon={Compass}>
              {t("nav.daily")}
            </Chip>
            <Chip href="/quran" tone="accent" size="sm">
              {t("nav.quran")}
            </Chip>
          </div>
        </div>
      </div>

      {schedule ? (
        <p className="relative mt-4 text-[0.75rem] text-muted-foreground">
          {pick(schedule.district.name)}
          <span className="mx-1.5 text-border-strong">·</span>
          {countdownBn(
            secondsLeft !== null
              ? Math.ceil(secondsLeft / 60)
              : schedule.nextPrayer.minutesAway,
            locale,
          )}
        </p>
      ) : null}
    </section>
  );
}

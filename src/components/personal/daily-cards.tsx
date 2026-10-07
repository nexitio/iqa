"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, Flame, ScrollText, Target, Volume2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { bnOrdinal, formatNumber, toBnDigits } from "@/lib/bn";
import { cn } from "@/lib/utils";
import { AYAH_OF_THE_DAY, getAyah } from "@/lib/data/quran";
import { HADITH_OF_THE_DAY, getHadith } from "@/lib/data/hadith";
import { getTodayIndex, DAILY_AYAH_REFS, DHIKR_ROUTINE, type DhikrItem } from "@/lib/data/daily";
import {
  LEARNING_GOAL_MINUTES_PER_DAY,
  USER_STREAK_DAYS,
  WEEKLY_LEARNING_MINUTES,
} from "@/lib/data/personal";
import {
  Badge,
  Button,
  Card,
  DayDots,
  Progress,
  Ring,
  WeekStrip,
  type Tone,
} from "@/components/ui";

const WEEKDAY_LABELS_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

/** Convert Bangla digits back to ASCII so a count label can drive progress. */
function parseCountBn(label: string): number | null {
  const ascii = label.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
  const match = ascii.match(/\d+/);
  return match ? Number(match[0]) : null;
}

/**
 * Resolves today's ayah once per render pass. Falls back to the curated
 * `AYAH_OF_THE_DAY` when a rotation ref has no local record yet.
 */
function useTodaysAyah(overrideRef?: string) {
  return useMemo(() => {
    if (overrideRef) return getAyah(overrideRef) ?? AYAH_OF_THE_DAY;
    const ref = DAILY_AYAH_REFS[getTodayIndex(DAILY_AYAH_REFS.length)];
    return getAyah(ref) ?? AYAH_OF_THE_DAY;
  }, [overrideRef]);
}

/* -------------------------------------------------------------------------- */

export function DailyAyahCard({
  ayahRef,
  className,
  layout = "card",
}: {
  ayahRef?: string;
  className?: string;
  layout?: "card" | "wide";
}) {
  const { t, isBn } = useI18n();
  const ayah = useTodaysAyah(ayahRef);
  const [saved, setSaved] = useState(false);

  const href = `/quran/${ayah.surah}?ayah=${ayah.number}`;
  const wide = layout === "wide";

  return (
    <Card className={cn("parchment", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge tone="primary" size="sm">
            {t("label.dailyAyah")}
          </Badge>
          <Link
            href={href}
            className="text-[0.75rem] font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {isBn ? `সূরা ${toBnDigits(ayah.surah)}:${toBnDigits(ayah.number)}` : `${ayah.surah}:${ayah.number}`}
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon-sm" variant="ghost" aria-label={t("action.play")}>
            <Volume2 className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setSaved((v) => !v)}
            aria-label={saved ? t("action.saved") : t("action.save")}
            className={saved ? "text-primary" : undefined}
          >
            {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          </Button>
        </div>
      </div>

      <p
        className={cn(
          "arabic mt-4 text-foreground",
          wide ? "text-2xl sm:text-[1.75rem]" : "text-xl sm:text-2xl",
        )}
      >
        {ayah.arabic}
      </p>

      <p className="mt-3 text-[0.8125rem] italic leading-relaxed text-muted-foreground">
        {ayah.transliterationBn}
      </p>

      <div className="mt-3 border-t border-border pt-3">
        <p className="text-[0.9375rem] leading-loose text-foreground">
          {isBn ? ayah.translationBn : ayah.translationEn}
        </p>
      </div>

      {ayah.tafsirBn ? (
        <div className="mt-3 rounded-card bg-primary-soft/60 p-3.5">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-primary">
            {t("label.tafsir")}
          </p>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-primary-soft-foreground">
            {ayah.tafsirBn}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button href={href} size="sm" variant="soft">
          {t("quran.readSurah")}
        </Button>
        <Button href="/daily" size="sm" variant="ghost">
          {t("nav.daily")}
        </Button>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

export function DailyHadithCard({
  hadithId,
  className,
}: {
  hadithId?: string;
  className?: string;
}) {
  const { t, pick, isBn } = useI18n();
  const hadith = useMemo(
    () => (hadithId ? getHadith(hadithId) : undefined) ?? HADITH_OF_THE_DAY,
    [hadithId],
  );
  const [saved, setSaved] = useState(false);
  const href = `/hadith/${hadith.collectionSlug}/hadith-${hadith.id.replace(/^hadith-/, "")}`;

  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent" size="sm" icon={ScrollText}>
            {t("label.dailyHadith")}
          </Badge>
          <GradeTag grade={hadith.grade} />
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => setSaved((v) => !v)}
          aria-label={saved ? t("action.saved") : t("action.save")}
          className={saved ? "text-primary" : undefined}
        >
          {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
        </Button>
      </div>

      <p className="arabic mt-4 text-lg leading-loose text-foreground sm:text-xl">{hadith.arabic}</p>

      <div className="mt-3 border-t border-border pt-3">
        <p className="text-[0.9375rem] leading-loose text-foreground">
          {isBn ? hadith.translationBn : hadith.translationEn}
        </p>
      </div>

      {hadith.lessonBn && isBn ? (
        <div className="mt-3 rounded-card bg-accent-soft/60 p-3.5">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-accent-soft-foreground">
            শিক্ষা
          </p>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-accent-soft-foreground">
            {hadith.lessonBn}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-[0.75rem] text-muted-foreground">
          <span className="font-medium text-foreground">{hadith.refBn}</span>
          <span className="mx-1.5 text-border-strong">·</span>
          {t("label.narrator")}: {pick(hadith.narrator)}
        </p>
        <Button href={href} size="xs" variant="ghost">
          {t("action.readMore")}
        </Button>
      </div>
    </Card>
  );
}

function GradeTag({ grade }: { grade: string }) {
  const { t } = useI18n();
  const map: Record<string, { label: string; tone: Tone }> = {
    sahih: { label: t("grade.sahih"), tone: "success" },
    hasan: { label: t("grade.hasan"), tone: "info" },
    daif: { label: t("grade.daif"), tone: "danger" },
    "muttafaqun-alaih": { label: t("grade.muttafaqunAlaih"), tone: "primary" },
  };
  const config = map[grade] ?? map.sahih;
  return (
    <Badge tone={config.tone} size="xs">
      {config.label}
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */

export function DhikrCard({ dhikr, className }: { dhikr?: DhikrItem; className?: string }) {
  const { t } = useI18n();
  const item = dhikr ?? DHIKR_ROUTINE[0];
  const target = useMemo(() => parseCountBn(item.count), [item.count]);
  const [taps, setTaps] = useState(0);

  const progress = target ? Math.min(100, (taps / target) * 100) : 0;
  const done = target !== null && taps >= target;

  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
            {t("misc.dhikrNow")}
          </p>
          <p className="mt-1 text-[0.8125rem] font-medium text-foreground">{item.count}</p>
        </div>
        <Ring value={progress} size={52} thickness={5} tone={done ? "success" : "primary"}>
          <span className="text-[0.6875rem] font-bold tabular text-foreground">
            {toBnDigits(taps)}
          </span>
        </Ring>
      </div>

      <p className="arabic mt-4 text-xl leading-loose text-foreground">{item.arabic}</p>
      <p className="mt-2 text-[0.75rem] italic text-muted-foreground">{item.transliterationBn}</p>
      <p className="mt-2 text-[0.8125rem] leading-relaxed text-foreground">{item.meaningBn}</p>

      <button
        type="button"
        onClick={() => setTaps((n) => n + 1)}
        className={cn(
          "mt-4 w-full rounded-panel border border-dashed py-4 text-center text-[0.875rem] font-semibold transition-all active:scale-[0.99]",
          done
            ? "border-success/50 bg-success-soft text-success-soft-foreground"
            : "border-border-strong bg-surface-2 text-foreground hover:border-primary/45 hover:bg-primary-soft/50",
        )}
      >
        {done ? "সম্পন্ন হয়েছে ✓" : t("misc.dhikrNow")}
      </button>

      <p className="mt-3 text-[0.6875rem] leading-relaxed text-subtle-foreground">{item.virtueBn}</p>

      <div className="mt-3 flex items-center gap-2">
        {taps > 0 ? (
          <Button size="xs" variant="ghost" onClick={() => setTaps(0)}>
            {t("action.clear")}
          </Button>
        ) : null}
        <Button href="/daily" size="xs" variant="ghost" className="ml-auto">
          {t("nav.daily")}
        </Button>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

export function LearningGoalCard({
  minutesToday = 0,
  goal = LEARNING_GOAL_MINUTES_PER_DAY,
  streakDays = USER_STREAK_DAYS,
  className,
}: {
  minutesToday?: number;
  goal?: number;
  streakDays?: number;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const progress = goal > 0 ? Math.min(100, (minutesToday / goal) * 100) : 0;
  const met = minutesToday >= goal;

  return (
    <Card className={className}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
            <Target className="size-3" aria-hidden />
            {t("label.progress")}
          </p>
          <p className="mt-1.5 font-display text-2xl font-bold leading-none tabular text-foreground">
            {formatNumber(minutesToday, locale)}
            <span className="ml-1 text-[0.8125rem] font-medium text-muted-foreground">
              / {formatNumber(goal, locale)} {t("label.minutes")}
            </span>
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
            <Flame className={cn("size-3.5", streakDays > 0 ? "text-warning" : "text-subtle-foreground")} />
            {toBnDigits(streakDays)} {t("label.days")} {t("label.streak")}
          </p>
        </div>
        <Ring value={progress} size={68} thickness={7} tone={met ? "success" : "primary"}>
          <span className="text-[0.75rem] font-bold tabular text-foreground">
            {toBnDigits(Math.round(progress))}%
          </span>
        </Ring>
      </div>

      <p className="mt-4 rounded-card bg-primary-soft/55 p-3 text-[0.8125rem] leading-relaxed text-primary-soft-foreground">
        {t("home.streakMessage", { n: toBnDigits(streakDays) })}
      </p>

      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
          {t("label.thisWeek")}
        </p>
        <WeekStrip
          values={WEEKLY_LEARNING_MINUTES}
          goal={goal}
          labels={WEEKDAY_LABELS_BN}
        />
      </div>

      <div className="mt-4">
        <Progress value={progress} size="xs" tone={met ? "success" : "primary"} />
      </div>

      {streakDays > 0 ? (
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <DayDots total={7} completed={Math.min(7, streakDays)} />
          <span className="ml-auto text-[0.6875rem] text-subtle-foreground">
            {bnOrdinal(Math.min(7, streakDays))} দিন
          </span>
        </div>
      ) : null}
    </Card>
  );
}

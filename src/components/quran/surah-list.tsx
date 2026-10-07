"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { formatNumber, toBnDigits } from "@/lib/bn";
import { getSurah } from "@/lib/data/quran";
import { useI18n } from "@/lib/i18n";
import type { QuranSurah } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";

/**
 * The surah index row.
 *
 * A mushaf index is 114 lines long, and this one has to stay usable when the
 * reader is scanning rather than reading. So the row is two tight lines — the
 * name they know it by plus the Arabic title on the first, and the facts that
 * distinguish one surah from another on the second — and nothing else. No card,
 * no description sentence, no third tier of metadata.
 *
 * The two facts that matter when picking a surah are whether its text is here
 * yet and how long it is, so the right-hand slot shows exactly one of those: a
 * row with a translation shows its ayah count, a row without says so plainly
 * instead of advertising a reading experience that does not exist.
 */
export function SurahListRow({ surah, className }: { surah: QuranSurah; className?: string }) {
  const { t, pick, locale } = useI18n();

  return (
    <Link
      href={`/quran/${surah.number}`}
      className={cn(
        "group flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-surface-2",
        className,
      )}
    >
      <span
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft font-display text-[0.875rem] font-bold leading-none text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
      >
        {toBnDigits(surah.number)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-display text-[0.9375rem] font-semibold leading-tight text-foreground">
            {pick(surah.name)}
          </span>
          <span className="arabic arabic-ui shrink-0 text-[1.0625rem] leading-none text-primary" lang="ar">
            {surah.nameArabic}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[0.6875rem] leading-tight text-subtle-foreground">
          <span className="truncate">{pick(surah.meaning)}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0">{t(`revelation.${surah.revelation}`)}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0">
            {t("label.juz")} {formatNumber(surah.juz, locale)}
          </span>
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-2">
        {surah.hasText ? (
          <span className="hidden text-[0.6875rem] tabular text-muted-foreground sm:inline">
            {formatNumber(surah.ayahCount, locale)} {t("label.ayahs")}
          </span>
        ) : (
          <Badge tone="neutral" size="xs">
            {t("state.comingSoon")}
          </Badge>
        )}
        <ChevronLeft
          className="size-4 shrink-0 text-subtle-foreground transition-colors group-hover:text-primary"
          aria-hidden
        />
      </span>
    </Link>
  );
}

/**
 * Quick-jump rail for the surahs Bangladeshi readers reach for most.
 *
 * A chip rather than a card: this is a shortcut, not content, and ten of them
 * have to fit in the height one card used to take.
 */
export function PopularSurahChips({
  numbers,
  className,
}: {
  numbers: number[];
  className?: string;
}) {
  const { pick, locale } = useI18n();
  const surahs = numbers.map((n) => getSurah(n)).filter((s): s is QuranSurah => Boolean(s));

  if (surahs.length === 0) return null;

  return (
    <div className={cn("no-scrollbar -mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-0.5", className)}>
      {surahs.map((surah) => (
        <Link
          key={surah.number}
          href={`/quran/${surah.number}`}
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 transition-colors hover:border-primary/40 hover:bg-primary-soft"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-[0.6875rem] font-bold leading-none text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {formatNumber(surah.number, locale)}
          </span>
          <span className="whitespace-nowrap text-[0.8125rem] font-medium text-foreground">
            {pick(surah.name)}
          </span>
          <span className="arabic arabic-ui whitespace-nowrap text-[0.9375rem] leading-none text-primary" lang="ar">
            {surah.nameArabic}
          </span>
        </Link>
      ))}
    </div>
  );
}

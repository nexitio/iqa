"use client";

import Link from "next/link";
import { BookOpen, ScrollText, Heart, ArrowLeft } from "lucide-react";
import { AYAH_OF_THE_DAY, getSurah } from "@/lib/data/quran";
import { HADITH_OF_THE_DAY } from "@/lib/data/hadith";
import { DUAS, getTodayIndex } from "@/lib/data/daily";
import { cn } from "@/lib/utils";

/**
 * Daily content strip.
 *
 * Three horizontally scrollable cards — Today's Ayah, Hadith, and Dua —
 * each showing actual Arabic + Bengali text so the reader can engage without
 * navigating away. Replaces the "জ্ঞানের ধারা" scholar-avatar rail in the
 * exact same card footprint.
 */
export function DailyStories({ className }: { className?: string }) {
  const ayah = AYAH_OF_THE_DAY;
  const surah = getSurah(ayah.surah);
  const hadith = HADITH_OF_THE_DAY;
  const dua = DUAS[getTodayIndex(DUAS.length)];

  const cards = [
    {
      id: "ayah",
      tag: "আজকের আয়াত",
      icon: BookOpen,
      href: `/quran/${ayah.surah}?ayah=${ayah.number}`,
      meta: surah ? `সূরা ${surah.name.bn} · ${ayah.ref}` : ayah.ref,
      arabic: ayah.arabic,
      text: ayah.translationBn,
      accent: "text-primary",
      tagBg: "bg-primary-soft text-primary-soft-foreground",
    },
    {
      id: "hadith",
      tag: "আজকের হাদীস",
      icon: ScrollText,
      href: "/daily",
      meta: hadith.refBn,
      arabic: hadith.arabic,
      text: hadith.translationBn,
      accent: "text-emerald-600 dark:text-emerald-400",
      tagBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    },
    {
      id: "dua",
      tag: "আজকের দুআ",
      icon: Heart,
      href: "/daily#dua",
      meta: dua?.situationBn ?? "",
      arabic: dua?.arabic ?? "",
      text: dua?.meaningBn ?? "",
      accent: "text-amber-600 dark:text-amber-400",
      tagBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    },
  ];

  return (
    <section
      aria-label="আজকের দৈনিক বিষয়বস্তু"
      className={cn("rounded-panel border border-border bg-surface shadow-card", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="font-display text-[0.9375rem] font-semibold text-foreground">
          আজকের জন্য
        </h2>
        <Link
          href="/daily"
          className="text-[0.75rem] font-medium text-primary transition-colors hover:text-primary-hover"
        >
          সব দেখুন
        </Link>
      </div>

      {/* Scrollable content cards — three columns, horizontally scrollable on mobile */}
      <div className="no-scrollbar flex divide-x divide-border overflow-x-auto">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              href={card.href}
              className="group flex min-w-[14rem] flex-1 flex-col gap-2.5 p-4 transition-colors hover:bg-surface-2"
            >
              {/* Tag row */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold",
                    card.tagBg,
                  )}
                >
                  <Icon className="size-3" aria-hidden />
                  {card.tag}
                </span>
                <ArrowLeft
                  className={cn(
                    "size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100",
                    card.accent,
                  )}
                  aria-hidden
                />
              </div>

              {/* Arabic snippet */}
              {card.arabic && (
                <p
                  className="arabic line-clamp-2 text-right text-[1.0625rem] leading-[1.8] text-foreground"
                  lang="ar"
                  dir="rtl"
                >
                  {card.arabic}
                </p>
              )}

              {/* Bengali translation */}
              <p className="line-clamp-2 text-[0.75rem] leading-relaxed text-muted-foreground">
                {card.text}
              </p>

              {/* Reference / meta */}
              {card.meta && (
                <p className={cn("text-[0.6875rem] font-medium", card.accent)}>{card.meta}</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

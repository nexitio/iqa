"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ScrollText, Heart, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { AYAH_OF_THE_DAY, getSurah } from "@/lib/data/quran";
import { HADITH_OF_THE_DAY } from "@/lib/data/hadith";
import { DUAS, getTodayIndex } from "@/lib/data/daily";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Daily content strip.
 *
 * Three horizontally scrollable cards — Today's Ayah, Hadith, and Dua —
 * each showing actual Arabic + Bengali text so the reader can engage without
 * navigating away. Replaces the "জ্ঞানের ধারা" scholar-avatar rail in the
 * exact same card footprint.
 *
 * The strip already scrolled sideways, but only a swipe revealed that: the
 * scrollbar is hidden by design and the third card is only half visible on a
 * phone, so a reader with no reason to swipe could believe two cards were the
 * whole section. The arrow controls make the rest findable by tap, and they
 * appear only while there is something left in that direction — which is also
 * what keeps them out of the way once all three cards fit side by side.
 */
export function DailyStories({ className }: { className?: string }) {
  const { t } = useI18n();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ back: false, forward: false });

  /** Which ends still have a card off-screen. */
  const syncArrows = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const remaining = scroller.scrollWidth - scroller.clientWidth;
    setCanScroll({
      back: scroller.scrollLeft > 4,
      forward: remaining > 4 && scroller.scrollLeft < remaining - 4,
    });
  }, []);

  /*
   * A ResizeObserver delivers the first measurement itself, so the effect never
   * calls setState synchronously on mount; observing the first card as well
   * covers the strip's content changing width (a longer translation, a narrower
   * viewport), and the scroll listener covers the reader's own swipes.
   */
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.addEventListener("scroll", syncArrows, { passive: true });
    const observer = new ResizeObserver(syncArrows);
    observer.observe(scroller);
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);
    return () => {
      scroller.removeEventListener("scroll", syncArrows);
      observer.disconnect();
    };
  }, [syncArrows]);

  /** Move by one card, landing on a snap point rather than mid-card. */
  const scrollByCard = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.firstElementChild;
    const step = card ? card.getBoundingClientRect().width : scroller.clientWidth;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollBy({ left: direction * step, behavior: smooth ? "smooth" : "auto" });
  };

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
      <div className="relative">
        {/*
         * Snapping is `proximity`, not `mandatory`: with mandatory snapping the
         * browser re-snaps a programmatic scroll past the arrow's one-card step
         * — the last card's snap offset lies beyond the scroll range, so the
         * nearest valid point becomes the very end of the strip. Proximity still
         * aligns a swipe to a card boundary, it just does not overrule a tap.
         */}
        <div
          ref={scrollerRef}
          className="no-scrollbar flex snap-x snap-proximity divide-x divide-border overflow-x-auto overscroll-x-contain"
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                href={card.href}
                className="group flex min-w-[14rem] flex-1 snap-start flex-col gap-2.5 p-4 transition-colors hover:bg-surface-2"
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

        {/* Edge fades, so a card is not cut off mid-letter at the boundary and
            the arrow reads as chrome rather than a sticker on the text. */}
        {canScroll.back ? (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-surface to-transparent"
            aria-hidden
          />
        ) : null}
        {canScroll.forward ? (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-surface to-transparent"
            aria-hidden
          />
        ) : null}

        {/* Edge controls. Only the direction that still has a card out of view is
            rendered, so the strip never shows a dead arrow — and a desktop
            layout, where all three cards fit side by side, shows none at all. */}
        {canScroll.back ? (
          <ScrollArrow
            direction="back"
            label={t("action.previous")}
            onClick={() => scrollByCard(-1)}
          />
        ) : null}
        {canScroll.forward ? (
          <ScrollArrow
            direction="forward"
            label={t("action.next")}
            onClick={() => scrollByCard(1)}
          />
        ) : null}
      </div>
    </section>
  );
}

/** One edge control, sitting centred over the strip's left or right edge. */
function ScrollArrow({
  direction,
  label,
  onClick,
}: {
  direction: "back" | "forward";
  label: string;
  onClick: () => void;
}) {
  const Icon = direction === "back" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "absolute top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/95 text-foreground shadow-raised backdrop-blur transition-colors hover:border-primary/45 hover:text-primary active:scale-95",
        direction === "back" ? "left-1.5" : "right-1.5",
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

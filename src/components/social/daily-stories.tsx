"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ScrollText, Heart, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { AYAH_OF_THE_DAY, getSurah } from "@/lib/data/quran";
import { HADITH_OF_THE_DAY } from "@/lib/data/hadith";
import { duaOfToday } from "@/lib/data/duas";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Daily content strip.
 *
 * Three cards — Today's Ayah, Hadith, and Dua — each showing actual Arabic +
 * Bengali text so the reader can engage without navigating away.
 *
 * One line of whole cards. The strip is a horizontal grid whose columns are an
 * exact fraction of the visible width — half on a phone, a third from `sm` up —
 * so a reader always sees two cards, or three, and never two and a half. A
 * `flex-1 min-w-*` row is what produced the fragment: it sized cards from their
 * content minimum, which is neither half nor a third of anything, leaving the
 * third card cut off at the boundary. Whole columns need no explaining, and the
 * strip only scrolls at all below `sm`, where two cards cannot share one line
 * with the third.
 *
 * The arrow controls come back with it: they are the only way a phone reader
 * learns the third card exists, and they appear only while there is something
 * left in that direction — which is why a desktop, where all three cards fit,
 * shows none at all.
 */
export function DailyStories({ className }: { className?: string }) {
  const { t, pick, isBn } = useI18n();
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
  const dua = duaOfToday();

  const cards = [
    {
      id: "ayah",
      tag: "আজকের আয়াত",
      icon: BookOpen,
      href: `/quran/${ayah.surah}?ayah=${ayah.number}`,
      meta: surah
        ? `${t("label.surah")} ${pick(surah.name)} · ${isBn ? toBnDigits(ayah.ref) : ayah.ref}`
        : isBn
          ? toBnDigits(ayah.ref)
          : ayah.ref,
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
      meta: isBn ? hadith.refBn : hadith.refEn,
      arabic: hadith.arabic,
      text: hadith.translationBn,
      accent: "text-emerald-600 dark:text-emerald-400",
      tagBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    },
    {
      id: "dua",
      tag: "আজকের দুআ",
      icon: Heart,
      // Straight to the dua itself, not to the daily page's section of them.
      href: `/duas#${dua.slug}`,
      meta: pick(dua.occasion),
      arabic: dua.arabic,
      text: pick(dua.meaning),
      accent: "text-amber-600 dark:text-amber-400",
      tagBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    },
  ];

  return (
    <section
      aria-label="আজকের দৈনিক বিষয়বস্তু"
      className={cn(
        // `overflow-hidden` is what keeps the cards' hover fill inside the panel's
        // rounded corners: the row reaches the panel's edge, so without it the
        // leftmost and rightmost cards paint a square corner over the curve.
        "overflow-hidden rounded-panel border border-border bg-surface shadow-card",
        className,
      )}
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

      <div className="relative">
        {/* One row, columns at a whole fraction of the visible width. From `sm`
            up three thirds fill the strip exactly, so there is nothing to
            scroll and the arrows below stay hidden; `lg` is where the page's
            column has the room for it. */}
        <div
          ref={scrollerRef}
          className="no-scrollbar grid snap-x snap-proximity grid-flow-col auto-cols-[50%] divide-x divide-border overflow-x-auto overscroll-x-contain sm:auto-cols-[33.3333%] lg:grid-flow-row lg:grid-cols-3"
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                href={card.href}
                className="group flex snap-start flex-col gap-2.5 p-4 transition-colors hover:bg-surface-2"
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
            rendered, so the strip never shows a dead arrow — and a layout where
            all three cards fit side by side shows none at all. */}
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

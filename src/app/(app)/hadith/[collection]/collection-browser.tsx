"use client";

import { useMemo, useState } from "react";
import { Filter, Layers, ScrollText } from "lucide-react";
import { HadithCard } from "@/components/hadith";
import { Button, EmptyState, softTone } from "@/components/ui";
import { formatNumber } from "@/lib/bn";
import { getBooksForCollection, getHadithsForCollection } from "@/lib/data/hadith";
import { useI18n } from "@/lib/i18n";
import type { Hadith, HadithGrade } from "@/lib/types";
import { cn } from "@/lib/utils";

const GRADES: HadithGrade[] = ["muttafaqun-alaih", "sahih", "hasan", "daif"];

const GRADE_LABEL_KEY: Record<HadithGrade, string> = {
  sahih: "grade.sahih",
  hasan: "grade.hasan",
  daif: "grade.daif",
  "muttafaqun-alaih": "grade.muttafaqunAlaih",
};

/**
 * Filter pill. `Chip` is presentational and cannot take a click handler, so the
 * interactive filter uses a real button that borrows the same visual language.
 */
function FilterButton({
  active,
  children,
  count,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  count?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-[0.75rem] font-medium transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-card"
          : cn(softTone.neutral, "border-transparent hover:border-primary/35 hover:text-foreground"),
      )}
    >
      {children}
      {count !== undefined ? <span className="tabular opacity-70">{count}</span> : null}
    </button>
  );
}

/**
 * Chapter + authenticity filtering for one collection.
 *
 * Only the hadith actually present in this build are listed, and the caller
 * states the shortfall explicitly rather than implying the collection is whole.
 */
export function CollectionBrowser({ collectionSlug }: { collectionSlug: string }) {
  const { t, locale } = useI18n();
  const [book, setBook] = useState<number | "all">("all");
  const [grade, setGrade] = useState<HadithGrade | "all">("all");

  const books = useMemo(() => getBooksForCollection(collectionSlug), [collectionSlug]);
  const all = useMemo(() => getHadithsForCollection(collectionSlug), [collectionSlug]);

  // Only offer chapters that actually contain a loaded hadith, so a filter can
  // never lead to an empty screen.
  const presentBooks = useMemo(
    () => books.filter((b) => all.some((h) => h.bookNumber === b.number)),
    [books, all],
  );

  const results = useMemo(
    () =>
      all.filter((hadith) => {
        if (book !== "all" && hadith.bookNumber !== book) return false;
        if (grade !== "all" && hadith.grade !== grade) return false;
        return true;
      }),
    [all, book, grade],
  );

  const gradeCounts = useMemo(
    () =>
      GRADES.reduce<Record<string, number>>((acc, g) => {
        acc[g] = all.filter((h) => h.grade === g).length;
        return acc;
      }, {}),
    [all],
  );

  // Group by chapter so each section can carry the `#book-N` anchor that the
  // chapter list links to — and so no id is ever rendered twice.
  const grouped = useMemo(() => {
    const map = new Map<number, Hadith[]>();
    for (const hadith of results) {
      const list = map.get(hadith.bookNumber) ?? [];
      list.push(hadith);
      map.set(hadith.bookNumber, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [results]);

  if (all.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title={locale === "bn" ? "এই সংকলনে এখনো হাদীস যুক্ত হয়নি" : "No hadith added yet"}
        description={
          locale === "bn"
            ? "এই সংকলনের হাদীস ধাপে ধাপে যুক্ত করা হচ্ছে — ইনশাআল্লাহ শীঘ্রই।"
            : "Hadith from this collection are being added gradually."
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-panel border border-border bg-surface-2 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
              <Layers className="size-3.5" aria-hidden />
              {t("label.book")}
            </p>
            <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1">
              <FilterButton active={book === "all"} count={formatNumber(all.length, locale)} onClick={() => setBook("all")}>
                সব অধ্যায়
              </FilterButton>
              {presentBooks.map((b) => (
                <FilterButton
                  key={b.id}
                  active={book === b.number}
                  count={formatNumber(all.filter((h) => h.bookNumber === b.number).length, locale)}
                  onClick={() => setBook(b.number)}
                >
                  {b.name.bn}
                </FilterButton>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 border-t border-border pt-3">
          <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
            <Filter className="size-3.5" aria-hidden />
            {t("label.grade")}
          </p>
          <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1">
            <FilterButton active={grade === "all"} onClick={() => setGrade("all")}>
              {locale === "bn" ? "সব মান" : "All grades"}
            </FilterButton>
            {GRADES.map((g) => (
              <FilterButton
                key={g}
                active={grade === g}
                count={formatNumber(gradeCounts[g] ?? 0, locale)}
                onClick={() => setGrade(g)}
              >
                {t(GRADE_LABEL_KEY[g])}
              </FilterButton>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-[0.75rem] text-subtle-foreground">
            {locale === "bn"
              ? `${formatNumber(results.length, locale)} টি হাদীস দেখানো হচ্ছে`
              : `Showing ${results.length} hadith`}
          </p>
          {(book !== "all" || grade !== "all") && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setBook("all");
                setGrade("all");
              }}
            >
              {t("action.clear")}
            </Button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={t("state.noResults")}
          description={
            locale === "bn"
              ? "এই অধ্যায় ও মানের সমন্বয়ে কোনো হাদীস পাওয়া যায়নি। ফিল্টার পরিবর্তন করে দেখুন।"
              : "No hadith match this chapter and grade combination."
          }
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBook("all");
                setGrade("all");
              }}
            >
              {t("action.clear")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {grouped.map(([bookNumber, items]) => (
            <section key={bookNumber} id={`book-${bookNumber}`} className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-3 text-[0.6875rem] font-semibold tabular text-muted-foreground"
                  aria-hidden
                >
                  {formatNumber(bookNumber, locale)}
                </span>
                <h3 className="min-w-0 truncate font-display text-[0.9375rem] font-semibold text-foreground">
                  {books.find((b) => b.number === bookNumber)?.name.bn ?? t("label.book")}
                </h3>
                <span className="ml-auto shrink-0 text-[0.6875rem] text-subtle-foreground">
                  {formatNumber(items.length, locale)} {t("label.hadith")}
                </span>
              </div>
              <div className="space-y-4">
                {items.map((hadith) => (
                  <HadithCard key={hadith.id} hadith={hadith} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

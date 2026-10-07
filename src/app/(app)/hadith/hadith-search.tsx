"use client";

import { useMemo, useState } from "react";
import { Search, ScrollText } from "lucide-react";
import { HadithCard } from "@/components/hadith";
import { ButtonGroup, EmptyState, SearchInput, SegmentButton } from "@/components/ui";
import { formatNumber } from "@/lib/bn";
import { HADITHS } from "@/lib/data/hadith";
import { useI18n } from "@/lib/i18n";
import type { HadithGrade } from "@/lib/types";

const GRADES: HadithGrade[] = ["muttafaqun-alaih", "sahih", "hasan", "daif"];

const GRADE_LABEL_KEY: Record<HadithGrade, string> = {
  sahih: "grade.sahih",
  hasan: "grade.hasan",
  daif: "grade.daif",
  "muttafaqun-alaih": "grade.muttafaqunAlaih",
};

/**
 * Live hadith search.
 *
 * Bangladeshi readers very often remember a hadith by its Bangla wording or by
 * the Companion who narrated it, so both are searched, along with the Arabic
 * text and the collection reference.
 */
export function HadithSearch() {
  const { t, pick, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState<HadithGrade | "all">("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HADITHS.filter((hadith) => {
      if (grade !== "all" && hadith.grade !== grade) return false;
      if (!q) return true;
      const haystack = [
        hadith.translationBn,
        hadith.translationEn,
        hadith.narrator.bn,
        hadith.narrator.en,
        hadith.refBn,
        hadith.refEn,
        hadith.arabic,
        hadith.lessonBn ?? "",
        pick(hadith.collectionName),
      ]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((term) => haystack.includes(term));
    });
  }, [query, grade, pick]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          icon={Search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("hadith.searchPlaceholder")}
          aria-label={t("hadith.searchPlaceholder")}
          wrapperClassName="flex-1"
        />
        <ButtonGroup className="no-scrollbar max-w-full shrink-0 overflow-x-auto">
          <SegmentButton active={grade === "all"} onClick={() => setGrade("all")}>
            {t("label.grade")}
          </SegmentButton>
          {GRADES.map((g) => (
            <SegmentButton key={g} active={grade === g} onClick={() => setGrade(g)}>
              {t(GRADE_LABEL_KEY[g])}
            </SegmentButton>
          ))}
        </ButtonGroup>
      </div>

      <p className="flex items-center gap-2 text-[0.75rem] text-subtle-foreground">
        <ScrollText className="size-3.5" aria-hidden />
        {locale === "bn"
          ? `${formatNumber(results.length, locale)} টি হাদীস পাওয়া গেছে`
          : `${results.length} hadith found`}
      </p>

      {results.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t("state.noResults")}
          description={
            locale === "bn"
              ? "অন্য শব্দ দিয়ে খুঁজুন — যেমন বর্ণনাকারীর নাম বা সংকলনের নাম।"
              : "Try another word, such as a narrator or collection name."
          }
        />
      ) : (
        <div className="space-y-4">
          {results.map((hadith) => (
            <HadithCard key={hadith.id} hadith={hadith} />
          ))}
        </div>
      )}
    </div>
  );
}

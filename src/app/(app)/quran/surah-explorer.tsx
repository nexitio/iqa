"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search, SearchX } from "lucide-react";
import { formatNumber, toBnDigits } from "@/lib/bn";
import { QURAN_SURAHS } from "@/lib/data/quran";
import { useI18n } from "@/lib/i18n";
import type { QuranSurah, RevelationPlace } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SurahListRow } from "@/components/quran";
import {
  ButtonGroup,
  Card,
  EmptyState,
  SearchInput,
  SegmentButton,
  Select,
} from "@/components/ui";

type RevelationFilter = "all" | RevelationPlace;

/**
 * Searchable, filterable surah index.
 *
 * Bangladeshi readers look for a surah by the name they know it by (Bangla), by
 * its transliterated name (as it appears in an app list) or by number, so all
 * three are matched, along with the Arabic title.
 *
 * Three deliberate choices keep this usable at forty rows:
 *
 * - It is a *list*, not a grid of cards. An index is read down a column, and
 *   cards turn forty short entries into screens of scrolling.
 * - There is no para grouping. The surahs here are spread across thirty paras
 *   with one or two in most of them, so grouping produced a heading for every
 *   pair of rows — more chrome than content. Para is a per-row fact and a
 *   filter instead, which answers "what is in para 5" better than scrolling to
 *   a heading does.
 * - The controls stick. Once the list is longer than the viewport, filtering it
 *   should not require scrolling back to the top first.
 */
export function SurahExplorer({ surahs = QURAN_SURAHS }: { surahs?: QuranSurah[] }) {
  const { t, isBn } = useI18n();
  const [query, setQuery] = useState("");
  const [revelation, setRevelation] = useState<RevelationFilter>("all");
  const [juz, setJuz] = useState<number | "all">("all");

  const juzNumbers = useMemo(
    () => [...new Set(surahs.map((s) => s.juz))].sort((a, b) => a - b),
    [surahs],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return surahs.filter((surah) => {
      if (revelation !== "all" && surah.revelation !== revelation) return false;
      if (juz !== "all" && surah.juz !== juz) return false;
      if (!q) return true;
      return (
        surah.name.bn.toLowerCase().includes(q) ||
        surah.name.en.toLowerCase().includes(q) ||
        surah.meaning.bn.toLowerCase().includes(q) ||
        surah.meaning.en.toLowerCase().includes(q) ||
        surah.slug.replace(/-/g, " ").includes(q) ||
        surah.nameArabic.includes(q) ||
        String(surah.number) === q ||
        toBnDigits(surah.number) === q
      );
    });
  }, [surahs, query, revelation, juz]);

  const withTextCount = filtered.filter((s) => s.hasText).length;
  const filteredBySomething = query.trim() !== "" || revelation !== "all" || juz !== "all";

  return (
    <div className="space-y-3">
      {/* Sticky so the list can be re-filtered without scrolling back up, and
          docked flush under the header so no strip of the list shows between
          the two. The surface is translucent because rows pass underneath it. */}
      <div className="sticky top-[var(--header-h)] z-20 rounded-panel border border-border bg-surface/92 p-2.5 shadow-card backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("quran.searchPlaceholder")}
            aria-label={t("quran.searchPlaceholder")}
            icon={Search}
            wrapperClassName="min-w-[11rem] flex-1"
            className="h-9 text-[0.8125rem]"
          />

          <ButtonGroup>
            <SegmentButton active={revelation === "all"} onClick={() => setRevelation("all")}>
              {isBn ? "সব" : "All"}
            </SegmentButton>
            <SegmentButton
              active={revelation === "meccan"}
              onClick={() => setRevelation("meccan")}
            >
              {t("revelation.meccan")}
            </SegmentButton>
            <SegmentButton
              active={revelation === "medinan"}
              onClick={() => setRevelation("medinan")}
            >
              {t("revelation.medinan")}
            </SegmentButton>
          </ButtonGroup>

          <Select
            aria-label={t("label.juz")}
            value={juz === "all" ? "all" : String(juz)}
            onChange={(value) => setJuz(value === "all" ? "all" : Number(value))}
            className="h-9 w-auto min-w-[8.5rem] text-[0.8125rem]"
            options={[
              { value: "all", label: isBn ? `সব ${t("label.juz")}` : `All ${t("label.juz")}` },
              ...juzNumbers.map((n) => ({
                value: String(n),
                label: `${t("label.juz")} ${formatNumber(n, "bn")}`,
                // The label carries Bengali numerals, so searching "15" needs the
                // Latin number as a keyword.
                keywords: `${t("label.juz")} ${n}`,
              })),
            ]}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-0.5 text-[0.75rem] text-subtle-foreground">
        <span className="font-medium text-muted-foreground">
          {formatNumber(filtered.length, "bn")} {isBn ? "টি সূরা" : "surahs"}
        </span>
        <span aria-hidden>·</span>
        <span>
          {formatNumber(withTextCount, "bn")}{" "}
          {isBn ? "টির অনুবাদ প্রস্তুত" : "with a translation ready"}
        </span>
        {filteredBySomething ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setRevelation("all");
              setJuz("all");
            }}
            className="ml-auto font-medium text-primary hover:underline"
          >
            {t("action.clear")}
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          tone="neutral"
          title={t("state.noResults")}
          description={
            isBn
              ? "অন্য নাম বা নম্বর দিয়ে খুঁজে দেখুন, অথবা ফিল্টার বদলান।"
              : "Try another name or number, or change the filter."
          }
          action={
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setRevelation("all");
                setJuz("all");
              }}
              className="text-[0.8125rem] font-medium text-primary hover:underline"
            >
              {t("action.clear")}
            </button>
          }
        />
      ) : (
        <Card flush className={cn("overflow-hidden")}>
          <div className="divide-y divide-border">
            {filtered.map((surah) => (
              <SurahListRow key={surah.number} surah={surah} />
            ))}
          </div>
        </Card>
      )}

      {/* One honest line about coverage, at the end where a reader who has
          scrolled the whole index will actually meet it. */}
      <p className="flex items-start gap-2 px-0.5 text-[0.6875rem] leading-relaxed text-subtle-foreground">
        <BookOpen className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {isBn
          ? "কুরআনের পাঠ যাচাই করে ধাপে ধাপে যুক্ত করা হচ্ছে ইনশাআল্লাহ — যে সূরাগুলোতে অনুবাদ প্রস্তুত নয়, সেখানে স্পষ্টভাবে লেখা আছে।"
          : "Surah text is being added and checked in stages — a surah without a translation says so on its row."}
      </p>
    </div>
  );
}

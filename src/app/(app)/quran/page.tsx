import type { Metadata } from "next";
import { BookOpen, Compass, Sparkles } from "@/components/icons";
import { T } from "@/components/i18n-text";
import { ContinueLearningRail } from "@/components/personal";
import { PopularSurahChips } from "@/components/quran";
import { POPULAR_SURAHS, QURAN_SURAHS } from "@/lib/data/quran";
import { READING_PROGRESS } from "@/lib/data/personal";
import { formatNumber } from "@/lib/bn";
import { SurahExplorer } from "./surah-explorer";

export const metadata: Metadata = {
  title: "আল-কুরআনুল কারীম",
  description:
    "সম্পূর্ণ কুরআন — আরবি, বাংলা উচ্চারণ ও শব্দে-শব্দে বাংলা অনুবাদ সহ। সূরা অনুযায়ী বা পারা অনুযায়ী পড়ুন, সংরক্ষণ করুন এবং যেখানে থেমেছিলেন সেখান থেকে চালিয়ে যান।",
};

/** Small section label used above each block on the index. */
function BlockLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-1.5 font-display text-[0.875rem] font-semibold text-foreground">
      <Icon className="size-3.5 text-primary" aria-hidden />
      {children}
    </h2>
  );
}

/**
 * Qur'an index.
 *
 * An index, not a landing page. The earlier version opened with a tall patterned
 * header carrying a three-column stat block and a description paragraph, then
 * forty large cards — so the thing a reader came for (the list) started below
 * the fold and took screens to cross. Here the header is a slim strip whose only
 * job is to say what the section is and how much of it is ready, everything else
 * is either a shortcut or the list, and the list itself is rows.
 *
 * Order is by intent: resume what you were reading, jump to something you
 * already know, or find something you don't.
 */
export default function QuranIndexPage() {
  const quranProgress = READING_PROGRESS.filter((item) => item.kind === "quran");
  const surahsWithText = QURAN_SURAHS.filter((s) => s.hasText).length;
  const totalAyahs = QURAN_SURAHS.reduce((sum, s) => sum + s.ayahCount, 0);

  const stats = [
    { value: formatNumber(QURAN_SURAHS.length, "bn"), label: "সূরা" },
    { value: formatNumber(totalAyahs, "bn"), label: "আয়াত" },
    { value: formatNumber(surahsWithText, "bn"), label: "টির অনুবাদ প্রস্তুত" },
  ];

  return (
    <div className="space-y-5">
      <header className="relative overflow-hidden rounded-panel border border-border bg-surface p-4 shadow-card pattern-girih sm:p-5">
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-surface/85 via-surface/95 to-surface"
          aria-hidden
        />
        <div className="relative flex items-start gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <BookOpen className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-primary">আল-কুরআন</p>
            <h1 className="font-display text-lg font-bold leading-snug text-foreground sm:text-xl">
              <T k="quran.title" />
            </h1>
            <p className="mt-1 max-w-2xl text-[0.8125rem] leading-relaxed text-muted-foreground">
              <T k="quran.subtitle" />
            </p>
          </div>
        </div>

        <ul className="relative mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border pt-3">
          {stats.map((stat) => (
            <li key={stat.label} className="flex items-baseline gap-1.5">
              <span className="font-display text-[0.9375rem] font-bold tabular leading-none text-foreground">
                {stat.value}
              </span>
              <span className="text-[0.75rem] text-subtle-foreground">{stat.label}</span>
            </li>
          ))}
        </ul>
      </header>

      {quranProgress.length > 0 ? (
        <section className="space-y-2.5">
          <BlockLabel icon={BookOpen}>
            <T k="label.continueLearning" />
          </BlockLabel>
          <ContinueLearningRail items={quranProgress} />
        </section>
      ) : null}

      <section className="space-y-2.5">
        <BlockLabel icon={Sparkles}>বহুল পঠিত সূরা</BlockLabel>
        <PopularSurahChips numbers={POPULAR_SURAHS} />
      </section>

      <section className="space-y-3">
        <BlockLabel icon={Compass}>
          <T k="quran.allSurahs" />
        </BlockLabel>
        <SurahExplorer />
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Compass, Info, Sparkles } from "@/components/icons";
import { Pick, T } from "@/components/i18n-text";
import { ContinueLearningCard } from "@/components/personal";
import { SurahListRow } from "@/components/quran";
import {
  Breadcrumbs,
  Button,
  Card,
  CardHeader,
  ContentPending,
  EmptyState,
  SectionHeader,
} from "@/components/ui";
import { formatNumber, toBnDigits } from "@/lib/bn";
import { POPULAR_SURAHS, QURAN_SURAHS, getAyahsForSurah, getSurah } from "@/lib/data/quran";
import { READING_PROGRESS } from "@/lib/data/personal";
import { AyahReader } from "./ayah-reader";

interface RouteParams {
  params: Promise<{ surah: string }>;
  searchParams: Promise<{ ayah?: string }>;
}

export function generateStaticParams() {
  return QURAN_SURAHS.map((surah) => ({ surah: String(surah.number) }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { surah: raw } = await params;
  const surah = getSurah(Number(raw));
  if (!surah) return { title: "সূরা" };

  return {
    title: `সূরা ${surah.name.bn} — ${surah.meaning.bn}`,
    description: `${surah.name.bn} (${surah.name.en}) — ${surah.ayahCount} আয়াত, ${
      surah.revelation === "meccan" ? "মাক্কী" : "মাদানী"
    } সূরা। আরবি, বাংলা উচ্চারণ ও অনুবাদসহ পড়ুন।`,
  };
}

/**
 * The Qur'an reader.
 *
 * The page exists to deliver text, so the masthead is deliberately the shortest
 * thing that can still orient a reader who landed here from search: what surah
 * this is, what it means, and the three facts that tell them whether they are in
 * the right place. Everything that used to surround it — a patterned hero, a
 * three-badge row, a separate callout for "about this surah", breadcrumbs on
 * their own line — has been folded into it or moved into the rail, which buys
 * the reader roughly a screen of text before the first scroll.
 *
 * Three states matter and each is handled honestly: a surah with no text yet, a
 * surah with only part of its text available, and a complete surah. The reader
 * never implies completeness it does not have.
 */
export default async function SurahPage({ params, searchParams }: RouteParams) {
  const { surah: raw } = await params;
  const { ayah: ayahParam } = await searchParams;

  const surahNumber = Number(raw);
  const surah = Number.isFinite(surahNumber) ? getSurah(surahNumber) : undefined;
  if (!surah) notFound();

  const ayahs = getAyahsForSurah(surah.number);
  const loaded = ayahs.length;
  const isPartial = loaded > 0 && loaded < surah.ayahCount;
  const isEmpty = loaded === 0;

  const deepLinkAyah = ayahParam ? Number(ayahParam) : undefined;
  const initialAyah =
    deepLinkAyah && ayahs.some((a) => a.number === deepLinkAyah) ? deepLinkAyah : undefined;

  const previous = getSurah(surah.number - 1);
  const next = getSurah(surah.number + 1);

  const popular = POPULAR_SURAHS.filter((n) => n !== surah.number)
    .map((n) => getSurah(n))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .slice(0, 6);

  const progress = READING_PROGRESS.find(
    (item) => item.kind === "quran" && item.href.startsWith(`/quran/${surah.number}`),
  );

  return (
    <div className="space-y-5">
      <header className="relative overflow-hidden rounded-panel border border-border bg-surface p-4 shadow-card pattern-girih sm:p-5">
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-surface/85 via-surface/95 to-surface"
          aria-hidden
        />
        <Breadcrumbs
          className="relative mb-2.5"
          items={[
            { label: "হোম", href: "/" },
            { label: "কুরআন", href: "/quran" },
            { label: surah.name.bn },
          ]}
        />

        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft font-display text-[1.0625rem] font-bold leading-none text-primary">
              {toBnDigits(surah.number)}
            </span>
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 font-display text-lg font-bold leading-snug text-foreground">
                সূরা {surah.name.bn}
                <span className="arabic arabic-ui text-xl font-semibold text-primary" lang="ar">
                  {surah.nameArabic}
                </span>
              </h1>
              <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">{surah.meaning.bn}</p>

              <ul className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[0.6875rem] text-subtle-foreground">
                <li>{surah.revelation === "meccan" ? "মাক্কী" : "মাদানী"}</li>
                <li>
                  {formatNumber(surah.ayahCount, "bn")} <T k="label.ayahs" />
                </li>
                <li>
                  <T k="label.juz" /> {toBnDigits(surah.juz)}
                </li>
                {isPartial ? (
                  <li className="font-medium text-warning-soft-foreground">
                    {toBnDigits(loaded)} টি আয়াতের অনুবাদ প্রস্তুত
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          <Button href="/quran" variant="outline" size="sm" icon={Compass}>
            <T k="quran.allSurahs" />
          </Button>
        </div>

        {surah.about ? (
          <p className="relative mt-3.5 border-t border-border pt-3 text-[0.75rem] leading-relaxed text-muted-foreground">
            <Pick value={surah.about} />
          </p>
        ) : null}
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-4">
          {isEmpty ? (
            <EmptyState
              icon={BookOpen}
              title={`সূরা ${surah.name.bn}`}
              description="এই সূরার আরবি ও বাংলা অনুবাদ এখনো যুক্ত করা হয়নি। কুরআনের পাঠ সংশোধনসহ ধাপে ধাপে যুক্ত করা হচ্ছে ইনশাআল্লাহ — ততদিন নিচের প্রস্তুত সূরাগুলো পড়তে পারেন।"
              action={
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button href="/quran" icon={Compass}>
                    <T k="quran.allSurahs" />
                  </Button>
                  <Button href="/quran/1" variant="outline" icon={BookOpen}>
                    সূরা আল-ফাতিহা
                  </Button>
                </div>
              }
            />
          ) : (
            <>
              {isPartial ? (
                <ContentPending
                  message={`এই সূরার ${toBnDigits(surah.ayahCount)} টি আয়াতের মধ্যে ${toBnDigits(
                    loaded,
                  )} টির অনুবাদ এখন যুক্ত হয়েছে। বাকি আয়াতগুলো পাঠ যাচাই করে ধাপে ধাপে যুক্ত করা হচ্ছে ইনশাআল্লাহ।`}
                />
              ) : null}

              <AyahReader
                ayahs={ayahs}
                surahName={`সূরা ${surah.name.bn}`}
                surahNumber={surah.number}
                initialAyah={initialAyah}
              />
            </>
          )}

          <nav className="flex items-stretch justify-between gap-3 border-t border-border pt-4">
            {previous ? (
              <Link
                href={`/quran/${previous.number}`}
                className="group flex min-w-0 flex-1 items-center gap-3 rounded-panel border border-border bg-surface p-3 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-raised"
              >
                <ArrowRight
                  className="size-4 shrink-0 text-subtle-foreground transition-colors group-hover:text-primary"
                  aria-hidden
                />
                <span className="min-w-0 text-left">
                  <span className="block text-[0.6875rem] text-subtle-foreground">
                    <T k="action.previous" />
                  </span>
                  <span className="block truncate text-[0.8125rem] font-medium text-foreground">
                    {previous.name.bn}
                  </span>
                </span>
              </Link>
            ) : (
              <span className="flex-1" />
            )}

            {next ? (
              <Link
                href={`/quran/${next.number}`}
                className="group flex min-w-0 flex-1 items-center gap-3 rounded-panel border border-border bg-surface p-3 text-right transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-raised"
              >
                <span className="min-w-0 flex-1 text-right">
                  <span className="block text-[0.6875rem] text-subtle-foreground">
                    <T k="action.next" />
                  </span>
                  <span className="block truncate text-[0.8125rem] font-medium text-foreground">
                    {next.name.bn}
                  </span>
                </span>
                <ArrowLeft
                  className="size-4 shrink-0 text-subtle-foreground transition-colors group-hover:text-primary"
                  aria-hidden
                />
              </Link>
            ) : (
              <span className="flex-1" />
            )}
          </nav>
        </div>

        <aside className="space-y-5">
          {progress ? (
            <section>
              <SectionHeader size="sm" title={<T k="label.continueLearning" />} />
              <ContinueLearningCard item={progress} />
            </section>
          ) : null}

          <Card>
            <CardHeader icon={Sparkles} title="বহুল পঠিত সূরা" subtitle="দ্রুত পড়া শুরু করুন" />
            <div className="mt-3 -mx-1.5">
              {popular.map((item) => (
                <SurahListRow key={item.number} surah={item} className="rounded-lg" />
              ))}
            </div>
            <div className="mt-3 border-t border-border pt-3.5">
              <Link
                href="/quran"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-primary hover:underline"
              >
                <T k="quran.allSurahs" />
                <ArrowLeft className="size-3.5" aria-hidden />
              </Link>
            </div>
          </Card>

          <Card variant="flat" padding="sm">
            <p className="flex items-start gap-2 text-[0.6875rem] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0 text-subtle-foreground" aria-hidden />
              অনুবাদ ইসলামিক ফাউন্ডেশন বাংলাদেশের অনুবাদ ধারা অনুসরণ করে করা হয়েছে, সাথে বাংলা
              উচ্চারণ দেওয়া হয়েছে যাতে আরবি না জানা পাঠকও সহজে অনুসরণ করতে পারেন।
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

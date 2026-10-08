import type { Metadata } from "next";
import {
  Compass,
  HandHeart,
  Heart,
  ScrollText,
  Sparkles,
  Sun,
  Target,
} from "@/components/icons";
import { Num, T } from "@/components/i18n-text";
import {
  Button,
  Callout,
  Card,
  CardHeader,
  Chip,
  PageHeader,
  Progress,
  SectionHeader,
} from "@/components/ui";
import {
  DailyAyahCard,
  DailyHadithCard,
  DhikrCard,
  NextPrayerBanner,
  QiblaCompass,
} from "@/components/personal";
import { DuaCard } from "@/components/knowledge";
import { DHIKR_ROUTINE, FOCUS_THEMES, getTodayIndex } from "@/lib/data/daily";
import { DUAS, getDuaCategory } from "@/lib/data/duas";
import { getDepartment } from "@/lib/data/departments";

/**
 * The daily selection is computed from the day of the year, so a fully static
 * build would freeze today's ayah/hadith/theme forever. Regenerating hourly
 * keeps the page fast while still turning over with the date.
 */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "দৈনিক আয়াত ও হাদীস",
  description:
    "প্রতিদিনের আয়াত, হাদীস, জিকিরের রুটিন, প্রয়োজনীয় দুআ, কিবলা দিক ও সাপ্তাহিক ফোকাস থিম — একটি রুটিনে সবকিছু।",
};

const TODAY_DHIKR_INDEX = getTodayIndex(DHIKR_ROUTINE.length);

/**
 * The day's three duas, taken in rotation from the collection.
 *
 * Three rather than all of them: this page is a routine, and the collection has
 * its own home now — the section's job is to put a few in front of the reader and
 * hand them the rest on request, not to be a second, staler copy of /duas.
 */
const DAILY_DUA_COUNT = 3;
const TODAY_DUA_INDEX = getTodayIndex(DUAS.length);
const TODAY_DUAS = Array.from(
  { length: DAILY_DUA_COUNT },
  (_, offset) => DUAS[(TODAY_DUA_INDEX + offset) % DUAS.length],
);

const FOCUS_MINUTES_TOTAL = FOCUS_THEMES.reduce((sum, theme) => sum + theme.targetMinutes, 0);

export default function DailyPage() {
  // The first theme rotates weekly so the page feels seasonal rather than static.
  const featuredTheme = FOCUS_THEMES[getTodayIndex(FOCUS_THEMES.length)];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="nav.daily" />}
        title={<T k="label.dailyAyah" />}
        description="প্রতিদিন একটু ইলম — আজকের আয়াত, হাদীস, জিকির ও দুআ একসাথে। রুটিনটি প্রতিদিন স্বয়ংক্রিয়ভাবে বদলায়।"
        icon={Sparkles}
        patterned
        actions={
          <>
            <Button href="/quran" variant="outline" size="sm">
              <T k="nav.quran" />
            </Button>
            <Button href="/hadith" variant="ghost" size="sm">
              <T k="nav.hadith" />
            </Button>
          </>
        }
      />

      <NextPrayerBanner />

      <div className="grid gap-4 lg:grid-cols-2">
        <DailyAyahCard layout="wide" />
        <DailyHadithCard />
      </div>

      {/* ------------------------------------------------------------------ */}
      <section>
        <SectionHeader
          title="আজকের জিকির"
          description="দিনে অল্প কিছু সময়—তবু নিয়মিত। নিচের বাটনে চাপ দিয়ে গুনতে পারেন।"
          icon={Heart}
          href="/daily"
          actionLabel="পূর্ণ রুটিন"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {DHIKR_ROUTINE.map((dhikr, index) => (
            <DhikrCard
              key={dhikr.id}
              dhikr={dhikr}
              className={index === TODAY_DHIKR_INDEX ? "ring-1 ring-primary/35" : undefined}
            />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0">
          <SectionHeader
            title="প্রয়োজনের দুআ"
            description="আজকের জন্য বেছে নেওয়া তিনটি দুআ — সূত্র, উচ্চারণ ও অর্থসহ।"
            icon={HandHeart}
            href="/duas"
            actionLabel="সব দুআ"
          />
          <div className="space-y-3">
            {TODAY_DUAS.map((dua, index) => (
              // The first one is the anchor other pages link to ("#dua").
              <div key={dua.slug} id={index === 0 ? "dua" : undefined} className="scroll-mt-24">
                <DuaCard
                  dua={dua}
                  category={getDuaCategory(dua.categorySlug)}
                  defaultOpen={index === 0}
                />
              </div>
            ))}
          </div>

          <Callout tone="info" className="mt-6" icon={Target}>
            আজকের আয়াত, হাদীস ও দুআ প্রতিদিন স্বয়ংক্রিয়ভাবে বদলায়, যাতে পুরো কুরআন,
            হাদীস ও দুআর সংকলনের ভেতর দিয়ে ধীরে ধীরে চলতে পারেন। সব দুআ এখন
            আলাদা সংকলনে — বিভাগ অনুযায়ী সাজানো ও সূত্রসহ।
          </Callout>
        </section>

        <aside className="space-y-4">
          <QiblaCompass />

          <Card>
            <CardHeader
              title="এই সপ্তাহের ফোকাস"
              subtitle="একটি বিষয়ে গভীরভাবে মনোযোগ দেওয়ার সপ্তাহ"
              icon={Sun}
              tone="accent"
            />
            <div className="mt-4 rounded-card bg-accent-soft/50 p-4">
              <p className="text-2xl" aria-hidden>
                {featuredTheme.emoji}
              </p>
              <p className="mt-2 font-display text-[0.9375rem] font-bold text-accent-soft-foreground">
                {featuredTheme.titleBn}
              </p>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-accent-soft-foreground/90">
                {featuredTheme.descriptionBn}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {featuredTheme.departmentSlugs.map((slug) => {
                  const department = getDepartment(slug);
                  if (!department) return null;
                  return (
                    <Chip
                      key={slug}
                      href={`/departments/${slug}`}
                      tone={department.tone}
                      size="sm"
                    >
                      {department.name.bn}
                    </Chip>
                  );
                })}
              </div>
              <Progress
                value={0}
                size="xs"
                tone="accent"
                className="mt-4"
                label="weekly focus progress"
              />
              <p className="mt-2 text-[0.6875rem] text-accent-soft-foreground/80">
                লক্ষ্য: <Num value={featuredTheme.targetMinutes} /> মিনিট এই সপ্তাহে
              </p>
            </div>

            <ul className="mt-4 space-y-2.5 border-t border-border pt-4">
              {FOCUS_THEMES.filter((theme) => theme.id !== featuredTheme.id)
                .slice(0, 4)
                .map((theme) => (
                  <li key={theme.id} className="flex items-start gap-2.5">
                    <span className="text-base leading-none" aria-hidden>
                      {theme.emoji}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.8125rem] font-medium text-foreground">
                        {theme.titleBn}
                      </span>
                      <span className="mt-0.5 block text-[0.6875rem] text-subtle-foreground">
                        <Num value={theme.targetMinutes} /> মিনিট
                      </span>
                    </span>
                  </li>
                ))}
            </ul>
            <p className="mt-4 text-[0.6875rem] leading-relaxed text-subtle-foreground">
              বছরের ফোকাস থিমগুলোর মোট লক্ষ্য <Num value={FOCUS_MINUTES_TOTAL} /> মিনিট।
            </p>
          </Card>

          <Card>
            <CardHeader title="আরও পড়ুন" subtitle="আজকের সাথে মানানসই" icon={ScrollText} />
            <div className="mt-4 flex flex-col gap-2">
              <Button href="/hadith" variant="outline" size="sm" full>
                <T k="hadith.allCollections" />
              </Button>
              <Button href="/quran" variant="outline" size="sm" full icon={Compass}>
                <T k="quran.allSurahs" />
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

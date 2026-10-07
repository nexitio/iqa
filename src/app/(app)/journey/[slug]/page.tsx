import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LucideIcon } from "@/components/icons";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Route,
  ScrollText,
  Sparkles,
  Users,
} from "@/components/icons";
import { Num, T } from "@/components/i18n-text";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  PageHeader,
  Progress,
  Ring,
  SectionHeader,
  FactList,
  type Tone,
} from "@/components/ui";
import { JOURNEYS } from "@/lib/data/personal";
import { bnOrdinal, toBnDigits } from "@/lib/bn";
import { cn } from "@/lib/utils";
import type { JourneyDay } from "@/lib/types";

interface JourneyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return JOURNEYS.map((journey) => ({ slug: journey.slug }));
}

export async function generateMetadata({ params }: JourneyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const journey = JOURNEYS.find((j) => j.slug === slug);
  if (!journey) return { title: "শিক্ষা যাত্রা" };
  return {
    title: journey.titleBn,
    description: journey.descriptionBn,
  };
}

const DAY_KINDS: Record<JourneyDay["kind"], { label: string; tone: Tone; icon: LucideIcon }> = {
  quran: { label: "কুরআন পাঠ", tone: "primary", icon: BookOpen },
  hadith: { label: "হাদীস", tone: "accent", icon: ScrollText },
  reflection: { label: "প্রতিফলন", tone: "info", icon: Brain },
  quiz: { label: "মূল্যায়ন", tone: "warning", icon: CheckCircle2 },
  article: { label: "প্রবন্ধ", tone: "success", icon: FileText },
};

export default async function JourneyDetailPage({ params }: JourneyPageProps) {
  const { slug } = await params;
  const journey = JOURNEYS.find((j) => j.slug === slug);
  if (!journey) notFound();

  const index = JOURNEYS.findIndex((j) => j.id === journey.id);
  const previous = index > 0 ? JOURNEYS[index - 1] : null;
  const next = index < JOURNEYS.length - 1 ? JOURNEYS[index + 1] : null;

  const percent =
    journey.totalDays > 0 ? (journey.completedDays / journey.totalDays) * 100 : 0;
  const finished = journey.totalDays > 0 && journey.completedDays >= journey.totalDays;

  // The first day not yet completed is where the reader should resume.
  const nextDay = journey.days.find((day) => !day.completed) ?? null;

  const minutesInvested = journey.days
    .filter((day) => day.completed)
    .reduce((sum, day) => sum + day.minutes, 0);

  const totalMinutes = journey.days.reduce((sum, day) => sum + day.minutes, 0);
  const minutesPerDay = Math.round(totalMinutes / Math.max(1, journey.days.length));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="nav.journey" />}
        title={journey.titleBn}
        description={journey.descriptionBn}
        icon={Route}
        tone="accent"
        patterned
        breadcrumbs={[
          { label: <T k="nav.home" />, href: "/" },
          { label: <T k="nav.journey" />, href: "/journey" },
          { label: journey.titleBn },
        ]}
        actions={
          nextDay ? (
            <Button href={nextDay.href} icon={Sparkles}>
              চালিয়ে যান — {bnOrdinal(nextDay.day)} দিন
            </Button>
          ) : (
            <Badge tone="success" size="md" icon={CheckCircle2}>
              <T k="journey.completed" />
            </Badge>
          )
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Ring value={percent} size={76} thickness={7} tone={finished ? "success" : "accent"}>
            <div className="text-center">
              <p className="text-[0.75rem] font-bold tabular leading-none text-foreground">
                {toBnDigits(Math.round(percent))}%
              </p>
              <p className="mt-0.5 text-[0.5625rem] text-subtle-foreground">সম্পন্ন</p>
            </div>
          </Ring>
          <div className="min-w-0 self-center">
            <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
              অগ্রগতি
            </p>
            <p className="mt-1 font-display text-lg font-bold leading-tight text-foreground">
              <Num value={journey.completedDays} />
              <span className="text-muted-foreground">
                {" / "}
                <Num value={journey.totalDays} /> দিন
              </span>
            </p>
            <Progress
              value={percent}
              size="sm"
              tone={finished ? "success" : "accent"}
              className="mt-2.5"
              label="journey progress"
            />
          </div>
          <div className="min-w-0 self-center">
            <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
              প্রতিদিনের সময়
            </p>
            <p className="mt-1 flex items-center gap-1.5 font-display text-lg font-bold leading-tight text-foreground">
              <Clock className="size-4 text-accent" aria-hidden />
              <Num value={minutesPerDay} /> মিনিট
            </p>
            <p className="mt-1.5 text-[0.6875rem] text-subtle-foreground">
              মোট <Num value={totalMinutes} /> মিনিটের সাজানো পরিকল্পনা
            </p>
          </div>
          <div className="min-w-0 self-center">
            <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
              যুক্ত হয়েছেন
            </p>
            <p className="mt-1 flex items-center gap-1.5 font-display text-lg font-bold leading-tight text-foreground">
              <Users className="size-4 text-primary" aria-hidden />
              <Num value={journey.enrolled} /> জন
            </p>
            <Badge tone="accent" size="xs" className="mt-2">
              {journey.categoryBn}
            </Badge>
          </div>
        </div>
      </PageHeader>

      {journey.completedDays > 0 && !finished ? (
        <Callout tone="accent" icon={Sparkles}>
          আপনি ইতিমধ্যে <Num value={minutesInvested} /> মিনিট এই যাত্রায় দিয়েছেন। ধারাবাহিকতাই
          এখানে সবচেয়ে বড় অর্জন — আজকের দিনটি শেষ করলেই আরেক ধাপ এগিয়ে যাবেন।
        </Callout>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0">
          <SectionHeader
            title="দিন অনুযায়ী পরিকল্পনা"
            description={`${bnOrdinal(journey.totalDays)} পর্যন্ত ধাপে ধাপে সাজানো`}
            icon={CalendarDays}
          />

          <ol className="relative">
            {journey.days.map((day, i) => {
              const meta = DAY_KINDS[day.kind];
              const isNext = nextDay?.day === day.day;
              const isLast = i === journey.days.length - 1;

              return (
                <li key={day.day} className="relative flex gap-4">
                  {/* Timeline spine */}
                  <div className="flex shrink-0 flex-col items-center">
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-full border-2 text-[0.75rem] font-bold tabular transition-colors",
                        day.completed
                          ? "border-success bg-success text-white"
                          : isNext
                            ? "border-accent bg-accent-soft text-accent-soft-foreground"
                            : "border-border-strong bg-surface text-subtle-foreground",
                      )}
                    >
                      {day.completed ? (
                        <CheckCircle2 className="size-4" aria-hidden />
                      ) : (
                        toBnDigits(day.day)
                      )}
                    </span>
                    {!isLast ? (
                      <span
                        className={cn(
                          "w-0.5 flex-1",
                          day.completed ? "bg-success/40" : "bg-border",
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </div>

                  <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-5")}>
                    <Card
                      interactive={Boolean(day.href)}
                      className={cn(
                        "flex h-full flex-col",
                        day.completed && "border-success/35 bg-success-soft/25",
                        isNext && "border-accent/45 bg-accent-soft/30 shadow-raised",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                            {bnOrdinal(day.day)} দিন
                          </span>
                          <Badge tone={meta.tone} size="xs" icon={meta.icon}>
                            {meta.label}
                          </Badge>
                          {isNext ? (
                            <Badge tone="accent" size="xs" icon={Sparkles}>
                              এখন পড়ুন
                            </Badge>
                          ) : null}
                          {day.completed ? (
                            <Badge tone="success" size="xs" icon={CheckCircle2}>
                              সম্পন্ন
                            </Badge>
                          ) : null}
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-subtle-foreground">
                          <Clock className="size-3.5" aria-hidden />
                          <Num value={day.minutes} /> মিনিট
                        </span>
                      </div>

                      <h3 className="mt-2.5 font-display text-[0.9375rem] font-semibold leading-snug text-foreground">
                        {day.titleBn}
                      </h3>
                      <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                        {day.subtitleBn}
                      </p>

                      <div className="mt-auto pt-3.5">
                        <Link
                          href={day.href}
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[0.8125rem] font-medium transition-colors",
                            isNext ? "text-accent" : "text-primary hover:text-primary-hover",
                          )}
                        >
                          {day.completed ? "আবার পড়ুন" : isNext ? "আজ শুরু করুন" : "খুলুন"}
                          <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                      </div>
                    </Card>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader title="যাত্রার তথ্য" icon={Route} tone="accent" />
            <FactList
              className="mt-4"
              columns={1}
              items={[
                { label: "বিষয়", value: journey.categoryBn, icon: Sparkles },
                { label: "মেয়াদ", value: journey.durationLabelBn, icon: CalendarDays },
                {
                  label: "ধাপ",
                  value: <Num value={journey.totalDays} />,
                  icon: CheckCircle2,
                },
                { label: "মোট সময়", value: <><Num value={totalMinutes} /> মিনিট</>, icon: Clock },
                {
                  label: "আপনার বিনিয়োগ",
                  value: <><Num value={minutesInvested} /> মিনিট</>,
                  icon: BookOpen,
                },
                { label: "যুক্ত", value: <><Num value={journey.enrolled} /> জন</>, icon: Users },
              ]}
            />
          </Card>

          <Card variant="parchment">
            <CardHeader
              title="ধারাবাহিকতা, তীব্রতা নয়"
              subtitle="শেখার সবচেয়ে বড় শর্ত"
              icon={Sparkles}
              tone="accent"
            />
            <div className="mt-4 space-y-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
              <p>
                প্রতিদিন ১০ মিনিটের নিয়মিত চর্চা মাসে একটি বইয়ের সমান ইলম দিতে পারে।
                একদিনে অনেক বেশি পড়ে কয়েক দিন বিরতি দেওয়ার চেয়ে প্রতিদিনের ছোট
                অভ্যাসই বেশি কার্যকর।
              </p>
              <p>
                মিস হলে নিজেকে দোষ দেবেন না — পরদিনই ফিরে আসুন। আল্লাহর কাছে
                নিয়মিত ছোট আমলই প্রিয়।
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="পরবর্তী যাত্রা" icon={ArrowRight} tone="primary" />
            <div className="mt-4 flex flex-col gap-2">
              {next ? (
                <Button href={`/journey/${next.slug}`} variant="outline" size="sm" full icon={ArrowRight}>
                  {next.titleBn}
                </Button>
              ) : null}
              {previous ? (
                <Button href={`/journey/${previous.slug}`} variant="ghost" size="sm" full icon={ArrowLeft}>
                  {previous.titleBn}
                </Button>
              ) : null}
              <Button href="/journey" variant="ghost" size="sm" full>
                <T k="journey.discover" />
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

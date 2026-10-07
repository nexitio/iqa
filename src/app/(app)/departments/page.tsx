import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Compass, Flame, MessageCircleQuestion, Sparkles, Users, Workflow } from "@/components/icons";
import { DEPARTMENTS, TOPICS, TRENDING_TOPICS } from "@/lib/data/departments";
import { SCHOLARS } from "@/lib/data/scholars";
import { ANSWERS, QUESTIONS } from "@/lib/data/questions";
import { departmentIcon } from "@/components/people";
import { Num, Pick, T } from "@/components/i18n-text";
import {
  Badge,
  Callout,
  Card,
  Chip,
  PageHeader,
  SectionHeader,
  StatTile,
  asTone,
  softTone,
  textTone,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "বিভাগসমূহ",
  description:
    "আকীদা, ফিকহ, কুরআন ও তাফসীর, হাদীস, পরিবার, অর্থনীতি, তরুণ — ইলমের প্রতিটি বিভাগ, সংশ্লিষ্ট আলেম ও জ্ঞানের ভাণ্ডারসহ।",
};

/** Total unanswered work outstanding, used for the routing explainer. */
const OPEN_QUESTIONS = QUESTIONS.filter((q) => q.status === "open" || q.status === "routed").length;
const ANSWERED_QUESTIONS = QUESTIONS.filter((q) => q.status === "answered" || q.status === "closed").length;

export default function DepartmentsPage() {
  // Most active departments by question volume — the taxonomy's `stats` is the
  // source of truth, so departments render identically wherever they appear.
  const byVolume = [...DEPARTMENTS].sort((a, b) => b.stats.questions - a.stats.questions);
  const trendingDepartments = DEPARTMENTS.filter((d) => d.trending);
  const trendingTopics = TRENDING_TOPICS.length > 0 ? TRENDING_TOPICS : TOPICS.filter((t) => t.trending);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="label.departments" />}
        title={<T k="nav.departments" />}
        description="প্রতিটি বিভাগ একটি জ্ঞানের দরজা — এবং একটি প্রশ্নের গন্তব্য। আপনার প্রশ্ন যে বিভাগে পড়ে, সেই বিভাগের আলেমরাই সবার আগে তা দেখেন।"
        icon={Building2}
        patterned
        actions={
          <>
            <Badge tone="primary" size="md" icon={Workflow}>
              <Num value={DEPARTMENTS.length} />
              <span className="mx-1">টি বিভাগ</span>
            </Badge>
            <Link
              href="/questions/ask"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-[0.875rem] font-medium text-primary-foreground shadow-card transition-colors hover:bg-primary-hover"
            >
              <MessageCircleQuestion className="size-4" aria-hidden />
              <T k="action.ask" />
            </Link>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="বিভাগ"
            value={<Num value={DEPARTMENTS.length} />}
            hint="প্রতিটি বিভাগে অন্তত একজন আলেম আছেন"
            icon={Building2}
            tone="primary"
          />
          <StatTile
            label="আলেম ও মুফতি"
            value={<Num value={SCHOLARS.length} />}
            hint="একজন আলেম একাধিক বিভাগে যুক্ত হতে পারেন"
            icon={Users}
            tone="scholar"
          />
          <StatTile
            label="সক্রিয় প্রশ্ন"
            value={<Num value={OPEN_QUESTIONS} />}
            hint="এগুলো এখনো উত্তরপ্রক্রিয়ায়"
            icon={MessageCircleQuestion}
            tone="warning"
          />
          <StatTile
            label="উত্তর সম্পন্ন"
            value={<Num value={ANSWERED_QUESTIONS} />}
            hint={`${ANSWERS.length}টি উত্তর প্রকাশিত হয়েছে`}
            icon={Sparkles}
            tone="success"
          />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <section>
            <SectionHeader
              title="সব বিভাগ"
              description="আলেম, প্রশ্ন, প্রবন্ধ ও ফতোয়া — বিভাগভিত্তিক সবকিছু"
              icon={Compass}
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {DEPARTMENTS.map((department) => {
                const Icon = departmentIcon(department.icon);
                const tone = asTone(department.tone);
                return (
                  <Link
                    key={department.id}
                    href={`/departments/${department.slug}`}
                    className="group flex h-full flex-col rounded-panel border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-raised"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", softTone[tone])}>
                        <Icon className="size-5" strokeWidth={1.9} />
                      </span>
                      {department.trending ? (
                        <Badge tone="danger" size="xs" icon={Flame}>
                          <T k="label.trending" />
                        </Badge>
                      ) : null}
                    </div>

                    <h3 className="mt-3.5 font-display text-base font-bold leading-snug text-foreground group-hover:text-primary">
                      <Pick value={department.name} />
                    </h3>
                    <p className="mt-0.5 text-[0.6875rem] text-subtle-foreground">
                      <Pick value={department.shortName} />
                    </p>
                    <p className="mt-2.5 line-clamp-3 flex-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                      <Pick value={department.description} />
                    </p>

                    <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3.5 text-[0.75rem]">
                      <div>
                        <dt className="text-subtle-foreground">আলেম</dt>
                        <dd className={cn("mt-0.5 font-semibold tabular", textTone[tone])}>
                          <Num value={department.scholarIds.length} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-subtle-foreground">প্রশ্ন</dt>
                        <dd className="mt-0.5 font-semibold tabular text-foreground">
                          <Num value={department.stats.questions} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-subtle-foreground">প্রবন্ধ</dt>
                        <dd className="mt-0.5 font-semibold tabular text-foreground">
                          <Num value={department.stats.articles} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-subtle-foreground">ফতোয়া</dt>
                        <dd className="mt-0.5 font-semibold tabular text-foreground">
                          <Num value={department.stats.fatwas} />
                        </dd>
                      </div>
                    </dl>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-primary">
                      বিভাগে যান
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <SectionHeader
              title="বিভাগ কীভাবে প্রশ্ন রাউট করে"
              description="প্রশ্ন জমা দেওয়ার সাথে সাথেই কোন আলেম সবার আগে দেখবেন, সেটি নির্ধারিত হয়ে যায়"
              icon={Workflow}
              tone="accent"
            />
            <Card variant="parchment">
              <ol className="space-y-4">
                {[
                  {
                    title: "আপনি বিভাগ বেছে নেন",
                    body: "প্রশ্ন লেখার সময় আপনি এক বা একাধিক বিভাগ নির্বাচন করেন — যেমন পরিবার ও বিবাহ, সাথে অর্থনীতি। বিভাগ যত নির্ভুল, উত্তর তত প্রাসঙ্গিক।",
                  },
                  {
                    title: "সংশ্লিষ্ট বিভাগের আলেম আগে দেখেন",
                    body: "যে আলেম আপনার বেছে নেওয়া বিভাগের সদস্য, তিনি সবার আগে প্রশ্নটি দেখেন। যাঁরা একাধিক প্রাসঙ্গিক বিভাগে আছেন, তাঁদের অগ্রাধিকারও বেশি।",
                  },
                  {
                    title: "তারপর যোগ্যতা ও সাড়াদানের সময়",
                    body: "একই বিভাগে একাধিক আলেম থাকলে অগ্রাধিকার নির্ধারিত হয় বিশেষজ্ঞতা, এই বিভাগে উত্তরদানের অভিজ্ঞতা এবং গড়ে কত দ্রুত উত্তর দেন — এই তিনটি মিলিয়ে।",
                  },
                  {
                    title: "বাকি আলেমরাও উত্তর দিতে পারেন",
                    body: "অগ্রাধিকার মানে একচেটিয়া নয়। প্রশ্ন প্রকাশ্য হলে সংশ্লিষ্ট অন্য আলেমরাও উত্তর দিতে পারেন, এবং আপনার গৃহীত উত্তরটিই উপরে দেখানো হয়।",
                  },
                ].map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-[0.8125rem] font-bold text-primary-foreground">
                      <Num value={index + 1} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[0.9375rem] font-semibold text-foreground">
                        {step.title}
                      </span>
                      <span className="mt-1 block text-[0.8125rem] leading-relaxed text-muted-foreground">
                        {step.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>

            <Callout tone="accent" title="নিশ্চিত হতে চান কে উত্তর দেবেন?" className="mt-4">
              প্রশ্ন লেখার পাতায় বিভাগ বেছে নেওয়ার সাথে সাথেই আপনি দেখতে পাবেন কোন আলেমরা অগ্রাধিকার পাবেন এবং কেন।
            </Callout>
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          <Card>
            <SectionHeader
              title="সবচেয়ে সক্রিয় বিভাগ"
              description="প্রশ্নের পরিমাণ অনুসারে"
              icon={Flame}
              tone="danger"
              size="sm"
            />
            <ul className="space-y-2.5">
              {byVolume.slice(0, 6).map((department) => {
                const Icon = departmentIcon(department.icon);
                const tone = asTone(department.tone);
                return (
                  <li key={department.id}>
                    <Link
                      href={`/departments/${department.slug}`}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-3"
                    >
                      <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", softTone[tone])}>
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.8125rem] font-medium text-foreground">
                          <Pick value={department.name} />
                        </span>
                        <span className="block text-[0.6875rem] text-subtle-foreground">
                          <Num value={department.stats.questions} />টি প্রশ্ন
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <SectionHeader
              title="আলোচিত বিষয়"
              description="এই মুহূর্তে যেগুলো নিয়ে বেশি প্রশ্ন আসছে"
              icon={Sparkles}
              tone="accent"
              size="sm"
            />
            <div className="flex flex-wrap gap-2">
              {trendingTopics.slice(0, 14).map((topic) => (
                <Chip key={topic.slug} href={`/topics/${topic.slug}`} size="sm" tone="accent" active={false}>
                  <Pick value={topic.name} />
                </Chip>
              ))}
            </div>
          </Card>

          {trendingDepartments.length > 0 ? (
            <Card>
              <SectionHeader
                title="এখন বেশি প্রশ্ন আসছে"
                description="এই বিভাগগুলোতে উত্তরদাতার চাহিদা বেশি"
                icon={Flame}
                tone="danger"
                size="sm"
              />
              <ul className="space-y-2.5">
                {trendingDepartments.slice(0, 4).map((department) => (
                  <li key={department.id} className="flex items-center justify-between gap-3">
                    <Link
                      href={`/departments/${department.slug}`}
                      className="truncate text-[0.8125rem] font-medium text-foreground hover:text-primary"
                    >
                      <Pick value={department.name} />
                    </Link>
                    <span className="shrink-0 text-[0.6875rem] text-subtle-foreground">
                      <Num value={department.scholarIds.length} /> জন আলেম
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card>
            <SectionHeader title="সহায়তা দরকার?" icon={MessageCircleQuestion} size="sm" />
            <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
              কোন বিভাগে প্রশ্ন করবেন বুঝতে না পারলে চিন্তা নেই — প্রশ্ন লেখার পাতায় বিভাগ বেছে নেওয়ার সময় সঠিক
              বিভাগ নির্বাচনে সহায়তা করা হয়, এবং প্রশ্নটি সংশ্লিষ্ট আলেমদের কাছেই পৌঁছে যায়।
            </p>
            <Link
              href="/questions/ask"
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-[0.875rem] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              প্রশ্ন লিখুন
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}

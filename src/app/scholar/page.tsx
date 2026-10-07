import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Eye,
  Flame,
  GraduationCap,
  MessageCircleQuestion,
  PenLine,
  Scale,
  Sparkles,
  Star,
  ThumbsUp,
  Trophy,
} from "@/components/icons";
import { ActivityFeed, RoutingQueueCard, ScholarPerformancePanel } from "@/components/console";
import { AvailableInline } from "./availability";
import { Num, T } from "@/components/i18n-text";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Progress,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { PLATFORM_ACTIVITY, SCHOLAR_DASHBOARDS, SCHOLAR_DASHBOARD } from "@/lib/data/admin";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";
import { getDepartment } from "@/lib/data/departments";
import { findDistrict } from "@/lib/bn";
import { getScholarQueue, SCHOLAR_CONSOLE_ID } from "./scholar-queue";

export const metadata: Metadata = {
  title: "সারসংক্ষেপ",
};

/**
 * Scholar overview.
 *
 * The metrics come from ScholarPerformancePanel, which already renders the KPI
 * grid, the weekly answering chart and the department split — so this page adds
 * the identity header, the routed-queue preview and the activity trail rather
 * than repeating those tiles.
 */
export default function ScholarOverviewPage() {
  const scholar = SCHOLAR_BY_ID[SCHOLAR_CONSOLE_ID];
  const dashboard = SCHOLAR_DASHBOARDS[SCHOLAR_CONSOLE_ID] ?? SCHOLAR_DASHBOARD;
  const queue = getScholarQueue(SCHOLAR_CONSOLE_ID);
  const pending = queue.filter((item) => item.question.answerCount === 0);
  const topThree = pending.slice(0, 3);
  const district = scholar ? findDistrict(scholar.district) : undefined;

  const departments = (scholar?.departmentIds ?? [])
    .map((slug) => getDepartment(slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const answeredRate =
    queue.length > 0
      ? Math.round(((queue.length - pending.length) / queue.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Identity + greeting */}
      <Card variant="parchment">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar
              name={scholar?.name.bn ?? "আলেম"}
              color={scholar?.avatarColor}
              size="xl"
              verified={scholar?.verified}
            />
            <div className="min-w-0">
              <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-primary">
                <T k="console.welcome" />
              </p>
              <h1 className="mt-1 font-display text-xl font-bold leading-tight text-foreground sm:text-2xl">
                {scholar ? `${scholar.honorific.bn} ${scholar.name.bn}` : "আলেম"}
              </h1>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                {scholar?.madrasah.bn}
                {district ? ` · ${district.name.bn}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {scholar ? (
                  <AvailableInline
                    available={scholar.availableForQuestions}
                    responseTimeHours={scholar.responseTimeHours}
                  />
                ) : null}
                <Badge tone="accent" size="sm" icon={Star}>
                  রেটিং <Num value={scholar?.rating ?? 0} />
                </Badge>
                <Badge tone="primary" size="sm" icon={Trophy}>
                  <Num value={scholar?.stats.helpfulVotes ?? 0} /> সহায়ক ভোট
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button href="/scholar/write" icon={PenLine}>
              <T k="console.writeTitle" />
            </Button>
            <Button href="/scholar/questions" variant="outline" icon={MessageCircleQuestion}>
              <T k="console.answerQuestion" />
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
              আমার বিভাগসমূহ
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {departments.map((department) => (
                <Badge key={department.slug} tone={department.tone} size="xs">
                  {department.shortName.bn}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
              উত্তর দেওয়ার হার
            </p>
            <p className="mt-1.5 font-display text-xl font-bold tabular text-foreground">
              <Num value={answeredRate} />%
            </p>
            <Progress value={answeredRate} tone="success" size="sm" className="mt-2" />
          </div>
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
              এখন অপেক্ষমাণ
            </p>
            <p className="mt-1.5 font-display text-xl font-bold tabular text-foreground">
              <Num value={pending.length} />
            </p>
            <p className="mt-1 text-[0.6875rem] text-subtle-foreground">
              আপনার কাছে রাউট করা মোট <Num value={queue.length} />টি প্রশ্নের মধ্যে
            </p>
          </div>
        </div>
      </Card>

      {/* Metrics, charts and department split */}
      <ScholarPerformancePanel dashboard={dashboard} />

      {/* Contribution totals from the public profile record */}
      <section>
        <SectionHeader
          size="sm"
          icon={GraduationCap}
          title="জ্ঞানের অবদান"
          description="আপনার প্রোফাইলে প্রকাশিত মোট অবদান — পাঠকরা এটিই দেখেন"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="প্রশ্নের উত্তর"
            value={<Num value={scholar?.stats.answers ?? 0} />}
            icon={MessageCircleQuestion}
            tone="primary"
            hint="সর্বকাল"
          />
          <StatTile
            label="প্রকাশিত ফতোয়া"
            value={<Num value={scholar?.stats.fatwas ?? 0} />}
            icon={Scale}
            tone="accent"
            hint="আনুষ্ঠানিক রায়"
            href="/scholar/fatwas"
          />
          <StatTile
            label="প্রবন্ধ"
            value={<Num value={scholar?.stats.articles ?? 0} />}
            icon={BookOpen}
            tone="info"
            hint="প্রকাশিত ও খসড়া মিলিয়ে"
            href="/scholar/articles"
          />
          <StatTile
            label="অনুসারী"
            value={<Num value={scholar?.stats.followers ?? 0} />}
            icon={Eye}
            tone="scholar"
            hint="আপনার প্রোফাইল ফলো করেন"
          />
        </div>
      </section>

      {/* Priority queue preview */}
      <section>
        <SectionHeader
          icon={Sparkles}
          tone="accent"
          title="প্রশ্ন বাক্সে অপেক্ষমাণ"
          description="আপনার কাছে সবচেয়ে অগ্রাধিকার নিয়ে আসা প্রশ্নগুলো"
          href="/scholar/questions"
          actionLabel="সব প্রশ্ন দেখুন"
        />
        {topThree.length > 0 ? (
          <div className="space-y-4">
            {topThree.map((item) => (
              <RoutingQueueCard
                key={item.question.id}
                question={item.question}
                candidates={item.candidates}
                rank={item.me.priority}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader
              icon={Trophy}
              tone="success"
              title="সব প্রশ্নের উত্তর দেওয়া হয়েছে"
              subtitle="এখন অপেক্ষমাণ কোনো প্রশ্ন নেই — নতুন প্রশ্ন এলে এখানে দেখা যাবে।"
            />
          </Card>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ActivityFeed entries={PLATFORM_ACTIVITY} limit={6} />

        <div className="space-y-4">
          <Card>
            <CardHeader icon={Clock} title="সাড়া দেওয়ার গড় সময়" />
            <p className="mt-3 font-display text-3xl font-bold leading-none text-foreground">
              <Num value={dashboard.avgResponseHours} />
              <span className="ml-1.5 font-bangla text-sm font-medium text-muted-foreground">
                <T k="console.hours" />
              </span>
            </p>
            <p className="mt-2 text-[0.75rem] leading-relaxed text-muted-foreground">
              দ্রুত সাড়া দিলে প্রশ্ন রাউটিংয়ে আপনার অগ্রাধিকার বাড়ে — ব্যবহারকারীর
              অপেক্ষার সময় কমলে প্ল্যাটফর্মের ওপর আস্থাও বাড়ে।
            </p>
          </Card>

          <Card>
            <CardHeader
              icon={Flame}
              tone="danger"
              title="টানা উত্তর দেওয়ার ধারা"
              subtitle="প্রতিদিন অন্তত একটি প্রশ্নের উত্তর দিন"
            />
            <p className="mt-3 font-display text-3xl font-bold leading-none text-foreground">
              <Num value={dashboard.streakDays} />
              <span className="ml-1.5 font-bangla text-sm font-medium text-muted-foreground">
                দিন
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button href="/scholar/questions" size="sm" variant="soft" icon={MessageCircleQuestion}>
                প্রশ্নের উত্তর দিন
              </Button>
              <Link
                href="/scholar/profile"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-primary transition-colors hover:text-primary-hover"
              >
                পাবলিক প্রোফাইল
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader icon={ThumbsUp} title="কেন রাউটিং গুরুত্বপূর্ণ" />
            <p className="mt-2 text-[0.75rem] leading-relaxed text-muted-foreground">
              কোনো ব্যবহারকারী প্রশ্ন করলে সংশ্লিষ্ট বিভাগের আলেমরা আগে পান। আপনি
              <span className="font-medium text-foreground"> {departments[0]?.shortName.bn ?? "ফিকহ"} </span>
              বিভাগের প্রধান বিশেষজ্ঞ, তাই এই বিষয়ের প্রশ্নগুলো প্রথমে আপনার কাছে আসে।
            </p>
            <div className="mt-4">
              <Button href="/scholar/questions" variant="outline" size="sm" full icon={Sparkles}>
                রাউটিং ব্যাখ্যা দেখুন
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

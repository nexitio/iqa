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
import { Num, Pick, T } from "@/components/i18n-text";
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
                {scholar ? (
                  <>
                    <Pick value={scholar.honorific} /> <Pick value={scholar.name} />
                  </>
                ) : (
                  <T k="scholar.core.scholarFallback" />
                )}
              </h1>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                <Pick value={scholar?.madrasah} />
                {district ? (
                  <>
                    {" · "}
                    <Pick value={district.name} />
                  </>
                ) : null}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {scholar ? (
                  <AvailableInline
                    available={scholar.availableForQuestions}
                    responseTimeHours={scholar.responseTimeHours}
                  />
                ) : null}
                <Badge tone="accent" size="sm" icon={Star}>
                  <T k="scholar.core.rating" /> <Num value={scholar?.rating ?? 0} />
                </Badge>
                <Badge tone="primary" size="sm" icon={Trophy}>
                  <Num value={scholar?.stats.helpfulVotes ?? 0} />{" "}
                  <T k="scholar.core.helpfulVotes" />
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
              <T k="console.yourDepartments" />
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {departments.map((department) => (
                <Badge key={department.slug} tone={department.tone} size="xs">
                  <Pick value={department.shortName} />
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
              <T k="scholar.core.answerRate" />
            </p>
            <p className="mt-1.5 font-display text-xl font-bold tabular text-foreground">
              <Num value={answeredRate} />%
            </p>
            <Progress value={answeredRate} tone="success" size="sm" className="mt-2" />
          </div>
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
              <T k="scholar.core.nowPending" />
            </p>
            <p className="mt-1.5 font-display text-xl font-bold tabular text-foreground">
              <Num value={pending.length} />
            </p>
            <p className="mt-1 text-[0.6875rem] text-subtle-foreground">
              <T k="scholar.core.pendingHint" vars={{ count: queue.length }} />
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
          title={<T k="scholar.core.contributions" />}
          description={<T k="scholar.core.contributionsHint" />}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label={<T k="scholar.core.statAnswers" />}
            value={<Num value={scholar?.stats.answers ?? 0} />}
            icon={MessageCircleQuestion}
            tone="primary"
            hint={<T k="scholar.core.hintAllTime" />}
          />
          <StatTile
            label={<T k="scholar.core.statFatwas" />}
            value={<Num value={scholar?.stats.fatwas ?? 0} />}
            icon={Scale}
            tone="accent"
            hint={<T k="scholar.core.hintFormalRulings" />}
            href="/scholar/fatwas"
          />
          <StatTile
            label={<T k="scholar.core.statArticles" />}
            value={<Num value={scholar?.stats.articles ?? 0} />}
            icon={BookOpen}
            tone="info"
            hint={<T k="scholar.core.hintPublishedAndDrafts" />}
            href="/scholar/articles"
          />
          <StatTile
            label={<T k="scholar.core.statFollowers" />}
            value={<Num value={scholar?.stats.followers ?? 0} />}
            icon={Eye}
            tone="scholar"
            hint={<T k="scholar.core.hintFollowYou" />}
          />
        </div>
      </section>

      {/* Priority queue preview */}
      <section>
        <SectionHeader
          icon={Sparkles}
          tone="accent"
          title={<T k="scholar.core.pendingInInbox" />}
          description={<T k="scholar.core.pendingInInboxHint" />}
          href="/scholar/questions"
          actionLabel={<T k="scholar.core.allQuestions" />}
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
              title={<T k="scholar.core.allAnswered" />}
              subtitle={<T k="scholar.core.allAnsweredHint" />}
            />
          </Card>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ActivityFeed entries={PLATFORM_ACTIVITY} limit={6} />

        <div className="space-y-4">
          <Card>
            <CardHeader icon={Clock} title={<T k="scholar.core.avgResponseTime" />} />
            <p className="mt-3 font-display text-3xl font-bold leading-none text-foreground">
              <Num value={dashboard.avgResponseHours} />
              <span className="ml-1.5 font-bangla text-sm font-medium text-muted-foreground">
                <T k="console.hours" />
              </span>
            </p>
            <p className="mt-2 text-[0.75rem] leading-relaxed text-muted-foreground">
              <T k="scholar.core.avgResponseHint" />
            </p>
          </Card>

          <Card>
            <CardHeader
              icon={Flame}
              tone="danger"
              title={<T k="scholar.core.streakTitle" />}
              subtitle={<T k="scholar.core.streakSubtitle" />}
            />
            <p className="mt-3 font-display text-3xl font-bold leading-none text-foreground">
              <Num value={dashboard.streakDays} />
              <span className="ml-1.5 font-bangla text-sm font-medium text-muted-foreground">
                <T k="scholar.core.days" />
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button href="/scholar/questions" size="sm" variant="soft" icon={MessageCircleQuestion}>
                <T k="console.answerQuestion" />
              </Button>
              <Link
                href="/scholar/profile"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-primary transition-colors hover:text-primary-hover"
              >
                <T k="console.publicProfile" />
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader icon={ThumbsUp} title={<T k="scholar.core.whyRouting" />} />
            <p className="mt-2 text-[0.75rem] leading-relaxed text-muted-foreground">
              <T k="scholar.core.whyRoutingLead" />{" "}
              <span className="font-medium text-foreground">
                {departments[0] ? <Pick value={departments[0].shortName} /> : <T k="label.fiqh" />}
              </span>{" "}
              <T k="scholar.core.whyRoutingTail" />
            </p>
            <div className="mt-4">
              <Button href="/scholar/questions" variant="outline" size="sm" full icon={Sparkles}>
                <T k="scholar.core.explainRouting" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

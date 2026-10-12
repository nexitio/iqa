import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ClipboardCheck,
  Clock,
  Flag,
  LayoutDashboard,
  ShieldCheck,
  UserPlus,
  Users,
  Route,
} from "@/components/icons";
import {
  ADMIN_OVERVIEW,
  PLATFORM_ACTIVITY,
  REPORTS,
  REVIEW_QUEUE,
  SCHOLAR_APPLICATIONS,
} from "@/lib/data/admin";
import { DEPARTMENTS } from "@/lib/data/departments";
import {
  ActivityFeed,
  DepartmentBreakdown,
  DistrictBreakdown,
  KpiGrid,
  TrendPanel,
} from "@/components/console";
import { Digits, T, TimeAgo } from "@/components/i18n-text";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  CountPill,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";

export const metadata: Metadata = { title: "সারসংক্ষেপ" };

/** The three queues that need an admin's attention, surfaced up front. */
function ActionQueues() {
  const pendingApplications = SCHOLAR_APPLICATIONS.filter((a) => a.status === "pending");
  const pendingReview = REVIEW_QUEUE.filter((i) => i.status === "pending");
  const openReports = REPORTS.filter((r) => r.status === "pending");
  const oldestReview = [...pendingReview].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
  )[0];

  const queues = [
    {
      href: "/admin/scholars",
      icon: UserPlus,
      title: <T k="admin.home.queueScholars" />,
      description: <T k="admin.home.queueScholarsHelp" />,
      count: pendingApplications.length,
      tone: "warning" as const,
      items: pendingApplications.slice(0, 3).map((a) => a.nameBn),
      more: pendingApplications.length > 3 ? pendingApplications.length - 3 : 0,
    },
    {
      href: "/admin/review",
      icon: ClipboardCheck,
      title: <T k="admin.reviewQueue" />,
      description: <T k="admin.home.queueReviewHelp" />,
      count: pendingReview.length,
      tone: "primary" as const,
      items: pendingReview.slice(0, 3).map((i) => i.titleBn),
      more: pendingReview.length > 3 ? pendingReview.length - 3 : 0,
      note: oldestReview ? (
        <>
          <T k="admin.home.oldestSubmission" /> <TimeAgo iso={oldestReview.submittedAt} />
        </>
      ) : undefined,
    },
    {
      href: "/admin/reports",
      icon: Flag,
      title: <T k="admin.home.queueReports" />,
      description: <T k="admin.home.queueReportsHelp" />,
      count: openReports.length,
      tone: "danger" as const,
      items: openReports.slice(0, 3).map((r) => r.reasonLabelBn),
      more: openReports.length > 3 ? openReports.length - 3 : 0,
    },
  ];

  return (
    <section className="space-y-4">
      <SectionHeader
        icon={ShieldCheck}
        title={<T k="admin.home.todaysWork" />}
        description={<T k="admin.home.todaysWorkHelp" />}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {queues.map((queue) => (
          <Card key={queue.href} className="flex flex-col">
            <CardHeader
              tone={queue.tone}
              icon={queue.icon}
              title={
                <span className="flex items-center gap-2">
                  {queue.title}
                  <CountPill value={<Digits value={queue.count} />} tone={queue.tone} />
                </span>
              }
              subtitle={queue.description}
            />
            <ul className="mt-4 flex-1 space-y-2">
              {queue.items.map((item) => (
                <li
                  key={item}
                  className="truncate rounded-lg bg-surface-2 px-3 py-2 text-[0.75rem] text-muted-foreground"
                >
                  {item}
                </li>
              ))}
              {queue.more > 0 ? (
                <li className="px-3 text-[0.6875rem] text-subtle-foreground">
                  <T k="admin.home.morePending" vars={{ count: queue.more }} />
                </li>
              ) : null}
            </ul>
            <div className="mt-4 border-t border-border pt-4">
              {queue.note ? (
                <p className="mb-2.5 inline-flex items-center gap-1.5 text-[0.6875rem] text-subtle-foreground">
                  <Clock className="size-3" aria-hidden />
                  {queue.note}
                </p>
              ) : null}
              <Link
                href={queue.href}
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-primary transition-colors hover:text-primary-hover"
              >
                <T k="admin.home.reviewAndDecide" />
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function AdminOverviewPage() {
  const departmentCoverage = DEPARTMENTS.filter((d) => d.scholarIds.length > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="admin.title" />}
        title={<T k="admin.overview" />}
        description={<T k="admin.home.description" />}
        icon={LayoutDashboard}
        tone="admin"
        patterned
        actions={
          <>
            <Button href="/admin/scholars/new" icon={UserPlus}>
              <T k="admin.addScholar" />
            </Button>
            <Button href="/admin/review" variant="outline" icon={ClipboardCheck}>
              <T k="admin.reviewQueue" />
            </Button>
          </>
        }
      />

      {ADMIN_OVERVIEW.unansweredOver24h > 20 || ADMIN_OVERVIEW.flaggedContent > 0 ? (
        <Callout
          tone={ADMIN_OVERVIEW.flaggedContent > 0 ? "danger" : "warning"}
          icon={Flag}
          title={<T k="admin.home.needsAttention" />}
        >
          <T k="admin.home.unansweredCallout" vars={{ count: ADMIN_OVERVIEW.unansweredOver24h }} />{" "}
          {ADMIN_OVERVIEW.flaggedContent > 0 ? (
            <T k="admin.home.flaggedContent" vars={{ count: ADMIN_OVERVIEW.flaggedContent }} />
          ) : (
            ""
          )}
        </Callout>
      ) : null}

      <KpiGrid overview={ADMIN_OVERVIEW} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendPanel
          title={<T k="admin.home.activeUsersTrend" />}
          subtitle={<T k="admin.home.activeUsersTrendHelp" />}
          data={ADMIN_OVERVIEW.dailyActiveTrend}
          tone="primary"
          chart="bar"
        />
        <TrendPanel
          title={<T k="admin.home.questionsTrend" />}
          subtitle={<T k="admin.home.questionsTrendHelp" />}
          data={ADMIN_OVERVIEW.questionsTrend}
          tone="accent"
          chart="sparkline"
        />
      </div>

      <ActionQueues />

      <div className="grid gap-4 lg:grid-cols-2">
        <DepartmentBreakdown points={ADMIN_OVERVIEW.topDepartments} />
        <DistrictBreakdown points={ADMIN_OVERVIEW.districtBreakdown} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <ActivityFeed entries={PLATFORM_ACTIVITY} limit={8} />

        <div className="space-y-4">
          <Card>
            <CardHeader
              icon={Route}
              tone="primary"
              title={<T k="admin.home.departmentCoverage" />}
              subtitle={<T k="admin.home.departmentCoverageHelp" />}
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatTile
                size="sm"
                label={<T k="admin.home.coveredDepartments" />}
                value={<Digits value={departmentCoverage} />}
                icon={ShieldCheck}
                tone={departmentCoverage === DEPARTMENTS.length ? "success" : "warning"}
              />
              <StatTile
                size="sm"
                label={<T k="admin.home.totalDepartments" />}
                value={<Digits value={DEPARTMENTS.length} />}
                icon={Users}
                tone="info"
              />
            </div>
            <p className="mt-3 text-[0.6875rem] leading-relaxed text-subtle-foreground">
              <T k="admin.home.coverageNote" />
            </p>
          </Card>

          <Card>
            <CardHeader icon={Clock} tone="info" title={<T k="admin.home.quickGuide" />} />
            <ul className="mt-3 space-y-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <T k="admin.home.guideAddScholar" />
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <T k="admin.home.guideHoldRulings" />
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <T k="admin.home.guideMuftiCredentials" />
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              <Badge tone="admin" size="xs" dot>
                <T k="admin.home.adminOnly" />
              </Badge>
              <Badge tone="neutral" size="xs">
                <T k="admin.home.auditLogOn" />
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

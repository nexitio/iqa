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
import { T } from "@/components/i18n-text";
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
import { toBnDigits } from "@/lib/bn";
import { relativeTime } from "@/lib/utils";

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
      title: "আলেম আবেদন",
      description: "যোগ্যতা যাচাই করে প্রোফাইল অনুমোদন করুন — বিভাগ নির্ধারণ প্রশ্ন রাউটিং ঠিক করে।",
      count: pendingApplications.length,
      tone: "warning" as const,
      items: pendingApplications.slice(0, 3).map((a) => a.nameBn),
      more: pendingApplications.length > 3 ? pendingApplications.length - 3 : 0,
    },
    {
      href: "/admin/review",
      icon: ClipboardCheck,
      title: "পর্যালোচনা সারি",
      description: "প্রকাশের আগে প্রবন্ধ ও ফতোয়ার দলিল যাচাই করুন।",
      count: pendingReview.length,
      tone: "primary" as const,
      items: pendingReview.slice(0, 3).map((i) => i.titleBn),
      more: pendingReview.length > 3 ? pendingReview.length - 3 : 0,
      note: oldestReview ? `সবচেয়ে পুরনো জমা ${relativeTime(oldestReview.submittedAt, "bn")}` : undefined,
    },
    {
      href: "/admin/reports",
      icon: Flag,
      title: "মডারেশন রিপোর্ট",
      description: "ভুল তথ্য, দলাদলি ও আদববিরোধী আচরণের অভিযোগ নিষ্পত্তি করুন।",
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
        title="আজকের কাজ"
        description="যেসব বিষয়ে অ্যাডমিনের সিদ্ধান্ত প্রয়োজন"
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
                  <CountPill value={toBnDigits(queue.count)} tone={queue.tone} />
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
                  আরও {toBnDigits(queue.more)}টি অপেক্ষমাণ
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
                দেখুন ও সিদ্ধান্ত নিন
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
        description="প্ল্যাটফর্মের ব্যবহার, প্রশ্নপ্রবাহ, বিভাগভিত্তিক চাহিদা ও মডারেশন অবস্থা এক জায়গায়। এই সংখ্যাগুলোই ঠিক করে কোথায় নতুন আলেম দরকার।"
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
          title="দ্রুত মনোযোগ প্রয়োজন"
        >
          {toBnDigits(ADMIN_OVERVIEW.unansweredOver24h)}টি প্রশ্ন ২৪ ঘণ্টার বেশি উত্তরহীন — সংশ্লিষ্ট বিভাগে হয়তো
          আলেমের ঘাটতি আছে, রাউটিং পুনর্বিবেচনা করুন।{" "}
          {ADMIN_OVERVIEW.flaggedContent > 0
            ? `${toBnDigits(ADMIN_OVERVIEW.flaggedContent)}টি কনটেন্ট মডারেশনের অপেক্ষায় আছে।`
            : ""}
        </Callout>
      ) : null}

      <KpiGrid overview={ADMIN_OVERVIEW} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendPanel
          title="দৈনিক সক্রিয় ব্যবহারকারী"
          subtitle="গত ১৪ দিন — সন্ধ্যার পর সর্বোচ্চ সক্রিয়তা"
          data={ADMIN_OVERVIEW.dailyActiveTrend}
          tone="primary"
          chart="bar"
        />
        <TrendPanel
          title="দৈনিক নতুন প্রশ্ন"
          subtitle="গত ১৪ দিন — ধীরে ধীরে বাড়ছে চাহিদা"
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
              title="বিভাগ কভারেজ"
              subtitle="প্রতিটি বিভাগে অন্তত একজন আলেম থাকা রাউটিংয়ের জন্য জরুরি"
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatTile
                size="sm"
                label="কভার করা বিভাগ"
                value={toBnDigits(departmentCoverage)}
                icon={ShieldCheck}
                tone={departmentCoverage === DEPARTMENTS.length ? "success" : "warning"}
              />
              <StatTile
                size="sm"
                label="মোট বিভাগ"
                value={toBnDigits(DEPARTMENTS.length)}
                icon={Users}
                tone="info"
              />
            </div>
            <p className="mt-3 text-[0.6875rem] leading-relaxed text-subtle-foreground">
              প্রতিটি বিভাগে কমপক্ষে একজন আলেম থাকলে সংশ্লিষ্ট বিভাগের প্রশ্ন কখনো অনাদায়ী থাকে না।
            </p>
          </Card>

          <Card>
            <CardHeader icon={Clock} tone="info" title="সংক্ষিপ্ত নির্দেশিকা" />
            <ul className="mt-3 space-y-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                নতুন আলেম যোগ করলে অবশ্যই বিভাগ নির্ধারণ করুন — এটিই রাউটিংয়ের ভিত্তি।
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                দলিলবিহীন বা শর্তহীন রায় পর্যালোচনায় আটকে দিন।
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                প্রতিটি ফতোয়ার পেছনে মুফতির যোগ্যতা ও স্বাক্ষর প্রকাশ্য রাখুন।
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              <Badge tone="admin" size="xs" dot>
                শুধুমাত্র অ্যাডমিন
              </Badge>
              <Badge tone="neutral" size="xs">
                অডিট লগ চালু
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

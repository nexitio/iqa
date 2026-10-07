"use client";

import {
  Activity,
  AlertTriangle,
  BookOpen,
  ClipboardCheck,
  Clock,
  Cpu,
  Eye,
  Flag,
  GraduationCap,
  PenLine,
  Users,
  UserRound,
  Scale,
  Sparkles,
  Trophy,
  Flame,
} from "lucide-react";
import type {
  AdminOverview,
  ScholarDashboard,
  StatPoint,
  TimeSeriesPoint,
} from "@/lib/types";
import type { ActivityEntry } from "@/lib/data/admin";
import { useI18n } from "@/lib/i18n";
import { formatNumber, toBnDigits } from "@/lib/bn";
import { cn, relativeTime } from "@/lib/utils";
import {
  Badge,
  BarChart,
  Card,
  CardHeader,
  Delta,
  DonutChart,
  HorizontalBars,
  Legend,
  SectionHeader,
  Sparkline,
  StatTile,
} from "@/components/ui";
import type { Tone } from "@/components/ui";

/* ---------------------------------------------------------------- trends */

/** A chart card over a time series, with the latest value called out. */
export function TrendPanel({
  title,
  subtitle,
  data,
  tone = "primary",
  formatter,
  chart = "bar",
  className,
}: {
  title: string;
  subtitle?: string;
  data: TimeSeriesPoint[];
  tone?: Tone;
  formatter?: (value: number) => string;
  chart?: "bar" | "sparkline";
  className?: string;
}) {
  const { locale } = useI18n();
  const format = formatter ?? ((v: number) => formatNumber(v, locale));
  const latest = data.length > 0 ? data[data.length - 1].value : 0;
  const first = data.length > 1 ? data[0].value : latest;
  const change = first > 0 ? Math.round(((latest - first) / first) * 1000) / 10 : 0;

  return (
    <Card className={className}>
      <CardHeader
        title={title}
        subtitle={subtitle}
        action={
          <div className="text-right">
            <p className="font-display text-lg font-bold tabular leading-none text-foreground">
              {format(latest)}
            </p>
            <Delta value={change} className="mt-1.5" />
          </div>
        }
      />
      <div className="mt-5">
        {chart === "bar" ? (
          <BarChart
            data={data.map((point) => ({ label: point.label, value: point.value }))}
            tone={tone}
            height={150}
            formatValue={format}
          />
        ) : (
          <>
            <Sparkline data={data.map((point) => point.value)} tone={tone} height={72} />
            <div className="mt-2 flex justify-between text-[0.625rem] text-subtle-foreground">
              <span>{data[0]?.label}</span>
              <span>{data[data.length - 1]?.label}</span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

/** Stat tile with an inline sparkline trend. */
export function SparkStat({
  label,
  value,
  data,
  tone = "primary",
  delta,
  hint,
  className,
}: {
  label: string;
  value: string;
  data: number[];
  tone?: Tone;
  delta?: number;
  hint?: string;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col justify-between", className)}>
      <div>
        <p className="text-[0.75rem] font-medium text-muted-foreground">{label}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold tabular leading-none text-foreground">
            {value}
          </span>
          {delta !== undefined ? <Delta value={delta} /> : null}
        </div>
        {hint ? <p className="mt-1.5 text-[0.6875rem] text-subtle-foreground">{hint}</p> : null}
      </div>
      <Sparkline data={data} tone={tone} height={40} className="mt-3" />
    </Card>
  );
}

/* ------------------------------------------------------------ breakdowns */

export function DepartmentBreakdown({
  points,
  className,
}: {
  points: StatPoint[];
  className?: string;
}) {
  const { locale } = useI18n();
  const data = points.map((point) => ({ label: point.labelBn, value: point.value }));

  return (
    <Card className={className}>
      <SectionHeader
        size="sm"
        icon={Scale}
        title="শীর্ষ বিভাগসমূহ"
        description="প্রশ্নের পরিমাণ অনুসারে"
        className="mb-4"
      />
      <HorizontalBars
        data={data}
        tone="primary"
        formatValue={(value) => formatNumber(value, locale)}
      />
      <p className="mt-4 border-t border-border pt-3 text-[0.6875rem] text-subtle-foreground">
        সাপ্তাহিক হিসাব — মোট প্রশ্নের পরিমাণ অনুসারে সাজানো
      </p>
    </Card>
  );
}

export function DistrictBreakdown({
  points,
  className,
  topCount = 5,
}: {
  points: StatPoint[];
  className?: string;
  topCount?: number;
}) {
  const { t, locale } = useI18n();
  const top = points.slice(0, topCount);
  const rest = points.slice(topCount);
  const restTotal = rest.reduce((sum, point) => sum + point.value, 0);
  const tones: Tone[] = ["primary", "accent", "info", "success", "danger"];

  const segments = [
    ...top.map((point, index) => ({
      label: point.labelBn,
      value: point.value,
      tone: tones[index % tones.length],
    })),
    ...(restTotal > 0 ? [{ label: "অন্যান্য", value: restTotal, tone: "neutral" as Tone }] : []),
  ];

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <Card className={className}>
      <SectionHeader
        size="sm"
        icon={Users}
        title={t("admin.districtBreakdown")}
        description={`${formatNumber(points.length, locale)}টি জেলা`}
        className="mb-4"
      />
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <DonutChart
          segments={segments}
          size={160}
          thickness={20}
          centerValue={formatNumber(total, locale)}
          centerLabel="মোট ব্যবহারকারী"
          className="shrink-0"
        />
        <div className="w-full min-w-0 flex-1">
          <ul className="space-y-2.5">
            {segments.map((segment) => (
              <li key={segment.label} className="flex items-center gap-3">
                <span
                  className={cn(
                    "size-2.5 shrink-0 rounded-full",
                    segment.tone === "primary" && "bg-primary",
                    segment.tone === "accent" && "bg-accent",
                    segment.tone === "info" && "bg-info",
                    segment.tone === "success" && "bg-success",
                    segment.tone === "danger" && "bg-danger",
                    segment.tone === "neutral" && "bg-subtle-foreground",
                  )}
                />
                <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-foreground">
                  {segment.label}
                </span>
                <span className="shrink-0 text-[0.75rem] font-semibold tabular text-muted-foreground">
                  {formatNumber(segment.value, locale)}
                </span>
                <span className="w-10 shrink-0 text-right text-[0.6875rem] tabular text-subtle-foreground">
                  {total > 0 ? formatNumber(Math.round((segment.value / total) * 100), locale) : toBnDigits(0)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------- activity */

const ACTIVITY_KINDS: Record<
  ActivityEntry["kind"],
  { icon: typeof Activity; className: string }
> = {
  publish: { icon: PenLine, className: "bg-primary-soft text-primary" },
  scholar: { icon: GraduationCap, className: "bg-role-scholar-soft text-role-scholar" },
  moderation: { icon: ClipboardCheck, className: "bg-warning-soft text-warning-soft-foreground" },
  user: { icon: UserRound, className: "bg-role-user-soft text-role-user" },
  system: { icon: Cpu, className: "bg-surface-3 text-muted-foreground" },
};

export function ActivityFeed({
  entries,
  className,
  limit,
}: {
  entries: ActivityEntry[];
  className?: string;
  limit?: number;
}) {
  const { t, locale } = useI18n();
  const list = limit ? entries.slice(0, limit) : entries;

  return (
    <Card className={className}>
      <SectionHeader
        size="sm"
        icon={Activity}
        title={t("admin.recentActivity")}
        className="mb-4"
      />
      <ol className="relative space-y-4 border-l border-border pl-5">
        {list.map((entry) => {
          const meta = ACTIVITY_KINDS[entry.kind];
          const Icon = meta.icon;
          return (
            <li key={entry.id} className="relative">
              <span
                className={cn(
                  "absolute -left-[1.9375rem] grid size-7 place-items-center rounded-full ring-4 ring-surface",
                  meta.className,
                )}
              >
                <Icon className="size-3.5" aria-hidden />
              </span>
              <p className="text-[0.8125rem] leading-relaxed text-foreground">
                <span className="font-semibold">{entry.actorBn}</span>{" "}
                <span className="text-muted-foreground">{entry.actionBn}</span>
              </p>
              <p className="mt-0.5 text-[0.75rem] font-medium text-foreground/90">{entry.targetBn}</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-[0.6875rem] text-subtle-foreground">
                <Clock className="size-3" aria-hidden />
                {relativeTime(entry.at, locale)}
              </p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

/* ---------------------------------------------------------------- KPI grid */

export function KpiGrid({
  overview,
  className,
}: {
  overview: AdminOverview;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const n = (value: number) => formatNumber(value, locale);

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      <StatTile
        label={t("admin.totalUsers")}
        value={n(overview.totalUsers)}
        icon={Users}
        tone="primary"
        hint={t("label.allTime")}
      />
      <StatTile
        label={t("admin.activeToday")}
        value={n(overview.activeToday)}
        icon={Activity}
        tone="success"
        delta={12.4}
        hint={t("label.today")}
      />
      <StatTile
        label={t("admin.totalScholars")}
        value={n(overview.totalScholars)}
        icon={GraduationCap}
        tone="scholar"
        hint={`${n(overview.pendingScholarApplications)} ${t("admin.pendingApplications").toLowerCase()}`}
        href="/admin/scholars"
      />
      <StatTile
        label={t("admin.quranReads")}
        value={n(overview.quranReads7d)}
        icon={BookOpen}
        tone="accent"
        delta={8.1}
        hint={t("label.thisWeek")}
      />

      <StatTile
        label={t("admin.openQuestions")}
        value={n(overview.openQuestions)}
        icon={Sparkles}
        tone="info"
        hint={`${n(overview.unansweredOver24h)} উত্তরহীন ২৪ ঘন্টার বেশি`}
        href="/admin/questions"
      />
      <StatTile
        label={t("admin.unanswered24h")}
        value={n(overview.unansweredOver24h)}
        icon={AlertTriangle}
        tone={overview.unansweredOver24h > 20 ? "warning" : "success"}
        hint="রাউটিং পুনর্বিবেচনা প্রয়োজন"
      />
      <StatTile
        label={t("admin.pendingReview")}
        value={n(overview.pendingReview)}
        icon={ClipboardCheck}
        tone="warning"
        hint={`${n(overview.publishedFatwas)} ফতোয়া প্রকাশিত`}
        href="/admin/review"
      />
      <StatTile
        label={t("admin.flagged")}
        value={n(overview.flaggedContent)}
        icon={Flag}
        tone={overview.flaggedContent > 0 ? "danger" : "success"}
        hint="মডারেশনের অপেক্ষায়"
        href="/admin/reports"
      />
    </div>
  );
}

/* ------------------------------------------------- scholar performance */

export function ScholarPerformancePanel({
  dashboard,
  className,
}: {
  dashboard: ScholarDashboard;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const n = (value: number, digits = 0) =>
    digits > 0 ? toBnDigits(value.toFixed(digits)) : formatNumber(value, locale);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={t("console.routedQuestions")}
          value={n(dashboard.routedQuestions)}
          icon={Sparkles}
          tone="primary"
          hint={t("console.priorityInbox")}
          href="/scholar/questions"
        />
        <StatTile
          label={t("console.answeredThisWeek")}
          value={n(dashboard.answeredThisWeek)}
          icon={PenLine}
          tone="success"
          hint={t("label.thisWeek")}
        />
        <StatTile
          label={t("console.avgResponse")}
          value={`${n(dashboard.avgResponseHours, 1)} ${t("console.hours")}`}
          icon={Clock}
          tone="info"
          hint="রাউটেড প্রশ্নে গড়"
        />
        <StatTile
          label={t("console.helpfulRate")}
          value={`${n(dashboard.helpfulRate)}%`}
          icon={Trophy}
          tone="accent"
          hint="ব্যবহারকারীর মতামত অনুসারে"
        />
        <StatTile
          label={t("label.views")}
          value={n(dashboard.totalViews)}
          icon={Eye}
          tone="primary"
        />
        <StatTile
          label={t("console.newFollowers")}
          value={n(dashboard.newFollowers)}
          icon={Users}
          tone="scholar"
          delta={6.2}
        />
        <StatTile
          label={t("console.pendingDrafts")}
          value={n(dashboard.pendingDrafts)}
          icon={PenLine}
          tone={dashboard.pendingDrafts > 0 ? "warning" : "success"}
          hint="প্রকাশের অপেক্ষায়"
          href="/scholar/articles"
        />
        <StatTile
          label={t("console.streak")}
          value={`${n(dashboard.streakDays)} ${t("label.days")}`}
          icon={Flame}
          tone="danger"
          hint="টানা উত্তর দেওয়ার ধারা"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendPanel
          title="সাপ্তাহিক উত্তর"
          subtitle="গত ৭ দিনে প্রদত্ত উত্তর"
          data={dashboard.weeklyAnswers}
          tone="primary"
          chart="bar"
        />
        <Card>
          <SectionHeader
            size="sm"
            icon={Scale}
            title={t("console.yourDepartments")}
            description="আপনার উত্তরসমূহের বিভাগভিত্তিক ভাগ"
            className="mb-4"
          />
          <HorizontalBars
            data={dashboard.topDepartments.map((point) => ({
              label: point.labelBn,
              value: point.value,
            }))}
            tone="accent"
            formatValue={(value) => `${formatNumber(value, locale)}%`}
          />
          <div className="mt-4 border-t border-border pt-3">
            <Legend
              items={[
                { label: "এই সপ্তাহ", tone: "accent", value: formatNumber(dashboard.answeredThisWeek, locale) },
                { label: "রাউটেড", tone: "primary", value: formatNumber(dashboard.routedQuestions, locale) },
              ]}
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge tone="success" size="xs">
              সক্রিয়
            </Badge>
            <span className="text-[0.6875rem] text-subtle-foreground">
              আপনি এই সপ্তাহে {formatNumber(dashboard.answeredThisWeek, locale)}টি প্রশ্নের উত্তর দিয়েছেন
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

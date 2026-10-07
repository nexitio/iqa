"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  Clock,
  MessageCircleQuestion,
  Route,
  Scale,
  Users,
} from "lucide-react";
import type { Question } from "@/lib/types";
import { ROUTING_CANDIDATES } from "@/lib/data/questions";
import { getDepartment } from "@/lib/data/departments";
import { getScholar } from "@/lib/data/scholars";
import { findDistrict, formatNumber, toBnDigits } from "@/lib/bn";
import { useI18n } from "@/lib/i18n";
import { cn, relativeTime } from "@/lib/utils";
import { ScholarMiniCard } from "@/components/people";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  Chip,
  EmptyState,
  Progress,
  StatusBadge,
} from "@/components/ui";

type FilterId = "all" | "unanswered" | "urgent" | "fatwa" | "routed-none";

const FILTERS: { id: FilterId; label: string; tone?: "danger" | "warning" | "accent" }[] = [
  { id: "all", label: "সব প্রশ্ন" },
  { id: "unanswered", label: "উত্তরহীন" },
  { id: "routed-none", label: "রাউট হয়নি", tone: "danger" },
  { id: "urgent", label: "জরুরি", tone: "warning" },
  { id: "fatwa", label: "ফতোয়া চাওয়া", tone: "accent" },
];

const HOURS_24 = 24 * 60 * 60 * 1000;

/*
 * These live at module scope and take `now` explicitly rather than closing over
 * it. A component-local helper would be a new identity on every render, which is
 * exactly what makes dependency arrays lie — and it is why the memos below used
 * to need lint suppressions. Taking the clock as an argument keeps them pure and
 * the arrays complete.
 */

/** Whole hours a question has been waiting, as of `now`. */
function ageHoursOf(iso: string, now: number) {
  return Math.floor((now - new Date(iso).getTime()) / (60 * 60 * 1000));
}

/** Unanswered for more than a day — the backlog that needs a nudge. */
function isStaleQuestion(question: Question, now: number) {
  return question.answerCount === 0 && now - new Date(question.createdAt).getTime() > HOURS_24;
}

/** No scholar is a viable routing candidate for this question. */
function hasNoRouting(question: Question) {
  return (ROUTING_CANDIDATES[question.id] ?? []).length === 0;
}

/**
 * Question pipeline monitor.
 *
 * An admin needs to see whether routing is actually reaching anyone, so each
 * row shows the question's status alongside its top routed scholar and the size
 * of its routing queue. The nudge action is real local state: nudging a question
 * records it and shows the effect, rather than pressing a control that does
 * nothing.
 */
export function QuestionMonitor({
  questions,
  /** Server render time. Passed in so the client never reads a clock during render. */
  now,
  className,
}: {
  questions: Question[];
  now: number;
  className?: string;
}) {
  const { pick, t, locale } = useI18n();
  const [filter, setFilter] = useState<FilterId>("all");
  const [nudged, setNudged] = useState<string[]>([]);

  const counts = useMemo(
    () => ({
      all: questions.length,
      unanswered: questions.filter((q) => q.answerCount === 0).length,
      "routed-none": questions.filter(hasNoRouting).length,
      urgent: questions.filter((q) => q.urgency === "urgent").length,
      fatwa: questions.filter((q) => q.fatwaRequested).length,
    }),
    [questions],
  );

  const stale = useMemo(
    () =>
      questions
        .filter((question) => isStaleQuestion(question, now))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [questions, now],
  );

  const visible = useMemo(() => {
    const list = questions.filter((question) => {
      switch (filter) {
        case "unanswered":
          return question.answerCount === 0;
        case "routed-none":
          return hasNoRouting(question);
        case "urgent":
          return question.urgency === "urgent";
        case "fatwa":
          return question.fatwaRequested;
        default:
          return true;
      }
    });
    // Oldest first so the backlog is dealt with in order.
    return [...list].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [questions, filter]);

  return (
    <div className={cn("space-y-4", className)}>
      {stale.length > 0 ? (
        <Callout tone="warning" icon={AlertTriangle} title="২৪ ঘণ্টার বেশি উত্তরহীন প্রশ্ন">
          {toBnDigits(stale.length)}টি প্রশ্ন একদিনের বেশি সময় ধরে উত্তরহীন। নিচের তালিকায় এই প্রশ্নগুলোর বিভাগ দেখে নিন —
          যে বিভাগে আলেম সংকট, সেখানে নতুন আলেম যোগ করতে হবে।
        </Callout>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((option) => (
          <Button
            key={option.id}
            size="sm"
            variant={filter === option.id ? "primary" : "outline"}
            onClick={() => setFilter(option.id)}
            aria-pressed={filter === option.id}
          >
            {option.label}
            <span className="ml-1 tabular opacity-70">{toBnDigits(counts[option.id])}</span>
          </Button>
        ))}
      </div>

      {stale.length > 0 ? (
        <Card>
          <CardHeader
            icon={Clock}
            tone="warning"
            title="উত্তরহীন ব্যাকলগ"
            subtitle="সর্বোচ্চ অপেক্ষার প্রশ্নগুলো আগে — কোন বিভাগে আলেম দরকার তা এখানেই বোঝা যায়"
          />
          <ul className="mt-4 space-y-2.5">
            {stale.slice(0, 5).map((question) => {
              const departments = question.departmentIds
                .map((slug) => getDepartment(slug))
                .filter((d): d is NonNullable<typeof d> => Boolean(d));
              const hasAlm = departments.some((d) => d.scholarIds.length > 0);
              const wasNudged = nudged.includes(question.id);
              return (
                <li
                  key={question.id}
                  className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface-2 p-3.5"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning-soft-foreground">
                    <Clock className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.8125rem] font-semibold text-foreground">
                      {question.titleBn}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] text-subtle-foreground">
                      <span className="tabular">
                        অপেক্ষা {toBnDigits(ageHoursOf(question.createdAt, now))} ঘণ্টা
                      </span>
                      <span aria-hidden>·</span>
                      <span>{pick(findDistrict(question.askerDistrict).name)}</span>
                      <span aria-hidden>·</span>
                      {departments.map((d) => (
                        <Chip key={d.slug} size="sm" tone={d.tone} className="h-5 px-1.5 text-[0.625rem]">
                          {pick(d.shortName)}
                        </Chip>
                      ))}
                    </span>
                  </span>
                  {!hasAlm ? (
                    <Badge tone="danger" size="xs" icon={AlertTriangle}>
                      বিভাগে আলেম নেই
                    </Badge>
                  ) : null}
                  <Button
                    size="xs"
                    variant={wasNudged ? "outline" : "soft"}
                    icon={BellRing}
                    disabled={wasNudged}
                    onClick={() => setNudged((prev) => [...prev, question.id])}
                  >
                    {wasNudged ? "তাগাদা পাঠানো হয়েছে" : "আলেমদের তাগাদা দিন"}
                  </Button>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          icon={MessageCircleQuestion}
          title="এই ফিল্টারে কোনো প্রশ্ন নেই"
          description="রাউটিং স্বাভাবিক আছে — অন্য ফিল্টার দেখুন।"
          className="rounded-panel border border-border bg-surface"
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((question) => {
            const candidates = ROUTING_CANDIDATES[question.id] ?? [];
            const top = candidates[0];
            const topScholar = top ? getScholar(top.scholarId) : undefined;
            const departments = question.departmentIds
              .map((slug) => getDepartment(slug))
              .filter((d): d is NonNullable<typeof d> => Boolean(d));
            const departmentsWithScholars = departments.filter((d) => d.scholarIds.length > 0).length;
            const coverage =
              departments.length > 0
                ? Math.round((departmentsWithScholars / departments.length) * 100)
                : 0;

            return (
              <li key={question.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          status={question.status}
                          label={
                            {
                              open: t("status.open"),
                              routed: t("status.routed"),
                              answered: t("status.answered"),
                              closed: t("status.closed"),
                            }[question.status]
                          }
                          size="xs"
                        />
                        {question.urgency === "urgent" ? (
                          <Badge tone="danger" size="xs" icon={AlertTriangle}>
                            {t("label.urgent")}
                          </Badge>
                        ) : null}
                        {question.fatwaRequested ? (
                          <Badge tone="accent" size="xs" icon={Scale}>
                            {t("label.fatwaRequested")}
                          </Badge>
                        ) : null}
                        {candidates.length === 0 ? (
                          <Badge tone="danger" size="xs" icon={Route}>
                            রাউট হয়নি
                          </Badge>
                        ) : null}
                        {isStaleQuestion(question, now) ? (
                          <Badge tone="warning" size="xs" icon={Clock}>
                            {toBnDigits(ageHoursOf(question.createdAt, now))} ঘণ্টা অপেক্ষা
                          </Badge>
                        ) : null}
                      </div>

                      <p className="mt-2.5 font-display text-[0.9375rem] font-semibold leading-snug text-foreground">
                        {question.titleBn}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[0.6875rem] text-subtle-foreground">
                        <span>{pick(findDistrict(question.askerDistrict).name)}</span>
                        <span aria-hidden>·</span>
                        <span>{relativeTime(question.createdAt, locale)}</span>
                        <span aria-hidden>·</span>
                        <span className="tabular">
                          {formatNumber(question.views, locale)} জন দেখেছেন
                        </span>
                        <span aria-hidden>·</span>
                        <span className="tabular">
                          {formatNumber(question.answerCount, locale)}টি উত্তর
                        </span>
                      </p>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {departments.map((department) => (
                          <Chip
                            key={department.slug}
                            href={`/departments/${department.slug}`}
                            size="sm"
                            tone={department.tone}
                            className="h-6 px-2 text-[0.6875rem]"
                          >
                            {pick(department.shortName)}
                            {department.scholarIds.length === 0 ? " · আলেম নেই" : ""}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className="w-full shrink-0 space-y-2.5 xl:w-72">
                      <div className="rounded-card border border-border bg-surface-2 p-3">
                        <p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                          <Users className="size-3.5" aria-hidden />
                          রাউটিং
                        </p>
                        {candidates.length === 0 ? (
                          <p className="mt-1.5 text-[0.75rem] leading-relaxed text-danger">
                            কোনো আলেম খুঁজে পাওয়া যায়নি — সংশ্লিষ্ট বিভাগে আলেম যোগ করা প্রয়োজন।
                          </p>
                        ) : (
                          <>
                            <p className="mt-1.5 text-[0.75rem] text-muted-foreground">
                              {formatNumber(candidates.length, locale)} জন আলেমের কাছে পাঠানো হয়েছে
                            </p>
                            {topScholar ? (
                              <div className="mt-2.5 border-t border-border pt-2.5">
                                <ScholarMiniCard scholar={topScholar} />
                                <p className="mt-1.5 text-[0.6875rem] tabular text-subtle-foreground">
                                  মিল {formatNumber(top.score, locale)}% · অগ্রাধিকার{" "}
                                  {toBnDigits(top.priority)}
                                </p>
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>

                      <div className="rounded-card border border-border bg-surface-2 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                            বিভাগ কভারেজ
                          </p>
                          <span className="text-[0.6875rem] tabular text-muted-foreground">
                            {toBnDigits(coverage)}%
                          </span>
                        </div>
                        <Progress
                          className="mt-2"
                          value={coverage}
                          tone={coverage === 100 ? "success" : coverage > 0 ? "warning" : "danger"}
                        />
                        <p className="mt-2 text-[0.625rem] leading-relaxed text-subtle-foreground">
                          {toBnDigits(departmentsWithScholars)}/{toBnDigits(departments.length)} বিভাগে আলেম আছেন
                        </p>
                      </div>

                      <Button
                        href={`/questions/${question.slug}`}
                        size="sm"
                        variant="outline"
                        full
                        iconRight={ArrowRight}
                      >
                        প্রশ্নটি দেখুন
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

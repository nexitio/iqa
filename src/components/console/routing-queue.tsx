"use client";

import { useMemo, useState } from "react";
import {
  Bookmark,
  Check,
  Clock,
  Eye,
  Flag,
  MapPin,
  MessageCircleQuestion,
  Scale,
  Sparkles,
  ThumbsDown,
  UserRound,
  Zap,
} from "lucide-react";
import type { Question, RoutingCandidate } from "@/lib/types";
import { getDepartment } from "@/lib/data/departments";
import { useI18n } from "@/lib/i18n";
import { findDistrict, formatNumber } from "@/lib/bn";
import { cn, relativeTime, truncate } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  Chip,
  CountPill,
  Progress,
  StatusBadge,
} from "@/components/ui";

/**
 * Question routing surface.
 *
 * When a question is asked, the platform scores every scholar on department
 * overlap, topic expertise, current load and historic response time. The
 * highest-scoring scholars see the question first — and crucially, they are told
 * *why* it reached them, which keeps the ranking trustworthy rather than magic.
 */

/** Position badge, e.g. "অগ্রাধিকার ১". */
export function PriorityBadge({ priority, className }: { priority: number; className?: string }) {
  const { locale } = useI18n();
  const tone = priority === 1 ? "danger" : priority === 2 ? "warning" : "neutral";
  return (
    <Badge tone={tone} size="sm" icon={Zap} className={className}>
      অগ্রাধিকার {formatNumber(priority, locale)}
    </Badge>
  );
}

/** 0–100 routing score rendered as a labelled bar. */
export function MatchScoreBar({ score, className }: { score: number; className?: string }) {
  const { locale } = useI18n();
  const clamped = Math.min(100, Math.max(0, score));
  const tone = clamped >= 85 ? "success" : clamped >= 65 ? "primary" : "info";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Progress value={clamped} tone={tone} size="sm" className="min-w-24 flex-1" />
      <span className="shrink-0 text-[0.75rem] font-semibold tabular text-foreground">
        মিল {formatNumber(clamped, locale)}%
      </span>
    </div>
  );
}

/** Why this question was routed to this scholar. */
export function RoutingReasons({
  reasons,
  score,
  className,
}: {
  reasons: string[];
  score?: number;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={cn("rounded-card border border-border bg-surface-2 p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-foreground">
          <Sparkles className="size-4 text-accent" aria-hidden />
          {t("console.whyYou")}
        </p>
        {score !== undefined ? (
          <span className="text-[0.6875rem] font-medium text-subtle-foreground">
            {t("label.matchScore")}
          </span>
        ) : null}
      </div>

      {score !== undefined ? <MatchScoreBar score={score} className="mt-3" /> : null}

      <ul className="mt-3.5 space-y-2">
        {reasons.map((reason) => (
          <li key={reason} className="flex items-start gap-2.5">
            <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-success-soft text-success-soft-foreground">
              <Check className="size-2.5" strokeWidth={3.4} aria-hidden />
            </span>
            <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A routed question as it appears in a scholar's priority inbox. */
export function RoutingQueueCard({
  question,
  candidates,
  /** The scholar's own position in the queue; defaults to first. */
  rank = 1,
  className,
  onAnswer,
  onSave,
  onDecline,
}: {
  question: Question;
  candidates: RoutingCandidate[];
  rank?: number;
  className?: string;
  onAnswer?: (question: Question) => void;
  onSave?: (question: Question) => void;
  onDecline?: (question: Question) => void;
}) {
  const { t, pick, locale } = useI18n();

  // The entry describing *this* scholar is the one at `rank`.
  const me = useMemo(
    () => candidates.find((c) => c.priority === rank) ?? candidates[0],
    [candidates, rank],
  );

  const departments = question.departmentIds
    .map((id) => getDepartment(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const district = findDistrict(question.askerDistrict);
  const statusLabel = t(`status.${question.status}`);

  return (
    <Card interactive className={cn("flex flex-col", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {me ? <PriorityBadge priority={me.priority} /> : null}
          <StatusBadge status={question.status} label={statusLabel} />
          {question.urgency === "urgent" ? (
            <Badge tone="danger" size="sm" icon={Zap}>
              {t("label.urgent")}
            </Badge>
          ) : null}
          {question.fatwaRequested ? (
            <Badge tone="accent" size="sm" icon={Scale}>
              {t("label.fatwaRequested")}
            </Badge>
          ) : null}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.6875rem] text-subtle-foreground">
          <Clock className="size-3.5" aria-hidden />
          {relativeTime(question.createdAt, locale)}
        </span>
      </header>

      <div className="mt-3.5">
        <h3 className="font-display text-[1.0625rem] font-semibold leading-snug text-foreground">
          {question.titleBn}
        </h3>
        <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {truncate(question.bodyBn, 240)}
        </p>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-subtle-foreground">
          <MapPin className="size-3.5" aria-hidden />
          {pick(district.name)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-subtle-foreground">
          <Eye className="size-3.5" aria-hidden />
          {formatNumber(question.views, locale)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-subtle-foreground">
          <UserRound className="size-3.5" aria-hidden />
          {question.visibility === "anonymous" ? t("label.anonymous") : t("label.questioner")}
        </span>
        {question.answerCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-subtle-foreground">
            <MessageCircleQuestion className="size-3.5" aria-hidden />
            {formatNumber(question.answerCount, locale)} {t("qa.answerCount")}
          </span>
        ) : (
          <Badge tone="warning" size="xs" icon={Flag}>
            উত্তর হয়নি
          </Badge>
        )}
      </div>

      {departments.length > 0 ? (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {departments.map((department) => (
            <Chip key={department.slug} size="sm" tone={department.tone} href={`/departments/${department.slug}`}>
              {pick(department.name)}
            </Chip>
          ))}
        </div>
      ) : null}

      {me ? <RoutingReasons reasons={me.reasonsBn} score={me.score} className="mt-4" /> : null}

      <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Button size="sm" icon={MessageCircleQuestion} onClick={() => onAnswer?.(question)}>
          {t("action.answer")}
        </Button>
        <Button variant="outline" size="sm" icon={Bookmark} onClick={() => onSave?.(question)}>
          {t("action.save")}
        </Button>
        <Button variant="ghost" size="sm" icon={ThumbsDown} onClick={() => onDecline?.(question)}>
          আমার জন্য নয়
        </Button>
        <Button variant="link" size="sm" href={`/questions/${question.slug}`} className="ml-auto">
          {t("action.readMore")}
        </Button>
      </footer>
    </Card>
  );
}

/**
 * Admin view of a scholar's routing footprint: which department questions will
 * reach them and who else competes for the same queue.
 */
export function RoutingPreview({
  departmentNames,
  topScholars,
  className,
}: {
  departmentNames: string[];
  topScholars: { name: string; score: number }[];
  className?: string;
}) {
  const { t, locale } = useI18n();

  return (
    <div className={cn("rounded-card border border-border bg-surface-2 p-4", className)}>
      <p className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-foreground">
        <Sparkles className="size-4 text-primary" aria-hidden />
        {t("admin.routingPreview")}
      </p>
      <p className="mt-1 text-[0.75rem] leading-relaxed text-muted-foreground">
        {t("admin.routingPreviewHelp")}
      </p>

      {departmentNames.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {departmentNames.map((name) => (
            <Chip key={name} size="sm" tone="primary">
              {name}
            </Chip>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[0.75rem] text-subtle-foreground">কোনো বিভাগ নির্বাচন করা হয়নি</p>
      )}

      {topScholars.length > 0 ? (
        <ol className="mt-4 space-y-2.5 border-t border-border pt-4">
          {topScholars.map((scholar, index) => (
            <li key={scholar.name} className="flex items-center gap-3">
              <CountPill value={formatNumber(index + 1, locale)} tone={index === 0 ? "primary" : "neutral"} />
              <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium text-foreground">
                {scholar.name}
              </span>
              <span className="shrink-0 text-[0.75rem] font-semibold tabular text-muted-foreground">
                {formatNumber(Math.round(scholar.score), locale)}%
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

type InboxFilterId = "all" | "urgent" | "fatwa" | "today" | "unanswered";

const INBOX_FILTERS: { id: InboxFilterId; labelBn: string; labelEn: string }[] = [
  { id: "all", labelBn: "সব প্রশ্ন", labelEn: "All" },
  { id: "urgent", labelBn: "জরুরি", labelEn: "Urgent" },
  { id: "fatwa", labelBn: "ফতোয়া চাওয়া", labelEn: "Fatwa requested" },
  { id: "today", labelBn: "আজ এসেছে", labelEn: "New today" },
  { id: "unanswered", labelBn: "উত্তর হয়নি", labelEn: "Unanswered" },
];

function isToday(iso: string) {
  const then = new Date(iso);
  const now = new Date();
  return (
    then.getFullYear() === now.getFullYear() &&
    then.getMonth() === now.getMonth() &&
    then.getDate() === now.getDate()
  );
}

/** Filter rail for the scholar's priority inbox. */
export function QuestionInboxFilters({
  questions,
  className,
  active,
  onChange,
}: {
  questions?: Question[];
  className?: string;
  active?: InboxFilterId;
  onChange?: (filter: InboxFilterId) => void;
}) {
  const { locale } = useI18n();
  const [internal, setInternal] = useState<InboxFilterId>("all");
  const current = active ?? internal;

  const counts = useMemo(() => {
    const list = questions ?? [];
    return {
      all: list.length,
      urgent: list.filter((q) => q.urgency === "urgent").length,
      fatwa: list.filter((q) => q.fatwaRequested).length,
      today: list.filter((q) => isToday(q.createdAt)).length,
      unanswered: list.filter((q) => q.answerCount === 0).length,
    } as Record<InboxFilterId, number>;
  }, [questions]);

  return (
    <div className={cn("no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1", className)}>
      {INBOX_FILTERS.map((filter) => {
        const selected = current === filter.id;
        const count = questions ? counts[filter.id] : undefined;
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              setInternal(filter.id);
              onChange?.(filter.id);
            }}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[0.8125rem] font-medium transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {locale === "bn" ? filter.labelBn : filter.labelEn}
            {count !== undefined ? (
              <CountPill value={formatNumber(count, locale)} tone={selected ? "primary" : "neutral"} />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

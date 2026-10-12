"use client";

import { useMemo, useState } from "react";
import type { Question, RoutingCandidate } from "@/lib/types";
import { MessageCircleQuestion, Scale, Sparkles, Zap } from "lucide-react";
import { QuestionInboxFilters, RoutingQueueCard } from "@/components/console";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  Progress,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/bn";

/**
 * The scholar's priority inbox.
 *
 * Each item already carries the routing rationale that brought it here, so the
 * scholar sees *why* they were chosen alongside the question itself. Filtering
 * happens client-side over the pre-resolved queue.
 */

/** One routed question, flattened for the client. */
export interface InboxItem {
  question: Question;
  candidates: RoutingCandidate[];
  /** This scholar's position in the routing queue. */
  priority: number;
  /** This scholar's 0–100 match score. */
  score: number;
}

type FilterId = "all" | "urgent" | "fatwa" | "today" | "unanswered";

function isToday(iso: string) {
  const then = new Date(iso);
  const now = new Date();
  return (
    then.getFullYear() === now.getFullYear() &&
    then.getMonth() === now.getMonth() &&
    then.getDate() === now.getDate()
  );
}

export function QuestionInbox({
  items,
  departmentNames,
}: {
  items: InboxItem[];
  /** The scholar's department labels, in Bangla, resolved on the server. */
  departmentNames: string[];
}) {
  const { t, tList, locale } = useI18n();
  const [active, setActive] = useState<FilterId>("all");

  const questions = useMemo(() => items.map((item) => item.question), [items]);

  const filtered = useMemo(() => {
    switch (active) {
      case "urgent":
        return items.filter((item) => item.question.urgency === "urgent");
      case "fatwa":
        return items.filter((item) => item.question.fatwaRequested);
      case "today":
        return items.filter((item) => isToday(item.question.createdAt));
      case "unanswered":
        return items.filter((item) => item.question.answerCount === 0);
      default:
        return items;
    }
  }, [items, active]);

  const unanswered = items.filter((item) => item.question.answerCount === 0).length;
  const urgent = items.filter((item) => item.question.urgency === "urgent").length;
  const fatwaRequested = items.filter((item) => item.question.fatwaRequested).length;
  const answeredRate =
    items.length > 0 ? Math.round(((items.length - unanswered) / items.length) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="min-w-0 space-y-4">
        <Card>
          <CardHeader
            icon={Sparkles}
            tone="accent"
            title={t("console.priorityInbox")}
            subtitle={t("scholar.tools.inbox.subtitle")}
            action={
              <Badge tone="primary" size="sm">
                {t("scholar.tools.inbox.count", { count: items.length })}
              </Badge>
            }
          />
          <div className="mt-4">
            <QuestionInboxFilters
              questions={questions}
              active={active}
              onChange={setActive}
              className="border-t border-border pt-4"
            />
          </div>
        </Card>

        {filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={MessageCircleQuestion}
              title={t("scholar.tools.inbox.emptyTitle")}
              description={t("scholar.tools.inbox.emptyDescription")}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <RoutingQueueCard
                key={item.question.id}
                question={item.question}
                candidates={item.candidates}
                rank={item.priority}
              />
            ))}
          </div>
        )}
      </div>

      {/* Workload rail */}
      <aside className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <StatTile
            label={t("console.routedQuestions")}
            value={formatNumber(items.length, locale)}
            icon={Sparkles}
            tone="primary"
            hint={t("scholar.tools.inbox.unansweredHint", { count: unanswered })}
          />
          <StatTile
            label={t("scholar.tools.inbox.urgentLabel")}
            value={formatNumber(urgent, locale)}
            icon={Zap}
            tone={urgent > 0 ? "danger" : "success"}
            hint={t("scholar.tools.inbox.urgentHint")}
          />
          <StatTile
            label={t("scholar.tools.inbox.fatwaLabel")}
            value={formatNumber(fatwaRequested, locale)}
            icon={Scale}
            tone="accent"
            hint={t("scholar.tools.inbox.fatwaHint")}
          />
        </div>

        <Card>
          <CardHeader
            icon={Sparkles}
            title={t("console.yourDepartments")}
            subtitle={t("scholar.tools.inbox.departmentsSubtitle")}
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {departmentNames.map((name) => (
              <Badge key={name} tone="primary" size="xs">
                {name}
              </Badge>
            ))}
          </div>
          <div className="mt-5">
            <p className="text-[0.75rem] font-medium text-muted-foreground">
              {t("scholar.tools.inbox.answerRate")}
            </p>
            <p className="mt-1.5 font-display text-2xl font-bold tabular text-foreground">
              {formatNumber(answeredRate, locale)}%
            </p>
            <Progress value={answeredRate} tone="success" size="sm" className="mt-2.5" />
            <p className="mt-2 text-[0.6875rem] leading-relaxed text-subtle-foreground">
              {t("scholar.tools.inbox.answerRateHint")}
            </p>
          </div>
        </Card>

        <Card>
          <SectionHeader
            size="sm"
            icon={Sparkles}
            title={t("scholar.tools.inbox.howRoutingTitle")}
            className="mb-3"
          />
          <ol className="space-y-3">
            {tList("scholar.tools.inbox.routingSteps").map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-[0.6875rem] font-bold text-primary">
                  {formatNumber(index + 1, locale)}
                </span>
                <span className="text-[0.75rem] leading-relaxed text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      </aside>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Compass, Inbox, MessageCircleQuestion } from "lucide-react";
import type { Question, QuestionStatus } from "@/lib/types";
import { DEPARTMENTS, getDepartment } from "@/lib/data/departments";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/bn";
import { ButtonGroup, Chip, ChipList, EmptyState, SegmentButton } from "@/components/ui";
import { QuestionCard } from "@/components/knowledge";

const STATUSES: { id: "all" | QuestionStatus; labelBn: string; labelEn: string }[] = [
  { id: "all", labelBn: "সব প্রশ্ন", labelEn: "All questions" },
  { id: "answered", labelBn: "উত্তর দেওয়া", labelEn: "Answered" },
  { id: "routed", labelBn: "আলেমের কাছে", labelEn: "Routed" },
  { id: "open", labelBn: "খোলা", labelEn: "Open" },
  { id: "closed", labelBn: "সম্পন্ন", labelEn: "Closed" },
];

/**
 * Status + department filtering for the Q&A index.
 *
 * Client-side because the whole dataset is already local; once the backend
 * lands these become query parameters against the API.
 */
export function QuestionBrowser({ questions }: { questions: Question[] }) {
  const { t, isBn, pick, locale } = useI18n();
  const [status, setStatus] = useState<"all" | QuestionStatus>("all");
  const [department, setDepartment] = useState<string | null>(null);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: questions.length };
    for (const question of questions) {
      base[question.status] = (base[question.status] ?? 0) + 1;
    }
    return base;
  }, [questions]);

  // Only offer departments that actually carry questions, so a filter can never
  // dead-end into an empty list.
  const activeDepartments = useMemo(() => {
    const used = new Set(questions.flatMap((q) => q.departmentIds));
    return DEPARTMENTS.filter((d) => used.has(d.slug) || used.has(d.id));
  }, [questions]);

  // Questions tag themselves with department slugs, while a Department also has
  // its own id — accept either so a filter never silently misses a match.
  const departmentKeys = useMemo(() => {
    if (!department) return null;
    const match = getDepartment(department);
    return match ? [match.slug, match.id] : [department];
  }, [department]);

  const filtered = useMemo(() => {
    return questions.filter((question) => {
      if (status !== "all" && question.status !== status) return false;
      if (departmentKeys) {
        if (!question.departmentIds.some((id) => departmentKeys.includes(id))) return false;
      }
      return true;
    });
  }, [questions, status, departmentKeys]);

  const hasFilters = status !== "all" || department !== null;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <ButtonGroup className="no-scrollbar max-w-full overflow-x-auto">
          {STATUSES.map((item) => (
            <SegmentButton
              key={item.id}
              active={status === item.id}
              onClick={() => setStatus(item.id)}
            >
              {isBn ? item.labelBn : item.labelEn}
              <span className="tabular text-[0.6875rem] opacity-70">
                {formatNumber(counts[item.id] ?? 0, locale)}
              </span>
            </SegmentButton>
          ))}
        </ButtonGroup>

        <ChipList label={t("label.departments")}>
          <Chip
            size="sm"
            active={department === null}
            onClick={() => setDepartment(null)}
            icon={Compass}
          >
            {isBn ? "সব বিভাগ" : "All departments"}
          </Chip>
          {activeDepartments.map((item) => (
            <Chip
              key={item.slug}
              size="sm"
              tone={item.tone}
              active={department === item.slug}
              onClick={() => setDepartment(department === item.slug ? null : item.slug)}
            >
              {pick(item.shortName)}
            </Chip>
          ))}
        </ChipList>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t("state.noResults")}
          description={
            isBn
              ? "এই ফিল্টারে কোনো প্রশ্ন নেই। অন্য বিভাগ বা অবস্থা বেছে দেখুন।"
              : "No questions match this filter. Try another department or status."
          }
          action={
            hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setStatus("all");
                  setDepartment(null);
                }}
                className="text-[0.8125rem] font-medium text-primary hover:underline"
              >
                {isBn ? "ফিল্টার মুছুন" : "Clear filters"}
              </button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((question) => (
            <QuestionCard key={question.id} question={question} layout="list" />
          ))}
        </div>
      )}

      <p className="flex items-center gap-2 text-[0.75rem] text-subtle-foreground">
        <MessageCircleQuestion className="size-3.5" aria-hidden />
        {isBn
          ? `${formatNumber(questions.length, locale)}টি প্রশ্নের মধ্যে ${formatNumber(filtered.length, locale)}টি দেখানো হচ্ছে`
          : `Showing ${filtered.length} of ${questions.length} questions`}
      </p>
    </div>
  );
}

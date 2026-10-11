"use client";

import { useMemo, useState } from "react";
import { Compass, Inbox, MessageCircleQuestion } from "lucide-react";
import type { Department, Question, QuestionStatus } from "@/lib/types";
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
 * The questions and the department vocabulary now arrive from the server page,
 * which read them from the API; the filtering stays here because it is the same
 * handful of rows either way and re-fetching on every chip click would cost a
 * round trip to answer a question the browser can answer instantly. The status
 * and department shapes mirror the API's own query parameters, so moving this
 * server-side later is a change of address, not of interface.
 */
export function QuestionBrowser({
  questions,
  departments,
  statusCounts,
}: {
  questions: Question[];
  /** The fetched taxonomy — this component no longer reads the bundled dataset. */
  departments: Department[];
  /**
   * How many questions exist per status across the whole archive, when the page
   * asked the API for them. Passed in rather than tallied here on purpose: the list
   * is one page of rows, and a chip that counted the page would understate a busy
   * archive. Absent, the tally falls back to the rows at hand.
   */
  statusCounts?: Partial<Record<"all" | QuestionStatus, number>>;
}) {
  const { t, isBn, pick, locale } = useI18n();
  const [status, setStatus] = useState<"all" | QuestionStatus>("all");
  const [department, setDepartment] = useState<string | null>(null);

  const counts = useMemo(() => {
    if (statusCounts) return statusCounts;
    const base: Record<string, number> = { all: questions.length };
    for (const question of questions) {
      base[question.status] = (base[question.status] ?? 0) + 1;
    }
    return base;
  }, [questions, statusCounts]);

  /** The archive's size, so the "showing n of m" line is about the archive too. */
  const archiveTotal = statusCounts?.all ?? questions.length;

  // Only offer departments that actually carry questions, so a filter can never
  // dead-end into an empty list.
  const activeDepartments = useMemo(() => {
    const used = new Set(questions.flatMap((q) => q.departmentIds));
    return departments.filter((d) => used.has(d.slug) || used.has(d.id));
  }, [questions, departments]);

  // Questions tag themselves with department slugs, while a Department also has
  // its own id — accept either so a filter never silently misses a match.
  const departmentKeys = useMemo(() => {
    if (!department) return null;
    const match = departments.find((d) => d.slug === department || d.id === department);
    return match ? [match.slug, match.id] : [department];
  }, [department, departments]);

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
          ? `${formatNumber(archiveTotal, locale)}টি প্রশ্নের মধ্যে ${formatNumber(questions.length, locale)}টি তালিকায় আছে; ফিল্টারে ${formatNumber(filtered.length, locale)}টি`
          : `Showing ${filtered.length} of ${questions.length} listed (${archiveTotal} in the archive)`}
      </p>
    </div>
  );
}

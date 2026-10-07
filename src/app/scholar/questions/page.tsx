import type { Metadata } from "next";
import { MessageCircleQuestion } from "@/components/icons";
import { PageHeader } from "@/components/ui";
import { T } from "@/components/i18n-text";
import { getDepartment } from "@/lib/data/departments";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";
import { getScholarQueue, SCHOLAR_CONSOLE_ID } from "../scholar-queue";
import { QuestionInbox, type InboxItem } from "./question-inbox";

export const metadata: Metadata = {
  title: "প্রশ্ন বাক্স",
};

/**
 * The routed question queue for the signed-in scholar, ordered by the priority
 * the routing engine assigned them.
 */
export default function ScholarQuestionsPage() {
  const scholar = SCHOLAR_BY_ID[SCHOLAR_CONSOLE_ID];

  const items: InboxItem[] = getScholarQueue(SCHOLAR_CONSOLE_ID).map((item) => ({
    question: item.question,
    candidates: item.candidates,
    priority: item.me.priority,
    score: item.me.score,
  }));

  const departmentNames = (scholar?.departmentIds ?? [])
    .map((slug) => getDepartment(slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .map((d) => d.name.bn);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={MessageCircleQuestion}
        eyebrow={<T k="console.title" />}
        title={<T k="console.priorityInbox" />}
        description="ব্যবহারকারীর প্রশ্ন আপনার বিভাগ অনুযায়ী রাউট হয়েছে। প্রতিটি প্রশ্নে দেখা যাবে কেন সেটি আপনার কাছে এসেছে — যাতে রাউটিং বিশ্বাসযোগ্য থাকে।"
        patterned
      />

      <QuestionInbox items={items} departmentNames={departmentNames} />
    </div>
  );
}

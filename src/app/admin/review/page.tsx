import type { Metadata } from "next";
import { ClipboardCheck, ShieldCheck } from "@/components/icons";
import { REVIEW_QUEUE } from "@/lib/data/admin";
import { T } from "@/components/i18n-text";
import { Callout, PageHeader, SectionHeader, Card } from "@/components/ui";
import { toBnDigits } from "@/lib/bn";
import { ReviewBoard } from "./review-board";

export const metadata: Metadata = { title: "পর্যালোচনা সারি" };

export default function AdminReviewPage() {
  const flagged = REVIEW_QUEUE.filter((i) => i.flaggedReferences > 0);
  const totalWords = REVIEW_QUEUE.reduce((sum, i) => sum + i.wordCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="admin.title" />}
        title={<T k="admin.reviewQueue" />}
        description="প্রকাশের আগে প্রতিটি প্রবন্ধ ও ফতোয়ার দলিল যাচাই করা হয়। প্রশ্ন রাউটিং যেমন আলেমের যোগ্যতার উপর নির্ভর করে, তেমনি প্ল্যাটফর্মের বিশ্বাসযোগ্যতা নির্ভর করে এই যাচাইয়ের উপর।"
        icon={ClipboardCheck}
        tone="admin"
        patterned
        breadcrumbs={[{ label: "অ্যাডমিন", href: "/admin" }, { label: "পর্যালোচনা" }]}
      />

      {flagged.length > 0 ? (
        <Callout tone="danger" icon={ShieldCheck} title="যাচাই প্রয়োজন এমন রেফারেন্স">
          {toBnDigits(flagged.length)}টি জমায় সন্দেহজনক সন্বর্ধনা বা দুর্বল সূত্র চিহ্নিত হয়েছে। অনুমোদনের আগে অবশ্যই আয়াত
          ও হাদীসের সূত্র মিলিয়ে দেখুন — একটি ভুল সূত্র পুরো প্ল্যাটফর্মের উপর সন্দেহ তৈরি করে।
        </Callout>
      ) : null}

      <ReviewBoard items={REVIEW_QUEUE} />

      <SectionHeader
        size="sm"
        icon={ClipboardCheck}
        title="পর্যালোচনার ধাপ"
        description={`বর্তমানে ${toBnDigits(REVIEW_QUEUE.length)}টি জমা আছে, মোট ${toBnDigits(totalWords)} শব্দ`}
      />
      <Card>
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "১. দলিল যাচাই",
              body: "প্রতিটি আয়াত ও হাদীসের সূত্র মিলিয়ে দেখুন। ভুল সূরার নাম, ভুল হাদীস নম্বর বা দুর্বল হাদীস প্রকাশ করা যাবে না।",
            },
            {
              title: "২. ভাষা ও আদব",
              body: "আক্রমণাত্মক বা দলাদলিমূলক ভাষা থাকলে পরিবর্তন চেয়ে ফেরত পাঠান। মতভেদ থাকতে পারে, আদব হারানো যাবে না।",
            },
            {
              title: "৩. বিভাগ নির্ধারণ",
              body: "প্রকাশিত কনটেন্ট সঠিক বিভাগে পড়ছে কি না দেখুন — ভুল বিভাগে গেলে সঠিক পাঠক সেটি খুঁজে পাবেন না।",
            },
            {
              title: "৪. প্রকাশ বা ফেরত",
              body: "সব ঠিক থাকলে অনুমোদন করুন। ছোট সংশোধন লাগলে পরিবর্তন চান — লেখক নিজের খসড়ায় ফিরে সম্পাদনা করবেন।",
            },
          ].map((step) => (
            <li key={step.title}>
              <p className="font-display text-[0.9375rem] font-semibold text-foreground">{step.title}</p>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

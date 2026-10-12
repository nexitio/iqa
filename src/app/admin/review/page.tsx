import type { Metadata } from "next";
import { ClipboardCheck, ShieldCheck } from "@/components/icons";
import { REVIEW_QUEUE } from "@/lib/data/admin";
import { T } from "@/components/i18n-text";
import { Callout, PageHeader, SectionHeader, Card } from "@/components/ui";
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
        description={<T k="admin.queue.reviewIntro" />}
        icon={ClipboardCheck}
        tone="admin"
        patterned
        breadcrumbs={[
          { label: <T k="admin.queue.crumbAdmin" />, href: "/admin" },
          { label: <T k="admin.queue.crumbReview" /> },
        ]}
      />

      {flagged.length > 0 ? (
        <Callout
          tone="danger"
          icon={ShieldCheck}
          title={<T k="admin.queue.flaggedRefsTitle" />}
        >
          <T k="admin.queue.flaggedRefsBody" vars={{ count: flagged.length }} />
        </Callout>
      ) : null}

      <ReviewBoard items={REVIEW_QUEUE} />

      <SectionHeader
        size="sm"
        icon={ClipboardCheck}
        title={<T k="admin.queue.reviewSteps" />}
        description={
          <T
            k="admin.queue.reviewStepsHelp"
            vars={{ pending: REVIEW_QUEUE.length, words: totalWords }}
          />
        }
      />
      <Card>
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { id: "1", titleKey: "admin.queue.step1Title", bodyKey: "admin.queue.step1Body" },
            { id: "2", titleKey: "admin.queue.step2Title", bodyKey: "admin.queue.step2Body" },
            { id: "3", titleKey: "admin.queue.step3Title", bodyKey: "admin.queue.step3Body" },
            { id: "4", titleKey: "admin.queue.step4Title", bodyKey: "admin.queue.step4Body" },
          ].map((step) => (
            <li key={step.id}>
              <p className="font-display text-[0.9375rem] font-semibold text-foreground">
                <T k={step.titleKey} />
              </p>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                <T k={step.bodyKey} />
              </p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

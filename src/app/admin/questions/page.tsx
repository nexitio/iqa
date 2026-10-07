import type { Metadata } from "next";
import { AlertTriangle, MessageCircleQuestion, Route, Scale, Users } from "@/components/icons";
import { ANSWERS, QUESTIONS, ROUTING_CANDIDATES } from "@/lib/data/questions";
import { DEPARTMENTS } from "@/lib/data/departments";
import { T } from "@/components/i18n-text";
import { Callout, PageHeader, SectionHeader, StatTile, Card, CardHeader } from "@/components/ui";
import { toBnDigits } from "@/lib/bn";
import { nowMs } from "@/lib/clock";
import { QuestionMonitor } from "./question-monitor";

export const metadata: Metadata = { title: "প্রশ্ন মনিটরিং" };

/** How long a question waits before it counts as stale. */
const HOURS_24 = 24 * 60 * 60 * 1000;

/** The backlog is only meaningful "as of now", so this route is never cached. */
export const dynamic = "force-dynamic";

export default function AdminQuestionsPage() {
  const now = nowMs();
  const unanswered = QUESTIONS.filter((q) => q.answerCount === 0).length;
  const stale = QUESTIONS.filter(
    (q) => q.answerCount === 0 && now - new Date(q.createdAt).getTime() > HOURS_24,
  ).length;
  const unrouted = QUESTIONS.filter((q) => (ROUTING_CANDIDATES[q.id] ?? []).length === 0).length;
  const urgent = QUESTIONS.filter((q) => q.urgency === "urgent").length;
  const fatwaRequested = QUESTIONS.filter((q) => q.fatwaRequested).length;
  const answered = QUESTIONS.filter((q) => q.status === "answered" || q.status === "closed").length;
  const answerRate = QUESTIONS.length > 0 ? Math.round((answered / QUESTIONS.length) * 100) : 0;

  /* Which departments carry the most unanswered demand — where to add scholars. */
  const departmentLoad = DEPARTMENTS.map((department) => {
    const departmentQuestions = QUESTIONS.filter((q) => q.departmentIds.includes(department.slug));
    const openCount = departmentQuestions.filter((q) => q.answerCount === 0).length;
    return {
      slug: department.slug,
      nameBn: department.name.bn,
      shortNameBn: department.shortName.bn,
      scholarCount: department.scholarIds.length,
      questionCount: departmentQuestions.length,
      openCount,
      questionsPerScholar:
        department.scholarIds.length > 0
          ? Math.round(department.stats.questions / department.scholarIds.length)
          : 0,
      tone: department.tone,
    };
  })
    .sort((a, b) => b.openCount - a.openCount)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="admin.title" />}
        title="প্রশ্ন মনিটরিং"
        description="প্রতিটি প্রশ্ন সঠিক বিভাগের আলেমের কাছে পৌঁছাচ্ছে কি না তা এখানেই বোঝা যায়। প্রশ্ন অনাদায়ী থাকলে সমস্যাটি সাধারণত দুইটি — ওই বিভাগে আলেম নেই, বা আলেমের উপর প্রশ্নভার অতিরিক্ত।"
        icon={MessageCircleQuestion}
        tone="admin"
        patterned
        breadcrumbs={[{ label: "অ্যাডমিন", href: "/admin" }, { label: "প্রশ্ন" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={<T k="admin.openQuestions" />}
          value={toBnDigits(QUESTIONS.filter((q) => q.status === "open").length)}
          icon={MessageCircleQuestion}
          tone="info"
          hint={`মোট ${toBnDigits(QUESTIONS.length)}টি প্রশ্ন`}
        />
        <StatTile
          label="উত্তরহীন"
          value={toBnDigits(unanswered)}
          icon={AlertTriangle}
          tone={unanswered > 0 ? "warning" : "success"}
          hint={`${toBnDigits(stale)}টি ২৪ ঘণ্টার বেশি পুরনো`}
        />
        <StatTile
          label="রাউট হয়নি"
          value={toBnDigits(unrouted)}
          icon={Route}
          tone={unrouted > 0 ? "danger" : "success"}
          hint={unrouted > 0 ? "সংশ্লিষ্ট বিভাগে আলেম নেই" : "সব প্রশ্ন রাউট হয়েছে"}
        />
        <StatTile
          label="ফতোয়া চাওয়া"
          value={toBnDigits(fatwaRequested)}
          icon={Scale}
          tone="accent"
          hint={`${toBnDigits(urgent)}টি জরুরি চিহ্নিত`}
        />
      </div>

      {unrouted > 0 ? (
        <Callout tone="danger" icon={Route} title="রাউটিং ব্যর্থ হয়েছে">
          {toBnDigits(unrouted)}টি প্রশ্নের জন্য কোনো আলেম খুঁজে পাওয়া যায়নি। এর অর্থ হলো প্রশ্নটির বিভাগে কোনো আলেম
          দায়িত্বে নেই, অথবা সব আলেম অনুপলব্ধ। সংশ্লিষ্ট বিভাগে আলেম যোগ না করলে এই প্রশ্ন চিরকাল অনাদায়ী থাকবে।
        </Callout>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <QuestionMonitor questions={QUESTIONS} now={now} />

        <aside className="space-y-4">
          <Card>
            <CardHeader
              icon={Users}
              tone="warning"
              title="কোথায় আলেম দরকার"
              subtitle="উত্তরহীন প্রশ্ন ও আলেমপ্রতি প্রশ্নভার অনুসারে"
            />
            <ul className="mt-4 space-y-3">
              {departmentLoad.map((row) => (
                <li key={row.slug} className="rounded-card border border-border bg-surface-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[0.8125rem] font-semibold leading-snug text-foreground">
                      {row.nameBn}
                    </p>
                    <span className="shrink-0 rounded-md bg-surface px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular text-muted-foreground">
                      {toBnDigits(row.scholarCount)} জন
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] tabular text-subtle-foreground">
                    <span>{toBnDigits(row.questionCount)}টি প্রশ্ন</span>
                    {row.openCount > 0 ? (
                      <span className="text-warning">{toBnDigits(row.openCount)}টি উত্তরহীন</span>
                    ) : (
                      <span className="text-success">সব উত্তর দেওয়া</span>
                    )}
                    {row.scholarCount > 0 ? (
                      <span>আলেমপ্রতি ~{toBnDigits(row.questionsPerScholar)}</span>
                    ) : (
                      <span className="text-danger">আলেম নেই</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader icon={Scale} tone="accent" title="উত্তরপ্রবাহ" />
            <dl className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-[0.8125rem] text-muted-foreground">মোট উত্তর</dt>
                <dd className="font-display text-base font-bold tabular text-foreground">
                  {toBnDigits(ANSWERS.length)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[0.8125rem] text-muted-foreground">গৃহীত উত্তর</dt>
                <dd className="font-display text-base font-bold tabular text-success">
                  {toBnDigits(ANSWERS.filter((a) => a.accepted).length)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[0.8125rem] text-muted-foreground">উত্তর হার</dt>
                <dd className="font-display text-base font-bold tabular text-foreground">
                  {toBnDigits(answerRate)}%
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[0.8125rem] text-muted-foreground">বন্ধ প্রশ্ন</dt>
                <dd className="font-display text-base font-bold tabular text-foreground">
                  {toBnDigits(QUESTIONS.filter((q) => q.status === "closed").length)}
                </dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>

      <SectionHeader
        size="sm"
        icon={AlertTriangle}
        title="ব্যাকলগ কমানোর উপায়"
        description="প্রশ্ন অনাদায়ী রাখা প্ল্যাটফর্মের সবচেয়ে বড় ক্ষতি"
      />
      <Card>
        <ul className="grid gap-3 text-[0.8125rem] leading-relaxed text-muted-foreground sm:grid-cols-2">
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            যে বিভাগে আলেম নেই, সেখানে দ্রুত নিয়োগ দিন — এটিই একমাত্র স্থায়ী সমাধান।
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            আলেমপ্রতি প্রশ্নভার বেশি হলে (৮০-এর বেশি) নতুন আলেম যোগ করা যুক্তিযুক্ত।
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            অনুপলব্ধ আলেমকে সাময়িকভাবে বাদ দিয়ে দিন যাতে রাউটিং কার্যকর প্রার্থী খুঁজে পায়।
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            ২৪ ঘণ্টার বেশি অপেক্ষা করা প্রশ্নে আলেমদের তাগাদা পাঠানো যাবে।
          </li>
        </ul>
      </Card>
    </div>
  );
}

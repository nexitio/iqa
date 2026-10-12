import type { Metadata } from "next";
import { AlertTriangle, MessageCircleQuestion, Route, Scale, Users } from "@/components/icons";
import { ANSWERS, QUESTIONS, ROUTING_CANDIDATES } from "@/lib/data/questions";
import { DEPARTMENTS } from "@/lib/data/departments";
import { Digits, T } from "@/components/i18n-text";
import { Callout, PageHeader, SectionHeader, StatTile, Card, CardHeader } from "@/components/ui";
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
        title={<T k="admin.queue.questionsTitle" />}
        description={<T k="admin.queue.questionsIntro" />}
        icon={MessageCircleQuestion}
        tone="admin"
        patterned
        breadcrumbs={[
          { label: <T k="admin.queue.crumbAdmin" />, href: "/admin" },
          { label: <T k="admin.queue.crumbQuestions" /> },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={<T k="admin.openQuestions" />}
          value={<Digits value={QUESTIONS.filter((q) => q.status === "open").length} />}
          icon={MessageCircleQuestion}
          tone="info"
          hint={<T k="admin.queue.totalQuestions" vars={{ count: QUESTIONS.length }} />}
        />
        <StatTile
          label={<T k="admin.queue.unanswered" />}
          value={<Digits value={unanswered} />}
          icon={AlertTriangle}
          tone={unanswered > 0 ? "warning" : "success"}
          hint={<T k="admin.queue.staleHint" vars={{ count: stale }} />}
        />
        <StatTile
          label={<T k="admin.queue.notRouted" />}
          value={<Digits value={unrouted} />}
          icon={Route}
          tone={unrouted > 0 ? "danger" : "success"}
          hint={
            unrouted > 0 ? <T k="admin.queue.noDepartmentScholar" /> : <T k="admin.queue.allRouted" />
          }
        />
        <StatTile
          label={<T k="label.fatwaRequested" />}
          value={<Digits value={fatwaRequested} />}
          icon={Scale}
          tone="accent"
          hint={<T k="admin.queue.urgentFlagged" vars={{ count: urgent }} />}
        />
      </div>

      {unrouted > 0 ? (
        <Callout tone="danger" icon={Route} title={<T k="admin.queue.routingFailedTitle" />}>
          <T k="admin.queue.routingFailedBody" vars={{ count: unrouted }} />
        </Callout>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <QuestionMonitor questions={QUESTIONS} now={now} />

        <aside className="space-y-4">
          <Card>
            <CardHeader
              icon={Users}
              tone="warning"
              title={<T k="admin.queue.whereScholarsNeeded" />}
              subtitle={<T k="admin.queue.whereScholarsNeededHelp" />}
            />
            <ul className="mt-4 space-y-3">
              {departmentLoad.map((row) => (
                <li key={row.slug} className="rounded-card border border-border bg-surface-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[0.8125rem] font-semibold leading-snug text-foreground">
                      {row.nameBn}
                    </p>
                    <span className="shrink-0 rounded-md bg-surface px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular text-muted-foreground">
                      <T k="admin.queue.scholarCountSuffix" vars={{ count: row.scholarCount }} />
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] tabular text-subtle-foreground">
                    <span>
                      <T k="admin.queue.questionsCount" vars={{ count: row.questionCount }} />
                    </span>
                    {row.openCount > 0 ? (
                      <span className="text-warning">
                        <T k="admin.queue.unansweredCount" vars={{ count: row.openCount }} />
                      </span>
                    ) : (
                      <span className="text-success">
                        <T k="admin.queue.allAnswered" />
                      </span>
                    )}
                    {row.scholarCount > 0 ? (
                      <span>
                        <T
                          k="admin.queue.perScholar"
                          vars={{ count: row.questionsPerScholar }}
                        />
                      </span>
                    ) : (
                      <span className="text-danger">
                        <T k="admin.queue.noScholars" />
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader icon={Scale} tone="accent" title={<T k="admin.queue.answerFlow" />} />
            <dl className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-[0.8125rem] text-muted-foreground">
                  <T k="admin.queue.totalAnswers" />
                </dt>
                <dd className="font-display text-base font-bold tabular text-foreground">
                  <Digits value={ANSWERS.length} />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[0.8125rem] text-muted-foreground">
                  <T k="admin.queue.acceptedAnswers" />
                </dt>
                <dd className="font-display text-base font-bold tabular text-success">
                  <Digits value={ANSWERS.filter((a) => a.accepted).length} />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[0.8125rem] text-muted-foreground">
                  <T k="admin.queue.answerRate" />
                </dt>
                <dd className="font-display text-base font-bold tabular text-foreground">
                  <Digits value={answerRate} />%
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[0.8125rem] text-muted-foreground">
                  <T k="admin.queue.closedQuestions" />
                </dt>
                <dd className="font-display text-base font-bold tabular text-foreground">
                  <Digits value={QUESTIONS.filter((q) => q.status === "closed").length} />
                </dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>

      <SectionHeader
        size="sm"
        icon={AlertTriangle}
        title={<T k="admin.queue.backlogHeading" />}
        description={<T k="admin.queue.backlogHeadingHelp" />}
      />
      <Card>
        <ul className="grid gap-3 text-[0.8125rem] leading-relaxed text-muted-foreground sm:grid-cols-2">
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <T k="admin.queue.backlogTip1" />
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <T k="admin.queue.backlogTip2" />
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <T k="admin.queue.backlogTip3" />
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <T k="admin.queue.backlogTip4" />
          </li>
        </ul>
      </Card>
    </div>
  );
}

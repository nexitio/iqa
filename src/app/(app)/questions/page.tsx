import type { Metadata } from "next";
import {
  BookOpenCheck,
  Compass,
  Inbox,
  MessageCircleQuestion,
  MessagesSquare,
  Plus,
  Sparkles,
} from "@/components/icons";
import type { Answer, Question } from "@/lib/types";
import {
  fetchAnswers,
  fetchDepartments,
  fetchQuestions,
  fetchScholars,
  fetchTopics,
  indexBy,
  MAX_LIMIT,
} from "@/lib/content-api";
import { T } from "@/components/i18n-text";
import { AskCtaCard } from "@/components/knowledge";
import { ScholarMiniCard } from "@/components/people";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  ChipList,
  ErrorState,
  PageHeader,
  SectionHeader,
} from "@/components/ui";
import { toBnDigits } from "@/lib/bn";
import { relativeTime } from "@/lib/utils";
import { QuestionBrowser } from "./question-browser";

export const metadata: Metadata = {
  title: "প্রশ্ন ও উত্তর",
  description:
    "বিশ্বস্ত আলেমদের কাছে আপনার প্রশ্ন করুন এবং যাচাইকৃত উত্তর পান। বিভাগ অনুযায়ী প্রশ্ন পাঠানো হয় সংশ্লিষ্ট আলেমের কাছে, যাতে দ্রুত ও নির্ভুল উত্তর পাওয়া যায়।",
};

/**
 * Q&A index.
 *
 * Layered so a visitor can either read what has already been answered or ask
 * their own question, without the two competing for attention.
 *
 * Every read here is a read from the API: the archive, the rail of fresh answers,
 * the scholars behind those answers, the departments the filter offers, and the
 * topics people are actually asking about. Two things follow from that, and both
 * are deliberate:
 *
 *  - **The tiles are the API's own totals.** Each one is asked for with `limit: 1`
 *    and read from the list envelope's `total`, so "উত্তর দেওয়া হয়েছে" is how many
 *    answered questions exist rather than how many happened to fit in the page this
 *    reader loaded. A count that only described the current page would be a worse
 *    lie than no count at all.
 *  - **A failed archive read is an error state, not an empty list.** The API being
 *    unreachable and the archive being empty look identical in the data and mean
 *    opposite things to a reader, so the failure branch says which happened and
 *    offers the way back. A failed *side* read costs only its rail.
 */

/** The five counts the header states, each one the API's own total for its filter. */
interface StatusCounts {
  answered: number;
  routed: number;
  open: number;
  fatwaRequested: number;
  urgent: number;
}

/** The archive's own size per status, which is what the filter's chips state. */
type ArchiveCounts = Partial<Record<"all" | Question["status"], number>>;

export default async function QuestionsPage() {
  const [
    listed,
    answeredTotal,
    routedTotal,
    openTotal,
    closedTotal,
    fatwaRequestedTotal,
    urgentTotal,
    recentlyAnsweredResult,
    answersResult,
    scholarsResult,
    departmentsResult,
    topicsResult,
  ] = await Promise.all([
    // The list is the page.
    fetchQuestions({ limit: MAX_LIMIT }),
    fetchQuestions({ status: "answered", limit: 1 }),
    fetchQuestions({ status: "routed", limit: 1 }),
    fetchQuestions({ status: "open", limit: 1 }),
    fetchQuestions({ status: "closed", limit: 1 }),
    fetchQuestions({ fatwaRequested: true, limit: 1 }),
    fetchQuestions({ urgency: "urgent", limit: 1 }),
    // A window wide enough to sort by *when it was answered*. The archive is
    // ordered by urgency and then asked-at, which is right for the list below and
    // wrong for a rail whose heading promises the most recent answers.
    fetchQuestions({ status: "answered", limit: 24 }),
    // One read for every answer in the archive: it is what the "who answers the
    // most" rail counts, and the dataset it replaces was a single array too.
    fetchAnswers({ limit: MAX_LIMIT }),
    fetchScholars(),
    fetchDepartments(),
    fetchTopics({ trending: true }),
  ]);

  // A failed side read costs a rail, not the page — the header still says what it
  // can, and the list below is the one read that has to succeed.
  const questions = listed.ok ? listed.data.items : [];
  const archiveSize = listed.ok ? listed.data.total : questions.length;
  const departments = departmentsResult.ok ? departmentsResult.data : [];
  const trendingTopics = topicsResult.ok ? topicsResult.data : [];
  const answers = answersResult.ok ? answersResult.data.items : [];
  const scholarsById = indexBy(scholarsResult.ok ? scholarsResult.data.items : [], "id");

  // `undefined` rather than `0` for a count that did not arrive: zero is a fact
  // about the archive, and a failed read is not entitled to state it.
  const answeredCount = answeredTotal.ok ? answeredTotal.data.total : undefined;
  const routedCount = routedTotal.ok ? routedTotal.data.total : undefined;
  const openCount = openTotal.ok ? openTotal.data.total : undefined;
  const closedCount = closedTotal.ok ? closedTotal.data.total : undefined;
  const fatwaRequestedCount = fatwaRequestedTotal.ok ? fatwaRequestedTotal.data.total : undefined;
  const urgentCount = urgentTotal.ok ? urgentTotal.data.total : undefined;

  const counts: StatusCounts | undefined =
    answeredCount !== undefined &&
    routedCount !== undefined &&
    openCount !== undefined &&
    fatwaRequestedCount !== undefined &&
    urgentCount !== undefined
      ? {
          answered: answeredCount,
          routed: routedCount,
          open: openCount,
          fatwaRequested: fatwaRequestedCount,
          urgent: urgentCount,
        }
      : undefined;

  // The archive's size per status, for the filter's chips. `all` is the unfiltered
  // read's own total, which is the archive rather than the page of it shown here.
  const archiveCounts: ArchiveCounts | undefined =
    answeredCount !== undefined &&
    routedCount !== undefined &&
    openCount !== undefined &&
    closedCount !== undefined
      ? { all: archiveSize, answered: answeredCount, routed: routedCount, open: openCount, closed: closedCount }
      : undefined;

  if (!listed.ok) {
    return (
      <div className="space-y-6">
        <Header />
        <ErrorState
          title="প্রশ্নগুলো আনা যায়নি"
          description="কনটেন্ট সার্ভিসে পৌঁছানো যায়নি। একটু পরে আবার চেষ্টা করুন — সমস্যা থেকে গেলে প্রশাসনকে জানান।"
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button href="/questions" size="sm">
                আবার চেষ্টা করুন
              </Button>
              <Button href="/" variant="outline" size="sm">
                হোমে ফিরে যান
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  // Accepted answers first, so the excerpt under a question is the answer the
  // asker actually accepted rather than whichever one the API listed first.
  const answersByQuestion = new Map<string, Answer[]>();
  for (const answer of answers) {
    const rows = answersByQuestion.get(answer.questionId) ?? [];
    rows.push(answer);
    answersByQuestion.set(answer.questionId, rows);
  }
  const answerFor = (question: Question) => {
    const rows = answersByQuestion.get(question.id) ?? [];
    return rows.find((row) => row.accepted) ?? rows[0];
  };

  const recentlyAnswered = (recentlyAnsweredResult.ok ? recentlyAnsweredResult.data.items : [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.answeredAt ?? b.createdAt).getTime() -
        new Date(a.answeredAt ?? a.createdAt).getTime(),
    )
    .slice(0, 4);

  // Scholars who have actually answered the most questions.
  const topScholars = Object.entries(
    answers.reduce<Record<string, number>>((acc, answer) => {
      acc[answer.scholarId] = (acc[answer.scholarId] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([scholarId]) => scholarsById.get(scholarId))
    .filter((scholar): scholar is NonNullable<typeof scholar> => Boolean(scholar));

  return (
    <div className="space-y-6">
      <Header counts={counts} />

      {/* The list is the page. Everything a reader came for is reachable from
          here, so only the filterable archive comes before the extras. */}
      <section>
        <SectionHeader
          icon={Inbox}
          title="সকল প্রশ্ন"
          description="অবস্থা ও বিভাগ অনুযায়ী ছেঁকে দেখুন"
        />
        <QuestionBrowser
          questions={questions}
          departments={departments}
          statusCounts={archiveCounts}
        />
      </section>

      {recentlyAnswered.length > 0 ? (
        <section>
          <SectionHeader
            icon={Sparkles}
            tone="success"
            title="এইমাত্র উত্তর পাওয়া গেছে"
            description="সদ্য প্রকাশিত উত্তরগুলো — আপনার প্রশ্নের উত্তর হয়তো এখানেই আছে"
            href="/questions"
            actionLabel="সব প্রশ্ন"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {recentlyAnswered.map((question) => {
              const answer = answerFor(question);
              const scholar = answer ? scholarsById.get(answer.scholarId) : undefined;
              return (
                <Card key={question.id} interactive className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-success-soft-foreground">
                      <BookOpenCheck className="size-3" aria-hidden />
                      উত্তর পাওয়া গেছে
                    </span>
                    <span className="text-[0.6875rem] text-subtle-foreground">
                      {relativeTime(question.answeredAt ?? question.createdAt, "bn")}
                    </span>
                  </div>
                  <a
                    href={`/questions/${question.slug}`}
                    className="font-display text-[0.9375rem] font-semibold leading-snug text-foreground transition-colors hover:text-primary"
                  >
                    {question.titleBn}
                  </a>
                  {answer ? (
                    <p className="line-clamp-3 rounded-xl border-l-2 border-primary/40 bg-surface-2 p-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
                      {answer.bodyBn}
                    </p>
                  ) : null}
                  {scholar ? (
                    <p className="text-[0.75rem] text-subtle-foreground">
                      উত্তর দিয়েছেন {scholar.honorific.bn} {scholar.name.bn}
                    </p>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {trendingTopics.length > 0 ? (
        <section>
          <SectionHeader icon={Compass} title="আলোচিত বিষয়" description="মানুষ এখন এসব বিষয়ে জানতে চাইছে" />
          <ChipList>
            {trendingTopics.map((topic) => (
              <Chip
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                tone="accent"
                size="md"
                count={toBnDigits(topic.contentCount)}
              >
                {topic.name.bn}
              </Chip>
            ))}
          </ChipList>
        </section>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section>
          <SectionHeader
            icon={MessagesSquare}
            title="সক্রিয় আলেমেরা"
            description="যাঁরা সবচেয়ে বেশি প্রশ্নের উত্তর দিয়েছেন"
          />
          {topScholars.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {topScholars.map((scholar) => (
                <ScholarMiniCard key={scholar.id} scholar={scholar} />
              ))}
            </div>
          ) : (
            <p className="text-[0.8125rem] text-muted-foreground">
              উত্তর দেওয়ার তথ্য পাওয়া গেলে এই আলেমদের এখানে দেখা যাবে।
            </p>
          )}
        </section>

        <aside>
          <Card>
            <CardHeader
              icon={Compass}
              title="প্রশ্ন কীভাবে পৌঁছায়?"
              subtitle="বিভাগ অনুযায়ী আলেম নির্বাচন"
            />
            <ol className="mt-4 space-y-3">
              {[
                "আপনি প্রশ্নের সাথে সংশ্লিষ্ট বিভাগ বেছে নেন।",
                "সেই বিভাগের বিশেষজ্ঞ আলেমদের অগ্রাধিকার দেওয়া হয়।",
                "প্রথমে যিনি দ্রুত ও নির্ভুল উত্তর দিতে পারেন তাঁকে দেখানো হয়।",
                "উত্তর প্রকাশিত হলে আপনি জানতে পারেন।",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[0.6875rem] font-bold tabular text-primary">
                    {toBnDigits(index + 1)}
                  </span>
                  <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>

      <AskCtaCard />
    </div>
  );
}

/**
 * The page's own head, so the failure branch can still show it.
 *
 * `counts` is absent exactly when the counting reads did not all answer — the
 * header then states no totals rather than stating zero, which would read as an
 * empty archive when the truth is that we could not ask.
 */
function Header({ counts }: { counts?: StatusCounts }) {
  return (
    <PageHeader
      patterned
      icon={MessageCircleQuestion}
      eyebrow="ইলম · প্রশ্নোত্তর"
      title={<T k="qa.title" />}
      description={<T k="qa.subtitle" />}
      actions={
        <>
          <Button href="/questions/ask" icon={Plus}>
            <T k="action.askScholar" />
          </Button>
          <Button href="/scholars" variant="outline">
            <T k="nav.scholars" />
          </Button>
        </>
      }
    >
      {counts ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
          {[
            { label: "উত্তর দেওয়া হয়েছে", value: counts.answered },
            { label: "আলেমের কাছে পাঠানো", value: counts.routed },
            { label: "নতুন প্রশ্ন", value: counts.open },
            { label: "ফতোয়া চাওয়া", value: counts.fatwaRequested },
            { label: "জরুরি", value: counts.urgent },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">{item.label}</dt>
              <dd className="mt-1 font-display text-xl font-bold tabular text-foreground">
                {toBnDigits(item.value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </PageHeader>
  );
}

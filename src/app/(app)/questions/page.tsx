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
import { T } from "@/components/i18n-text";
import { AskCtaCard } from "@/components/knowledge";
import { ScholarMiniCard } from "@/components/people";
import { Button, Card, CardHeader, Chip, ChipList, PageHeader, SectionHeader } from "@/components/ui";
import { TRENDING_TOPICS } from "@/lib/data/departments";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";
import { ANSWERS, ANSWERED_QUESTIONS, QUESTIONS, URGENT_QUESTIONS } from "@/lib/data/questions";
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
 */
export default function QuestionsPage() {
  const counts = {
    open: QUESTIONS.filter((q) => q.status === "open").length,
    routed: QUESTIONS.filter((q) => q.status === "routed").length,
    answered: QUESTIONS.filter((q) => q.status === "answered").length,
    closed: QUESTIONS.filter((q) => q.status === "closed").length,
  };

  const recentlyAnswered = [...ANSWERED_QUESTIONS]
    .sort((a, b) => new Date(b.answeredAt ?? b.createdAt).getTime() - new Date(a.answeredAt ?? a.createdAt).getTime())
    .slice(0, 4);

  // Scholars who have actually answered the most questions.
  const topScholars = Object.entries(
    ANSWERS.reduce<Record<string, number>>((acc, answer) => {
      acc[answer.scholarId] = (acc[answer.scholarId] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([scholarId]) => SCHOLAR_BY_ID[scholarId])
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const fatwaRequested = QUESTIONS.filter((q) => q.fatwaRequested).length;

  return (
    <div className="space-y-6">
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
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
          {[
            { label: "উত্তর দেওয়া হয়েছে", value: counts.answered },
            { label: "আলেমের কাছে পাঠানো", value: counts.routed },
            { label: "নতুন প্রশ্ন", value: counts.open },
            { label: "ফতোয়া চাওয়া", value: fatwaRequested },
            { label: "জরুরি", value: URGENT_QUESTIONS.length },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">{item.label}</dt>
              <dd className="mt-1 font-display text-xl font-bold tabular text-foreground">
                {toBnDigits(item.value)}
              </dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      {/* The list is the page. Everything a reader came for is reachable from
          here, so only the filterable archive comes before the extras. */}
      <section>
        <SectionHeader
          icon={Inbox}
          title="সকল প্রশ্ন"
          description="অবস্থা ও বিভাগ অনুযায়ী ছেঁকে দেখুন"
        />
        <QuestionBrowser questions={QUESTIONS} />
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
              const answer = ANSWERS.find((a) => a.questionId === question.id && a.accepted)
                ?? ANSWERS.find((a) => a.questionId === question.id);
              const scholar = answer ? SCHOLAR_BY_ID[answer.scholarId] : undefined;
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

      <section>
        <SectionHeader icon={Compass} title="আলোচিত বিষয়" description="মানুষ এখন এসব বিষয়ে জানতে চাইছে" />
        <ChipList>
          {TRENDING_TOPICS.map((topic) => (
            <Chip key={topic.slug} href={`/topics/${topic.slug}`} tone="accent" size="md" count={toBnDigits(topic.contentCount)}>
              {topic.name.bn}
            </Chip>
          ))}
        </ChipList>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section>
          <SectionHeader
            icon={MessagesSquare}
            title="সক্রিয় আলেমেরা"
            description="যাঁরা সবচেয়ে বেশি প্রশ্নের উত্তর দিয়েছেন"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {topScholars.map((scholar) => (
              <ScholarMiniCard key={scholar.id} scholar={scholar} />
            ))}
          </div>
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

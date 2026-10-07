import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  BookOpenCheck,
  Clock,
  Compass,
  Eye,
  Lock,
  MapPin,
  MessageCircleQuestion,
  Scale,
  Sparkles,
  UserRound,
  Users,
} from "@/components/icons";
import { T } from "@/components/i18n-text";
import { AnswerCard, AskCtaCard, FatwaRow, QuestionRow } from "@/components/knowledge";
import { ScholarMiniCard } from "@/components/people";
import { RoutingReasons } from "@/components/console";
import {
  Badge,
  Breadcrumbs,
  Button,
  Callout,
  Card,
  CardHeader,
  Chip,
  EmptyState,
  Prose,
  SectionHeader,
  StatusBadge,
} from "@/components/ui";
import { FATWAS } from "@/lib/data/content";
import { getDepartment } from "@/lib/data/departments";
import { getUser } from "@/lib/data/personal";
import {
  getAnswersForQuestion,
  getQuestion,
  getRoutingCandidates,
  QUESTIONS,
} from "@/lib/data/questions";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";
import { findDistrict, formatNumber } from "@/lib/bn";
import { relativeTime, toParagraphs } from "@/lib/utils";

export function generateStaticParams() {
  return QUESTIONS.map((question) => ({ slug: question.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const question = getQuestion(slug);
  if (!question) return { title: "প্রশ্ন পাওয়া যায়নি" };
  return {
    title: question.titleBn,
    description: question.bodyBn.slice(0, 180),
  };
}

const STATUS_LABEL: Record<string, string> = {
  open: "খোলা",
  routed: "আলেমের কাছে পাঠানো",
  answered: "উত্তর দেওয়া হয়েছে",
  closed: "সম্পন্ন",
};

/**
 * Question detail.
 *
 * Beyond the answer itself the page has to answer a second question — "who has
 * this, and are they qualified?" — so the routing rationale is shown to the
 * asker rather than being hidden behind the curtain.
 */
export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const question = getQuestion(slug);
  if (!question) notFound();

  const answers = getAnswersForQuestion(question.id);
  const accepted = answers.find((answer) => answer.accepted) ?? null;
  const others = answers.filter((answer) => answer.id !== accepted?.id);
  const candidates = getRoutingCandidates(question.id);
  const district = findDistrict(question.askerDistrict);
  const asker = question.visibility === "public" ? getUser(question.askerId) : undefined;

  const departments = question.departmentIds
    .map((id) => getDepartment(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  // Scholars either already involved or queued for this question.
  const involvedScholarIds = [
    ...new Set([...answers.map((a) => a.scholarId), ...candidates.map((c) => c.scholarId)]),
  ];
  const involvedScholars = involvedScholarIds
    .map((id) => SCHOLAR_BY_ID[id])
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const relatedQuestions = QUESTIONS.filter(
    (other) =>
      other.id !== question.id &&
      other.departmentIds.some((id) => question.departmentIds.includes(id)),
  ).slice(0, 5);

  const relatedFatwas = FATWAS.filter(
    (fatwa) =>
      fatwa.status === "published" &&
      fatwa.departmentIds.some((id) => question.departmentIds.includes(id)),
  ).slice(0, 3);

  const escalated = answers.find((answer) => answer.becameFatwaSlug);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "হোম", href: "/" },
          { label: "প্রশ্নোত্তর", href: "/questions" },
          { label: `প্রশ্ন #${formatNumber(Number(question.id.replace(/\D/g, "")) || 1, "bn")}` },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          {/* ----------------------------------------------------- question */}
          <article className="overflow-hidden rounded-panel border border-border bg-surface shadow-card">
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-2 px-4 py-3 sm:px-5">
              <StatusBadge status={question.status} label={STATUS_LABEL[question.status]} />
              {question.urgency === "urgent" ? (
                <Badge tone="danger" size="sm" icon={AlertTriangle}>
                  জরুরি
                </Badge>
              ) : null}
              {question.fatwaRequested ? (
                <Badge tone="accent" size="sm" icon={Scale}>
                  ফতোয়া চাওয়া হয়েছে
                </Badge>
              ) : null}
              <span className="ml-auto inline-flex items-center gap-1.5 text-[0.6875rem] text-subtle-foreground">
                <Clock className="size-3.5" aria-hidden />
                {relativeTime(question.createdAt, "bn")}
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <h1 className="font-display text-xl font-bold leading-snug text-foreground sm:text-2xl">
                {question.titleBn}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.75rem] text-muted-foreground">
                {question.visibility === "public" ? (
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="size-3.5" aria-hidden />
                    {asker?.name ?? "সদস্য"}
                  </span>
                ) : question.visibility === "anonymous" ? (
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="size-3.5" aria-hidden />
                    <T k="label.anonymous" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="size-3.5" aria-hidden />
                    <T k="label.private" />
                  </span>
                )}
                {question.visibility !== "private" ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" aria-hidden />
                    {district.name.bn}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-3.5" aria-hidden />
                  {formatNumber(question.views, "bn")} বার দেখা হয়েছে
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" aria-hidden />
                  {formatNumber(question.followerCount, "bn")} জন অনুসরণ করছেন
                </span>
              </div>

              {departments.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {departments.map((department) => (
                    <Chip
                      key={department.slug}
                      href={`/departments/${department.slug}`}
                      tone={department.tone}
                      size="sm"
                      active
                    >
                      {department.name.bn}
                    </Chip>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 border-t border-border pt-5">
                <Prose paragraphs={toParagraphs(question.bodyBn)} />
              </div>
            </div>
          </article>

          {/* ------------------------------------------------------ answers */}
          <section>
            <SectionHeader
              icon={BookOpenCheck}
              tone="success"
              title={`উত্তর${answers.length > 0 ? ` (${formatNumber(answers.length, "bn")})` : ""}`}
              description={
                accepted
                  ? "প্রশ্নকারীর গৃহীত উত্তরটি সবার আগে দেখানো হয়েছে"
                  : "আলেমদের উত্তর এখানে প্রকাশিত হবে"
              }
            />

            {answers.length === 0 ? (
              <div className="space-y-4">
                <EmptyState
                  icon={MessageCircleQuestion}
                  tone="info"
                  title={<T k="qa.noAnswerYet" />}
                  description="আপনার প্রশ্নটি সংশ্লিষ্ট বিভাগের আলেমদের কাছে পৌঁছে দেওয়া হয়েছে। উত্তরের জন্য অনুগ্রহ করে অপেক্ষা করুন — অথবা অন্য প্রশ্ন দেখে নিন।"
                  action={
                    <Button href="/questions" variant="outline">
                      অন্য প্রশ্ন দেখুন
                    </Button>
                  }
                />
                {candidates.length > 0 ? (
                  <Card>
                    <CardHeader
                      icon={Sparkles}
                      title="কোন আলেমদের কাছে পাঠানো হয়েছে"
                      subtitle="অগ্রাধিকার ক্রম অনুযায়ী — যিনি আগে উত্তর দিতে পারেন"
                    />
                    <ol className="mt-4 space-y-3">
                      {candidates.map((candidate, index) => {
                        const scholar = SCHOLAR_BY_ID[candidate.scholarId];
                        if (!scholar) return null;
                        return (
                          <li key={candidate.scholarId} className="flex items-center gap-3">
                            <span
                              className={
                                index === 0
                                  ? "grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-[0.75rem] font-bold tabular text-primary-foreground"
                                  : "grid size-7 shrink-0 place-items-center rounded-lg bg-surface-3 text-[0.75rem] font-bold tabular text-muted-foreground"
                              }
                            >
                              {formatNumber(index + 1, "bn")}
                            </span>
                            <div className="min-w-0 flex-1">
                              <ScholarMiniCard scholar={scholar} />
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                    {candidates[0] ? (
                      <RoutingReasons
                        reasons={candidates[0].reasonsBn}
                        score={candidates[0].score}
                        className="mt-4"
                      />
                    ) : null}
                  </Card>
                ) : null}
              </div>
            ) : (
              <div className="space-y-5">
                {accepted ? (
                  <AnswerCard answer={accepted} question={question} accepted />
                ) : null}
                {others.map((answer) => (
                  <AnswerCard key={answer.id} answer={answer} />
                ))}
              </div>
            )}
          </section>

          {/* --------------------------------------------- scholar invitation */}
          {question.status !== "closed" ? (
            <Callout
              tone="primary"
              icon={Sparkles}
              title="আপনি আলেম হলে উত্তর দিতে পারেন"
              action={
                <Button href="/scholar/questions" variant="outline" size="sm">
                  আলেম প্যানেল
                </Button>
              }
            >
              সংশ্লিষ্ট বিভাগের আলেমরা এই প্রশ্নটি তাঁদের প্রশ্ন বাক্সে পেয়েছেন। উত্তর লেখার সময়
              কুরআন ও হাদীসের প্রাসঙ্গিক রেফারেন্স প্রস্তাব হিসেবে পাওয়া যায়, যা এক ক্লিকে যুক্ত করা যায়।
            </Callout>
          ) : null}

          {escalated?.becameFatwaSlug ? (
            <Callout tone="accent" icon={Scale} title="এই প্রশ্নটি ফতোয়া হিসেবে প্রকাশিত হয়েছে">
              <span className="block">
                প্রশ্নটি গুরুত্বপূর্ণ হওয়ায় আলেমের উত্তরটি পরে আনুষ্ঠানিক ফতোয়া আকারে প্রকাশ করা হয়েছে।
              </span>
              <Button href={`/fatwas/${escalated.becameFatwaSlug}`} variant="outline" size="sm" className="mt-3">
                ফতোয়াটি পড়ুন
              </Button>
            </Callout>
          ) : null}

          <AskCtaCard />
        </div>

        {/* ----------------------------------------------------------- rail */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader icon={Compass} title="এই প্রশ্নটি যেভাবে পৌঁছেছে" />
            <ol className="mt-4 space-y-3">
              {[
                "প্রশ্নকারী বিভাগ নির্বাচন করেছেন।",
                "সেই বিভাগের আলেমদের মধ্যে অগ্রাধিকার নির্ধারণ করা হয়েছে।",
                "শীর্ষ আলেমদের প্রশ্ন বাক্সে এটি দেখানো হয়েছে।",
                accepted ? "একজন আলেম উত্তর দিয়েছেন।" : "উত্তরের অপেক্ষা চলছে।",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-3 text-[0.6875rem] font-bold tabular text-muted-foreground">
                    {formatNumber(index + 1, "bn")}
                  </span>
                  <span
                    className={
                      index === 3 && !accepted
                        ? "text-[0.8125rem] leading-relaxed text-warning-soft-foreground"
                        : "text-[0.8125rem] leading-relaxed text-muted-foreground"
                    }
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-border pt-3.5 text-[0.6875rem] leading-relaxed text-subtle-foreground">
              বিভাগ অনুযায়ী পাঠানো হয় বলেই প্রশ্নটি নির্ভুল যোগ্যতার আলেমের কাছে পৌঁছায়।
            </p>
          </Card>

          {involvedScholars.length > 0 ? (
            <section>
              <SectionHeader size="sm" icon={Users} title="জড়িত আলেমেরা" />
              <div className="space-y-2.5">
                {involvedScholars.slice(0, 4).map((scholar) => (
                  <ScholarMiniCard key={scholar.id} scholar={scholar} />
                ))}
              </div>
            </section>
          ) : null}

          {relatedQuestions.length > 0 ? (
            <section>
              <SectionHeader
                size="sm"
                icon={MessageCircleQuestion}
                title={<T k="label.relatedQuestions" />}
              />
              <div className="space-y-1">
                {relatedQuestions.map((related) => (
                  <QuestionRow key={related.id} question={related} />
                ))}
              </div>
            </section>
          ) : null}

          {relatedFatwas.length > 0 ? (
            <section>
              <SectionHeader size="sm" tone="accent" icon={Scale} title="সম্পর্কিত ফতোয়া" />
              <div className="space-y-3">
                {relatedFatwas.map((fatwa) => (
                  <FatwaRow key={fatwa.id} fatwa={fatwa} />
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
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
import type { Scholar } from "@/lib/types";
import {
  fetchDepartments,
  fetchFatwas,
  fetchPublicUser,
  fetchQuestion,
  fetchQuestions,
  fetchScholars,
  indexBy,
} from "@/lib/content-api";
import { Num, T, TimeAgo } from "@/components/i18n-text";
import { AnswerCard, AskCtaCard, FatwaRow, QuestionRow } from "@/components/knowledge";
import { ScholarMiniCard } from "@/components/people";
import {
  Badge,
  Breadcrumbs,
  Button,
  Callout,
  Card,
  CardHeader,
  Chip,
  EmptyState,
  ErrorState,
  Prose,
  SectionHeader,
  StatusBadge,
} from "@/components/ui";
import { findDistrict } from "@/lib/bn";
import { toParagraphs } from "@/lib/utils";

/**
 * One question, read from the API.
 *
 * The question, its answers, the asker's name, the departments it was filed under
 * and every rail beside it come from the API, so an answer a scholar gives today is
 * on this page today. The bundled dataset used to answer all of it, which meant a
 * question nobody had seeded could not be reached at all.
 *
 * Two things are deliberate:
 *
 *  - **A slug the API does not know is a 404.** It will never exist, so the answer
 *    is the not-found boundary rather than an error state. Anything else — the
 *    service down, a read that timed out — gets an error state with a way to try
 *    again, because the question does exist and saying otherwise would be a lie.
 *  - **The routing candidate card lost its scores.** The API records which
 *    departments a question was filed under, not the priority ranking that used to
 *    be computed from it, so the card now shows the scholars who actually carry
 *    those departments instead of a scored queue that no longer exists. A number
 *    invented client-side to fill that space would be worse than the honest list.
 */

/**
 * One read per request, shared by the metadata and the page.
 *
 * Both need the same question and Next renders them as separate passes, so a bare
 * fetch in each is two requests for one page. On the missing-slug path that is
 * worse than wasteful: two 404s arriving together leave the metadata pass in flight
 * when the page throws `notFound()`, and a boundary that has already flushed cannot
 * be replaced — the reader gets the 404 UI and a stream that never closes.
 */
const readQuestion = cache(async (slug: string) => {
  const result = await fetchQuestion(slug);
  if (!result.ok && result.status === 404) notFound();
  return result;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await readQuestion(slug);
  if (!result.ok) return { title: "প্রশ্ন পাওয়া যায়নি" };
  return {
    title: result.data.question.titleBn,
    description: result.data.question.bodyBn.slice(0, 180),
  };
}

const STATUS_LABEL: Record<string, string> = {
  open: "খোলা",
  routed: "আলেমের কাছে পাঠানো",
  answered: "উত্তর দেওয়া হয়েছে",
  closed: "সম্পন্ন",
};

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await readQuestion(slug);

  if (!result.ok) {
    return (
      <ErrorState
        title="প্রশ্নটি আনা যায়নি"
        description="কনটেন্ট সার্ভিসে পৌঁছানো যায়নি, তাই প্রশ্নটি এখন দেখানো যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।"
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button href={`/questions/${encodeURIComponent(slug)}`} size="sm">
              আবার চেষ্টা করুন
            </Button>
            <Button href="/questions" variant="outline" size="sm">
              সব প্রশ্ন দেখুন
            </Button>
          </div>
        }
      />
    );
  }

  const { question, answers } = result.data;
  const accepted = answers.find((answer) => answer.accepted) ?? null;
  const others = answers.filter((answer) => answer.id !== accepted?.id);
  const escalated = answers.find((answer) => answer.becameFatwaSlug);
  const district = findDistrict(question.askerDistrict);

  // The rails are the same archive read sideways — one query each, in parallel —
  // and a rail that comes back empty is simply not drawn: a heading with nothing
  // under it is worse than the section being absent.
  const firstDepartment = question.departmentIds[0];
  const [departmentsResult, scholarsResult, askerResult, routedResult, relatedQuestionsResult, relatedFatwasResult] =
    await Promise.all([
      fetchDepartments(),
      fetchScholars(),
      // Only a public question names the person who asked it; the API's public
      // profile is where that name comes from, and a failed lookup costs the name,
      // not the page.
      question.visibility === "public" ? fetchPublicUser(question.askerId) : Promise.resolve(null),
      firstDepartment ? fetchScholars({ department: firstDepartment, limit: 4 }) : Promise.resolve(null),
      firstDepartment ? fetchQuestions({ department: firstDepartment, limit: 6 }) : Promise.resolve(null),
      firstDepartment ? fetchFatwas({ department: firstDepartment, limit: 3 }) : Promise.resolve(null),
    ]);

  const departments = (departmentsResult.ok ? departmentsResult.data : []).filter(
    (department) =>
      question.departmentIds.includes(department.slug) || question.departmentIds.includes(department.id),
  );
  const scholarsById = indexBy(scholarsResult.ok ? scholarsResult.data.items : [], "id");
  const asker = askerResult?.ok ? askerResult.data.user : undefined;
  const routed = routedResult?.ok ? routedResult.data.items : [];
  const relatedQuestions = (relatedQuestionsResult?.ok ? relatedQuestionsResult.data.items : [])
    .filter((other) => other.id !== question.id)
    .slice(0, 5);
  const relatedFatwas = relatedFatwasResult?.ok ? relatedFatwasResult.data.items : [];

  // Scholars either already involved or carrying the question's departments.
  const involvedScholarIds = [
    ...new Set([...answers.map((answer) => answer.scholarId), ...routed.map((scholar) => scholar.id)]),
  ];
  const involvedScholars = involvedScholarIds
    .map((id) => scholarsById.get(id))
    .filter((scholar): scholar is Scholar => Boolean(scholar));

  // The crumb wants a short name for this question. Ids are opaque (`q-1a2b3c`), so
  // a number is only there when the id happens to carry one; otherwise the id
  // itself is the honest label — it is what the API answers for this question.
  const reference = question.id.replace(/^q-?/, "");
  const questionRef = /^\d+$/.test(reference) ? <Num value={Number(reference)} /> : question.id;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "হোম", href: "/" },
          { label: "প্রশ্নোত্তর", href: "/questions" },
          { label: <>প্রশ্ন #{questionRef}</> },
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
                <TimeAgo iso={question.createdAt} />
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
                  <Num value={question.views} /> বার দেখা হয়েছে
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" aria-hidden />
                  <Num value={question.followerCount} /> জন অনুসরণ করছেন
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
              title={
                <>
                  উত্তর
                  {answers.length > 0 ? <> (<Num value={answers.length} />)</> : null}
                </>
              }
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
                {routed.length > 0 ? (
                  <Card>
                    <CardHeader
                      icon={Sparkles}
                      title="কোন আলেমদের কাছে পাঠানো হয়েছে"
                      subtitle="প্রশ্নের বিভাগগুলো যাঁরা সামলান"
                    />
                    <ol className="mt-4 space-y-3">
                      {routed.map((scholar) => (
                        <li key={scholar.id} className="min-w-0">
                          <ScholarMiniCard scholar={scholar} />
                        </li>
                      ))}
                    </ol>
                  </Card>
                ) : null}
              </div>
            ) : (
              <div className="space-y-5">
                {accepted ? (
                  <AnswerCard
                    answer={accepted}
                    question={question}
                    accepted
                    scholar={scholarsById.get(accepted.scholarId)}
                  />
                ) : null}
                {others.map((answer) => (
                  <AnswerCard
                    key={answer.id}
                    answer={answer}
                    scholar={scholarsById.get(answer.scholarId)}
                  />
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
                    <Num value={index + 1} />
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
                  <FatwaRow key={fatwa.id} fatwa={fatwa} mufti={scholarsById.get(fatwa.muftiId)} />
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

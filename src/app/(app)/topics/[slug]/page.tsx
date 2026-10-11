import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  MessageCircleQuestion,
  MessagesSquare,
  Scale,
  ScrollText,
  Sparkles,
} from "@/components/icons";
import type { Department, Scholar } from "@/lib/types";
import {
  fetchArticles,
  fetchDepartments,
  fetchDiscussions,
  fetchFatwas,
  fetchHadiths,
  fetchQuestions,
  fetchScholars,
  fetchTopic,
  fetchTopics,
  indexBy,
  MAX_LIMIT,
} from "@/lib/content-api";
import { formatNumber } from "@/lib/bn";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Chip,
  ContentPending,
  EmptyState,
  ErrorState,
  PageHeader,
  SectionHeader,
} from "@/components/ui";
import {
  ArticleCard,
  DiscussionRow,
  FatwaCard,
  QuestionRow,
} from "@/components/knowledge";
import { HadithCard } from "@/components/hadith";
import { departmentIcon } from "@/components/people";
import { T, Pick } from "@/components/i18n-text";

/**
 * One topic, read from the API.
 *
 * A topic is a query, not a page of prose: the vocabulary, the departments behind
 * it, and then the content that answers to either. The API does that resolution
 * itself — `?topic=<slug>&includeRelated=true` matches what the topic tags *and*
 * what its departments carry, which is the two-tier match this page has always
 * wanted — so the page no longer guesses which key a row tagged itself with.
 *
 * A slug the API does not know is a 404 and gets `notFound()`, because it will
 * never exist; anything else — the service down, a query that timed out — gets an
 * error state with a way to try again, because the topic does exist.
 */

/**
 * One read per request, shared by the metadata and the page.
 *
 * Same reason as the article route: both passes need the topic, a bare fetch in
 * each is two requests, and on the missing-slug path the second one would flush a
 * boundary the first has already decided about. `cache` collapses the two.
 */
const readTopic = cache(async (slug: string) => {
  const result = await fetchTopic(slug);
  if (!result.ok && result.status === 404) notFound();
  return result;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await readTopic(slug);
  if (!result.ok) return { title: "বিষয়" };

  return {
    title: result.data.topic.name.bn,
    description: result.data.topic.description.bn,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await readTopic(slug);

  if (!result.ok) {
    return (
      <ErrorState
        title="বিষয়টি আনা যায়নি"
        description="কনটেন্ট সার্ভিসে পৌঁছানো যায়নি, তাই বিষয়টি এখন দেখানো যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।"
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button href={`/topics/${encodeURIComponent(slug)}`} size="sm">
              আবার চেষ্টা করুন
            </Button>
            <Button href="/topics" variant="outline" size="sm">
              সব বিষয় দেখুন
            </Button>
          </div>
        }
      />
    );
  }

  const { topic, departmentSlugs } = result.data;
  const primarySlug = departmentSlugs[0];

  /**
   * Every section of this page, in one round of reads.
   *
   * The rails are the same content read sideways — one query per section, all in
   * parallel — and a section that comes back empty is simply not drawn, which is
   * why a failed side read costs a rail rather than the page.
   */
  const [
    departmentsResult,
    questionsResult,
    articlesResult,
    fatwasResult,
    discussionsResult,
    hadithsResult,
    scholarsResult,
    topicsResult,
  ] = await Promise.all([
    fetchDepartments(),
    fetchQuestions({ topic: topic.slug, includeRelated: true, limit: 6 }),
    fetchArticles({ topic: topic.slug, includeRelated: true, limit: 6 }),
    // Fatwas filter by department, not by topic, so the archive is read whole and
    // narrowed here against the departments this topic covers.
    fetchFatwas({ limit: MAX_LIMIT }),
    fetchDiscussions({ topic: topic.slug, includeRelated: true, limit: 4 }),
    // A hadith is tagged with a department, so the topic's first department is the
    // vocabulary its filter speaks.
    primarySlug
      ? fetchHadiths({ topic: primarySlug, limit: 3 })
      : Promise.resolve(null),
    fetchScholars(),
    fetchTopics(),
  ]);

  const departments = departmentsResult.ok ? departmentsResult.data : [];
  const scholars = indexBy(scholarsResult.ok ? scholarsResult.data.items : [], "id");
  const questions = questionsResult.ok ? questionsResult.data.items : [];
  const discussions = discussionsResult.ok ? discussionsResult.data.items : [];
  const hadiths = hadithsResult?.ok ? hadithsResult.data.items : [];
  const fatwas = (fatwasResult.ok ? fatwasResult.data.items : []).filter((fatwa) =>
    fatwa.departmentIds.some((id) => departmentSlugs.includes(id)),
  );

  const taggedArticles = articlesResult.ok ? articlesResult.data.items : [];
  // Nothing carries the topic's own tags, so the departments behind it are the
  // fallback tier — and the note below the list says exactly that.
  const fallbackArticles =
    taggedArticles.length === 0 && primarySlug
      ? await fetchArticles({ department: primarySlug, limit: 6 })
      : null;
  const articles =
    taggedArticles.length > 0
      ? taggedArticles
      : fallbackArticles?.ok
        ? fallbackArticles.data.items
        : [];

  const topicDepartments = departments.filter((department) =>
    departmentSlugs.includes(department.slug),
  );
  const primaryTone = topicDepartments[0]?.tone ?? "primary";

  const related = (topicsResult.ok ? topicsResult.data : [])
    .filter(
      (other) =>
        other.slug !== topic.slug &&
        other.departmentSlugs.some((deptSlug) => departmentSlugs.includes(deptSlug)),
    )
    .slice(0, 10);

  const empty =
    articles.length + fatwas.length + questions.length + discussions.length + hadiths.length ===
    0;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: <T k="nav.home" />, href: "/" },
          { label: <T k="label.topics" />, href: "/topics" },
          { label: <Pick value={topic.name} /> },
        ]}
        eyebrow={<T k="label.topic" />}
        title={<Pick value={topic.name} />}
        description={<Pick value={topic.description} />}
        icon={Sparkles}
        tone={primaryTone}
        patterned
        actions={
          <>
            <Button href="/questions/ask" icon={MessageCircleQuestion}>
              এই বিষয়ে প্রশ্ন করুন
            </Button>
            <Button href="/topics" variant="outline">
              <T k="nav.topics" />
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          {topic.trending ? (
            <Badge tone="danger" size="sm" icon={Sparkles}>
              <T k="label.trending" />
            </Badge>
          ) : null}
          <Badge tone="neutral" size="sm">
            {formatNumber(topic.contentCount, "bn")} টি কনটেন্ট
          </Badge>
          {topicDepartments.map((department) => (
            <Chip
              key={department.id}
              href={`/departments/${department.slug}`}
              tone={department.tone}
              icon={departmentIcon(department.icon)}
              size="md"
            >
              <Pick value={department.shortName} />
            </Chip>
          ))}
        </div>
      </PageHeader>

      {empty ? (
        <EmptyState
          icon={Sparkles}
          title="এই বিষয়ে কনটেন্ট আসছে"
          description="এই বিষয়ে প্রশ্ন, প্রবন্ধ, ফতোয়া ও হাদীস যুক্ত করার কাজ চলছে। আপনি চাইলে এখনই প্রশ্ন করতে পারেন।"
          action={
            <Button href="/questions/ask" icon={MessageCircleQuestion}>
              <T k="action.askScholar" />
            </Button>
          }
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          {/* -------- questions: usually the most urgent need -------- */}
          {questions.length > 0 ? (
            <section>
              <SectionHeader
                title={<T k="label.questions" />}
                description="এই বিষয়ে অন্যরা যা জিজ্ঞেস করেছেন"
                icon={MessageCircleQuestion}
                tone="info"
                href="/questions"
              />
              <Card padding="sm" className="divide-y divide-border">
                {questions.map((question) => (
                  <QuestionRow key={question.id} question={question} />
                ))}
              </Card>
            </section>
          ) : null}

          {/* -------- articles -------- */}
          {articles.length > 0 ? (
            <section>
              <SectionHeader
                title={<T k="label.articles" />}
                description={
                  taggedArticles.length === 0
                    ? "সম্পর্কিত বিভাগের প্রবন্ধ"
                    : "বিস্তারিত আলোচনা ও দলিল"
                }
                icon={FileText}
                tone="primary"
                href="/articles"
              />
              <div className="space-y-3">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    author={scholars.get(article.authorId)}
                    department={departmentOf(departments, article.departmentIds)}
                    layout="list"
                  />
                ))}
              </div>
            </section>
          ) : null}

          {/* -------- fatwas -------- */}
          {fatwas.length > 0 ? (
            <section>
              <SectionHeader
                title={<T k="label.fatwas" />}
                description="দলিলসহ যাচাইকৃত রায়"
                icon={Scale}
                tone="accent"
                href="/fatwas"
              />
              <div className="space-y-3">
                {fatwas.map((fatwa) => (
                  <FatwaCard
                    key={fatwa.id}
                    fatwa={fatwa}
                    mufti={scholars.get(fatwa.muftiId)}
                    coSigners={coSignersOf(fatwa.coSignerIds, scholars)}
                    department={departmentOf(departments, fatwa.departmentIds)}
                    layout="list"
                  />
                ))}
              </div>
            </section>
          ) : null}

          {/* -------- hadith -------- */}
          {hadiths.length > 0 ? (
            <section>
              <SectionHeader
                title={<T k="label.relatedHadiths" />}
                description="এই বিষয়ের সহীহ হাদীস"
                icon={ScrollText}
                tone="success"
                href="/hadith"
              />
              <div className="space-y-3">
                {hadiths.map((hadith) => (
                  <HadithCard key={hadith.id} hadith={hadith} />
                ))}
              </div>
            </section>
          ) : null}

          {/* -------- discussions -------- */}
          {discussions.length > 0 ? (
            <section>
              <SectionHeader
                title={<T k="label.discussions" />}
                description="মডারেটেড, জ্ঞানকেন্দ্রিক আলোচনা"
                icon={MessagesSquare}
                tone="user"
                href="/discussions"
              />
              <Card padding="sm" className="divide-y divide-border">
                {discussions.map((discussion) => (
                  <DiscussionRow key={discussion.id} discussion={discussion} />
                ))}
              </Card>
            </section>
          ) : null}

          {taggedArticles.length === 0 && articles.length > 0 ? (
            <ContentPending message="এই নির্দিষ্ট বিষয়ে সরাসরি কোনো প্রবন্ধ এখনো যুক্ত হয়নি — উপরের তালিকায় সংশ্লিষ্ট বিভাগের প্রবন্ধ দেখানো হয়েছে।" />
          ) : null}
        </div>

        {/* -------- rail -------- */}
        <aside className="space-y-4">
          <Card>
            <CardHeader
              title={<T k="label.relatedKnowledge" />}
              subtitle="একই বিভাগের অন্যান্য বিষয়"
              icon={BookOpen}
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {related.length > 0 ? (
                related.map((other) => (
                  <Chip
                    key={other.slug}
                    href={`/topics/${other.slug}`}
                    tone={primaryTone}
                    count={other.contentCount}
                  >
                    <Pick value={other.name} />
                  </Chip>
                ))
              ) : (
                <p className="text-[0.8125rem] text-muted-foreground">
                  সম্পর্কিত বিষয় এখনো যুক্ত হয়নি।
                </p>
              )}
            </div>
          </Card>

          <Card variant="parchment">
            <CardHeader
              title="নিজে পড়ে দেখুন"
              subtitle="কুরআন ও হাদীসে ফিরে যান"
              icon={BookOpen}
            />
            <div className="mt-4 flex flex-col gap-2">
              <Button href="/quran" variant="outline" full icon={BookOpen}>
                <T k="nav.quran" />
              </Button>
              <Button href="/hadith" variant="outline" full icon={ScrollText}>
                <T k="nav.hadith" />
              </Button>
            </div>
          </Card>

          <Link
            href="/topics"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-primary transition-colors hover:text-primary-hover"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            <T k="label.topics" />
          </Link>
        </aside>
      </div>
    </div>
  );
}

/** The first department of a piece, from the fetched set rather than a lookup table. */
function departmentOf(
  departments: Department[],
  slugs: string[],
): Department | undefined {
  return departments.find((department) => slugs.includes(department.slug));
}

/** The co-signing muftis, resolved from the scholars the page already fetched. */
function coSignersOf(ids: string[], byId: Map<string, Scholar>): Scholar[] {
  return ids
    .map((id) => byId.get(id))
    .filter((scholar): scholar is Scholar => Boolean(scholar));
}

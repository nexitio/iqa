import type { Metadata } from "next";
import Link from "next/link";
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
import { DEPARTMENTS, TOPICS, getTopic } from "@/lib/data/departments";
import { ARTICLES, FATWAS, getArticlesByDepartment } from "@/lib/data/content";
import { QUESTIONS } from "@/lib/data/questions";
import { DISCUSSIONS } from "@/lib/data/community";
import { HADITHS } from "@/lib/data/hadith";
import { formatNumber } from "@/lib/bn";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Chip,
  ContentPending,
  EmptyState,
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

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return { title: "বিষয়" };
  return { title: topic.name.bn, description: topic.description.bn };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const departments = topic.departmentSlugs
    .map((id) => DEPARTMENTS.find((d) => d.slug === id || d.id === id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  /**
   * Topic matching is deliberately two-tier.
   *
   * Authored content tags itself with a mix of topic slugs and department
   * slugs, so a strict slug match would hide genuinely relevant material. We
   * take exact topic matches first and only fall back to department overlap to
   * keep the page useful rather than empty.
   */
  const matchesTopic = (topicIds: string[], departmentIds: string[]) =>
    topicIds.includes(topic.slug) ||
    departmentIds.some((d) => topic.departmentSlugs.includes(d));

  const articles = ARTICLES.filter((a) => matchesTopic(a.topicIds, a.departmentIds));
  const fatwas = FATWAS.filter((f) => matchesTopic([], f.departmentIds));
  const questions = QUESTIONS.filter((q) => matchesTopic(q.topicIds, q.departmentIds));
  const discussions = DISCUSSIONS.filter((d) => matchesTopic(d.topicIds, d.departmentIds));
  const hadiths = HADITHS.filter((h) => matchesTopic(h.topicIds, [])).slice(0, 3);

  // Fall back to the primary department's own articles when nothing matched.
  const fallbackArticles =
    articles.length === 0 && departments[0]
      ? getArticlesByDepartment(departments[0].slug)
      : [];
  const shownArticles = articles.length > 0 ? articles : fallbackArticles;

  const related = TOPICS.filter(
    (other) =>
      other.slug !== topic.slug &&
      other.departmentSlugs.some((d) => topic.departmentSlugs.includes(d)),
  ).slice(0, 10);

  const empty =
    shownArticles.length +
      fatwas.length +
      questions.length +
      discussions.length +
      hadiths.length ===
    0;

  const primaryTone = departments[0]?.tone ?? "primary";

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
          {departments.map((department) => (
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
          {shownArticles.length > 0 ? (
            <section>
              <SectionHeader
                title={<T k="label.articles" />}
                description={
                  articles.length === 0
                    ? "সম্পর্কিত বিভাগের প্রবন্ধ"
                    : "বিস্তারিত আলোচনা ও দলিল"
                }
                icon={FileText}
                tone="primary"
                href="/articles"
              />
              <div className="space-y-3">
                {shownArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} layout="list" />
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
                  <FatwaCard key={fatwa.id} fatwa={fatwa} layout="list" />
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

          {articles.length === 0 && shownArticles.length > 0 ? (
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

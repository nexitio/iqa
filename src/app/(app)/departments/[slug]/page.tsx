import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  MessageCircleQuestion,
  Scale,
  Sparkles,
  TrendingUp,
  Users,
} from "@/components/icons";
import {
  DEPARTMENTS,
  getDepartment,
  getTopicsByDepartment,
} from "@/lib/data/departments";
import { getScholarsByDepartment } from "@/lib/data/scholars";
import { FATWAS, getArticlesByDepartment } from "@/lib/data/content";
import { QUESTIONS } from "@/lib/data/questions";
import { formatNumber } from "@/lib/bn";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  Chip,
  ContentPending,
  EmptyState,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { ScholarCard, departmentIcon } from "@/components/people";
import { ArticleCard, FatwaCard, QuestionRow } from "@/components/knowledge";
import { T, Pick } from "@/components/i18n-text";

export function generateStaticParams() {
  return DEPARTMENTS.map((department) => ({ slug: department.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const department = getDepartment(slug);
  if (!department) return { title: "বিভাগ" };
  return {
    title: `${department.name.bn} — বিভাগ`,
    description: department.description.bn,
  };
}

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const department = getDepartment(slug);
  if (!department) notFound();

  const Icon = departmentIcon(department.icon);
  const scholars = getScholarsByDepartment(department.slug);
  const articles = getArticlesByDepartment(department.slug);
  const fatwas = FATWAS.filter((f) => f.departmentIds.includes(department.slug));
  const questions = QUESTIONS.filter((q) => q.departmentIds.includes(department.slug));
  const topics = getTopicsByDepartment(department.slug);

  const answerRate =
    department.stats.questions > 0
      ? Math.round((department.stats.answered / department.stats.questions) * 100)
      : 0;

  const hasContent =
    scholars.length + articles.length + fatwas.length + questions.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: <T k="nav.home" />, href: "/" },
          { label: <T k="label.departments" />, href: "/topics" },
          { label: <Pick value={department.name} /> },
        ]}
        eyebrow={
          <span className="flex items-center gap-2">
            {department.trending ? (
              <Badge tone="danger" size="xs" icon={TrendingUp}>
                <T k="label.trending" />
              </Badge>
            ) : null}
            <span>
              <T k="label.department" />
            </span>
          </span>
        }
        title={<Pick value={department.name} />}
        description={<Pick value={department.description} />}
        icon={Icon}
        tone={department.tone}
        patterned
        actions={
          <>
            <Button href="/questions/ask" icon={MessageCircleQuestion}>
              এই বিভাগে প্রশ্ন করুন
            </Button>
            <Button href="/topics" variant="outline" icon={Sparkles}>
              <T k="label.topics" />
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label={<T k="label.questions" />}
            value={formatNumber(department.stats.questions, "bn")}
            hint={`${formatNumber(answerRate, "bn")}% উত্তরের হার`}
            icon={MessageCircleQuestion}
            tone="info"
          />
          <StatTile
            label={<T k="label.answers" />}
            value={formatNumber(department.stats.answered, "bn")}
            hint="উত্তর দেওয়া প্রশ্ন"
            icon={Users}
            tone="success"
          />
          <StatTile
            label={<T k="label.articles" />}
            value={formatNumber(department.stats.articles, "bn")}
            hint="প্রকাশিত প্রবন্ধ"
            icon={FileText}
            tone="primary"
          />
          <StatTile
            label={<T k="label.fatwas" />}
            value={formatNumber(department.stats.fatwas, "bn")}
            hint="যাচাইকৃত ফিকহি রায়"
            icon={Scale}
            tone="accent"
          />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          {/* ---------------- scholars ---------------- */}
          <section>
            <SectionHeader
              title="এই বিভাগের আলেম"
              description="প্রশ্ন করলে প্রথমে এঁদের কাছেই যাবে"
              icon={Users}
              tone="scholar"
              href="/scholars"
            />
            {scholars.length === 0 ? (
              <EmptyState
                compact
                icon={Users}
                title="এখনো আলেম যুক্ত হয়নি"
                description="এই বিভাগে আলেম যোগ করা হলে তাঁরা এখানে দেখা যাবেন।"
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {scholars.map((scholar) => (
                  <ScholarCard key={scholar.id} scholar={scholar} layout="compact" />
                ))}
              </div>
            )}
          </section>

          {/* ---------------- questions ---------------- */}
          <section>
            <SectionHeader
              title="এই বিভাগের প্রশ্ন"
              description="অন্যরা যা জিজ্ঞেস করেছেন — হয়তো আপনার উত্তরও এখানে আছে"
              icon={MessageCircleQuestion}
              tone="info"
              href="/questions"
            />
            {questions.length === 0 ? (
              <ContentPending message="এই বিভাগের কোনো প্রশ্ন এখনো যুক্ত হয়নি।" />
            ) : (
              <Card padding="sm" className="divide-y divide-border">
                {questions.map((question) => (
                  <QuestionRow key={question.id} question={question} />
                ))}
              </Card>
            )}
          </section>

          {/* ---------------- articles ---------------- */}
          <section>
            <SectionHeader
              title="প্রবন্ধ"
              description="এই বিভাগের আলেমদের লেখা"
              icon={FileText}
              tone="primary"
              href="/articles"
            />
            {articles.length === 0 ? (
              <ContentPending message="এই বিভাগের কোনো প্রবন্ধ এখনো যুক্ত হয়নি।" />
            ) : (
              <div className="space-y-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} layout="list" />
                ))}
              </div>
            )}
          </section>

          {/* ---------------- fatwas ---------------- */}
          <section>
            <SectionHeader
              title="ফতোয়া"
              description="দলিলসহ যাচাইকৃত ফিকহি রায়"
              icon={Scale}
              tone="accent"
              href="/fatwas"
            />
            {fatwas.length === 0 ? (
              <ContentPending message="এই বিভাগের কোনো ফতোয়া এখনো যুক্ত হয়নি।" />
            ) : (
              <div className="space-y-3">
                {fatwas.map((fatwa) => (
                  <FatwaCard key={fatwa.id} fatwa={fatwa} layout="list" />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ---------------- rail ---------------- */}
        <aside className="space-y-4">
          {topics.length > 0 ? (
            <Card>
              <CardHeader
                title={<T k="label.topics" />}
                subtitle="এই বিভাগের আলোচিত বিষয়"
                icon={BookOpen}
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {topics.map((topic) => (
                  <Chip
                    key={topic.slug}
                    href={`/topics/${topic.slug}`}
                    tone={department.tone}
                    count={topic.contentCount}
                  >
                    <Pick value={topic.name} />
                  </Chip>
                ))}
              </div>
            </Card>
          ) : null}

          <Card variant="parchment">
            <CardHeader
              title="প্রশ্ন রাউটিং"
              subtitle="কীভাবে কাজ করে"
              icon={MessageCircleQuestion}
            />
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
              আপনি যে বিভাগে প্রশ্ন করবেন, সেই বিভাগের আলেমদের অগ্রাধিকার তালিকায়
              সবচেয়ে আগে দেখানো হয়। এতে যোগ্য আলেমই প্রথমে প্রশ্নটি পান।
            </p>
            <Button href="/questions/ask" full className="mt-4">
              <T k="action.askScholar" />
            </Button>
          </Card>

          <div>
            <SectionHeader
              title={<T k="label.departments" />}
              size="sm"
              icon={Sparkles}
            />
            <div className="flex flex-wrap gap-1.5">
              {DEPARTMENTS.filter((d) => d.slug !== department.slug)
                .slice(0, 10)
                .map((other) => (
                  <Chip
                    key={other.id}
                    href={`/departments/${other.slug}`}
                    tone={other.tone}
                    icon={departmentIcon(other.icon)}
                    size="sm"
                  >
                    <Pick value={other.shortName} />
                  </Chip>
                ))}
            </div>
            <Link
              href="/topics"
              className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-primary transition-colors hover:text-primary-hover"
            >
              <T k="action.viewAll" />
              <ArrowLeft className="size-3.5" aria-hidden />
            </Link>
          </div>

          {!hasContent ? (
            <Callout tone="warning" title="বিভাগটি প্রস্তুত হচ্ছে">
              এই বিভাগের আলেম, প্রবন্ধ ও ফতোয়া যুক্ত করার কাজ চলছে।
            </Callout>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

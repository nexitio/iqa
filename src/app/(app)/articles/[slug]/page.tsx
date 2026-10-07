import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AlarmClock,
  BookMarked,
  BookOpen,
  CalendarDays,
  Eye,
  FileText,
  FolderTree,
  MessageCircleQuestion,
  Sparkles,
  Scale,
  UserRound,
} from "@/components/icons";
import {
  ARTICLES,
  FATWAS,
  getArticle,
} from "@/lib/data/content";
import { getDepartment } from "@/lib/data/departments";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";
import { QUESTIONS } from "@/lib/data/questions";
import { T, Pick } from "@/components/i18n-text";
import {
  Avatar,
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Chip,
  ContentPending,
  PageHeader,
  Prose,
  SectionHeader,
  VerifiedMark,
  asTone,
  solidTone,
} from "@/components/ui";
import {
  ArticleRow,
  AskCtaCard,
  AuthorByline,
  ContentMetaBar,
  FatwaRow,
  QuestionRow,
  ReferenceList,
} from "@/components/knowledge";
import { toBnDigits } from "@/lib/bn";
import { citedReferences } from "../../_content/citations";
import { extractHeadings } from "../../_content/outline";
import { SaveShareBar, TableOfContents } from "../../_content/reader-tools";

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "প্রবন্ধ পাওয়া যায়নি" };
  return {
    title: article.title.bn,
    description: article.excerpt.bn,
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const author = SCHOLAR_BY_ID[article.authorId];
  const tone = asTone(article.coverTone);
  const departments = article.departmentIds
    .map((id) => getDepartment(id))
    .filter((department): department is NonNullable<typeof department> => Boolean(department));

  // Citations are recovered from the body text, since Article stores only a count.
  const references = citedReferences(article.bodyBn, article.referenceCount);
  const headings = extractHeadings(article.bodyBn);

  const relatedArticles = ARTICLES.filter(
    (other) =>
      other.id !== article.id &&
      other.status === "published" &&
      other.departmentIds.some((department) => article.departmentIds.includes(department)),
  ).slice(0, 3);

  const relatedFawas = FATWAS.filter(
    (fatwa) =>
      fatwa.status === "published" &&
      fatwa.departmentIds.some((department) => article.departmentIds.includes(department)),
  ).slice(0, 3);

  const relatedQuestions = QUESTIONS.filter((question) =>
    question.departmentIds.some((department) => article.departmentIds.includes(department)),
  ).slice(0, 5);

  const isPublished = article.status === "published";

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "হোম", href: "/" },
          { label: "প্রবন্ধ", href: "/articles" },
          { label: departments[0] ? departments[0].shortName.bn : "প্রবন্ধ" },
        ]}
        eyebrow={departments[0]?.shortName.bn ?? "প্রবন্ধ"}
        title={<Pick value={article.title} />}
        description={<Pick value={article.excerpt} />}
        icon={FileText}
        actions={<SaveShareBar id={article.slug} title={article.title} />}
      />

      {!isPublished ? (
        <Callout
          tone="warning"
          icon={AlarmClock}
          title="এই লেখাটি এখনো প্রকাশিত হয়নি"
        >
          এটি {article.status === "in-review" ? "পর্যালোচনার" : article.status === "draft" ? "খসড়া" : "পরিবর্তন প্রয়োজনীয়"}{" "}
          অবস্থায় আছে। প্রকাশের আগে সংশ্লিষ্ট বিভাগের আলেম যাচাই করে থাকেন — তাই এখানে দেখানো
          বিষয়টি চূড়ান্ত নয়।
        </Callout>
      ) : null}

      {/* Cover band built from the article's own tone token. */}
      <div className={`pattern-girih relative h-40 overflow-hidden rounded-panel sm:h-56 ${solidTone[tone]}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2 sm:bottom-6 sm:left-6">
          <Badge tone="neutral" size="sm" className="bg-white/20 text-white backdrop-blur-sm">
            <Pick value={departments[0]?.name} fallback="প্রবন্ধ" />
          </Badge>
          <Badge tone="neutral" size="sm" className="bg-white/20 text-white backdrop-blur-sm">
            {toBnDigits(article.readingMinutes)} মিনিট পাঠ
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <AuthorByline scholarId={article.authorId} timestamp={article.publishedAt} size="md" />
            <div className="mt-4 border-t border-border pt-4">
              <ContentMetaBar
                items={[
                  {
                    key: "published",
                    icon: CalendarDays,
                    label: (
                      <>
                        <T k="label.publishedOn" />{" "}
                        {new Date(article.publishedAt).toLocaleDateString("bn-BD", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </>
                    ),
                  },
                  {
                    key: "views",
                    icon: Eye,
                    label: `${toBnDigits(article.viewCount.toLocaleString("en-IN"))} বার পঠিত`,
                  },
                  {
                    key: "saved",
                    icon: BookMarked,
                    label: `${toBnDigits(article.bookmarkCount)} বার সংরক্ষিত`,
                  },
                  {
                    key: "refs",
                    icon: Scale,
                    label: `${toBnDigits(article.referenceCount)} টি দলিল`,
                  },
                ]}
              />
            </div>
          </Card>

          {/* The rendered body. `data-reading-body` is the anchor the ToC scrolls within. */}
          <article className="rounded-panel border border-border bg-surface p-5 shadow-card sm:p-8">
            <div data-reading-body>
              <Prose paragraphs={article.bodyBn} />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <div className="flex flex-wrap items-center gap-2">
                {departments.map((department) => (
                  <Chip
                    key={department.slug}
                    href={`/departments/${department.slug}`}
                    size="sm"
                    icon={FolderTree}
                  >
                    <Pick value={department.name} />
                  </Chip>
                ))}
              </div>
              <SaveShareBar id={article.slug} title={article.title} compact />
            </div>
          </article>

          {references.length > 0 ? (
            <ReferenceList
              references={references}
              title="এই প্রবন্ধের দলিল ও রেফারেন্স"
            />
          ) : article.referenceCount > 0 ? (
            <ContentPending message="এই লেখার আয়াত ও হাদীসগুলো মূল লেখার ভেতরেই উদ্ধৃত করা হয়েছে। আলাদা রেফারেন্স তালিকা শীঘ্রই যুক্ত করা হবে।" />
          ) : null}

          {relatedQuestions.length > 0 ? (
            <section aria-label="সম্পর্কিত প্রশ্ন">
              <SectionHeader
                title={<T k="label.relatedQuestions" />}
                description="এই বিষয়ে অন্যদের করা প্রশ্ন"
                icon={MessageCircleQuestion}
                tone="info"
                href="/questions"
              />
              <Card padding="sm">
                {relatedQuestions.map((question) => (
                  <QuestionRow key={question.id} question={question} />
                ))}
              </Card>
            </section>
          ) : null}

          {relatedArticles.length > 0 ? (
            <section aria-label="সম্পর্কিত প্রবন্ধ">
              <SectionHeader
                title="আরও পড়ুন"
                icon={FileText}
                href="/articles"
              />
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedArticles.map((other) => (
                  <ArticleRow key={other.id} article={other} />
                ))}
              </div>
            </section>
          ) : null}

          <AskCtaCard />
        </div>

        {/* Reading rail */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {headings.length >= 2 ? (
            <Card>
              <CardHeader title="এই লেখায় যা আছে" icon={BookOpen} />
              <CardBody className="mt-3">
                <TableOfContents items={headings} />
              </CardBody>
            </Card>
          ) : null}

          {author ? (
            <Card>
              <CardHeader
                title={<T k="label.answeredBy" />}
                icon={UserRound}
                titleClassName="text-[0.9375rem]"
              />
              <CardBody className="mt-3">
                <Link href={`/scholars/${author.slug}`} className="flex items-start gap-3">
                  <Avatar
                    name={author.name.bn}
                    color={author.avatarColor}
                    size="lg"
                    verified={author.verified}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[0.875rem] font-semibold leading-tight text-foreground">
                      <Pick value={author.honorific} /> <Pick value={author.name} />
                      {author.verified ? <VerifiedMark label="যাচাইকৃত" /> : null}
                    </span>
                    <span className="mt-1 block text-[0.75rem] leading-relaxed text-muted-foreground">
                      <Pick value={author.shortBio} />
                    </span>
                  </span>
                </Link>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 text-center">
                  <div>
                    <p className="font-display text-lg font-bold tabular text-foreground">
                      {toBnDigits(author.stats.articles)}
                    </p>
                    <p className="text-[0.6875rem] text-subtle-foreground">প্রবন্ধ</p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold tabular text-foreground">
                      {toBnDigits(author.stats.fatwas)}
                    </p>
                    <p className="text-[0.6875rem] text-subtle-foreground">ফতোয়া</p>
                  </div>
                </div>

                <Button href={`/scholars/${author.slug}`} variant="outline" size="sm" full className="mt-4">
                  প্রোফাইল দেখুন
                </Button>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="লেখকের যোগ্যতা" icon={Sparkles} titleClassName="text-[0.9375rem]" />
            <CardBody className="mt-3 space-y-3">
              {author?.credentials.slice(0, 3).map((credential) => (
                <div key={credential.id} className="min-w-0">
                  <p className="text-[0.8125rem] font-medium leading-snug text-foreground">
                    <Pick value={credential.title} />
                  </p>
                  <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-muted-foreground">
                    <Pick value={credential.institution} /> · {toBnDigits(credential.year)}
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>

          {relatedFawas.length > 0 ? (
            <Card>
              <SectionHeader
                title={<T k="fatwa.title" />}
                icon={Scale}
                tone="accent"
                size="sm"
                href="/fatwas"
                className="mb-2"
              />
              <div className="-mx-2">
                {relatedFawas.map((fatwa) => (
                  <FatwaRow key={fatwa.id} fatwa={fatwa} />
                ))}
              </div>
            </Card>
          ) : null}

          <Card variant="parchment">
            <p className="text-[0.75rem] leading-relaxed text-muted-foreground">
              <T k="misc.footerDisclaimer" />
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

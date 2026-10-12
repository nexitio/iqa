import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
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
import type { Article } from "@/lib/types";
import {
  fetchArticle,
  fetchArticles,
  fetchDepartments,
  fetchFatwas,
  fetchQuestions,
  fetchScholars,
  indexBy,
} from "@/lib/content-api";
import { Digits, GregDate, Num, Pick, T } from "@/components/i18n-text";
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
  ErrorState,
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
import { extractHeadings } from "../../_content/outline";
import { SaveShareBar, TableOfContents } from "../../_content/reader-tools";

/**
 * One article, read from the API.
 *
 * The piece itself, its evidence, the scholar who wrote it, the departments it
 * belongs to and every rail beside it come from the API. The bundled dataset used
 * to answer all of it, which meant a fixture — and a slug nobody had written yet
 * could not be reached at all.
 *
 * A slug the API does not know is a 404 and gets `notFound()`, because it will
 * never exist; anything else — the service down, a query that timed out — gets an
 * error state with a way to try again, because the piece does exist and saying
 * otherwise would be a lie.
 */

/**
 * One read per request, shared by the metadata and the page.
 *
 * Both need the same article, and Next renders them as separate passes, so a bare
 * fetch in each is two requests to the API for one page. On the missing-slug path
 * that is worse than wasteful: two 404s arriving together leave the metadata pass
 * in flight when the page throws `notFound()`, and a boundary that has already
 * flushed cannot be replaced — the reader gets the 404 UI and a stream that never
 * closes. `cache` collapses the two reads into one.
 */
const readArticle = cache(async (slug: string) => {
  const result = await fetchArticle(slug);
  // A slug the API does not know will never exist, so the answer is the not-found
  // boundary rather than an error state. Deciding it here, in the one read both
  // passes await, is what keeps the metadata pass and the page from disagreeing
  // about a piece that is simply not there.
  if (!result.ok && result.status === 404) notFound();
  return result;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await readArticle(slug);
  if (!result.ok) return { title: "প্রবন্ধ পাওয়া যায়নি" };

  return {
    title: result.data.article.title.bn,
    description: result.data.article.excerpt.bn,
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await readArticle(slug);

  if (!result.ok) {
    return (
      <ErrorState
        title="প্রবন্ধটি আনা যায়নি"
        description="কনটেন্ট সার্ভিসে পৌঁছানো যায়নি, তাই লেখাটি এখন দেখানো যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।"
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button href={`/articles/${encodeURIComponent(slug)}`} size="sm">
              আবার চেষ্টা করুন
            </Button>
            <Button href="/articles" variant="outline" size="sm">
              সব প্রবন্ধ দেখুন
            </Button>
          </div>
        }
      />
    );
  }

  const { article, references, author } = result.data;

  const [departmentsResult, scholarsResult] = await Promise.all([
    fetchDepartments(),
    fetchScholars(),
  ]);

  const departments = departmentsResult.ok ? departmentsResult.data : [];
  const scholars = indexBy(scholarsResult.ok ? scholarsResult.data.items : [], "id");

  const articleDepartments = departments.filter((department) =>
    article.departmentIds.includes(department.slug),
  );
  const primaryDepartment = articleDepartments[0];
  // The author as a scholar profile: the detail response names them, and the
  // profile is what the rail and the byline draw.
  const writtenBy = author?.scholarId ? scholars.get(author.scholarId) : undefined;

  // Rails are the same content read sideways — one query per rail, in parallel,
  // and a rail that comes back empty is simply not drawn.
  const [moreArticles, relatedFatwas, relatedQuestions] = await Promise.all([
    primaryDepartment
      ? fetchArticles({ department: primaryDepartment.slug, limit: 4 })
      : Promise.resolve(null),
    primaryDepartment
      ? fetchFatwas({ department: primaryDepartment.slug, limit: 3 })
      : Promise.resolve(null),
    primaryDepartment
      ? fetchQuestions({ department: primaryDepartment.slug, limit: 5 })
      : Promise.resolve(null),
  ]);

  const relatedArticles = (moreArticles?.ok ? moreArticles.data.items : [])
    .filter((other) => other.id !== article.id)
    .slice(0, 3);
  const relatedFawas = relatedFatwas?.ok ? relatedFatwas.data.items : [];
  const relatedQuestionRows = relatedQuestions?.ok ? relatedQuestions.data.items : [];

  const tone = asTone(article.coverTone);
  const headings = extractHeadings(article.bodyBn);
  const isPublished = article.status === "published";

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "হোম", href: "/" },
          { label: "প্রবন্ধ", href: "/articles" },
          { label: primaryDepartment ? primaryDepartment.shortName.bn : "প্রবন্ধ" },
        ]}
        eyebrow={primaryDepartment?.shortName.bn ?? "প্রবন্ধ"}
        title={<Pick value={article.title} />}
        description={<Pick value={article.excerpt} />}
        icon={FileText}
        actions={<SaveShareBar id={article.slug} title={article.title} />}
      />

      {!isPublished ? (
        <Callout tone="warning" icon={AlarmClock} title="এই লেখাটি এখনো প্রকাশিত হয়নি">
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
            <Pick value={primaryDepartment?.name} fallback="প্রবন্ধ" />
          </Badge>
          <Badge tone="neutral" size="sm" className="bg-white/20 text-white backdrop-blur-sm">
            <Digits value={article.readingMinutes} /> মিনিট পাঠ
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <AuthorByline
              scholarId={article.authorId}
              scholar={writtenBy}
              department={primaryDepartment}
              timestamp={article.publishedAt}
              size="md"
            />
            <div className="mt-4 border-t border-border pt-4">
              <ContentMetaBar
                items={[
                  {
                    key: "published",
                    icon: CalendarDays,
                    label: (
                      <>
                        <T k="label.publishedOn" />{" "}
                        <GregDate day={new Date(article.publishedAt)} weekday={false} />
                      </>
                    ),
                  },
                  {
                    key: "views",
                    icon: Eye,
                    label: (
                      <>
                        <Num value={article.viewCount} /> বার পঠিত
                      </>
                    ),
                  },
                  {
                    key: "saved",
                    icon: BookMarked,
                    label: (
                      <>
                        <Digits value={article.bookmarkCount} /> বার সংরক্ষিত
                      </>
                    ),
                  },
                  {
                    key: "refs",
                    icon: Scale,
                    label: (
                      <>
                        <Digits value={article.referenceCount} /> টি দলিল
                      </>
                    ),
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
                {articleDepartments.map((department) => (
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

          {/* The evidence the author attached, exactly as the API holds it. */}
          {references.length > 0 ? (
            <ReferenceList references={references} title="এই প্রবন্ধের দলিল ও রেফারেন্স" />
          ) : article.referenceCount > 0 ? (
            <ContentPending message="এই লেখার আয়াত ও হাদীসগুলো মূল লেখার ভেতরেই উদ্ধৃত করা হয়েছে। আলাদা রেফারেন্স তালিকা শীঘ্রই যুক্ত করা হবে।" />
          ) : null}

          {relatedQuestionRows.length > 0 ? (
            <section aria-label="সম্পর্কিত প্রশ্ন">
              <SectionHeader
                title={<T k="label.relatedQuestions" />}
                description="এই বিষয়ে অন্যদের করা প্রশ্ন"
                icon={MessageCircleQuestion}
                tone="info"
                href="/questions"
              />
              <Card padding="sm">
                {relatedQuestionRows.map((question) => (
                  <QuestionRow key={question.id} question={question} />
                ))}
              </Card>
            </section>
          ) : null}

          {relatedArticles.length > 0 ? (
            <section aria-label="সম্পর্কিত প্রবন্ধ">
              <SectionHeader title="আরও পড়ুন" icon={FileText} href="/articles" />
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedArticles.map((other: Article) => (
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

          {writtenBy ? (
            <Card>
              <CardHeader
                title={<T k="label.answeredBy" />}
                icon={UserRound}
                titleClassName="text-[0.9375rem]"
              />
              <CardBody className="mt-3">
                <Link href={`/scholars/${writtenBy.slug}`} className="flex items-start gap-3">
                  <Avatar
                    name={writtenBy.name.bn}
                    color={writtenBy.avatarColor}
                    size="lg"
                    verified={writtenBy.verified}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[0.875rem] font-semibold leading-tight text-foreground">
                      <Pick value={writtenBy.honorific} /> <Pick value={writtenBy.name} />
                      {writtenBy.verified ? <VerifiedMark label="যাচাইকৃত" /> : null}
                    </span>
                    <span className="mt-1 block text-[0.75rem] leading-relaxed text-muted-foreground">
                      <Pick value={writtenBy.shortBio} />
                    </span>
                  </span>
                </Link>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 text-center">
                  <div>
                    <p className="font-display text-lg font-bold tabular text-foreground">
                      <Digits value={writtenBy.stats.articles} />
                    </p>
                    <p className="text-[0.6875rem] text-subtle-foreground">প্রবন্ধ</p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold tabular text-foreground">
                      <Digits value={writtenBy.stats.fatwas} />
                    </p>
                    <p className="text-[0.6875rem] text-subtle-foreground">ফতোয়া</p>
                  </div>
                </div>

                <Button href={`/scholars/${writtenBy.slug}`} variant="outline" size="sm" full className="mt-4">
                  প্রোফাইল দেখুন
                </Button>
              </CardBody>
            </Card>
          ) : null}

          {writtenBy ? (
            <Card>
              <CardHeader title="লেখকের যোগ্যতা" icon={Sparkles} titleClassName="text-[0.9375rem]" />
              <CardBody className="mt-3 space-y-3">
                {writtenBy.credentials.slice(0, 3).map((credential) => (
                  <div key={credential.id} className="min-w-0">
                    <p className="text-[0.8125rem] font-medium leading-snug text-foreground">
                      <Pick value={credential.title} />
                    </p>
                    <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-muted-foreground">
                      <Pick value={credential.institution} /> · <Digits value={credential.year} />
                    </p>
                  </div>
                ))}
              </CardBody>
            </Card>
          ) : null}

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
                  <FatwaRow key={fatwa.id} fatwa={fatwa} mufti={scholars.get(fatwa.muftiId)} />
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

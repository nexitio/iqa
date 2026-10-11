import type { Metadata } from "next";
import Link from "next/link";
import {
  BookMarked,
  Eye,
  FileText,
  PenLine,
  Sparkles,
  TrendingUp,
  Users,
} from "@/components/icons";
import type { Article, Department, Scholar } from "@/lib/types";
import {
  fetchArticles,
  fetchDepartments,
  fetchScholars,
  fetchTopics,
  indexBy,
  MAX_LIMIT,
} from "@/lib/content-api";
import { T, Pick } from "@/components/i18n-text";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  Chip,
  ChipList,
  EmptyState,
  ErrorState,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { ArticleCard, ArticleRow } from "@/components/knowledge";
import { toBnDigits } from "@/lib/bn";

export const metadata: Metadata = {
  title: "প্রবন্ধ",
  description:
    "আলেমদের লেখা যাচাইকৃত ইসলামিক প্রবন্ধ — ফিকহ, আকীদা, পরিবার, অর্থনীতি ও সমসাময়িক বিষয়ে কুরআন-হাদীসের দলিলসহ।",
};

/**
 * The article archive.
 *
 * Every article on this page comes from the API — the list, the featured piece,
 * the rails, and the totals under the header — and the department, topic and
 * author names come from the same place rather than the bundled dataset. A read
 * that fails shows an error state with a way back; a read that finds nothing shows
 * the empty state, which is a different thing and says so.
 *
 * Two deliberate departures from what this page did over the fixtures:
 *
 *  - **The draft rail is gone.** It listed unpublished work to anyone who opened
 *    the page, which the fixture dataset made invisible. The API returns published
 *    articles unless a `status` is named, and a public page does not get to name
 *    one.
 *  - **`sort=saved` is applied here, not by the API**, which sorts by recency or by
 *    views. Everything published is fetched, so the two orderings agree.
 */

type SortKey = "newest" | "views" | "saved";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "সর্বশেষ" },
  { key: "views", label: "সর্বাধিক পঠিত" },
  { key: "saved", label: "সর্বাধিক সংরক্ষিত" },
];

function buildHref(params: { dept?: string; sort?: string }) {
  const search = new URLSearchParams();
  if (params.dept) search.set("dept", params.dept);
  if (params.sort) search.set("sort", params.sort);
  const query = search.toString();
  return query ? `/articles?${query}` : "/articles";
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string; sort?: string }>;
}) {
  const { dept, sort } = await searchParams;
  const activeSort: SortKey = sort === "views" || sort === "saved" ? sort : "newest";

  const [articles, departments, scholars, topics] = await Promise.all([
    fetchArticles({
      department: dept,
      limit: MAX_LIMIT,
      sort: activeSort === "views" ? "popular" : "recent",
    }),
    fetchDepartments(),
    fetchScholars(),
    fetchTopics(),
  ]);

  const shells = {
    departments: departments.ok ? departments.data : [],
    topics: topics.ok ? topics.data : [],
    scholars: scholars.ok ? scholars.data.items : [],
  };

  if (!articles.ok) {
    return (
      <div className="space-y-6">
        <Header />
        <ErrorState
          title="প্রবন্ধগুলো আনা যায়নি"
          description="কনটেন্ট সার্ভিসে পৌঁছানো যায়নি। একটু পরে আবার চেষ্টা করুন — সমস্যা থেকে গেলে প্রশাসনকে জানান।"
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button href={buildHref({ dept, sort })} size="sm">
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

  const published = articles.data.items;

  // Sorted here only for the one order the API does not have; the rest arrive sorted.
  const sorted =
    activeSort === "saved"
      ? [...published].sort((a, b) => b.bookmarkCount - a.bookmarkCount)
      : published;

  // The most recent piece opens the page, and is not repeated in the grid below.
  const featured = published[0];
  const cards = sorted.filter((article) => article.id !== featured?.id);

  const mostRead = [...published].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  const totalReads = published.reduce((sum, article) => sum + article.viewCount, 0);
  const totalReferences = published.reduce((sum, article) => sum + article.referenceCount, 0);
  const authorIds = new Set(published.map((article) => article.authorId));
  const authors = indexBy(shells.scholars, "id");

  // Departments that actually have published writing, so the rail stays honest.
  const activeDepartments = shells.departments.filter((department) =>
    published.some((article) => article.departmentIds.includes(department.slug)),
  );
  const filteredIn = dept
    ? shells.departments.find((department) => department.slug === dept)
    : undefined;

  return (
    <div className="space-y-6">
      <Header />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="প্রকাশিত প্রবন্ধ"
          value={toBnDigits(articles.data.total)}
          icon={FileText}
          tone="primary"
        />
        <StatTile
          label="মোট পাঠ"
          value={toBnDigits(totalReads.toLocaleString("en-IN"))}
          icon={Eye}
          tone="info"
        />
        <StatTile
          label="দলিল ও রেফারেন্স"
          value={toBnDigits(totalReferences)}
          icon={BookMarked}
          tone="accent"
        />
        <StatTile
          label="লেখক আলেম"
          value={toBnDigits(authorIds.size)}
          icon={Users}
          tone="scholar"
        />
      </div>

      {/* Filters are plain links so a filtered view is shareable and works without JS. */}
      <Card>
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
              <T k="label.departments" />
            </p>
            <ChipList>
              <Chip href={buildHref({ sort })} active={!dept}>
                সব বিভাগ
              </Chip>
              {activeDepartments.map((department) => (
                <Chip
                  key={department.slug}
                  href={buildHref({ dept: department.slug, sort })}
                  active={dept === department.slug}
                  tone="neutral"
                >
                  <Pick value={department.shortName} />
                </Chip>
              ))}
            </ChipList>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                <T k="action.sort" />
              </p>
              {SORTS.map((option) => (
                <Chip
                  key={option.key}
                  href={buildHref({ dept, sort: option.key })}
                  active={activeSort === option.key}
                  tone="primary"
                >
                  {option.label}
                </Chip>
              ))}
            </div>
            <p className="text-[0.75rem] tabular text-muted-foreground">
              {toBnDigits(dept ? published.length : articles.data.total)} টি প্রবন্ধ
            </p>
          </div>
        </div>
      </Card>

      {dept ? (
        <Callout tone="info" title="বিভাগ অনুসারে ছাঁকা হয়েছে">
          <span className="flex flex-wrap items-center gap-2">
            <Pick value={filteredIn?.name} fallback={dept} />
            <Link
              href={buildHref({ sort })}
              className="font-medium text-primary underline underline-offset-2"
            >
              সব প্রবন্ধ দেখুন
            </Link>
          </span>
        </Callout>
      ) : null}

      {/* Featured piece, only on an unfiltered newest view. */}
      {featured && !dept && activeSort === "newest" ? (
        <section aria-labelledby="featured-article">
          <SectionHeader
            title={<span id="featured-article">নির্বাচিত প্রবন্ধ</span>}
            icon={Sparkles}
            tone="accent"
            action={
              <Badge tone="accent" size="xs">
                সর্বশেষ প্রকাশিত
              </Badge>
            }
          />
          <ArticleCard
            article={featured}
            author={authors.get(featured.authorId)}
            department={departmentOf(shells.departments, featured)}
            layout="feature"
          />
        </section>
      ) : null}

      <section aria-label="প্রবন্ধ তালিকা">
        {cards.length === 0 ? (
          <EmptyState
            title={dept ? "কোনো প্রবন্ধ পাওয়া যায়নি" : "এখনো কোনো প্রবন্ধ প্রকাশিত হয়নি"}
            description={
              dept
                ? "এই বিভাগে এখনো কোনো প্রবন্ধ প্রকাশিত হয়নি। অন্য বিভাগ বেছে নিন বা সব প্রবন্ধ দেখুন।"
                : "আলেমদের লেখা প্রকাশিত হলে সেগুলো এখানে দেখা যাবে।"
            }
            icon={FileText}
            action={
              <Button href="/articles" variant="outline" size="sm">
                সব প্রবন্ধ দেখুন
              </Button>
            }
          />
        ) : (
          <>
            <SectionHeader
              title="সকল প্রবন্ধ"
              description="আপনার আগ্রহের বিভাগ অনুসারে সাজানো"
              icon={FileText}
              action={
                <Badge tone="neutral" size="xs" className="tabular">
                  {toBnDigits(cards.length)}
                </Badge>
              }
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  author={authors.get(article.authorId)}
                  department={departmentOf(shells.departments, article)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionHeader title="আলোচিত বিষয়" icon={TrendingUp} tone="danger" size="sm" />
          <CardBody className="mt-0">
            {shells.topics.some((topic) => topic.trending) ? (
              <ChipList className="flex-wrap">
                {shells.topics
                  .filter((topic) => topic.trending)
                  .slice(0, 10)
                  .map((topic) => (
                    <Chip key={topic.slug} href={`/topics/${topic.slug}`} size="sm">
                      <Pick value={topic.name} />
                    </Chip>
                  ))}
              </ChipList>
            ) : (
              <p className="text-[0.8125rem] text-muted-foreground">
                এই মুহূর্তে কোনো আলোচিত বিষয় নেই।
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <SectionHeader
            title="সর্বাধিক পঠিত"
            icon={Eye}
            tone="info"
            size="sm"
            href="/articles?sort=views"
          />
          <div className="-mx-2">
            {mostRead.map((article) => (
              <ArticleRow key={article.id} article={article} />
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="যাঁরা লিখছেন" icon={Users} tone="scholar" size="sm" href="/scholars" />
          <ul className="space-y-3">
            {[...authorIds]
              .map((id) => ({
                scholar: authors.get(id),
                count: published.filter((article) => article.authorId === id).length,
              }))
              .filter((row): row is { scholar: Scholar; count: number } => Boolean(row.scholar))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map(({ scholar, count }) => (
                <li key={scholar.id}>
                  <Link
                    href={`/scholars/${scholar.slug}`}
                    className="flex items-center justify-between gap-3 rounded-xl p-2 transition-colors hover:bg-surface-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[0.8125rem] font-medium text-foreground">
                        <Pick value={scholar.honorific} /> <Pick value={scholar.name} />
                      </span>
                      <span className="mt-0.5 block truncate text-[0.6875rem] text-subtle-foreground">
                        <Pick value={scholar.madrasah} />
                      </span>
                    </span>
                    <Badge tone="primary" size="xs" className="tabular">
                      {toBnDigits(count)} টি লেখা
                    </Badge>
                  </Link>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/** The department a piece belongs to, drawn from the fetched set rather than a lookup table. */
function departmentOf(departments: Department[], article: Article): Department | undefined {
  return departments.find((department) => article.departmentIds.includes(department.slug));
}

/** The page's own head, so the failure branch can still show it. */
function Header() {
  return (
    <PageHeader
      eyebrow="ইলম"
      title={<T k="nav.articles" />}
      description="আলেমদের লেখা গভীর প্রবন্ধ — প্রতিটি দাবির পেছনে কুরআন ও হাদীসের দলিল, এবং বাংলায় সহজ ব্যাখ্যা। পড়ুন, সংরক্ষণ করুন, নিজের লাইব্রেরি গড়ে তুলুন।"
      icon={FileText}
      patterned
      actions={
        <>
          <Button href="/fatwas" variant="outline" size="sm">
            <T k="nav.fatwas" />
          </Button>
          <Button href="/questions/ask" size="sm" icon={PenLine}>
            <T k="action.askScholar" />
          </Button>
        </>
      }
    />
  );
}

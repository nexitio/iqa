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
import {
  ARTICLES,
  FEATURED_ARTICLE_IDS,
  getArticle,
} from "@/lib/data/content";
import { DEPARTMENTS, TRENDING_TOPICS, getDepartment } from "@/lib/data/departments";
import { SCHOLARS } from "@/lib/data/scholars";
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

  const published = ARTICLES.filter((article) => article.status === "published");
  const featured = getArticle(FEATURED_ARTICLE_IDS[0]) ?? published[0];

  const inFilter = dept
    ? published.filter((article) => article.departmentIds.includes(dept))
    : published;

  const sorted = [...inFilter].sort((a, b) => {
    if (activeSort === "views") return b.viewCount - a.viewCount;
    if (activeSort === "saved") return b.bookmarkCount - a.bookmarkCount;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // The featured piece should not appear twice.
  const cards = sorted.filter((article) => article.id !== featured?.id);

  const pending = ARTICLES.filter((article) => article.status !== "published");
  const mostRead = [...published].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  const totalReads = published.reduce((sum, article) => sum + article.viewCount, 0);
  const totalReferences = published.reduce((sum, article) => sum + article.referenceCount, 0);
  const authorCount = new Set(published.map((article) => article.authorId)).size;

  // Departments that actually have published writing, so the rail stays honest.
  const activeDepartments = DEPARTMENTS.filter((department) =>
    published.some((article) => article.departmentIds.includes(department.slug)),
  );

  return (
    <div className="space-y-6">
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="প্রকাশিত প্রবন্ধ"
          value={toBnDigits(published.length)}
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
          value={toBnDigits(authorCount)}
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
              {toBnDigits(cards.length)} টি প্রবন্ধ
            </p>
          </div>
        </div>
      </Card>

      {dept ? (
        <Callout tone="info" title="বিভাগ অনুসারে ছাঁকা হয়েছে">
          <span className="flex flex-wrap items-center gap-2">
            <Pick value={getDepartment(dept)?.name} fallback={dept} />
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
                সম্পাদকের পছন্দ
              </Badge>
            }
          />
          <ArticleCard article={featured} layout="feature" />
        </section>
      ) : null}

      <section aria-label="প্রবন্ধ তালিকা">
        {cards.length === 0 ? (
          <EmptyState
            title="কোনো প্রবন্ধ পাওয়া যায়নি"
            description="এই বিভাগে এখনো কোনো প্রবন্ধ প্রকাশিত হয়নি। অন্য বিভাগ বেছে নিন বা সব প্রবন্ধ দেখুন।"
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
              action={<Badge tone="neutral" size="xs" className="tabular">{toBnDigits(cards.length)}</Badge>}
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Editorial states are surfaced deliberately so the workflow is visible. */}
      {pending.length > 0 ? (
        <section aria-label="পর্যালোচনায় থাকা লেখা">
          <SectionHeader
            title="খসড়া ও পর্যালোচনায়"
            description="আলেম প্যানেল থেকে নিয়ন্ত্রিত লেখা — প্রকাশের আগে দুইজন আলেম যাচাই করেন"
            icon={PenLine}
            tone="warning"
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pending.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionHeader
            title="আলোচিত বিষয়"
            icon={TrendingUp}
            tone="danger"
            size="sm"
          />
          <CardBody className="mt-0">
            <ChipList className="flex-wrap">
              {TRENDING_TOPICS.slice(0, 10).map((topic) => (
                <Chip key={topic.slug} href={`/topics/${topic.slug}`} size="sm">
                  <Pick value={topic.name} />
                </Chip>
              ))}
            </ChipList>
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
          <SectionHeader
            title="যাঁরা লিখছেন"
            icon={Users}
            tone="scholar"
            size="sm"
            href="/scholars"
          />
          <ul className="space-y-3">
            {SCHOLARS.filter((scholar) =>
              published.some((article) => article.authorId === scholar.id),
            )
              .slice(0, 5)
              .map((scholar) => {
                const count = published.filter(
                  (article) => article.authorId === scholar.id,
                ).length;
                return (
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
                );
              })}
          </ul>
        </Card>
      </div>
    </div>
  );
}

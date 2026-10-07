import type { Metadata } from "next";
import { BookOpen, BookmarkCheck, Eye, FileText, PenLine, RefreshCw } from "@/components/icons";
import { ArticleCard } from "@/components/knowledge";
import { T, Num } from "@/components/i18n-text";
import {
  Button,
  Card,
  Chip,
  ChipList,
  EmptyState,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { getArticlesByAuthor } from "@/lib/data/content";
import { SCHOLAR_CONSOLE_ID } from "../scholar-queue";

export const metadata: Metadata = {
  title: "আমার প্রবন্ধ",
};

const STATUS_FILTERS = [
  { id: "all", key: null },
  { id: "published", key: "status.published" },
  { id: "draft", key: "status.draft" },
  { id: "in-review", key: "status.inReview" },
  { id: "changes-requested", key: "status.changesRequested" },
] as const;

/**
 * The scholar's own articles, with the editorial lifecycle made visible so a
 * draft, a piece under review and a published work are never confused.
 */
export default async function ScholarArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = status ?? "all";

  const all = getArticlesByAuthor(SCHOLAR_CONSOLE_ID);
  const filtered = active === "all" ? all : all.filter((article) => article.status === active);

  const published = all.filter((article) => article.status === "published");
  const drafts = all.filter((article) => article.status === "draft");
  const totalViews = all.reduce((sum, article) => sum + article.viewCount, 0);
  const totalSaves = all.reduce((sum, article) => sum + article.bookmarkCount, 0);

  const countFor = (id: string) =>
    id === "all" ? all.length : all.filter((article) => article.status === id).length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        eyebrow={<T k="console.title" />}
        title={<T k="console.myArticles" />}
        description="আপনার লেখা প্রবন্ধের অবস্থা, পাঠকসংখ্যা ও পর্যালোচনার অবস্থা এক জায়গায়। খসড়া থেকে প্রকাশ পর্যন্ত পুরো প্রক্রিয়া এখানে দেখা যাবে।"
        actions={
          <Button href="/scholar/write" icon={PenLine}>
            নতুন প্রবন্ধ লিখুন
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="মোট প্রবন্ধ"
          value={<Num value={all.length} />}
          icon={FileText}
          tone="primary"
          hint="সব অবস্থা মিলিয়ে"
        />
        <StatTile
          label="প্রকাশিত"
          value={<Num value={published.length} />}
          icon={BookOpen}
          tone="success"
          hint="পাঠকের জন্য উন্মুক্ত"
        />
        <StatTile
          label="খসড়া"
          value={<Num value={drafts.length} />}
          icon={PenLine}
          tone={drafts.length > 0 ? "warning" : "success"}
          hint="অসম্পূর্ণ লেখা"
        />
        <StatTile
          label="মোট পাঠ"
          value={<Num value={totalViews} />}
          icon={Eye}
          tone="info"
          hint={`${totalSaves} বার সংরক্ষিত`}
        />
      </div>

      <Card>
        <SectionHeader
          size="sm"
          icon={BookmarkCheck}
          title="অবস্থা অনুসারে"
          description="প্রবন্ধের প্রকাশনার অবস্থা বেছে নিন"
          className="mb-3"
        />
        <ChipList label="অবস্থা">
          {STATUS_FILTERS.map((filter) => (
            <Chip
              key={filter.id}
              href={`/scholar/articles${filter.id === "all" ? "" : `?status=${filter.id}`}`}
              active={active === filter.id}
              count={countFor(filter.id)}
            >
              {filter.key ? <T k={filter.key} /> : "সব"}
            </Chip>
          ))}
        </ChipList>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="এই অবস্থায় কোনো প্রবন্ধ নেই"
            description="অন্য অবস্থা বেছে নিন, অথবা একটি নতুন প্রবন্ধ লেখা শুরু করুন।"
            action={
              <Button href="/scholar/write" icon={PenLine}>
                নতুন প্রবন্ধ লিখুন
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((article) => (
            <div key={article.id} className="space-y-2">
              <ArticleCard article={article} layout="list" />
              <div className="flex flex-wrap items-center gap-2 px-1">
                <Button href={`/articles/${article.slug}`} variant="ghost" size="xs">
                  প্রিভিউ
                </Button>
                <Button href="/scholar/write" variant="ghost" size="xs" icon={PenLine}>
                  সম্পাদনা
                </Button>
                {article.status === "changes-requested" ? (
                  <Button variant="outline" size="xs" icon={RefreshCw}>
                    পরিবর্তন করে পাঠান
                  </Button>
                ) : null}
                <span className="ml-auto text-[0.6875rem] text-subtle-foreground">
                  {article.referenceCount}টি রেফারেন্স · {article.commentCount}টি মন্তব্য
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

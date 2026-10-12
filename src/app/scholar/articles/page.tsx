import type { Metadata } from "next";
import { BookOpen, BookmarkCheck, Eye, FileText, PenLine, RefreshCw } from "@/components/icons";
import { ArticleCard } from "@/components/knowledge";
import { Digits, Num, T } from "@/components/i18n-text";
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
        description={<T k="scholar.core.articlesDescription" />}
        actions={
          <Button href="/scholar/write" icon={PenLine}>
            <T k="scholar.core.newArticle" />
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={<T k="scholar.core.statTotalArticles" />}
          value={<Num value={all.length} />}
          icon={FileText}
          tone="primary"
          hint={<T k="scholar.core.hintAllStatuses" />}
        />
        <StatTile
          label={<T k="status.published" />}
          value={<Num value={published.length} />}
          icon={BookOpen}
          tone="success"
          hint={<T k="scholar.core.hintOpenToReaders" />}
        />
        <StatTile
          label={<T k="status.draft" />}
          value={<Num value={drafts.length} />}
          icon={PenLine}
          tone={drafts.length > 0 ? "warning" : "success"}
          hint={<T k="scholar.core.hintUnfinished" />}
        />
        <StatTile
          label={<T k="scholar.core.statTotalViews" />}
          value={<Num value={totalViews} />}
          icon={Eye}
          tone="info"
          hint={<T k="scholar.core.hintSavedTimes" vars={{ count: totalSaves }} />}
        />
      </div>

      <Card>
        <SectionHeader
          size="sm"
          icon={BookmarkCheck}
          title={<T k="scholar.core.byStatus" />}
          description={<T k="scholar.core.byStatusHint" />}
          className="mb-3"
        />
        <ChipList label="অবস্থা">
          {STATUS_FILTERS.map((filter) => (
            <Chip
              key={filter.id}
              href={`/scholar/articles${filter.id === "all" ? "" : `?status=${filter.id}`}`}
              active={active === filter.id}
              count={<Digits value={countFor(filter.id)} />}
            >
              {filter.key ? <T k={filter.key} /> : <T k="scholar.core.all" />}
            </Chip>
          ))}
        </ChipList>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title={<T k="scholar.core.noArticlesInStatus" />}
            description={<T k="scholar.core.noArticlesHint" />}
            action={
              <Button href="/scholar/write" icon={PenLine}>
                <T k="scholar.core.newArticle" />
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
                  <T k="console.preview" />
                </Button>
                <Button href="/scholar/write" variant="ghost" size="xs" icon={PenLine}>
                  <T k="action.edit" />
                </Button>
                {article.status === "changes-requested" ? (
                  <Button variant="outline" size="xs" icon={RefreshCw}>
                    <T k="scholar.core.sendChanges" />
                  </Button>
                ) : null}
                <span className="ml-auto text-[0.6875rem] text-subtle-foreground">
                  <T k="scholar.core.referencesCount" vars={{ count: article.referenceCount }} /> ·{" "}
                  <T k="scholar.core.commentsCount" vars={{ count: article.commentCount }} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { Eye, Pin, Plus, Scale, Sparkles } from "@/components/icons";
import { FatwaCard } from "@/components/knowledge";
import { Digits, Num, T } from "@/components/i18n-text";
import {
  Button,
  Callout,
  Card,
  Chip,
  ChipList,
  ContentPending,
  EmptyState,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { getFatwasByMufti } from "@/lib/data/content";
import { SCHOLAR_CONSOLE_ID } from "../scholar-queue";

export const metadata: Metadata = {
  title: "আমার ফতোয়া",
};

const STATUS_FILTERS = [
  { id: "all", key: null },
  { id: "published", key: "status.published" },
  { id: "in-review", key: "status.inReview" },
  { id: "draft", key: "status.draft" },
] as const;

const FIQH_FILTERS = [
  { id: "all", key: null },
  { id: "hanafi", key: "fatwa.hanafi" },
  { id: "comparative", key: "fatwa.comparative" },
] as const;

/**
 * The scholar's own fatwas. A fatwa is a formal ruling, so the ruling line, the
 * evidence count and the pinned state are given prominence over decorative
 * detail.
 */
export default async function ScholarFatwasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; fiqh?: string }>;
}) {
  const { status, fiqh } = await searchParams;
  const activeStatus = status ?? "all";
  const activeFiqh = fiqh ?? "all";

  const all = getFatwasByMufti(SCHOLAR_CONSOLE_ID);
  const filtered = all
    .filter((fatwa) => activeStatus === "all" || fatwa.status === activeStatus)
    .filter((fatwa) => activeFiqh === "all" || fatwa.fiqh === activeFiqh);

  const published = all.filter((fatwa) => fatwa.status === "published");
  const pinned = all.filter((fatwa) => fatwa.pinned);
  const totalViews = all.reduce((sum, fatwa) => sum + fatwa.viewCount, 0);
  const totalReferences = all.reduce((sum, fatwa) => sum + fatwa.referenceCount, 0);

  const countForStatus = (id: string) =>
    id === "all" ? all.length : all.filter((fatwa) => fatwa.status === id).length;

  const buildHref = (nextStatus: string, nextFiqh: string) => {
    const params = new URLSearchParams();
    if (nextStatus !== "all") params.set("status", nextStatus);
    if (nextFiqh !== "all") params.set("fiqh", nextFiqh);
    const query = params.toString();
    return `/scholar/fatwas${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Scale}
        eyebrow={<T k="console.title" />}
        title={<T k="console.myFatwas" />}
        description={<T k="scholar.core.fatwasDescription" />}
        actions={
          <Button href="/scholar/write" icon={Plus}>
            <T k="scholar.core.newFatwa" />
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={<T k="scholar.core.statTotalFatwas" />}
          value={<Num value={all.length} />}
          icon={Scale}
          tone="primary"
          hint={<T k="scholar.core.hintPublishedAndDrafts" />}
        />
        <StatTile
          label={<T k="status.published" />}
          value={<Num value={published.length} />}
          icon={Sparkles}
          tone="success"
          hint={<T k="scholar.core.hintOpenToReaders" />}
        />
        <StatTile
          label={<T k="scholar.core.statEvidence" />}
          value={<Num value={totalReferences} />}
          icon={Pin}
          tone="accent"
          hint={<T k="scholar.core.hintEvidenceMix" />}
        />
        <StatTile
          label={<T k="scholar.core.statTotalViews" />}
          value={<Num value={totalViews} />}
          icon={Eye}
          tone="info"
          hint={<T k="scholar.core.hintPinned" vars={{ count: pinned.length }} />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader
            size="sm"
            icon={Scale}
            title={<T k="scholar.core.statusTitle" />}
            description={<T k="scholar.core.statusHint" />}
            className="mb-3"
          />
          <ChipList label="অবস্থা">
            {STATUS_FILTERS.map((filter) => (
              <Chip
                key={filter.id}
                href={buildHref(filter.id, activeFiqh)}
                active={activeStatus === filter.id}
                count={<Digits value={countForStatus(filter.id)} />}
              >
                {filter.key ? <T k={filter.key} /> : <T k="scholar.core.all" />}
              </Chip>
            ))}
          </ChipList>
        </Card>

        <Card>
          <SectionHeader
            size="sm"
            icon={Sparkles}
            title={<T k="scholar.core.madhabTitle" />}
            description={<T k="scholar.core.madhabHint" />}
            className="mb-3"
          />
          <ChipList label="মাযহাব">
            {FIQH_FILTERS.map((filter) => (
              <Chip
                key={filter.id}
                href={buildHref(activeStatus, filter.id)}
                active={activeFiqh === filter.id}
              >
                {filter.key ? <T k={filter.key} /> : <T k="scholar.core.all" />}
              </Chip>
            ))}
          </ChipList>
        </Card>
      </div>

      {all.length === 0 ? (
        <Card>
          <EmptyState
            icon={Scale}
            tone="accent"
            title={<T k="scholar.core.noFatwas" />}
            description={<T k="scholar.core.noFatwasHint" />}
            action={
              <Button href="/scholar/write" icon={Plus}>
                <T k="scholar.core.newFatwa" />
              </Button>
            }
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Scale}
            tone="accent"
            title={<T k="scholar.core.noFatwasInFilter" />}
            description={<T k="scholar.core.noFatwasInFilterHint" />}
            action={
              <Button href="/scholar/fatwas" variant="outline">
                <T k="scholar.core.seeAllFatwas" />
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((fatwa) => (
            <FatwaCard key={fatwa.id} fatwa={fatwa} layout="list" />
          ))}
        </div>
      )}

      <ContentPending message={<T k="scholar.core.reviewPending" />} />

      <Callout tone="info">
        <p className="text-[0.8125rem] leading-relaxed">
          <span className="font-semibold text-foreground">
            <T k="scholar.core.rememberLabel" />
          </span>{" "}
          <T k="scholar.core.rememberBody" />
        </p>
      </Callout>
    </div>
  );
}

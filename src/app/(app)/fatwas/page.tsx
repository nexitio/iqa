import type { Metadata } from "next";
import Link from "next/link";
import {
  BookMarked,
  ClipboardCheck,
  Eye,
  FileSearch,
  PenLine,
  Pin,
  Scale,
  Search,
  ShieldCheck,
  Users,
} from "@/components/icons";
import type { Department, Scholar } from "@/lib/types";
import {
  fetchDepartments,
  fetchFatwas,
  fetchScholars,
  fetchTopics,
  indexBy,
  MAX_LIMIT,
} from "@/lib/content-api";
import { Digits, Num, Pick, T } from "@/components/i18n-text";
import {
  Avatar,
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
  SearchInput,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { FatwaCard } from "@/components/knowledge";

export const metadata: Metadata = {
  title: "ফতোয়া সংকলন",
  description:
    "বাংলাদেশের যোগ্য মুফতিদের যাচাইকৃত ফিকহি রায় — কুরআন ও হাদীসের দলিলসহ, সুদ, যৌতুক, উত্তরাধিকার, যাকাত ও দৈনন্দিন জীবনের বিষয়ে।",
};

/**
 * The fatwa archive.
 *
 * The rulings, the pinned selection, the department chips, the subject chips and
 * the muftis behind the rail all come from the API now, and the filters are the
 * API's own: `?q=` searches the question, the ruling and the body in one pass, and
 * `?fiqh=`, `?department=` and `?topic=` are resolved by the server against the
 * same tables the rest of the app reads. A read that fails shows an error state —
 * the outage copy for an unreachable API, the filter copy for a value the API
 * refuses — and a read that finds nothing shows the empty state, so the three
 * outcomes a reader can land on never look alike.
 *
 * The subject rail is the topic vocabulary the API owns, narrowed to the topics
 * that actually have rulings, and ordered by how many — a whole catalogue of
 * subjects would be a wall of chips, while a ruling's own departments are what
 * make a subject relevant, and that is the same rule the list above was filtered
 * by. Every subject keeps its place in the rail, which scrolls like the
 * department rail does.
 *
 * The tiles describe the **archive**, not the current filter, which is what they
 * meant before and what their labels say. So the archive is fetched separately
 * from the list — and on an unfiltered view the two reads are the same URL, which
 * Next's fetch memoisation collapses into one request.
 */

/** The path from a reader's question to a published ruling. */
const PROCESS = [
  { icon: PenLine, label: "প্রশ্ন জমা পড়ে", hint: "নাম প্রকাশে অনিচ্ছুক হওয়ার সুযোগ" },
  { icon: Users, label: "বিভাগ অনুসারে মুফতির কাছে যায়", hint: "অগ্রাধিকার তালিকা অনুযায়ী" },
  { icon: FileSearch, label: "দলিল যাচাই ও গবেষণা", hint: "কুরআন, হাদীস ও ফিকহের কিতাব" },
  { icon: ClipboardCheck, label: "সহ-স্বাক্ষর ও প্রকাশ", hint: "একাধিক মুফতির যাচাই" },
];

export default async function FatwasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; fiqh?: string; dept?: string; topic?: string }>;
}) {
  const { q, fiqh, dept, topic } = await searchParams;
  const query = (q ?? "").trim();
  const fiqhParam = fiqh === "hanafi" || fiqh === "comparative" ? fiqh : undefined;
  const hasFilter = Boolean(fiqhParam || dept || topic || query);

  const [archive, listed, pinnedResult, departments, scholars, topics] = await Promise.all([
    // The archive, for the tiles and the rails.
    fetchFatwas({ limit: MAX_LIMIT }),
    // What the reader actually asked for.
    fetchFatwas({
      q: query || undefined,
      fiqh: fiqhParam,
      department: dept,
      // A ruling is filed under departments rather than tagged with topic keys,
      // so this narrows to the departments the topic covers — the API's own rule
      // for what a fatwa on a subject is.
      topic,
      limit: MAX_LIMIT,
    }),
    fetchFatwas({ pinned: true, limit: MAX_LIMIT }),
    fetchDepartments(),
    fetchScholars(),
    // The subject vocabulary, for the third chip rail.
    fetchTopics(),
  ]);

  const header = <Head />;

  if (!listed.ok) {
    // A `400` is the API refusing a filter value — a hand-edited `?topic=` — and
    // saying the service is unreachable would be a lie about what happened. It has
    // a way out of its own: drop the filters. Everything else is an outage, and
    // the retry keeps the reader's filters so the retry is worth making.
    const badFilter = listed.status === 400;
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          title={badFilter ? "ফিল্টারটি বোঝা যায়নি" : "ফতোয়াগুলো আনা যায়নি"}
          description={
            badFilter
              ? "ঠিকানার ফিল্টারটি চেনা যায়নি — বিষয় বা বিভাগের নামটি সম্ভবত ভুল। নিচের বোতাম থেকে সব রায় দেখতে পারেন।"
              : "কনটেন্ট সার্ভিসে পৌঁছানো যায়নি। একটু পরে আবার চেষ্টা করুন — সমস্যা থেকে গেলে প্রশাসনকে জানান।"
          }
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button href={badFilter ? "/fatwas" : hrefFor({ q: query, fiqh, dept, topic })} size="sm">
                {badFilter ? "সব ফতোয়া দেখুন" : "আবার চেষ্টা করুন"}
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

  // A failed side read costs a rail, not the page.
  const allFatwas = archive.ok ? archive.data.items : listed.data.items;
  const allTotal = archive.ok ? archive.data.total : listed.data.total;
  const departmentList = departments.ok ? departments.data : [];
  const scholarsById = indexBy(scholars.ok ? scholars.data.items : [], "id");
  const pinned = pinnedResult.ok ? pinnedResult.data.items : [];
  const topicList = topics.ok ? topics.data : [];

  const sorted = listed.data.items;

  // Only offer departments that actually have rulings.
  const activeDepartments = departmentList.filter((department) =>
    allFatwas.some((fatwa) => fatwa.departmentIds.includes(department.slug)),
  );

  /**
   * The subjects worth offering, each with the archive's own count beside it.
   *
   * A topic is relevant to a ruling when the ruling sits in one of the topic's
   * departments, which is the same rule the API applied to the list above, so the
   * chip's count and the list it produces cannot disagree. Ordered by that count —
   * the subjects the archive can actually speak to come first — then by the
   * topic's own weight, so the order is stable between requests.
   */
  const activeTopics = topicList
    .map((entry) => ({
      topic: entry,
      rulings: allFatwas.filter((fatwa) =>
        fatwa.departmentIds.some((id) => entry.departmentSlugs.includes(id)),
      ).length,
    }))
    .filter((row) => row.rulings > 0)
    .sort(
      (a, b) =>
        b.rulings - a.rulings ||
        b.topic.contentCount - a.topic.contentCount ||
        a.topic.slug.localeCompare(b.topic.slug),
    );

  /** The chosen subject, when it is one the vocabulary knows. */
  const activeTopic = activeTopics.find((row) => row.topic.slug === topic)?.topic;

  const muftiStats = Object.entries(
    allFatwas.reduce<Record<string, number>>((acc, fatwa) => {
      acc[fatwa.muftiId] = (acc[fatwa.muftiId] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalViews = allFatwas.reduce((sum, fatwa) => sum + fatwa.viewCount, 0);
  const totalReferences = allFatwas.reduce((sum, fatwa) => sum + fatwa.referenceCount, 0);
  // Distinct signatories, not the size of the top-five rail above.
  const muftiCount = new Set(allFatwas.map((fatwa) => fatwa.muftiId)).size;

  /** Preserves the other filters when one of them changes. */
  const href = (next: { q?: string; fiqh?: string; dept?: string; topic?: string }) =>
    hrefFor({ q: query, fiqh, dept, topic, ...next });

  return (
    <div className="space-y-6">
      {header}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="প্রকাশিত ফতোয়া"
          value={<Digits value={allTotal} />}
          icon={Scale}
          tone="primary"
        />
        <StatTile
          label="মোট পাঠ"
          value={<Num value={totalViews} />}
          icon={Eye}
          tone="info"
        />
        <StatTile
          label="দলিল ও রেফারেন্স"
          value={<Digits value={totalReferences} />}
          icon={BookMarked}
          tone="accent"
        />
        <StatTile
          label="সক্রিয় মুফতি"
          value={<Digits value={muftiCount} />}
          icon={ShieldCheck}
          tone="scholar"
        />
      </div>

      {/* Search and filters.
          The form is a plain GET so a search result is a shareable URL and the
          page works without JS. */}
      <Card>
        <form action="/fatwas" method="get" className="flex flex-col gap-4">
          {fiqhParam ? <input type="hidden" name="fiqh" value={fiqhParam} /> : null}
          {dept ? <input type="hidden" name="dept" value={dept} /> : null}
          {topic ? <input type="hidden" name="topic" value={topic} /> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              icon={Search}
              name="q"
              defaultValue={query}
              placeholder="রায় বা প্রশ্নের বিষয় লিখুন — যেমন সুদ, যৌতুক, যাকাত…"
              aria-label="ফতোয়া খুঁজুন"
              wrapperClassName="flex-1"
            />
            <Button type="submit" icon={Search} className="sm:w-auto">
              <T k="action.search" />
            </Button>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <div>
              <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                <T k="label.fiqh" />
              </p>
              <ChipList>
                <Chip href={href({ fiqh: undefined })} active={!fiqhParam}>
                  সব রায়
                </Chip>
                <Chip href={href({ fiqh: "hanafi" })} active={fiqhParam === "hanafi"} tone="primary">
                  <T k="fatwa.hanafi" />
                </Chip>
                <Chip
                  href={href({ fiqh: "comparative" })}
                  active={fiqhParam === "comparative"}
                  tone="info"
                >
                  <T k="fatwa.comparative" />
                </Chip>
              </ChipList>
            </div>

            <div>
              <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                <T k="label.departments" />
              </p>
              <ChipList>
                <Chip href={href({ dept: undefined })} active={!dept}>
                  সব বিভাগ
                </Chip>
                {activeDepartments.map((department) => (
                  <Chip
                    key={department.slug}
                    href={href({ dept: department.slug })}
                    active={dept === department.slug}
                  >
                    <Pick value={department.shortName} />
                  </Chip>
                ))}
              </ChipList>
            </div>

            {activeTopics.length > 0 ? (
              <div>
                <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                  <T k="label.topics" />
                </p>
                <ChipList>
                  <Chip href={href({ topic: undefined })} active={!topic}>
                    সব বিষয়
                  </Chip>
                  {activeTopics.map((row) => (
                    <Chip
                      key={row.topic.slug}
                      href={href({ topic: row.topic.slug })}
                      active={topic === row.topic.slug}
                      count={<Digits value={row.rulings} />}
                    >
                      <Pick value={row.topic.name} />
                    </Chip>
                  ))}
                </ChipList>
              </div>
            ) : null}
          </div>

          {hasFilter ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-[0.75rem] tabular text-muted-foreground">
                <Digits value={listed.data.total} /> টি রায় পাওয়া গেছে
                {activeTopic ? (
                  <span>
                    {" · "}
                    <Pick value={activeTopic.name} />
                  </span>
                ) : null}
                {query ? <span> · “{query}”</span> : null}
              </p>
              <Link
                href="/fatwas"
                className="text-[0.75rem] font-medium text-primary underline underline-offset-2"
              >
                ফিল্টার মুছুন
              </Link>
            </div>
          ) : null}
        </form>
      </Card>

      {/* Pinned rulings are the archive's front door. */}
      {!hasFilter && pinned.length > 0 ? (
        <section aria-label="গুরুত্বপূর্ণ ফতোয়া">
          <SectionHeader
            title="সর্বাধিক জিজ্ঞাসিত রায়"
            description="সবচেয়ে বেশি খোঁজা ও সংরক্ষিত সিদ্ধান্তগুলো"
            icon={Pin}
            tone="accent"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {pinned.map((fatwa) => (
              <FatwaCard
                key={fatwa.id}
                fatwa={fatwa}
                mufti={scholarsById.get(fatwa.muftiId)}
                coSigners={coSignersOf(fatwa.coSignerIds, scholarsById)}
                department={departmentOf(activeDepartments, fatwa.departmentIds)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-label="ফতোয়া সংকলন">
        <SectionHeader
          title={hasFilter ? "ফলাফল" : "সকল ফতোয়া"}
          description="প্রতিটি রায়ের সাথে যুক্ত করা হয়েছে কুরআন ও হাদীসের দলিল"
          icon={Scale}
          action={
            <Badge tone="neutral" size="xs" className="tabular">
              <Digits value={listed.data.total} />
            </Badge>
          }
        />
        {sorted.length === 0 ? (
          <EmptyState
            title={hasFilter ? "কোনো ফতোয়া পাওয়া যায়নি" : "এখনো কোনো ফতোয়া প্রকাশিত হয়নি"}
            description={
              hasFilter
                ? "এই শব্দ বা ফিল্টারে কোনো রায় মেলেনি। অন্য শব্দ দিয়ে খুঁজুন, অথবা সরাসরি আলেমকে প্রশ্ন করুন।"
                : "মুফতিদের যাচাইকৃত রায় প্রকাশিত হলে সেগুলো এখানে দেখা যাবে।"
            }
            icon={Scale}
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button href="/fatwas" variant="outline" size="sm">
                  সব ফতোয়া দেখুন
                </Button>
                <Button href="/questions/ask" size="sm">
                  <T k="action.askScholar" />
                </Button>
              </div>
            }
          />
        ) : (
          <div className="space-y-3">
            {sorted.map((fatwa) => (
              <FatwaCard
                key={fatwa.id}
                fatwa={fatwa}
                mufti={scholarsById.get(fatwa.muftiId)}
                coSigners={coSignersOf(fatwa.coSignerIds, scholarsById)}
                department={departmentOf(activeDepartments, fatwa.departmentIds)}
                layout="list"
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader title="যেভাবে ফতোয়া দেওয়া হয়" icon={ClipboardCheck} size="sm" />
          <CardBody className="mt-0">
            <ol className="space-y-3">
              {PROCESS.map((step, index) => (
                <li key={step.label} className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-[0.75rem] font-bold text-primary tabular">
                    <Digits value={index + 1} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-foreground">
                      <step.icon className="size-3.5 text-muted-foreground" aria-hidden />
                      {step.label}
                    </span>
                    <span className="mt-0.5 block text-[0.6875rem] text-subtle-foreground">
                      {step.hint}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <Callout tone="info" className="mt-4">
              ফতোয়া একটি আনুষ্ঠানিক রায়, আর সাধারণ উত্তর পথনির্দেশনা। জটিল ব্যক্তিগত
              বিষয়ে সরাসরি মুফতির সাথে সাক্ষাৎ করাই সর্বোত্তম।
            </Callout>
          </CardBody>
        </Card>

        <Card>
          <SectionHeader
            title="যাঁরা রায় দিয়েছেন"
            icon={Users}
            tone="scholar"
            size="sm"
            href="/scholars"
          />
          <ul className="space-y-2">
            {muftiStats.map(([scholarId, count]) => {
              const mufti = scholarsById.get(scholarId);
              if (!mufti) return null;
              return (
                <li key={scholarId}>
                  <Link
                    href={`/scholars/${mufti.slug}`}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-3"
                  >
                    <Avatar
                      name={mufti.name.bn}
                      color={mufti.avatarColor}
                      size="md"
                      verified={mufti.verified}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.875rem] font-medium text-foreground">
                        <Pick value={mufti.honorific} /> <Pick value={mufti.name} />
                      </span>
                      <span className="mt-0.5 block truncate text-[0.6875rem] text-subtle-foreground">
                        <Pick value={departmentName(activeDepartments, mufti.primaryDepartmentId)} />
                      </span>
                    </span>
                    <Badge tone="primary" size="xs" className="tabular">
                      <Digits value={count} /> টি রায়
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

/** The page's own head, so the failure branch can still show it. */
function Head() {
  return (
    <PageHeader
      eyebrow="ফিকহ"
      title={<T k="fatwa.title" />}
      description={<T k="fatwa.subtitle" />}
      icon={Scale}
      patterned
      actions={
        <>
          <Button href="/articles" variant="outline" size="sm">
            <T k="nav.articles" />
          </Button>
          <Button href="/questions/ask" size="sm" icon={PenLine}>
            <T k="action.askScholar" />
          </Button>
        </>
      }
    />
  );
}

/** The link for a set of filters, preserving whichever ones were not changed. */
function hrefFor(params: { q?: string; fiqh?: string; dept?: string; topic?: string }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.fiqh) search.set("fiqh", params.fiqh);
  if (params.dept) search.set("dept", params.dept);
  if (params.topic) search.set("topic", params.topic);
  const query = search.toString();
  return query ? `/fatwas?${query}` : "/fatwas";
}

/** The first department of a fatwa, from the fetched set rather than a lookup table. */
function departmentOf(departments: Department[], slugs: string[]): Department | undefined {
  return departments.find((department) => slugs.includes(department.slug));
}

function departmentName(departments: Department[], slug: string) {
  return departments.find((department) => department.slug === slug)?.name;
}

/** The co-signing muftis, resolved from the scholars the page already fetched. */
function coSignersOf(ids: string[], byId: Map<string, Scholar>): Scholar[] {
  return ids.map((id) => byId.get(id)).filter((scholar): scholar is Scholar => Boolean(scholar));
}

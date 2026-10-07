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
import { FATWAS, PINNED_FATWAS } from "@/lib/data/content";
import { DEPARTMENTS, getDepartment } from "@/lib/data/departments";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";
import { T, Pick } from "@/components/i18n-text";
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
  PageHeader,
  SearchInput,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { FatwaCard } from "@/components/knowledge";
import { toBnDigits } from "@/lib/bn";

export const metadata: Metadata = {
  title: "ফতোয়া সংকলন",
  description:
    "বাংলাদেশের যোগ্য মুফতিদের যাচাইকৃত ফিকহি রায় — কুরআন ও হাদীসের দলিলসহ, সুদ, যৌতুক, উত্তরাধিকার, যাকাত ও দৈনন্দিন জীবনের বিষয়ে।",
};

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
  searchParams: Promise<{ q?: string; fiqh?: string; dept?: string }>;
}) {
  const { q, fiqh, dept } = await searchParams;
  const query = (q ?? "").trim();
  const needle = query.toLowerCase();

  const published = FATWAS.filter((fatwa) => fatwa.status === "published");

  const filtered = published.filter((fatwa) => {
    if (fiqh && fatwa.fiqh !== fiqh) return false;
    if (dept && !fatwa.departmentIds.includes(dept)) return false;
    if (needle) {
      const haystack = `${fatwa.questionBn} ${fatwa.rulingBn} ${fatwa.bodyBn.join(" ")}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.viewCount - a.viewCount,
  );

  const hasFilter = Boolean(fiqh || dept || needle);

  // Only offer departments and muftis that actually have rulings.
  const activeDepartments = DEPARTMENTS.filter((department) =>
    published.some((fatwa) => fatwa.departmentIds.includes(department.slug)),
  );

  const muftiStats = Object.entries(
    published.reduce<Record<string, number>>((acc, fatwa) => {
      acc[fatwa.muftiId] = (acc[fatwa.muftiId] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalViews = published.reduce((sum, fatwa) => sum + fatwa.viewCount, 0);
  const totalReferences = published.reduce((sum, fatwa) => sum + fatwa.referenceCount, 0);

  /** Preserves the other filters when one of them changes. */
  const href = (next: { q?: string; fiqh?: string; dept?: string }) => {
    const search = new URLSearchParams();
    const merged = { q: query, fiqh, dept, ...next };
    if (merged.q) search.set("q", merged.q);
    if (merged.fiqh) search.set("fiqh", merged.fiqh);
    if (merged.dept) search.set("dept", merged.dept);
    const qs = search.toString();
    return qs ? `/fatwas?${qs}` : "/fatwas";
  };

  return (
    <div className="space-y-6">
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="প্রকাশিত ফতোয়া"
          value={toBnDigits(published.length)}
          icon={Scale}
          tone="primary"
        />
        <StatTile
          label="মোট পাঠ"
          value={toBnDigits(totalViews.toLocaleString("en-IN"))}
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
          label="সক্রিয় মুফতি"
          value={toBnDigits(muftiStats.length)}
          icon={ShieldCheck}
          tone="scholar"
        />
      </div>

      {/* Search and filters.
          The form is a plain GET so a search result is a shareable URL and the
          page works before the backend exists. */}
      <Card>
        <form action="/fatwas" method="get" className="flex flex-col gap-4">
          {fiqh ? <input type="hidden" name="fiqh" value={fiqh} /> : null}
          {dept ? <input type="hidden" name="dept" value={dept} /> : null}
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
                <Chip href={href({ fiqh: undefined })} active={!fiqh}>
                  সব রায়
                </Chip>
                <Chip href={href({ fiqh: "hanafi" })} active={fiqh === "hanafi"} tone="primary">
                  <T k="fatwa.hanafi" />
                </Chip>
                <Chip href={href({ fiqh: "comparative" })} active={fiqh === "comparative"} tone="info">
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
          </div>

          {hasFilter ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-[0.75rem] tabular text-muted-foreground">
                {toBnDigits(sorted.length)} টি রায় পাওয়া গেছে
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
      {!hasFilter && PINNED_FATWAS.length > 0 ? (
        <section aria-label="গুরুত্বপূর্ণ ফতোয়া">
          <SectionHeader
            title="সর্বাধিক জিজ্ঞাসিত রায়"
            description="সবচেয়ে বেশি খোঁজা ও সংরক্ষিত সিদ্ধান্তগুলো"
            icon={Pin}
            tone="accent"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {PINNED_FATWAS.map((fatwa) => (
              <FatwaCard key={fatwa.id} fatwa={fatwa} />
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
              {toBnDigits(sorted.length)}
            </Badge>
          }
        />
        {sorted.length === 0 ? (
          <EmptyState
            title="কোনো ফতোয়া পাওয়া যায়নি"
            description="এই শব্দ বা ফিল্টারে কোনো রায় মেলেনি। অন্য শব্দ দিয়ে খুঁজুন, অথবা সরাসরি আলেমকে প্রশ্ন করুন।"
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
              <FatwaCard key={fatwa.id} fatwa={fatwa} layout="list" />
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
                    {toBnDigits(index + 1)}
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
              const mufti = SCHOLAR_BY_ID[scholarId];
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
                        <Pick value={getDepartment(mufti.primaryDepartmentId)?.name} />
                      </span>
                    </span>
                    <Badge tone="primary" size="xs" className="tabular">
                      {toBnDigits(count)} টি রায়
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

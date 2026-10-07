import type { Metadata } from "next";
import { Eye, Pin, Plus, Scale, Sparkles } from "@/components/icons";
import { FatwaCard } from "@/components/knowledge";
import { Num, T } from "@/components/i18n-text";
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
        description="আপনার দেওয়া আনুষ্ঠানিক ফিকহি রায়। প্রতিটি ফতোয়ায় দলিলের সংখ্যা ও প্রকাশনার অবস্থা স্পষ্ট রাখা হয়েছে, যাতে পাঠক রায়ের ভিত্তি যাচাই করতে পারেন।"
        actions={
          <Button href="/scholar/write" icon={Plus}>
            নতুন ফতোয়া লিখুন
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="মোট ফতোয়া"
          value={<Num value={all.length} />}
          icon={Scale}
          tone="primary"
          hint="প্রকাশিত ও খসড়া মিলিয়ে"
        />
        <StatTile
          label="প্রকাশিত"
          value={<Num value={published.length} />}
          icon={Sparkles}
          tone="success"
          hint="পাঠকের জন্য উন্মুক্ত"
        />
        <StatTile
          label="সংযুক্ত দলিল"
          value={<Num value={totalReferences} />}
          icon={Pin}
          tone="accent"
          hint="আয়াত ও হাদীস মিলিয়ে"
        />
        <StatTile
          label="মোট পাঠ"
          value={<Num value={totalViews} />}
          icon={Eye}
          tone="info"
          hint={`${pinned.length}টি বিশেষভাবে চিহ্নিত`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader
            size="sm"
            icon={Scale}
            title="অবস্থা"
            description="ফতোয়ার প্রকাশনার অবস্থা"
            className="mb-3"
          />
          <ChipList label="অবস্থা">
            {STATUS_FILTERS.map((filter) => (
              <Chip
                key={filter.id}
                href={buildHref(filter.id, activeFiqh)}
                active={activeStatus === filter.id}
                count={countForStatus(filter.id)}
              >
                {filter.key ? <T k={filter.key} /> : "সব"}
              </Chip>
            ))}
          </ChipList>
        </Card>

        <Card>
          <SectionHeader
            size="sm"
            icon={Sparkles}
            title="মাযহাবভিত্তিক"
            description="রায় কোন পদ্ধতিতে দেওয়া হয়েছে"
            className="mb-3"
          />
          <ChipList label="মাযহাব">
            {FIQH_FILTERS.map((filter) => (
              <Chip
                key={filter.id}
                href={buildHref(activeStatus, filter.id)}
                active={activeFiqh === filter.id}
              >
                {filter.key ? <T k={filter.key} /> : "সব"}
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
            title="এখনো কোনো ফতোয়া লেখা হয়নি"
            description="আপনার প্রথম আনুষ্ঠানিক রায়টি লিখুন — প্রশ্ন, সংক্ষিপ্ত জবাব এবং দলিলসহ।"
            action={
              <Button href="/scholar/write" icon={Plus}>
                নতুন ফতোয়া লিখুন
              </Button>
            }
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Scale}
            tone="accent"
            title="এই ফিল্টারে কোনো ফতোয়া নেই"
            description="অন্য অবস্থা বা মাযহাব বেছে নিন, অথবা সব ফতোয়া দেখুন।"
            action={
              <Button href="/scholar/fatwas" variant="outline">
                সব ফতোয়া দেখুন
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

      <ContentPending message="ফতোয়া প্রকাশের আগে একজন পর্যালোচকের অনুমোদন প্রয়োজন হবে — সেই ওয়ার্কফ্লো ব্যাকএন্ড যুক্ত হলে সক্রিয় হবে। এখন ফতোয়াগুলো শুধু এই প্যানেলে দেখা যাচ্ছে।" />

      <Callout tone="info">
        <p className="text-[0.8125rem] leading-relaxed">
          <span className="font-semibold text-foreground">মনে রাখবেন:</span> ফতোয়া হলো
          আনুষ্ঠানিক রায়, আর সাধারণ উত্তর হলো পথনির্দেশ। ব্যক্তিগত ও জটিল বিষয়ে
          প্রশ্নকারীকে সরাসরি স্থানীয় আলেমের সঙ্গে পরামর্শ করতে বলুন।
        </p>
      </Callout>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BookMarked,
  Layers,
  Library,
  ScrollText,
  Sparkles,
  UserRound,
} from "@/components/icons";
import { GradeBadge, HadithCard, HadithRef } from "@/components/hadith";
import { Pick } from "@/components/i18n-text";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Chip,
  FactList,
  PageHeader,
  SectionHeader,
} from "@/components/ui";
import { formatNumber } from "@/lib/bn";
import {
  HADITHS,
  getCollection,
  getHadith,
  getHadithsByTopic,
  getHadithsForCollection,
} from "@/lib/data/hadith";
import { getTopic } from "@/lib/data/departments";
import type { Hadith } from "@/lib/types";
import { HadithDetailActions } from "./hadith-detail-actions";

/**
 * Resolve a hadith from the URL segment.
 *
 * Several places link with the canonical id (`hadith-1`) while a reader may
 * reasonably type or share just the number (`1`), so both are accepted — and the
 * result must belong to the collection in the path.
 */
function resolveHadith(collectionSlug: string, hadithId: string): Hadith | undefined {
  const direct = getHadith(hadithId);
  if (direct && direct.collectionSlug === collectionSlug) return direct;

  const digits = hadithId.replace(/\D/g, "");
  if (!digits) return undefined;
  const wanted = Number(digits);
  if (!Number.isFinite(wanted)) return undefined;

  return getHadithsForCollection(collectionSlug).find(
    (h) => h.number === wanted || h.id === `hadith-${wanted}`,
  );
}

export function generateStaticParams() {
  return HADITHS.map((hadith) => ({
    collection: hadith.collectionSlug,
    hadithId: hadith.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string; hadithId: string }>;
}): Promise<Metadata> {
  const { collection: collectionSlug, hadithId } = await params;
  const hadith = resolveHadith(collectionSlug, hadithId);
  if (!hadith) return { title: "হাদীস" };
  return {
    title: hadith.refBn,
    description: hadith.translationBn,
  };
}

export default async function HadithDetailPage({
  params,
}: {
  params: Promise<{ collection: string; hadithId: string }>;
}) {
  const { collection: collectionSlug, hadithId } = await params;
  const hadith = resolveHadith(collectionSlug, hadithId);
  if (!hadith) notFound();

  const collection = getCollection(hadith.collectionSlug);
  if (!collection) notFound();

  const siblings = getHadithsForCollection(hadith.collectionSlug);
  const position = siblings.findIndex((h) => h.id === hadith.id);
  const previous = position > 0 ? siblings[position - 1] : undefined;
  const next = position >= 0 && position < siblings.length - 1 ? siblings[position + 1] : undefined;

  const primaryTopic = hadith.topicIds[0];
  const related = (
    primaryTopic ? getHadithsByTopic(primaryTopic).filter((h) => h.id !== hadith.id) : []
  ).slice(0, 3);

  const topics = hadith.topicIds
    .map((slug) => ({ slug, topic: getTopic(slug) }))
    .filter((entry): entry is { slug: string; topic: NonNullable<ReturnType<typeof getTopic>> } =>
      Boolean(entry.topic),
    );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={collection.name.bn}
        title={hadith.refBn}
        description={<Pick value={hadith.bookName} />}
        icon={ScrollText}
        patterned
        breadcrumbs={[
          { label: "হোম", href: "/" },
          { label: "হাদীস", href: "/hadith" },
          { label: collection.name.bn, href: `/hadith/${collection.slug}` },
          { label: `হাদীস ${formatNumber(hadith.number, "bn")}` },
        ]}
        actions={
          <>
            <GradeBadge grade={hadith.grade} size="sm" />
            <Button href={`/hadith/${collection.slug}`} variant="soft" size="sm" icon={Library}>
              সংকলনে ফিরে যান
            </Button>
          </>
        }
      >
        <HadithDetailActions hadith={hadith} />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <HadithCard hadith={hadith} showActions={false} />

          {/* Reference metadata — unmissable for citation */}
          <Card variant="flat">
            <CardHeader
              title="রেফারেন্স তথ্য"
              subtitle="উদ্ধৃতির জন্য প্রয়োজনীয় সব তথ্য"
              icon={BadgeCheck}
            />
            <CardBody>
              <FactList
                columns={2}
                items={[
                  { label: "সংকলন", value: collection.name.bn, icon: Library },
                  { label: "অধ্যায়", value: hadith.bookName.bn, icon: Layers },
                  {
                    label: "হাদীস নম্বর",
                    value: formatNumber(hadith.number, "bn"),
                    icon: ScrollText,
                  },
                  { label: "বর্ণনাকারী", value: hadith.narrator.bn, icon: UserRound },
                ]}
              />
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <span className="text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
                  মান
                </span>
                <GradeBadge grade={hadith.grade} size="sm" />
                {hadith.grade === "muttafaqun-alaih" ? (
                  <Badge tone="primary" size="sm" icon={BadgeCheck}>
                    বুখারী ও মুসলিম উভয়ে বর্ণিত
                  </Badge>
                ) : null}
              </div>
            </CardBody>
          </Card>

          {/* Prev / next within the collection */}
          <nav
            aria-label="হাদীস পরিবর্তন"
            className="flex flex-wrap items-stretch justify-between gap-3 border-t border-border pt-5"
          >
            {previous ? (
              <Link
                href={`/hadith/${collection.slug}/${previous.id}`}
                className="group flex max-w-full items-center gap-3 rounded-panel border border-border bg-surface p-3.5 transition-all hover:-translate-y-px hover:border-primary/35 hover:shadow-card"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-3 text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowRight className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.6875rem] text-subtle-foreground">পূর্ববর্তী</span>
                  <span className="block truncate text-[0.8125rem] font-medium text-foreground">
                    {previous.refBn}
                  </span>
                </span>
              </Link>
            ) : (
              <span />
            )}

            {next ? (
              <Link
                href={`/hadith/${collection.slug}/${next.id}`}
                className="group ml-auto flex max-w-full items-center gap-3 rounded-panel border border-border bg-surface p-3.5 text-right transition-all hover:-translate-y-px hover:border-primary/35 hover:shadow-card"
              >
                <span className="min-w-0">
                  <span className="block text-[0.6875rem] text-subtle-foreground">পরবর্তী</span>
                  <span className="block truncate text-[0.8125rem] font-medium text-foreground">
                    {next.refBn}
                  </span>
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-3 text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowLeft className="size-4" aria-hidden />
                </span>
              </Link>
            ) : null}
          </nav>

          {/* Related hadith on the same subject */}
          {related.length > 0 ? (
            <section>
              <SectionHeader
                title="একই বিষয়ে আরও"
                description="এই হাদীসের বিষয়ের সাথে সম্পর্কিত হাদীস"
                icon={Sparkles}
                tone="accent"
              />
              <div className="space-y-4">
                {related.map((item) => (
                  <HadithCard key={item.id} hadith={item} showActions={false} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <Card variant="flat">
            <CardHeader title="আরবি মূল পাঠ" subtitle="উথমানী লিপি" icon={BookOpen} />
            <CardBody>
              <p className="arabic font-quran text-[1.25rem] leading-[2.1] text-foreground" lang="ar" dir="rtl">
                {hadith.arabic}
              </p>
            </CardBody>
          </Card>

          {topics.length > 0 ? (
            <Card variant="flat">
              <CardHeader title="বিষয়সমূহ" subtitle="সম্পর্কিত বিভাগ ও বিষয়" icon={Layers} />
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {topics.map(({ slug, topic }) => (
                    <Chip key={slug} href={`/topics/${slug}`} tone="primary" size="sm">
                      {topic.name.bn}
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          ) : null}

          <Card variant="flat">
            <CardHeader title="এই অধ্যায়ের অন্যান্য হাদীস" icon={BookMarked} />
            <CardBody>
              <ul className="space-y-1">
                {getHadithsForCollection(collection.slug)
                  .filter((h) => h.bookNumber === hadith.bookNumber && h.id !== hadith.id)
                  .slice(0, 6)
                  .map((item) => (
                    <li key={item.id}>
                      <HadithRef refBn={item.refBn} href={`/hadith/${collection.slug}/${item.id}`} />
                    </li>
                  ))}
                {getHadithsForCollection(collection.slug).filter(
                  (h) => h.bookNumber === hadith.bookNumber && h.id !== hadith.id,
                ).length === 0 ? (
                  <li className="text-[0.75rem] text-subtle-foreground">
                    এই অধ্যায়ে এখনো অন্য হাদীস যুক্ত হয়নি।
                  </li>
                ) : null}
              </ul>
            </CardBody>
          </Card>

          <Callout
            tone="accent"
            icon={Sparkles}
            title="সম্পর্কিত কুরআন"
          >
            এই হাদীসের বিষয়ের সাথে সম্পর্কিত আয়াত ও তাফসীর শীঘ্রই সংশ্লিষ্ট বিষয়ের পাতায় যুক্ত করা হবে।
            এখনই কুরআন পাঠ শুরু করতে পারেন।
            <span className="mt-3 flex flex-wrap gap-2">
              <Button href="/quran" variant="outline" size="xs">
                কুরআন পড়ুন
              </Button>
              {primaryTopic ? (
                <Button href={`/topics/${primaryTopic}`} variant="ghost" size="xs">
                  সম্পর্কিত বিষয়
                </Button>
              ) : null}
            </span>
          </Callout>
        </aside>
      </div>
    </div>
  );
}

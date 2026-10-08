import { BookRow } from "@/components/hadith";
import { Pick, T } from "@/components/i18n-text";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookMarked,
  Layers,
  Library,
  ScrollText,
  Sparkles,
  UserRound
} from "@/components/icons";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ContentPending,
  FactList,
  PageHeader,
  SectionHeader
} from "@/components/ui";
import { formatNumber } from "@/lib/bn";
import {
  HADITH_COLLECTIONS,
  getBooksForCollection,
  getCollection,
  getHadithsForCollection,
} from "@/lib/data/hadith";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionBrowser } from "./collection-browser";

export function generateStaticParams() {
  return HADITH_COLLECTIONS.map((collection) => ({ collection: collection.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection: slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "সংকলন" };
  return {
    title: collection.name.bn,
    description: `${collection.name.bn} — ${collection.description.bn}`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const hadiths = getHadithsForCollection(slug);
  const books = getBooksForCollection(slug);
  const loadedBooks = books.filter((book) => hadiths.some((h) => h.bookNumber === book.number));

  const index = HADITH_COLLECTIONS.findIndex((c) => c.slug === slug);
  const previous = index > 0 ? HADITH_COLLECTIONS[index - 1] : undefined;
  const next =
    index >= 0 && index < HADITH_COLLECTIONS.length - 1
      ? HADITH_COLLECTIONS[index + 1]
      : undefined;

  const others = HADITH_COLLECTIONS.filter((c) => c.slug !== slug);
  const incomplete = hadiths.length < collection.hadithCount;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={collection.name.bn}
        title={<Pick value={collection.name} />}
        description={<Pick value={collection.description} />}
        icon={ScrollText}
        patterned
        breadcrumbs={[
          { label: "হোম", href: "/" },
          { label: "হাদীস", href: "/hadith" },
          { label: collection.name.bn },
        ]}
        actions={
          <>
            <Button href="/daily" variant="outline" size="sm" icon={Sparkles}>
              দৈনিক হাদীস
            </Button>
            <Button href="/hadith" variant="soft" size="sm" icon={Library}>
              <T k="hadith.allCollections" />
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="arabic arabic-ui text-[1.375rem] text-primary" lang="ar" dir="rtl">
            {collection.nameArabic}
          </span>
          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8125rem] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-3.5" aria-hidden />
              {collection.author.bn}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="size-3.5" aria-hidden />
              {formatNumber(collection.bookCount, "bn")} অধ্যায়
            </span>
            {collection.authentic ? (
              <Badge tone="success" size="sm" icon={BadgeCheck}>
                নির্ভরযোগ্য সংকলন
              </Badge>
            ) : (
              <Badge tone="warning" size="sm">
                সংকলনগ্রন্থ
              </Badge>
            )}
          </div>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="min-w-0 space-y-6">
          {incomplete ? (
            <ContentPending
              message={`আসল সংকলনে মোট ${formatNumber(collection.hadithCount, "bn")} টি হাদীস রয়েছে। এই সংস্করণে এখন পর্যন্ত ${formatNumber(hadiths.length, "bn")} টি যুক্ত করা হয়েছে — বাকিগুলো ধাপে ধাপে যোগ করা হচ্ছে ইনশাআল্লাহ।`}
            />
          ) : null}

          <section>
            <SectionHeader
              title="অধ্যায় (কিতাব)"
              description="যে অধ্যায়গুলোতে এখন হাদীস পাওয়া যাচ্ছে"
              icon={Layers}
              size="sm"
              action={
                <span className="text-[0.75rem] text-subtle-foreground">
                  {formatNumber(loadedBooks.length, "bn")} / {formatNumber(books.length, "bn")}
                </span>
              }
            />
            <div className="grid gap-2.5 sm:grid-cols-2">
              {books.map((book) => (
                <BookRow
                  key={book.id}
                  book={book}
                  href={`/hadith/${slug}#book-${book.number}`}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              title="হাদীস"
              description="অধ্যায় ও মান অনুসারে ছেঁকে নিন"
              icon={ScrollText}
            />
            <CollectionBrowser collectionSlug={slug} />
          </section>

          {/* Collection navigation */}
          <nav
            aria-label="সংকলন পরিবর্তন"
            className="flex flex-wrap items-stretch justify-between gap-3 border-t border-border pt-5"
          >
            {previous ? (
              <Button href={`/hadith/${previous.slug}`} variant="outline" size="sm" icon={ArrowRight}>
                {previous.name.bn}
              </Button>
            ) : (
              <span />
            )}
            {next ? (
              <Button
                href={`/hadith/${next.slug}`}
                variant="outline"
                size="sm"
                iconRight={ArrowLeft}
                className="ml-auto"
              >
                {next.name.bn}
              </Button>
            ) : null}
          </nav>
        </div>

        <aside className="space-y-4 sticky top-25">
          <Card variant="default">
            <CardHeader
              title={<Pick value={collection.name} />}
              subtitle={collection.nameArabic}
              icon={BookMarked}
            />
            <CardBody>
              <FactList
                columns={1}
                items={[
                  { label: "সংকলক", value: collection.author.bn, icon: UserRound },
                  {
                    label: "মোট হাদীস",
                    value: `${formatNumber(collection.hadithCount, "bn")} টি`,
                    icon: ScrollText,
                  },
                  {
                    label: "অধ্যায়",
                    value: `${formatNumber(collection.bookCount, "bn")} টি`,
                    icon: Layers,
                  },
                  {
                    label: "এখন পড়া যাবে",
                    value: `${formatNumber(hadiths.length, "bn")} টি`,
                    icon: BookMarked,
                  },
                ]}
              />
            </CardBody>
          </Card>

          <Card variant="default">
            <CardHeader title="অন্য সংকলন" icon={Library} />
            <CardBody>
              <ul className="space-y-0.5">
                {others.map((other) => (
                  <li key={other.id}>
                    <Link
                      href={`/hadith/${other.slug}`}
                      className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-surface-3"
                    >
                      <span className="min-w-0 truncate text-[0.8125rem] font-medium text-foreground">
                        {other.name.bn}
                      </span>
                      <span className="shrink-0 text-[0.6875rem] tabular text-subtle-foreground">
                        {formatNumber(getHadithsForCollection(other.slug).length, "bn")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

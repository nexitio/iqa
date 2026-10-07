import type { Metadata } from "next";
import {
  BadgeCheck,
  BookMarked,
  Headphones,
  Layers,
  Library,
  ScrollText,
  Sparkles,
  Star,
} from "@/components/icons";
import { CollectionCard, HadithCard } from "@/components/hadith";
import { T } from "@/components/i18n-text";
import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  ChipList,
  ContentPending,
  FactList,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { formatNumber } from "@/lib/bn";
import {
  HADITH_BOOKS,
  HADITH_COLLECTIONS,
  HADITH_OF_THE_DAY,
  HADITHS,
} from "@/lib/data/hadith";
import { HadithSearch } from "./hadith-search";

export const metadata: Metadata = {
  title: "হাদীস সংকলন",
  description:
    "সহীহ হাদীস আরবি, বাংলা অনুবাদ, উচ্চারণ ও বর্ণনাকারীসহ পড়ুন — সহীহ বুখারী, সহীহ মুসলিম, সুনানে আবু দাউদ, তিরমিযী, নাসাঈ, ইবনে মাজাহ, রিয়াদুস সালিহীন ও মিশকাতুল মাসাবীহ।",
};

const TOTAL_CANONICAL = HADITH_COLLECTIONS.reduce((sum, c) => sum + c.hadithCount, 0);
const AGREED_UPON = HADITHS.filter((h) => h.grade === "muttafaqun-alaih");
const CURATED = AGREED_UPON.slice(0, 3);

export default function HadithIndexPage() {
  const featured = HADITH_OF_THE_DAY;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Hadith"
        title={<T k="hadith.title" />}
        description={<T k="hadith.subtitle" />}
        icon={ScrollText}
        patterned
        breadcrumbs={[{ label: "হোম", href: "/" }, { label: "হাদীস" }]}
        actions={
          <>
            <Button href="/daily" variant="outline" size="sm" icon={Sparkles}>
              দৈনিক হাদীস
            </Button>
            <Button href="/quran" variant="soft" size="sm" icon={Library}>
              কুরআন পড়ুন
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="সংকলন"
            value={formatNumber(HADITH_COLLECTIONS.length, "bn")}
            icon={Library}
            tone="primary"
            size="sm"
          />
          <StatTile
            label="অধ্যায় (কিতাব)"
            value={formatNumber(HADITH_BOOKS.length, "bn")}
            icon={Layers}
            tone="info"
            size="sm"
          />
          <StatTile
            label="এখন পড়া যাবে"
            value={formatNumber(HADITHS.length, "bn")}
            hint="বাকিগুলো ধাপে ধাপে যুক্ত হচ্ছে"
            icon={BookMarked}
            tone="success"
            size="sm"
          />
          <StatTile
            label="মুত্তাফাকুন আলাইহি"
            value={formatNumber(AGREED_UPON.length, "bn")}
            hint="বুখারী ও মুসলিম উভয়ে বর্ণিত"
            icon={BadgeCheck}
            tone="accent"
            size="sm"
          />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8">
          {/* Today's hadith */}
          <section>
            <SectionHeader
              title="আজকের হাদীস"
              description="প্রতিদিন একটি করে হাদীস — সকালে পড়ার জন্য"
              icon={Star}
              tone="accent"
              href="/daily"
              actionLabel="আরও দেখুন"
            />
            <HadithCard hadith={featured} />
          </section>

          {/* Collections */}
          <section>
            <SectionHeader
              title={<T k="hadith.allCollections" />}
              description="সিহাহ সিত্তাহসহ উপমহাদেশে বহুল পঠিত সংকলন"
              icon={Library}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {HADITH_COLLECTIONS.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          </section>

          {/* Curated selection */}
          {CURATED.length > 0 ? (
            <section>
              <SectionHeader
                title="মুত্তাফাকুন আলাইহি — নির্বাচিত হাদীস"
                description="যে হাদীসগুলো বুখারী ও মুসলিম উভয়েই বর্ণনা করেছেন"
                icon={BadgeCheck}
                tone="success"
              />
              <div className="space-y-4">
                {CURATED.map((hadith) => (
                  <HadithCard key={hadith.id} hadith={hadith} />
                ))}
              </div>
            </section>
          ) : null}

          {/* Search */}
          <section>
            <SectionHeader
              title="হাদীস খুঁজুন"
              description="বাংলা অনুবাদ, বর্ণনাকারী বা আরবি শব্দ দিয়ে খুঁজুন"
              icon={ScrollText}
              tone="info"
            />
            <HadithSearch />
          </section>
        </div>

        {/* Rail */}
        <aside className="space-y-4">
          <Card variant="flat">
            <CardHeader
              title="সংকলনের আকার"
              subtitle="আসল সংকলনে মোট হাদীসের সংখ্যা"
              icon={Layers}
            />
            <CardBody>
              <ul className="space-y-2.5">
                {HADITH_COLLECTIONS.map((collection) => (
                  <li
                    key={collection.id}
                    className="flex items-baseline justify-between gap-3 border-b border-border pb-2.5 last:border-0 last:pb-0"
                  >
                    <span className="min-w-0 truncate text-[0.8125rem] text-foreground">
                      {collection.name.bn}
                    </span>
                    <span className="shrink-0 text-[0.75rem] font-semibold tabular text-muted-foreground">
                      {formatNumber(collection.hadithCount, "bn")}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[0.6875rem] leading-relaxed text-subtle-foreground">
                সর্বমোট {formatNumber(TOTAL_CANONICAL, "bn")} টি হাদীসের মধ্যে এই সংস্করণে{" "}
                {formatNumber(HADITHS.length, "bn")} টি পড়া যাচ্ছে।
              </p>
            </CardBody>
          </Card>

          <Card variant="flat">
            <CardHeader title="এই সংকলনে কী আছে" icon={ScrollText} />
            <CardBody>
              <FactList
                columns={1}
                items={[
                  { label: "আরবি মূল পাঠ", value: "উথমানী লিপিতে সংরক্ষিত" },
                  { label: "বাংলা অনুবাদ", value: "সহজ ও প্রাঞ্জল ভাষায়" },
                  { label: "বর্ণনাকারী", value: "প্রত্যেক হাদীসে উল্লেখিত" },
                  { label: "মান নির্ণয়", value: "সহীহ · হাসান · মুত্তাফাকুন আলাইহি" },
                ]}
              />
            </CardBody>
          </Card>

          <Callout tone="info" icon={Headphones} title="অডিও শীঘ্রই আসছে">
            আরবি তিলাওয়াতসহ অডিও সংস্করণ প্রস্তুত করা হচ্ছে — ইনশাআল্লাহ শীঘ্রই যুক্ত করা হবে।
          </Callout>

          <Card variant="flat">
            <CardHeader title="সম্পর্কিত পড়া" icon={Sparkles} />
            <CardBody>
              <ChipList label="সম্পর্কিত">
                <Button href="/articles" variant="outline" size="sm">
                  প্রবন্ধ
                </Button>
                <Button href="/fatwas" variant="outline" size="sm">
                  ফতোয়া
                </Button>
                <Button href="/scholars" variant="outline" size="sm">
                  আলেমগণ
                </Button>
              </ChipList>
            </CardBody>
          </Card>
        </aside>
      </div>

      <ContentPending message="হাদীসসংগ্রহে হাদীসের সংখ্যা প্রতিদিন বাড়ছে। কোনো সংকলনে এখনো যেসব অধ্যায় যুক্ত হয়নি, সেগুলো শীঘ্রই পাওয়া যাবে ইনশাআল্লাহ।" />
    </div>
  );
}

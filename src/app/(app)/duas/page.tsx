import type { Metadata } from "next";
import { HandHeart, Moon, Sparkles } from "@/components/icons";
import { Num, Pick, T } from "@/components/i18n-text";
import { Badge, Button, Callout, Card, Chip, PageHeader } from "@/components/ui";
import { DUAS, duaOfToday, getDuaCategory } from "@/lib/data/duas";
import { DuaLibrary } from "./dua-library";

/**
 * The dua of the day is chosen by date, so a fully static build would freeze it.
 * Regenerating hourly matches the daily page: cheap, and it still turns over.
 */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "দুআ ও জিকির",
  description:
    "প্রতিদিনের ও বিশেষ মুহূর্তের প্রামাণ্য দুআ — আরবি, বাংলা উচ্চারণ, অর্থ ও সূত্রসহ। ঘুম, নামাজ, খাবার, সফর, অসুস্থতা, জ্ঞান ও দুশ্চিন্তার দুআ এক জায়গায়।",
};

export default function DuasPage() {
  const dua = duaOfToday();
  const category = getDuaCategory(dua.categorySlug);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="nav.duas" />}
        title={<T k="dua.title" />}
        description={<T k="dua.subtitle" />}
        icon={HandHeart}
        patterned
        actions={
          <>
            <Badge tone="accent" size="md" icon={Moon}>
              <Num value={DUAS.length} /> <T k="dua.countLabel" />
            </Badge>
            <Button href="/daily" variant="outline" size="sm">
              <T k="nav.daily" />
            </Button>
          </>
        }
      />

      {/* The day's dua gets the full treatment: Arabic first, at a size that can
          be read from a phone propped against a wall, and its source in the
          header where a reader checks it before reading anything else. */}
      <Card variant="parchment" padding="none" className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
          <Badge tone="accent" size="sm" icon={Moon}>
            <T k="dua.today" />
          </Badge>
          {category ? (
            <Chip href={`/duas#${category.slug}`} tone={category.tone} size="sm">
              <Pick value={category.name} />
            </Chip>
          ) : null}
          <span className="ml-auto text-[0.6875rem] font-medium text-subtle-foreground">
            <Pick value={dua.reference} />
          </span>
        </div>

        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <h2 className="font-display text-[1.125rem] font-bold leading-snug text-foreground">
            <Pick value={dua.title} />
          </h2>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            <Pick value={dua.occasion} />
          </p>

          <p className="arabic mt-4 text-right text-[1.75rem] leading-[2.05] text-foreground sm:text-[2rem]">
            {dua.arabic}
          </p>

          <p className="mt-4 text-[0.875rem] italic leading-relaxed text-muted-foreground">
            {dua.transliterationBn}
          </p>

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-[1.0625rem] leading-loose text-foreground">
              <Pick value={dua.meaning} />
            </p>
          </div>

          {dua.virtue ? (
            <p className="mt-4 rounded-card bg-accent-soft/60 px-4 py-3 text-[0.875rem] leading-relaxed text-accent-soft-foreground">
              <Pick value={dua.virtue} />
            </p>
          ) : null}
        </div>
      </Card>

      <DuaLibrary />

      <Callout tone="info" icon={Sparkles}>
        এখানে প্রতিটি দুআর সঙ্গে তার সূত্র — কুরআনের আয়াত বা হাদীসের সংকলন ও নম্বর — দেওয়া
        আছে, যাতে নিজে যাচাই করে পড়া যায়। উচ্চারণ বাংলা হরফে লেখা, তাই আরবি পড়তে না জানলেও
        শব্দ ঠিক রেখে দুআ বলা যায়।
      </Callout>
    </div>
  );
}

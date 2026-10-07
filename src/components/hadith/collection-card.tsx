"use client";

import Link from "next/link";
import { ArrowLeft, BookMarked, Layers, ScrollText } from "lucide-react";
import { formatNumber } from "@/lib/bn";
import { getHadithsForCollection } from "@/lib/data/hadith";
import { useI18n } from "@/lib/i18n";
import type { HadithBook, HadithCollection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { asTone, Badge, Card, Chip, Progress } from "@/components/ui";

/** "এখন পড়া যাবে" prefix, kept as plain text so the count stays locale-aware. */
function isBnLabel(locale: "bn" | "en", count: string) {
  return locale === "bn" ? `এখন রয়েছে ${count}` : `${count} available`;
}

/**
 * Collection tile. Shows the Arabic title alongside the Bangla name because
 * Bangladeshi readers recognise collections by both ("সহীহ বুখারী" / "ٱلْجَامِعُ ٱلصَّحِيح").
 */
export function CollectionCard({
  collection,
  className,
}: {
  collection: HadithCollection;
  className?: string;
}) {
  const { t, pick, locale } = useI18n();
  const tone = asTone(collection.tone);

  // How much of the canonical collection is actually readable in this build.
  // Without this the card would imply all 7,000+ hadith are available.
  const localCount = getHadithsForCollection(collection.slug).length;
  const available =
    collection.hadithCount > 0 ? Math.min(100, Math.round((localCount / collection.hadithCount) * 100)) : 0;

  return (
    <Card interactive className={cn("group flex flex-col", className)}>
      <Link href={`/hadith/${collection.slug}`} className="flex flex-1 flex-col">
        <div className="flex items-start gap-3.5">
          <span
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-105",
              tone === "success"
                ? "bg-success-soft text-success-soft-foreground"
                : tone === "accent"
                  ? "bg-accent-soft text-accent-soft-foreground"
                  : tone === "info"
                    ? "bg-info-soft text-info-soft-foreground"
                    : "bg-primary-soft text-primary",
            )}
            aria-hidden
          >
            <ScrollText className="size-5" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-display text-base font-semibold text-foreground">
                  {pick(collection.name)}
                </h3>
                <p className="mt-0.5 truncate text-[0.6875rem] text-subtle-foreground">
                  {pick(collection.author)}
                </p>
              </div>
              <span className="arabic arabic-ui shrink-0 text-[1.0625rem] text-primary" lang="ar">
                {collection.nameArabic}
              </span>
            </div>

            <p className="mt-2.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
              {pick(collection.description)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-subtle-foreground">
                <ScrollText className="size-3.5" aria-hidden />
                {formatNumber(collection.hadithCount, locale)} {t("label.hadith")}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-subtle-foreground">
                <Layers className="size-3.5" aria-hidden />
                {formatNumber(collection.bookCount, locale)} {t("label.book")}
              </span>
              {collection.authentic ? (
                <Badge tone="success" size="xs">
                  নির্ভরযোগ্য
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-border pt-3">
          <span className="inline-flex items-center gap-1 text-[0.75rem] font-medium text-primary">
            {t("action.readMore")}
            <ArrowLeft className="size-3.5" aria-hidden />
          </span>
          <span className="ml-auto flex items-center gap-2">
            <span className="text-[0.625rem] text-subtle-foreground">
              {isBnLabel(locale, formatNumber(localCount, locale))} {t("label.hadith")}
            </span>
            <Progress
              value={available}
              tone={tone}
              size="xs"
              className="w-14"
              label={`${pick(collection.name)} availability`}
            />
          </span>
        </div>
      </Link>
    </Card>
  );
}

/** A chapter row inside a collection detail page. */
export function BookRow({
  book,
  href,
  className,
}: {
  book: HadithBook;
  href: string;
  className?: string;
}) {
  const { t, pick, locale } = useI18n();

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3.5 rounded-xl border border-border bg-surface p-3.5 transition-all hover:-translate-y-px hover:border-primary/35 hover:shadow-card",
        className,
      )}
    >
      <span
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-3 text-[0.75rem] font-semibold text-muted-foreground"
        aria-hidden
      >
        {formatNumber(book.number, locale)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.875rem] font-medium text-foreground">
          {pick(book.name)}
        </span>
        <span className="mt-0.5 block text-[0.6875rem] text-subtle-foreground">
          {formatNumber(book.hadithCount, locale)} {t("label.hadith")}
        </span>
      </span>
      <BookMarked className="size-4 shrink-0 text-subtle-foreground" aria-hidden />
    </Link>
  );
}

/**
 * Inline "সহীহ বুখারী ১২৭" pill — used inside answers so a scholar's evidence
 * links straight to the full hadith.
 */
export function HadithRef({
  refBn,
  href,
  className,
}: {
  refBn: string;
  href?: string;
  className?: string;
}) {
  if (href) {
    return (
      <Chip href={href} tone="info" size="sm" icon={ScrollText} className={className}>
        {refBn}
      </Chip>
    );
  }

  return (
    <Chip tone="info" size="sm" icon={ScrollText} className={className}>
      {refBn}
    </Chip>
  );
}

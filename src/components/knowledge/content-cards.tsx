"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BookmarkCheck, CalendarDays, Clock, Eye, Pin, Quote, Scale } from "lucide-react";
import type { Article, Fatwa } from "@/lib/types";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";
import { getDepartment } from "@/lib/data/departments";
import { useI18n } from "@/lib/i18n";
import { cn, relativeTime } from "@/lib/utils";
import { formatNumber } from "@/lib/bn";
import {
  Avatar,
  AvatarStack,
  Badge,
  Card,
  StatusBadge,
  VerifiedMark,
  asTone,
  solidTone,
  type Tone,
} from "@/components/ui";
import { ReferenceCount as RefCount } from "./reference-chip";

/* ------------------------------------------------------------------ bylines */

/**
 * Scholar byline reused by article, fatwa and answer cards so authorship always
 * reads the same way: portrait, honourific, verified mark, department.
 */
export function AuthorByline({
  scholarId,
  timestamp,
  className,
  showDepartment = true,
  size = "sm",
}: {
  scholarId: string;
  timestamp?: string;
  className?: string;
  showDepartment?: boolean;
  size?: "sm" | "md";
}) {
  const { pick, locale, t, isBn } = useI18n();
  const scholar = SCHOLAR_BY_ID[scholarId];
  if (!scholar) {
    return (
      <span className={cn("text-[0.75rem] text-muted-foreground", className)}>
        {isBn ? "অজ্ঞাত" : "Unknown"}
      </span>
    );
  }

  const department = getDepartment(scholar.primaryDepartmentId);

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <Avatar
        name={pick(scholar.name)}
        color={scholar.avatarColor}
        size={size === "md" ? "md" : "sm"}
        verified={scholar.verified}
      />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-[0.8125rem] font-semibold leading-tight text-foreground">
          {pick(scholar.honorific)} {pick(scholar.name)}
          {scholar.verified ? <VerifiedMark label={t("label.verified")} className="shrink-0" /> : null}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[0.6875rem] text-subtle-foreground">
          {showDepartment && department ? <span className="truncate">{pick(department.shortName)}</span> : null}
          {showDepartment && department && timestamp ? <span aria-hidden>·</span> : null}
          {timestamp ? <span>{relativeTime(timestamp, locale)}</span> : null}
        </p>
      </div>
    </div>
  );
}

/** Small icon+label meta row (views, reading time, references, date). */
export function ContentMetaBar({
  items,
  className,
}: {
  items: { icon?: typeof Clock; label: ReactNode; key?: string }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3.5 gap-y-1.5", className)}>
      {items.map((item, i) => (
        <span
          key={item.key ?? i}
          className="inline-flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground"
        >
          {item.icon ? <item.icon className="size-3.5 shrink-0" aria-hidden /> : null}
          {item.label}
        </span>
      ))}
    </div>
  );
}

/** Gradient cover block standing in for article artwork. */
function ArticleCover({ tone, label, className }: { tone: Tone; label?: string; className?: string }) {
  return (
    <span className={cn("relative block overflow-hidden", solidTone[tone], className)} aria-hidden>
      <span className="absolute inset-0 pattern-girih opacity-30" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      {label ? (
        <span className="absolute bottom-2.5 left-3 rounded-full bg-black/35 px-2 py-0.5 text-[0.6875rem] font-medium text-white backdrop-blur-sm">
          {label}
        </span>
      ) : null}
    </span>
  );
}

/* ------------------------------------------------------------------ articles */

export function ArticleCard({
  article,
  layout = "grid",
}: {
  article: Article;
  layout?: "grid" | "list" | "feature";
}) {
  const { pick, locale, t, isBn } = useI18n();
  const tone = asTone(article.coverTone);
  const department = getDepartment(article.departmentIds[0]);
  const href = `/articles/${article.slug}`;

  const meta = (
    <ContentMetaBar
      items={[
        { key: "read", icon: Clock, label: `${article.readingMinutes} ${t("label.minutes")}` },
        { key: "views", icon: Eye, label: formatNumber(article.viewCount, locale) },
        { key: "saved", icon: BookmarkCheck, label: formatNumber(article.bookmarkCount, locale) },
      ]}
    />
  );

  if (layout === "list") {
    return (
      <Card interactive flush className="overflow-hidden">
        <Link href={href} className="flex items-stretch gap-4">
          <ArticleCover tone={tone} className="w-1.5 shrink-0" />
          <div className="min-w-0 flex-1 py-4 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              {department ? (
                <Badge tone={asTone(department.tone)} size="xs">
                  {pick(department.shortName)}
                </Badge>
              ) : null}
              {article.status !== "published" ? (
                <StatusBadge
                  status={article.status}
                  label={t(
                    article.status === "in-review"
                      ? "status.inReview"
                      : article.status === "changes-requested"
                        ? "status.changesRequested"
                        : "status.draft",
                  )}
                />
              ) : null}
            </div>
            <h3 className="mt-1.5 font-display text-[0.9375rem] font-semibold leading-snug text-foreground">
              {pick(article.title)}
            </h3>
            <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
              {pick(article.excerpt)}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
              {meta}
              <AuthorByline scholarId={article.authorId} />
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  if (layout === "feature") {
    return (
      <Card interactive flush className="overflow-hidden">
        <div className="grid gap-0 sm:grid-cols-[1.05fr_1fr]">
          <ArticleCover
            tone={tone}
            label={department ? pick(department.shortName) : undefined}
            className="h-44 sm:h-full"
          />
          <div className="flex flex-col p-5 sm:p-6">
            <Badge tone="accent" size="xs" className="w-fit">
              {isBn ? "নির্বাচিত" : "Featured"}
            </Badge>
            <h2 className="mt-3 font-display text-xl font-bold leading-snug text-foreground">
              <Link href={href} className="transition-colors hover:text-primary">
                {pick(article.title)}
              </Link>
            </h2>
            <p className="mt-2.5 line-clamp-3 text-[0.875rem] leading-relaxed text-muted-foreground">
              {pick(article.excerpt)}
            </p>
            <div className="mt-auto pt-5">
              <AuthorByline scholarId={article.authorId} size="md" />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                {meta}
                <RefCount count={article.referenceCount} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card interactive flush className="flex h-full flex-col overflow-hidden">
      <Link href={href} className="block">
        <ArticleCover
          tone={tone}
          label={department ? pick(department.shortName) : undefined}
          className="h-36"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {article.status !== "published" ? (
            <StatusBadge
              status={article.status}
              label={t(
                article.status === "in-review"
                  ? "status.inReview"
                  : article.status === "changes-requested"
                    ? "status.changesRequested"
                    : "status.draft",
              )}
              size="xs"
            />
          ) : null}
          <RefCount count={article.referenceCount} />
        </div>
        <h3 className="mt-2.5 font-display text-[1.0625rem] font-semibold leading-snug text-foreground">
          <Link href={href} className="transition-colors hover:text-primary">
            {pick(article.title)}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {pick(article.excerpt)}
        </p>
        <div className="mt-auto pt-4">
          <AuthorByline scholarId={article.authorId} />
          <div className="mt-3 border-t border-border pt-3">{meta}</div>
        </div>
      </div>
    </Card>
  );
}

/** Dense row for sidebars and "related reading" rails. */
export function ArticleRow({ article }: { article: Article }) {
  const { pick, locale, t } = useI18n();
  const tone = asTone(article.coverTone);
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-surface-3"
    >
      <ArticleCover tone={tone} className="mt-0.5 h-12 w-12 shrink-0 rounded-lg" />
      <span className="min-w-0">
        <span className="block font-display text-[0.8125rem] font-semibold leading-snug text-foreground group-hover:text-primary">
          {pick(article.title)}
        </span>
        <span className="mt-1 flex items-center gap-2 text-[0.6875rem] text-subtle-foreground">
          <Clock className="size-3" aria-hidden />
          {article.readingMinutes} {t("label.minutes")}
          <span aria-hidden>·</span>
          {formatNumber(article.viewCount, locale)} {t("label.views")}
        </span>
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------- fatwas */

/**
 * The fatwa card leads with the ruling. A reader should get the answer in the
 * first two lines and only then see the question and the evidence behind it.
 */
export function FatwaCard({
  fatwa,
  layout = "grid",
}: {
  fatwa: Fatwa;
  layout?: "grid" | "list";
}) {
  const { pick, locale, t, isBn } = useI18n();
  const department = getDepartment(fatwa.departmentIds[0]);
  const coSigners = fatwa.coSignerIds
    .map((id) => SCHOLAR_BY_ID[id])
    .filter(Boolean)
    .map((s) => ({ name: pick(s.name), color: s.avatarColor }));
  const href = `/fatwas/${fatwa.slug}`;

  const fiqhLabel =
    fatwa.fiqh === "hanafi" ? t("fatwa.hanafi") : t("fatwa.comparative");

  const rulingBlock = (
    <div className="relative overflow-hidden rounded-xl border border-primary/25 bg-primary-soft/50 p-4">
      <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />
      <p className="flex items-center gap-1.5 pl-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-primary">
        <Scale className="size-3.5" aria-hidden />
        {isBn ? "ফতোয়ার জবাব" : "The ruling"}
      </p>
      <p className="mt-2 pl-1.5 font-display text-[1.0625rem] font-semibold leading-relaxed text-foreground">
        {fatwa.rulingBn}
      </p>
    </div>
  );

  const questionBlock = (
    <div className="rounded-xl bg-surface-2 p-4">
      <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
        <Quote className="size-3.5" aria-hidden />
        {t("label.questioner")}
      </p>
      <p className="mt-1.5 line-clamp-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
        {fatwa.questionBn}
      </p>
    </div>
  );

  const byline = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <AuthorByline scholarId={fatwa.muftiId} timestamp={fatwa.publishedAt} />
      {coSigners.length > 0 ? (
        <span className="flex items-center gap-2">
          <AvatarStack people={coSigners} size="xs" max={3} />
          <span className="text-[0.6875rem] text-subtle-foreground">{t("label.coSigned")}</span>
        </span>
      ) : null}
    </div>
  );

  const badges = (
    <div className="flex flex-wrap items-center gap-2">        {fatwa.pinned ? (
        <Badge tone="accent" size="xs" icon={Pin}>
          {isBn ? "গুরুত্বপূর্ণ" : "Pinned"}
        </Badge>
      ) : null}
      <Badge tone={fatwa.fiqh === "hanafi" ? "primary" : "info"} size="xs" icon={Scale}>
        {fiqhLabel}
      </Badge>
      {department ? (
        <Badge tone={asTone(department.tone)} size="xs">
          {pick(department.shortName)}
        </Badge>
      ) : null}
      {fatwa.status !== "published" ? (
        <StatusBadge status={fatwa.status} label={t("status.inReview")} size="xs" />
      ) : null}
      <RefCount count={fatwa.referenceCount} />
    </div>
  );

  const metrics = (
    <ContentMetaBar
      items={[
        { key: "views", icon: Eye, label: `${formatNumber(fatwa.viewCount, locale)} ${t("label.views")}` },
        { key: "saved", icon: BookmarkCheck, label: formatNumber(fatwa.bookmarkCount, locale) },
        { key: "date", icon: CalendarDays, label: relativeTime(fatwa.publishedAt, locale) },
      ]}
    />
  );

  if (layout === "list") {
    return (
      <Card interactive className="flex flex-col gap-3.5">
        {badges}
        <Link href={href} className="block">
          <p className="font-display text-[1.0625rem] font-semibold leading-relaxed text-foreground transition-colors hover:text-primary">
            {fatwa.rulingBn}
          </p>
          <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
            {fatwa.questionBn}
          </p>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
          {byline}
        </div>
      </Card>
    );
  }

  return (
    <Card interactive className="flex h-full flex-col gap-4">
      {badges}
      {rulingBlock}
      <Link href={href} className="block">
        {questionBlock}
      </Link>
      <div className="mt-auto flex flex-col gap-3.5 border-t border-border pt-4">
        {byline}
        {metrics}
      </div>
    </Card>
  );
}

/** Dense fatwa row for the archive sidebar. */
export function FatwaRow({ fatwa }: { fatwa: Fatwa }) {
  const { pick, locale } = useI18n();
  const mufti = SCHOLAR_BY_ID[fatwa.muftiId];
  return (
    <Link
      href={`/fatwas/${fatwa.slug}`}
      className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-3"
    >
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        <Scale className="size-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.8125rem] font-semibold leading-snug text-foreground group-hover:text-primary">
          {fatwa.rulingBn}
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-[0.6875rem] text-subtle-foreground">
          {mufti ? <span className="truncate">{pick(mufti.name)}</span> : null}
          <span aria-hidden>·</span>
          <span>{relativeTime(fatwa.publishedAt, locale)}</span>
        </span>
      </span>
    </Link>
  );
}

export { RefCount };

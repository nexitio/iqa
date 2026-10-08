"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, GraduationCap, Sparkles } from "lucide-react";
// The registry lives in a module without "use client" so server pages can call
// it directly; a function exported from a client module cannot be invoked there.
import { departmentIcon } from "./department-icon";
import { getDepartment } from "@/lib/data/departments";
import { useI18n } from "@/lib/i18n";
import { formatNumber, toBnDigits } from "@/lib/bn";
import { cn, compact } from "@/lib/utils";
import type { Credential, Scholar } from "@/lib/types";
import { Avatar, Badge, Button, Card, Chip, VerifiedMark } from "@/components/ui";

/* -------------------------------------------------------------------------- */

export function AvailabilityBadge({
  available,
  responseTimeHours,
  className,
}: {
  available: boolean;
  responseTimeHours?: number;
  className?: string;
}) {
  const { t, isBn } = useI18n();
  const hours = responseTimeHours ?? 0;
  const hoursLabel = isBn ? `${toBnDigits(hours)} ঘণ্টা` : `${hours}h`;

  if (available) {
    return (
      <Badge tone="success" size="xs" icon={Sparkles} className={className}>
        {t("label.available")}
        {responseTimeHours !== undefined ? ` · ${hoursLabel}` : ""}
      </Badge>
    );
  }
  return (
    <Badge tone="neutral" size="xs" className={className}>
      {t("label.busy")}
    </Badge>
  );
}

/** The four contributions that make a scholar credible at a glance. */
export function ScholarStatBar({
  scholar,
  className,
  compactMode = false,
}: {
  scholar: Scholar;
  className?: string;
  compactMode?: boolean;
}) {
  const { t, locale } = useI18n();

  const items = [
    { label: t("label.answers"), value: scholar.stats.answers },
    { label: t("label.articles"), value: scholar.stats.articles },
    { label: t("label.fatwas"), value: scholar.stats.fatwas },
    { label: t("label.followers"), value: scholar.stats.followers },
  ];

  return (
    <dl
      className={cn(
        "grid grid-cols-4 divide-x divide-border rounded-card border border-border bg-surface-2",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="px-2 py-2 text-center">
          <dd className="font-display text-[0.9375rem] font-bold tabular leading-none text-foreground">
            {compactMode ? compact(item.value) : formatNumber(item.value, locale)}
          </dd>
          <dt className="mt-1 truncate text-[0.625rem] text-subtle-foreground">{item.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export function CredentialList({
  credentials,
  className,
}: {
  credentials: Credential[];
  className?: string;
}) {
  const { t, pick } = useI18n();
  if (credentials.length === 0) return null;

  return (
    <div className={className}>
      <p className="mb-3 text-[0.75rem] font-semibold uppercase tracking-wide text-subtle-foreground">
        {t("label.credentials")}
      </p>
      <ul className="space-y-3">
        {credentials.map((credential) => (
          <li key={credential.id} className="flex gap-3">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-soft-foreground">
              <GraduationCap className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.875rem] font-medium leading-snug text-foreground">
                {pick(credential.title)}
              </p>
              <p className="mt-0.5 text-[0.75rem] leading-relaxed text-muted-foreground">
                {pick(credential.institution)}
                <span className="mx-1.5 text-border-strong">·</span>
                <span className="tabular">{toBnDigits(credential.year)}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Small department pill row, shared by cards and rows. */
function DepartmentChips({ scholar, max = 3 }: { scholar: Scholar; max?: number }) {
  const { pick } = useI18n();
  const departments = scholar.departmentIds
    .map((id) => getDepartment(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const shown = departments.slice(0, max);
  const extra = departments.length - shown.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((department) => (
        <Chip
          key={department.id}
          href={`/departments/${department.slug}`}
          tone={department.tone}
          size="sm"
          icon={departmentIcon(department.icon)}
        >
          {pick(department.shortName)}
        </Chip>
      ))}
      {extra > 0 ? (
        <span className="text-[0.6875rem] text-subtle-foreground">+{toBnDigits(extra)}</span>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function ScholarCard({
  scholar,
  layout = "grid",
  showFollow = true,
  className,
}: {
  scholar: Scholar;
  layout?: "grid" | "list" | "compact";
  showFollow?: boolean;
  className?: string;
}) {
  const { t, pick, locale } = useI18n();
  const href = `/scholars/${scholar.slug}`;
  const name = `${pick(scholar.honorific)} ${pick(scholar.name)}`;

  if (layout === "compact") {
    return (
      <Card padding="sm" interactive className={cn("flex items-center gap-3", className)}>
        <Avatar name={pick(scholar.name)} color={scholar.avatarColor} size="sm" verified={scholar.verified} />
        <div className="min-w-0 flex-1">
          <Link href={href} className="block truncate text-[0.8125rem] font-semibold text-foreground hover:text-primary">
            {name}
          </Link>
          <p className="truncate text-[0.6875rem] text-subtle-foreground">{pick(scholar.madrasah)}</p>
        </div>
        <AvailabilityBadge available={scholar.availableForQuestions} responseTimeHours={scholar.responseTimeHours} />
      </Card>
    );
  }

  if (layout === "list") {
    return (
      <Card interactive className={cn("flex flex-col gap-4 sm:flex-row sm:items-center", className)}>
        <Link href={href} className="flex min-w-0 flex-1 items-start gap-3.5">
          <Avatar
            name={pick(scholar.name)}
            color={scholar.avatarColor}
            size="lg"
            verified={scholar.verified}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-display text-[0.9375rem] font-semibold text-foreground">{name}</span>
              {scholar.verified ? <VerifiedMark label={t("label.verifiedScholar")} /> : null}
            </div>
            <p className="mt-0.5 truncate text-[0.75rem] text-muted-foreground">{pick(scholar.madrasah)}</p>
            <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
              {pick(scholar.shortBio)}
            </p>
            <div className="mt-2.5">
              <DepartmentChips scholar={scholar} max={2} />
            </div>
          </div>
        </Link>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <Badge tone="accent" size="sm">
            {formatNumber(scholar.stats.followers, locale)} {t("label.followers")}
          </Badge>
          {showFollow ? (
            <Button href={href} size="sm" variant="outline">
              {t("action.follow")}
            </Button>
          ) : null}
        </div>
      </Card>
    );
  }

  return (
    <Card interactive className={cn("flex h-full flex-col", className)}>
      <div className="flex items-start gap-3.5">
        <Link href={href} className="shrink-0">
          <Avatar name={pick(scholar.name)} color={scholar.avatarColor} size="lg" verified={scholar.verified} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={href}
              className="font-display text-[0.9375rem] font-semibold leading-snug text-foreground hover:text-primary"
            >
              {name}
            </Link>
            {scholar.verified ? <VerifiedMark label={t("label.verifiedScholar")} /> : null}
          </div>
          <p className="mt-0.5 truncate text-[0.75rem] text-muted-foreground">{pick(scholar.madrasah)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone="accent" size="xs">
              ★ {scholar.rating.toFixed(1)}
            </Badge>
            <AvailabilityBadge
              available={scholar.availableForQuestions}
              responseTimeHours={scholar.responseTimeHours}
            />
          </div>
        </div>
      </div>

      <div className="mt-3">
        <DepartmentChips scholar={scholar} />
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
        {pick(scholar.shortBio)}
      </p>

      <ScholarStatBar scholar={scholar} className="mt-3.5" compactMode />

      {/* Two halves, not two full-width buttons. `Button` is `shrink-0` and
          `full` means `w-full`, so a pair of them in one flex row demanded 200%
          of the card: the follow button was pushed past the card's right edge
          and dragged the card's other content out with it. Each button takes a
          share of the row instead, and below ~16rem of card the row wraps to
          stacked buttons rather than letting either label clip. */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <Button
          href={href}
          size="sm"
          variant="outline"
          full={!showFollow}
          className={showFollow ? "min-w-0 grow basis-[7.5rem]" : undefined}
        >
          {t("action.viewAll")}
        </Button>
        {showFollow ? (
          <Button size="sm" variant="soft" className="min-w-0 grow basis-[7.5rem]">
            {t("action.follow")}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

export function ScholarMiniCard({ scholar, className }: { scholar: Scholar; className?: string }) {
  return <ScholarCard scholar={scholar} layout="compact" showFollow={false} className={className} />;
}

export function ScholarRow({
  scholar,
  rank,
  className,
}: {
  scholar: Scholar;
  rank?: number;
  className?: string;
}) {
  const { t, pick, locale } = useI18n();
  const href = `/scholars/${scholar.slug}`;

  return (
    <div className={cn("flex items-center gap-3.5 py-3", className)}>
      {rank !== undefined ? (
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-3 text-[0.75rem] font-bold tabular text-muted-foreground">
          {toBnDigits(rank)}
        </span>
      ) : null}
      <Avatar name={pick(scholar.name)} color={scholar.avatarColor} size="md" verified={scholar.verified} />
      <div className="min-w-0 flex-1">
        <Link href={href} className="block truncate text-[0.875rem] font-semibold text-foreground hover:text-primary">
          {pick(scholar.honorific)} {pick(scholar.name)}
        </Link>
        <p className="truncate text-[0.75rem] text-subtle-foreground">{pick(scholar.madrasah)}</p>
      </div>
      <div className="hidden shrink-0 items-center gap-4 text-right sm:flex">
        <div>
          <p className="font-display text-[0.875rem] font-bold tabular leading-none text-foreground">
            {formatNumber(scholar.stats.answers, locale)}
          </p>
          <p className="mt-0.5 text-[0.625rem] text-subtle-foreground">{t("label.answers")}</p>
        </div>
        <div>
          <p className="font-display text-[0.875rem] font-bold tabular leading-none text-foreground">
            {toBnDigits(scholar.responseTimeHours)}h
          </p>
          <p className="mt-0.5 text-[0.625rem] text-subtle-foreground">{t("label.responseTime")}</p>
        </div>
      </div>
      <Button
        href={href}
        size="icon-sm"
        variant="ghost"
        icon={ArrowRight}
        className="shrink-0"
      >
        {t("action.viewAll")}
      </Button>
    </div>
  );
}

/** Horizontal rail of scholar mini-cards, for sidebars and rails. */
export function ScholarMiniRail({
  scholars,
  className,
  title,
}: {
  scholars: Scholar[];
  className?: string;
  title?: ReactNode;
}) {
  if (scholars.length === 0) return null;
  return (
    <div className={className}>
      {title}
      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {scholars.map((scholar) => (
          <div key={scholar.id} className="w-[16rem] shrink-0">
            <ScholarCard scholar={scholar} layout="compact" />
          </div>
        ))}
      </div>
    </div>
  );
}

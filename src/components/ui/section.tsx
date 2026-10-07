import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ChevronLeft, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { softTone, solidTone, textTone, type Tone } from "./tone";

/* --------------------------------------------------------------- breadcrumbs */

export interface Crumb {
  label: ReactNode;
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="breadcrumb" className={cn("flex items-center gap-1.5 text-[0.75rem]", className)}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 ? <ChevronLeft className="size-3 text-subtle-foreground" aria-hidden /> : null}
          {item.href ? (
            <Link href={item.href} className="text-muted-foreground transition-colors hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* --------------------------------------------------------------- page header */

/**
 * The standard top-of-page block. Every route uses this so titles, eyebrows and
 * actions sit in the same place throughout the product.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  breadcrumbs,
  tone = "primary",
  className,
  children,
  /** Adds the low-contrast Islamic lattice behind the header. */
  patterned = false,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
  tone?: Tone;
  className?: string;
  children?: ReactNode;
  patterned?: boolean;
}) {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-panel border border-border bg-surface p-4 shadow-card sm:p-6",
        patterned && "pattern-girih",
        className,
      )}
    >
      {patterned ? (
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-surface/85 via-surface/95 to-surface"
          aria-hidden
        />
      ) : null}
      <div className="relative">
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} className="mb-3" /> : null}
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {Icon ? (
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", softTone[tone])}>
                <Icon className="size-[1.15rem]" strokeWidth={1.9} />
              </span>
            ) : null}
            <div className="min-w-0">
              {eyebrow ? (
                <p className={cn("text-[0.75rem] font-semibold uppercase tracking-wide", textTone[tone])}>
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="font-display text-xl font-bold leading-tight text-foreground sm:text-2xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-1.5 max-w-2xl text-[0.875rem] leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------ section header */

export function SectionHeader({
  title,
  description,
  icon: Icon,
  action,
  href,
  actionLabel,
  tone = "primary",
  className,
  size = "md",
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  /** Convenience: renders a "view all" link when given. */
  href?: string;
  actionLabel?: string;
  tone?: Tone;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-2">
        {Icon ? (
          <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg", softTone[tone])}>
            <Icon className={cn(size === "sm" ? "size-3.5" : "size-4")} />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2
            className={cn(
              "font-display font-semibold leading-snug text-foreground",
              size === "sm" ? "text-[0.875rem]" : "text-base",
            )}
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-[0.75rem] leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {action ??
        (href ? (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1 text-[0.8125rem] font-medium text-primary transition-colors hover:text-primary-hover"
          >
            {actionLabel ?? "সব দেখুন"}
            <ArrowRight className="size-3.5" />
          </Link>
        ) : null)}
    </div>
  );
}

/* ------------------------------------------------------------------ stat tile */

export function Delta({ value, className, suffix = "%" }: { value: number; className?: string; suffix?: string }) {
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular",
        up ? "bg-success-soft text-success-soft-foreground" : "bg-danger-soft text-danger-soft-foreground",
        className,
      )}
    >
      <Icon className="size-3" strokeWidth={2.6} aria-hidden />
      {up ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  delta,
  href,
  className,
  size = "md",
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  delta?: number;
  href?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.75rem] font-medium leading-snug text-muted-foreground">{label}</p>
        {Icon ? (
          <span className={cn("grid shrink-0 place-items-center rounded-xl", size === "sm" ? "size-7" : "size-9", softTone[tone])}>
            <Icon className={size === "sm" ? "size-3.5" : "size-4"} />
          </span>
        ) : null}
      </div>
      <div className={cn("mt-1.5 flex items-baseline gap-2", size === "sm" ? "text-xl" : "text-2xl")}>
        <span className="font-display font-bold tabular leading-none text-foreground">{value}</span>
        {delta !== undefined ? <Delta value={delta} /> : null}
      </div>
      {hint ? (
        <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-subtle-foreground">{hint}</p>
      ) : null}
    </>
  );

  const classes = cn(
    "rounded-panel border border-border bg-surface shadow-card transition-all",
    size === "sm" ? "p-3.5" : "p-4",
    href && "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-raised",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cn(classes, "block")}>
        {body}
      </Link>
    );
  }
  return <div className={classes}>{body}</div>;
}

/** Labelled value used inside profile and fatwa metadata grids. */
export function FactList({
  items,
  className,
  columns = 2,
}: {
  items: { label: ReactNode; value: ReactNode; icon?: LucideIcon }[];
  className?: string;
  columns?: 1 | 2 | 3;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4",
        columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
        className,
      )}
    >
      {items.map((item, index) => (
        <div key={index} className="min-w-0">
          <dt className="flex items-center gap-1.5 text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
            {item.icon ? <item.icon className="size-3.5" /> : null}
            {item.label}
          </dt>
          <dd className="mt-1 text-[0.875rem] font-medium leading-snug text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Compact legend row, shared by the chart panels. */
export function Legend({
  items,
  className,
}: {
  items: { label: string; tone: Tone; value?: ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2 text-[0.75rem] text-muted-foreground">
          <span className={cn("size-2 rounded-full", solidTone[item.tone])} />
          {item.label}
          {item.value !== undefined ? (
            <span className="font-semibold tabular text-foreground">{item.value}</span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

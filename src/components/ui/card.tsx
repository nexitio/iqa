import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { softTone, type Tone } from "./tone";

type CardVariant = "default" | "raised" | "flat" | "outline" | "parchment" | "glass";

const variants: Record<CardVariant, string> = {
  default: "border border-border bg-surface shadow-card",
  raised: "border border-border bg-surface shadow-raised",
  flat: "bg-surface-2",
  outline: "border border-border bg-transparent",
  parchment: "border border-border bg-surface shadow-card parchment",
  glass: "border border-white/15 bg-surface/70 backdrop-blur-xl",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Adds hover lift + cursor affordance; use when the whole card is a link. */
  interactive?: boolean;
  /** Removes default padding so the caller can lay out edge-to-edge media. */
  flush?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = {
  none: "",
  sm: "p-3.5",
  // Density is a feature: `md` is the default for every panel in the product,
  // so it is tuned to hold a full section without wasting a phone screen.
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export function Card({
  className,
  variant = "default",
  interactive = false,
  flush = false,
  padding,
  children,
  ...props
}: CardProps) {
  const resolvedPadding = padding ?? (flush ? "none" : "md");
  return (
    <div
      className={cn(
        "relative rounded-panel",
        variants[variant],
        paddings[resolvedPadding],
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-raised",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Title row with optional leading icon, subtitle and trailing action. */
export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  tone = "primary",
  className,
  titleClassName,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
  /** Tints the icon tile so a panel's purpose reads at a glance. */
  tone?: Tone;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg", softTone[tone])}>
            <Icon className="size-4" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className={cn("font-display text-[0.9375rem] font-semibold leading-snug text-foreground", titleClassName)}>
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-3.5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-3.5 flex flex-wrap items-center gap-3 border-t border-border pt-3.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/** Dashed placeholder surface for empty slots inside a card grid. */
export function CardPlaceholder({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-panel border border-dashed border-border-strong bg-surface-2/60 p-5 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

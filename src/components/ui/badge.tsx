import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Star, TrendingUp, Sparkles, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { softTone, solidTone, outlineTone, statusTone, type Tone } from "./tone";

type BadgeSize = "xs" | "sm" | "md";

const sizes: Record<BadgeSize, string> = {
  xs: "h-5 gap-1 px-1.5 text-[0.6875rem] rounded-md",
  sm: "h-6 gap-1 px-2 text-[0.75rem] rounded-lg",
  md: "h-7 gap-1.5 px-2.5 text-[0.8125rem] rounded-lg",
};

const iconSizes: Record<BadgeSize, string> = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  size?: BadgeSize;
  icon?: LucideIcon;
  variant?: "soft" | "solid" | "outline";
  className?: string;
  /** Renders a small leading colour dot instead of an icon. */
  dot?: boolean;
}

export function Badge({
  children,
  tone = "neutral",
  size = "sm",
  icon: Icon,
  variant = "soft",
  className,
  dot = false,
}: BadgeProps) {
  const palette =
    variant === "solid" ? cn(solidTone[tone], "text-white") : variant === "outline" ? outlineTone[tone] : softTone[tone];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap border border-transparent font-medium",
        sizes[size],
        palette,
        className,
      )}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", variant === "solid" ? "bg-white" : solidTone[tone])} /> : null}
      {Icon ? <Icon className={iconSizes[size]} strokeWidth={2.2} aria-hidden /> : null}
      {children}
    </span>
  );
}

/** Lifecycle badge driven by a snake/kebab status string from the data layer. */
export function StatusBadge({
  status,
  label,
  size = "sm",
  className,
}: {
  status: string;
  label: string;
  size?: BadgeSize;
  className?: string;
}) {
  return (
    <Badge tone={statusTone(status)} size={size} dot className={className}>
      {label}
    </Badge>
  );
}

/** Small verified tick used beside scholar names. */
export function VerifiedMark({ className, label }: { className?: string; label: string }) {
  return (
    <span className={cn("inline-flex text-primary", className)} title={label} aria-label={label}>
      <BadgeCheck className="size-4" strokeWidth={2.4} />
    </span>
  );
}

const FLAG_STYLES: Record<string, { tone: Tone; Icon: LucideIcon }> = {
  verified: { tone: "primary", Icon: BadgeCheck },
  top: { tone: "accent", Icon: Star },
  trending: { tone: "danger", Icon: Flame },
  new: { tone: "info", Icon: Sparkles },
  rising: { tone: "success", Icon: TrendingUp },
};

/** Compact "why this matters" flag, e.g. verified / trending / top scholar. */
export function FlagBadge({
  flag,
  label,
  size = "xs",
  className,
}: {
  flag: keyof typeof FLAG_STYLES | string;
  label: string;
  size?: BadgeSize;
  className?: string;
}) {
  const config = FLAG_STYLES[flag] ?? FLAG_STYLES.new;
  return (
    <Badge tone={config.tone} size={size} icon={config.Icon} className={className}>
      {label}
    </Badge>
  );
}

/** Numeric "trust" chip, e.g. "৯৬% সহায়ক". */
export function ScoreBadge({
  value,
  label,
  tone = "primary",
  className,
}: {
  value: string;
  label?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1 text-[0.75rem] font-semibold",
        softTone[tone],
        className,
      )}
    >
      {label ? <span className="font-normal opacity-80">{label}</span> : null}
      <span className="tabular">{value}</span>
    </span>
  );
}

/** Tiny count pill for nav rails and tab labels. */
export function CountPill({
  value,
  tone = "neutral",
  className,
}: {
  value: string | number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-grid min-w-5 place-items-center rounded-full px-1.5 text-[0.6875rem] font-semibold leading-5",
        softTone[tone],
        className,
      )}
    >
      {value}
    </span>
  );
}

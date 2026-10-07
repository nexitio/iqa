import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { softTone, outlineTone, type Tone } from "./tone";

type ChipSize = "sm" | "md";

const sizes: Record<ChipSize, string> = {
  sm: "h-7 gap-1.5 px-2.5 text-[0.75rem]",
  md: "h-9 gap-2 px-3.5 text-[0.8125rem]",
};

/**
 * A pill for a navigable subject (topic, department, tag). Renders as a link
 * when `href` is supplied, otherwise as a static label.
 */
export function Chip({
  children,
  href,
  tone = "neutral",
  size = "sm",
  icon: Icon,
  variant = "soft",
  active = false,
  count,
  className,
  onRemove,
  onClick,
  disabled,
  title,
}: {
  children: ReactNode;
  href?: string;
  tone?: Tone;
  size?: ChipSize;
  icon?: LucideIcon;
  variant?: "soft" | "outline";
  /** Selected state for filter rails. */
  active?: boolean;
  count?: string | number;
  className?: string;
  onRemove?: () => void;
  /**
   * Makes the chip interactive. When supplied the chip renders as a real
   * <button> so filter rails and removable tags are keyboard-operable.
   */
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  const classes = cn(
    "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border font-medium transition-all duration-150",
    sizes[size],
    active
      ? "border-primary bg-primary text-primary-foreground shadow-card"
      : variant === "outline"
        ? cn(outlineTone[tone], "border hover:border-primary/45")
        : cn(softTone[tone], "border-transparent hover:brightness-[0.97]"),
    (href || onClick) && "hover:-translate-y-px",
    disabled && "pointer-events-none opacity-55",
    className,
  );

  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  const inner = (
    <>
      {Icon ? <Icon className={iconSize} aria-hidden /> : null}
      <span className="truncate">{children}</span>
      {count !== undefined ? (
        <span className={cn("tabular opacity-70", size === "sm" ? "text-[0.6875rem]" : "text-[0.75rem]")}>
          {count}
        </span>
      ) : null}
      {onRemove ? (
        <span
          role="button"
          tabIndex={0}
          aria-label="remove"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-1 grid size-4 place-items-center rounded-full hover:bg-black/10"
        >
          ×
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} title={title} aria-current={active ? "page" : undefined}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        aria-pressed={active}
        className={classes}
      >
        {inner}
      </button>
    );
  }
  return (
    <span className={classes} title={title}>
      {inner}
    </span>
  );
}

/** Horizontally scrollable row of chips — the standard subject filter rail. */
export function ChipList({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn("no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 py-1", className)}
      role={label ? "group" : undefined}
      aria-label={label}
    >
      {children}
    </div>
  );
}

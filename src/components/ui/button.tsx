import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const button = cva(
  "relative inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-card hover:bg-primary-hover hover:shadow-raised active:translate-y-px",
        accent:
          "bg-accent text-accent-foreground shadow-card hover:bg-accent-hover active:translate-y-px",
        soft: "bg-primary-soft text-primary-soft-foreground hover:bg-primary hover:text-primary-foreground",
        outline:
          "border border-border-strong bg-surface text-foreground hover:border-primary/45 hover:bg-primary-soft hover:text-primary-soft-foreground",
        ghost: "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
        subtle: "bg-surface-3 text-foreground hover:bg-border",
        danger: "bg-danger text-white shadow-card hover:brightness-110 active:translate-y-px",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2.5 text-[0.75rem]",
        sm: "h-8 px-3 text-[0.8125rem]",
        md: "h-10 px-4 text-[0.875rem]",
        lg: "h-12 px-6 text-[0.9375rem]",
        icon: "size-9 rounded-full",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-11 rounded-full",
      },
      full: { true: "w-full", false: "" },
      /** Square-ish corners for toolbars and inline form actions. */
      squared: { true: "rounded-xl", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", full: false, squared: false },
  },
);

type ButtonVariantProps = VariantProps<typeof button>;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    ButtonVariantProps {
  children?: ReactNode;
  /** Leading icon. */
  icon?: LucideIcon;
  /** Trailing icon. */
  iconRight?: LucideIcon;
  /** Shows a spinner and disables interaction. */
  loading?: boolean;
  /** When present the button renders as a Next.js link. */
  href?: string;
  /** Adds target/rel for external links. */
  external?: boolean;
}

export function Button({
  children,
  className,
  variant,
  size,
  full,
  squared,
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  href,
  external = false,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const isIconOnly = size === "icon" || size === "icon-sm" || size === "icon-lg";
  const iconSize = size === "lg" || size === "icon-lg" ? "size-5" : size === "xs" ? "size-3.5" : "size-4";

  const content = (
    <>
      {loading ? (
        <Loader2 className={cn(iconSize, "animate-spin")} aria-hidden />
      ) : Icon ? (
        <Icon className={iconSize} strokeWidth={2.1} aria-hidden />
      ) : null}
      {children ? <span className={cn(isIconOnly && "sr-only")}>{children}</span> : null}
      {IconRight && !loading ? <IconRight className={iconSize} strokeWidth={2.1} aria-hidden /> : null}
    </>
  );

  const classes = cn(button({ variant, size, full, squared }), className);

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={classes}
        aria-label={isIconOnly && typeof children === "string" ? children : undefined}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={isIconOnly && typeof children === "string" ? children : undefined}
      {...props}
    >
      {content}
    </button>
  );
}

/** Segmented control row used for filters and view switchers. */
export function ButtonGroup({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A single option inside a ButtonGroup. */
export function SegmentButton({
  active = false,
  children,
  className,
  icon: Icon,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-card"
          : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
      {children}
    </button>
  );
}

export { button as buttonVariants };

import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const sizes: Record<AvatarSize, string> = {
  xs: "size-6 text-[0.625rem]",
  sm: "size-8 text-[0.6875rem]",
  md: "size-10 text-[0.8125rem]",
  lg: "size-12 text-base",
  xl: "size-16 text-xl",
  "2xl": "size-24 text-3xl",
};

const badgeSizes: Record<AvatarSize, string> = {
  xs: "size-2.5 -right-0 -bottom-0",
  sm: "size-3 -right-0 -bottom-0",
  md: "size-3.5 right-0 bottom-0",
  lg: "size-4 right-0.5 bottom-0.5",
  xl: "size-5 right-1 bottom-1",
  "2xl": "size-7 right-1.5 bottom-1.5",
};

/**
 * Avatars are generated from the record's own colour plus initials, so no
 * portrait assets are needed and Bengali conjuncts render correctly.
 */
export function Avatar({
  name,
  color = "#0d6b4f",
  size = "md",
  verified = false,
  ring = false,
  className,
  title,
}: {
  name: string;
  color?: string;
  size?: AvatarSize;
  verified?: boolean;
  /** Adds a surface-coloured ring so the avatar reads on busy backgrounds. */
  ring?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)} title={title ?? name}>
      <span
        className={cn(
          "grid place-items-center rounded-full font-semibold leading-none text-white",
          sizes[size],
          ring && "ring-2 ring-surface",
        )}
        style={{
          // Two-stop gradient keeps a flat colour token from looking muddy.
          backgroundImage: `linear-gradient(140deg, ${color} 0%, color-mix(in oklab, ${color} 72%, #000) 100%)`,
        }}
        aria-hidden
      >
        {initials(name)}
      </span>
      {verified ? (
        <BadgeCheck
          className={cn(
            "absolute rounded-full bg-surface text-primary",
            badgeSizes[size],
          )}
          strokeWidth={2.6}
          aria-label="verified"
        />
      ) : null}
    </span>
  );
}

/** Overlapping cluster, e.g. co-signing muftis on a fatwa. */
export function AvatarStack({
  people,
  max = 4,
  size = "sm",
  className,
}: {
  people: { name: string; color?: string }[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className={cn("flex items-center", className)}>
      {shown.map((p, i) => (
        <Avatar
          key={`${p.name}-${i}`}
          name={p.name}
          color={p.color}
          size={size}
          ring
          className={i === 0 ? "" : "-ml-2"}
        />
      ))}
      {extra > 0 ? (
        <span
          className={cn(
            "-ml-2 grid place-items-center rounded-full bg-surface-3 font-semibold text-muted-foreground ring-2 ring-surface",
            sizes[size],
          )}
        >
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

import { cn } from "@/lib/utils";
import { solidTone, type Tone } from "./tone";

export function Progress({
  value,
  tone = "primary",
  size = "md",
  className,
  showLabel = false,
  label,
}: {
  value: number;
  tone?: Tone;
  size?: "xs" | "sm" | "md";
  className?: string;
  showLabel?: boolean;
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const heights = { xs: "h-1", sm: "h-1.5", md: "h-2.5" };
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn("relative w-full overflow-hidden rounded-full bg-surface-3", heights[size])}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", solidTone[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel ? (
        <span className="shrink-0 text-[0.75rem] font-semibold tabular text-muted-foreground">
          {Math.round(clamped)}%
        </span>
      ) : null}
    </div>
  );
}

/**
 * Circular progress for "continue learning" cards. Drawn with SVG so it scales
 * cleanly and can hold a centred label.
 */
export function Ring({
  value,
  size = 64,
  thickness = 6,
  tone = "primary",
  children,
  className,
  trackClassName,
}: {
  value: number;
  size?: number;
  thickness?: number;
  tone?: Tone;
  children?: React.ReactNode;
  className?: string;
  trackClassName?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  const color = {
    primary: "var(--primary)",
    accent: "var(--accent)",
    info: "var(--info)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
    neutral: "var(--fg-subtle)",
    scholar: "var(--role-scholar)",
    user: "var(--role-user)",
    admin: "var(--role-admin)",
  }[tone];

  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className={cn("stroke-surface-3", trackClassName)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
      <span className="sr-only">{Math.round(clamped)}%</span>
    </div>
  );
}

/** Day-by-day completion strip used by journeys. */
export function DayDots({
  total,
  completed,
  tone = "primary",
  className,
}: {
  total: number;
  completed: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)} aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "size-2 rounded-full transition-colors",
            i < completed ? solidTone[tone] : "bg-surface-3",
          )}
        />
      ))}
    </div>
  );
}

/**
 * Seven-day activity strip with the goal line, for the "healthy habit" panel.
 * Values are minutes; bars above the goal are highlighted.
 */
export function WeekStrip({
  values,
  goal,
  labels,
  className,
}: {
  values: number[];
  goal: number;
  labels: string[];
  className?: string;
}) {
  const max = Math.max(goal, ...values, 1);
  return (
    <div className={cn("flex items-end gap-2", className)}>
      {values.map((v, i) => {
        const met = v >= goal;
        const height = Math.max(6, Math.round((v / max) * 100));
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-24 w-full items-end justify-center">
              <div
                className={cn(
                  "w-full max-w-7 rounded-t-md transition-all duration-500",
                  met ? "bg-primary" : "bg-primary/25",
                )}
                style={{ height: `${height}%` }}
                title={`${v}`}
              />
            </div>
            <span className="text-[0.6875rem] text-subtle-foreground">{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

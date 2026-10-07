import { cn } from "@/lib/utils";
import { solidTone, chartTone, type Tone } from "./tone";

/**
 * Hand-rolled SVG charts.
 *
 * The analytics surfaces need a handful of small, themed visuals. Drawing them
 * directly keeps the palette driven by our CSS tokens and avoids pulling a
 * charting library into the bundle for four shapes.
 */

export interface Series {
  label: string;
  value: number;
}

/* ---------------------------------------------------------------- bar chart */

export function BarChart({
  data,
  tone = "primary",
  height = 160,
  className,
  showValues = false,
  formatValue,
}: {
  data: Series[];
  tone?: Tone;
  height?: number;
  className?: string;
  showValues?: boolean;
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  // A bar per day is useful; a *label* per day is not — beside each other they
  // truncate into noise. Step them so at most eight sit on the axis, and let a
  // step label overflow its own column because its neighbours are empty.
  const labelStep = Math.max(1, Math.ceil(data.length / 8));
  return (
    <div className={className}>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={d.label} className="group flex h-full flex-1 flex-col justify-end">
              {showValues ? (
                <span className="mb-1 text-center text-[0.625rem] font-semibold tabular text-subtle-foreground">
                  {formatValue ? formatValue(d.value) : d.value}
                </span>
              ) : null}
              <div
                className={cn(
                  "w-full rounded-t-md transition-all duration-500 group-hover:opacity-85",
                  solidTone[tone],
                )}
                style={{ height: `${Math.max(3, pct)}%` }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 border-t border-border pt-2">
        {data.map((d, index) => (
          <span
            key={d.label}
            className="flex-1 whitespace-nowrap text-center text-[0.625rem] text-subtle-foreground"
            title={d.label}
            aria-hidden={index % labelStep !== 0}
          >
            {index % labelStep === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- sparkline */

export function Sparkline({
  data,
  tone = "primary",
  height = 56,
  className,
  showArea = true,
}: {
  data: number[];
  tone?: Tone;
  height?: number;
  className?: string;
  showArea?: boolean;
}) {
  if (data.length < 2) return <div className={className} style={{ height }} />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const width = 100;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = 100 - ((v - min) / span) * 88 - 6;
    return { x, y };
  });

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const area = `${line} L${width},100 L0,100 Z`;
  const color = chartTone[tone];
  const gradientId = `spark-${tone}`;

  return (
    <svg
      viewBox={`0 0 ${width} 100`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showArea ? <path d={area} fill={`url(#${gradientId})`} /> : null}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* -------------------------------------------------------------- donut chart */

export function DonutChart({
  segments,
  size = 180,
  thickness = 20,
  centerLabel,
  centerValue,
  className,
}: {
  segments: { label: string; value: number; tone: Tone }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Arc geometry is computed up front rather than accumulated inside the map,
  // so nothing is mutated while React renders the tree.
  const arcs = segments.reduce<{ segment: Series & { tone: Tone }; length: number; offset: number }[]>(
    (acc, segment) => {
      const length = (segment.value / total) * circumference;
      const previous = acc[acc.length - 1];
      acc.push({
        segment,
        length,
        offset: previous ? previous.offset + previous.length : 0,
      });
      return acc;
    },
    [],
  );

  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className="stroke-surface-3"
        />
        {arcs.map(({ segment, length, offset }) => (
          <circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            stroke={chartTone[segment.tone]}
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      {centerValue ? (
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-xl font-bold tabular leading-none text-foreground">{centerValue}</p>
            {centerLabel ? (
              <p className="mt-1 text-[0.6875rem] text-subtle-foreground">{centerLabel}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------ horizontal bars */

export function HorizontalBars({
  data,
  tone = "primary",
  className,
  formatValue,
  max,
}: {
  data: Series[];
  tone?: Tone;
  className?: string;
  formatValue?: (value: number) => string;
  max?: number;
}) {
  const peak = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className={cn("space-y-3", className)}>
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="truncate text-[0.8125rem] font-medium text-foreground">{d.label}</span>
            <span className="shrink-0 text-[0.75rem] font-semibold tabular text-muted-foreground">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-3">
            <div
              className={cn("h-full rounded-full transition-[width] duration-700", solidTone[tone])}
              style={{ width: `${Math.max(2, (d.value / peak) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------- activity heat */

export function HeatStrip({
  values,
  labels,
  tone = "primary",
  className,
}: {
  values: number[];
  labels?: string[];
  tone?: Tone;
  className?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {values.map((v, i) => {
        const intensity = v / max;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={cn("h-9 w-full rounded-md", solidTone[tone])}
              style={{ opacity: Math.max(0.12, intensity) }}
              title={`${v}`}
            />
            {labels ? (
              <span className="text-[0.625rem] text-subtle-foreground">{labels[i]}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

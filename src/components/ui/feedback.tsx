import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Info, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { outlineTone, softTone, type Tone } from "./tone";

/* --------------------------------------------------------------- skeletons */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer-bg rounded-lg", className)} aria-hidden />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-2/3" : i % 2 === 0 ? "w-full" : "w-11/12")} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-panel border border-border bg-surface p-5", className)} aria-hidden>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText className="mt-5" lines={3} />
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-primary", className)} aria-label="loading" />;
}

/* ------------------------------------------------------------------- states */

export function EmptyState({
  title,
  description,
  icon: Icon = Sparkles,
  action,
  tone = "primary",
  className,
  compact = false,
}: {
  // ReactNode so callers can pass the <T k="..." /> localization bridge.
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  tone?: Tone;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-4 py-8" : "px-6 py-14",
        className,
      )}
    >
      <span className={cn("grid size-14 place-items-center rounded-2xl", softTone[tone])}>
        <Icon className="size-6" strokeWidth={1.8} />
      </span>
      <h3 className="mt-4 font-display text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-md text-[0.8125rem] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={AlertTriangle}
      tone="danger"
      action={action}
      className={className}
    />
  );
}

/** Explains that a section has no dataset yet — used honestly during the UI phase. */
export function ContentPending({ message, className }: { message: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-panel border border-dashed border-border-strong bg-surface-2/70 p-4",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">{message}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ callouts */

export function Callout({
  title,
  children,
  tone = "info",
  icon: Icon = Info,
  action,
  className,
}: {
  title?: string;
  children: ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-panel border p-4", outlineTone[tone], className)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 size-4 shrink-0", "opacity-80")} />
        <div className="min-w-0 flex-1">
          {title ? <p className="text-[0.875rem] font-semibold text-foreground">{title}</p> : null}
          <div className={cn("text-[0.8125rem] leading-relaxed text-muted-foreground", title && "mt-1")}>
            {children}
          </div>
        </div>
        {action ? <div className="shrink-0 self-center">{action}</div> : null}
      </div>
    </div>
  );
}

/** Compact metric chip used in dense headers, e.g. "১২ আয়াত". */
export function MetaDot({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[0.75rem] text-muted-foreground", className)}>
      {children}
    </span>
  );
}

export function MetaRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5", className)}>{children}</div>
  );
}

/* -------------------------------------------------------------------- prose */

/**
 * Renders an array of Bangla paragraphs as structured long-form content.
 *
 * The mock bodies are written as plain paragraphs where headings, list items
 * and quotes are signalled by light conventions (`### `, `- `, `> `, or a short
 * unpunctuated line). This keeps authored content simple while still producing
 * a properly structured article page.
 */
export function Prose({
  paragraphs,
  className,
}: {
  paragraphs: string[];
  className?: string;
}) {
  const blocks: ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${key}`}>
        {listBuffer.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  paragraphs.forEach((raw, index) => {
    const text = raw.trim();
    if (!text) return;

    const isBullet = /^[-•*]\s+/.test(text);
    if (isBullet) {
      listBuffer.push(text.replace(/^[-•*]\s+/, ""));
      return;
    }
    flushList(String(index));

    if (/^#{2,4}\s/.test(text)) {
      blocks.push(<h2 key={index}>{text.replace(/^#{2,4}\s+/, "")}</h2>);
      return;
    }
    if (/^>\s?/.test(text)) {
      blocks.push(<blockquote key={index}>{text.replace(/^>\s?/, "")}</blockquote>);
      return;
    }
    // A short line with no terminal punctuation reads as a sub-heading.
    const looksLikeHeading = text.length <= 68 && !/[।.?!:]$/.test(text) && !text.includes("|");
    if (looksLikeHeading) {
      blocks.push(<h2 key={index}>{text}</h2>);
      return;
    }
    blocks.push(<p key={index}>{text}</p>);
  });
  flushList("end");

  return <div className={cn("prose-ilm", className)}>{blocks}</div>;
}

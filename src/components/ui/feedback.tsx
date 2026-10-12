import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Info, Loader2, Sparkles } from "lucide-react";
import { resolveCitationText, splitCitations, type CitationDetail } from "@/lib/reference-index";
import { T } from "@/components/i18n-text";
import { cn } from "@/lib/utils";
import { CitationChip } from "./citation";
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
  /*
   * ReactNode, not string: a console page renders its heading through the `<T>`
   * localisation bridge, and a prop typed `string` forced those pages to print
   * Bangla chrome in English mode.
   */
  title?: ReactNode;
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
 *
 * Emphasis is the same idea one level down: `**bold**`, `*italic*`, `[label](/href)
 * and `` `code` `` are parsed inside every block, so the writing surface can offer
 * a real toolbar without the draft ever stopping being text. Consecutive `> `
 * lines merge into one quotation, which is what makes a cited ayah — citation,
 * Arabic, translation — read as a single passage rather than three panels.
 *
 * Citations are the exception to "just styling": when a span names a reference the
 * product knows — bold or simply parenthesised in the sentence — it is rendered as
 * the openable reference it is, so the evidence is readable where the argument is
 * made rather than only in a list at the foot of the page.
 */

/*
 * Inline grammar, one pass. Group order matches the alternatives.
 *
 * A citation is the one span that is not merely styled: `**সূরা আল-বাকারা, আয়াত
 * ২৭৫**` and a bare mention like `(সূরা আত-তালাক, ২)` are both recognised as
 * evidence, set apart in the sentence and made openable. Everything else — bold,
 * italic, a link, code — is decoration on words. See `splitCitations` for where
 * the recognition lives; here it only decides what to render.
 */
const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;

/**
 * The meaning of a citation, when the author did not give one.
 *
 * A reader who meets `(সূরা আত-তালাক, ২)` alone is asked to take the argument on
 * trust, but the translation cannot simply be written into someone else's prose
 * either — those words would read as the author's. So the meaning is supplied
 * inline only where it is *missing*, and it is set apart as the reading aid it is:
 * tinted, muted, and labelled. Many bodies already quote the Bangla translation
 * before the reference — and the editor's own inserts always do — so the test is
 * simply whether a quotation sits immediately before the citation.
 */
function citationGloss(detail: CitationDetail, preceding: string): string | null {
  if (!detail.translationBn) return null;
  // A closing quote, optionally followed by the opening parenthesis or the `**`
  // of the citation itself: the author has already said what it means.
  if (/[”"’»]\s*\(?\s*\**\s*$/.test(preceding)) return null;
  return detail.translationBn;
}

/** The gloss, visibly the app's rather than the author's. */
function glossNode(translation: string, key: string) {
  return (
    <span
      key={key}
      className="mx-0.5 rounded-md bg-surface-2 px-1.5 italic text-muted-foreground ring-1 ring-border"
    >
      <span className="me-1 text-[0.6875em] font-semibold uppercase tracking-wide not-italic text-subtle-foreground">
        <T k="citation.glossLabel" />
      </span>
      {translation}
    </span>
  );
}

/**
 * Text that may hold citations, turned into text and openable references.
 *
 * Returns the visible text it emitted, so the next span can tell whether a
 * quotation precedes its citation — a citation runs across several nodes when the
 * author wrote it in bold, so the state cannot live inside one string.
 */
function pushText(nodes: ReactNode[], text: string, key: string, preceding: string): string {
  const spans = splitCitations(text);
  if (spans.length <= 1 && !spans[0]?.detail) {
    nodes.push(text);
    return preceding + text;
  }

  let tail = preceding;
  spans.forEach((span, i) => {
    if (span.detail) {
      const gloss = citationGloss(span.detail, tail);
      if (gloss) nodes.push(glossNode(gloss, `${key}-g${i}`));
      nodes.push(<CitationChip key={`${key}-c${i}`} detail={span.detail} label={span.text} />);
      tail = span.text;
    } else if (span.text) {
      nodes.push(span.text);
      tail += span.text;
    }
  });
  return tail;
}

function renderInline(text: string, key: string): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let index = 0;
  // The visible text so far, so a citation can see whether a quotation precedes it.
  let tail = "";
  INLINE.lastIndex = 0;
  for (let match = INLINE.exec(text); match; match = INLINE.exec(text)) {
    if (match.index > cursor) {
      tail = pushText(nodes, text.slice(cursor, match.index), `${key}-t${index}`, tail);
    }
    const at = `${key}-${index++}`;
    if (match[1] !== undefined) {
      // Internal routes are links, the way every other internal link is.
      nodes.push(
        match[2].startsWith("/") ? (
          <Link key={at} href={match[2]}>
            {match[1]}
          </Link>
        ) : (
          <a key={at} href={match[2]} rel="noreferrer" target="_blank">
            {match[1]}
          </a>
        ),
      );
      tail += match[1];
    } else if (match[3] !== undefined) {
      // A bold span that names a reference is evidence, not emphasis.
      const detail = resolveCitationText(match[3]);
      if (detail) {
        const gloss = citationGloss(detail, tail);
        if (gloss) nodes.push(glossNode(gloss, `${at}-g`));
        nodes.push(<CitationChip key={at} detail={detail} label={match[3]} />);
      } else {
        nodes.push(<strong key={at}>{match[3]}</strong>);
      }
      tail = match[3];
    } else if (match[4] !== undefined) {
      nodes.push(<em key={at}>{match[4]}</em>);
      tail = match[4];
    } else if (match[5] !== undefined) {
      nodes.push(<code key={at}>{match[5]}</code>);
      tail = match[5];
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) pushText(nodes, text.slice(cursor), `${key}-end`, tail);
  return nodes.length === 1 ? nodes[0] : nodes;
}

/**
 * Arabic scripture rather than Bangla prose.
 *
 * A quoted ayah arrives as the Arabic line, which has to be set in the Quranic
 * face, right to left — the same rule the feed applies to its scripture panels.
 * The test is script, not content: a line with Arabic letters and no Bangla is
 * scripture, whatever section it appears in.
 */
function isScripture(text: string) {
  return /[\u0600-\u06FF]/.test(text) && !/[\u0980-\u09FF]/.test(text);
}

/**
 * The lines a block is made of.
 *
 * `toParagraphs` splits on blank lines, so a block can still carry single
 * newlines inside it — and that is exactly how the composer writes a quotation:
 * the citation, the Arabic and the translation as three `> ` lines with no blank
 * line between them. A block that is *entirely* quotations or *entirely* bullets
 * is therefore several lines, and only such a uniform block is split; prose with
 * a soft line break is left whole, the way every other caller expects.
 */
function blockLines(text: string): string[] {
  if (!text.includes("\n")) return [text];
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const uniform =
    lines.length > 1 &&
    (lines.every((line) => /^>\s?/.test(line)) || lines.every((line) => /^[-•*]\s+/.test(line)));
  return uniform ? lines : [text];
}

export function Prose({
  paragraphs,
  className,
}: {
  paragraphs: string[];
  className?: string;
}) {
  const blocks: ReactNode[] = [];
  let listBuffer: string[] = [];
  let quoteBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${key}`}>
        {listBuffer.map((item, i) => (
          <li key={i}>{renderInline(item, `li${key}-${i}`)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  // Consecutive `> ` lines are one quotation: a citation, the Arabic and its
  // translation belong in a single panel, not three stacked ones.
  const flushQuote = (key: string) => {
    if (quoteBuffer.length === 0) return;
    blocks.push(
      <blockquote key={`bq-${key}`}>
        {quoteBuffer.map((line, i) => (
          <span
            key={i}
            lang={isScripture(line) ? "ar" : undefined}
            className={cn("block", isScripture(line) && "arabic")}
          >
            {renderInline(line, `bq${key}-${i}`)}
          </span>
        ))}
      </blockquote>,
    );
    quoteBuffer = [];
  };

  paragraphs.forEach((raw, index) => {
    const text = raw.trim();
    if (!text) return;

    blockLines(text).forEach((line, part) => {
      const key = `${index}.${part}`;

      const isBullet = /^[-•*]\s+/.test(line);
      if (isBullet) {
        flushQuote(key);
        listBuffer.push(line.replace(/^[-•*]\s+/, ""));
        return;
      }

      if (/^>\s?/.test(line)) {
        flushList(key);
        quoteBuffer.push(line.replace(/^>\s?/, ""));
        return;
      }

      flushList(key);
      flushQuote(key);

      if (/^#{2,4}\s/.test(line)) {
        blocks.push(<h2 key={key}>{renderInline(line.replace(/^#{2,4}\s+/, ""), `h${key}`)}</h2>);
        return;
      }
      // A short line with no terminal punctuation reads as a sub-heading.
      const looksLikeHeading = line.length <= 68 && !/[।.?!:]$/.test(line) && !line.includes("|");
      if (looksLikeHeading) {
        blocks.push(<h2 key={key}>{renderInline(line, `h${key}`)}</h2>);
        return;
      }
      // Scripture standing on its own line is set the way a reader expects to
      // find an ayah, without the writer having to mark it up as a quotation.
      if (isScripture(line)) {
        blocks.push(
          <p key={key} lang="ar" className="arabic">
            {renderInline(line, `ar${key}`)}
          </p>,
        );
        return;
      }
      blocks.push(<p key={key}>{renderInline(line, `p${key}`)}</p>);
    });
  });
  flushList("end");
  flushQuote("end");

  return <div className={cn("prose-ilm", className)}>{blocks}</div>;
}

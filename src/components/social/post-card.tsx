"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bookmark,
  Check,
  Eye,
  Heart,
  Link2,
  MessageCircle,
  Quote,
} from "lucide-react";
import { Avatar, Badge, VerifiedMark } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { toBnDigits } from "@/lib/bn";
import { cn, relativeTime, truncate } from "@/lib/utils";
import type { ResolvedPost } from "./resolve";

/**
 * The social feed unit: an author header, the post body, and a reaction bar.
 *
 * Deliberately modelled on the familiar social post — because the product's
 * premise is a *knowledge feed* people return to — while keeping scholarship
 * signals (verified mark, department, evidence count) in the most prominent
 * positions.
 *
 * Density is deliberate too: the header is two lines — who and what kind on the
 * first, the author's department, the age and the evidence count on the second —
 * because a feed that makes the reader scroll three screens to reach the second
 * post is not a feed. The view count closes that second line in a column of its
 * own, so it can be scanned down the feed instead of being found wherever each
 * row's text happened to end.
 *
 * It is a *row*, not a card: no corner radius, no shadow, and no edge of its own.
 * A feed is read in order, and the boundaries the stream draws — a rule down each
 * side of the column plus one between items — are the only separation that
 * ordering needs; stacked cards turn a stream into a pile.
 *
 * The row draws nothing across itself: no rule under the header, none above the
 * reactions. Every line inside a row would be competing with the ones that mark
 * where the row ends, so the row's own edges stay quiet and the stream's rules
 * carry all of the weight.
 */

function fmt(n: number) {
  return toBnDigits(new Intl.NumberFormat("en-IN").format(n));
}

/**
 * Where a row's content column starts: past the avatar, level with the author's
 * name. The title, the body and the actions all line up on it, so the avatar is
 * the only thing to the left of the text and the row reads as one page rather
 * than a stack of left-aligned fragments.
 *
 * Only from `sm` up, though. On a phone that gutter is a fifth of the reading
 * width spent on empty paper — the body pays for it in extra line-wraps — so
 * below the breakpoint the row falls back to its own left edge and uses the full
 * column. The avatar stays in the header either way; it is the body that stops
 * pretending to live underneath it.
 *
 * Row padding (0.875rem, `px-3.5`) + avatar (2.5rem, `size-10`) + gap after it
 * (0.625rem, `gap-2.5`) = 4rem. Keep these three in step: if the avatar or the
 * row padding changes, this does not follow it.
 */
const CONTENT_COLUMN = "pl-3.5 pr-3.5 sm:pl-16";

export function ReactionBar({
  postId,
  stats,
  className,
}: {
  postId: string;
  stats: ResolvedPost["stats"];
  className?: string;
}) {
  const { t } = useI18n();
  // Optimistic local state so the interaction feels immediate; the backend will
  // own these counters.
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${postId}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard can be blocked — the visual state change is still honest */
    }
  };

  const item = (
    active: boolean,
    Icon: typeof Heart,
    label: string,
    count: number,
    onClick?: () => void,
    activeClass = "text-danger",
  ) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      aria-label={label}
      className={cn(
        "group inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.8125rem] font-medium transition-colors",
        active ? activeClass : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
      )}
    >
      <Icon
        className={cn("size-[1.05rem] transition-transform group-active:scale-90", active && "fill-current")}
        strokeWidth={active ? 0 : 2}
        aria-hidden
      />
      <span className="hidden sm:inline">{label}</span>
      {count > 0 ? <span className="tabular">{fmt(count)}</span> : null}
    </button>
  );

  return (
    // No rule above the reactions: inside a divided feed the only full-width
    // line a row should carry is the one that ends it, or the eye cannot tell
    // the row's boundary from a divider it drew itself.
    <div className={cn("flex items-center gap-0.5", className)}>
      {item(liked, Heart, "সহায়ক", stats.likes + (liked ? 1 : 0), () => setLiked((v) => !v))}
      {item(false, MessageCircle, t("label.answers"), stats.comments, undefined, "text-primary")}
      {item(saved, Bookmark, t("action.save"), stats.saves + (saved ? 1 : 0), () => setSaved((v) => !v), "text-primary")}
      {item(copied, copied ? Check : Link2, copied ? t("action.copied") : t("action.share"), 0, onShare, "text-success")}
    </div>
  );
}

export function PostCard({ post, className }: { post: ResolvedPost; className?: string }) {
  const { pick, locale } = useI18n();
  const badge = locale === "bn" ? post.badge.labelBn : post.badge.labelEn;

  return (
    <article
      className={cn(
        "group relative bg-surface transition-colors hover:bg-surface-2/70",
        className,
      )}
    >
      {/* header: author, provenance, and why this is in the feed.

          No rule under it. The stream gives every row a drawn cap and a band of
          page background above that cap; a third line inside the row would be
          competing with the one boundary the reader actually needs to see. The
          masthead separates itself with weight and the avatar instead — a filled
          circle and a bold name against plain body text.

          The row's top padding lives here: rows touch, so the item's own breathing
          room has to be inside it. */}
      <div className="flex items-start gap-2.5 px-3.5 pb-3 pt-3.5">
        {post.author ? (
          <Link href={post.author.href ?? "#"} className="shrink-0">
            <Avatar
              name={post.author.nameBn}
              color={post.author.color}
              size="md"
              verified={post.author.verified}
            />
          </Link>
        ) : (
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
            <Quote className="size-4" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[0.875rem] font-semibold text-foreground">
              {post.author
                ? `${pick({ bn: post.author.honorificBn ?? "", en: post.author.honorificEn ?? "" })} ${post.author.nameBn}`.trim()
                : "ইলম"}
            </span>
            {post.author?.verified ? <VerifiedMark label="যাচাইকৃত" /> : null}
            <Badge tone={post.badge.tone} size="xs">
              {badge}
            </Badge>
          </div>

          {/* The meta row is two parts, not one wrapped line: what the item is
              (author's department, age, evidence count) on the left, and the one
              figure a reader scans down the feed on the right.

              `ml-auto` used to do that inside a single wrapping row, which only
              pinned the eye when the left side happened to fit on one line — and
              it did not for the kinds that carry a department and a reference
              count, so the count drifted onto a second line and out of its column
              while ayah and hadith rows had no count at all. The count now lives
              in its own non-wrapping slot, so its right edge is the content
              column's right edge in every row that has one. */}
          <div className="mt-0.5 flex items-start gap-2 text-[0.75rem] leading-4 text-subtle-foreground">
            <p className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-0.5">
              {post.author?.metaBn ? (
                <>
                  <span className="truncate">{post.author.metaBn}</span>
                  <span aria-hidden>·</span>
                </>
              ) : null}
              <span className="whitespace-nowrap">{relativeTime(post.createdAt, locale)}</span>
              {post.referenceCount ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="whitespace-nowrap font-medium text-primary">
                    {fmt(post.referenceCount)} রেফারেন্স
                  </span>
                </>
              ) : null}
              {/* The recommendation's reason used to sit here, spelled out as
                  "কারণ: …". It was the longest line in the row and it answered a
                  question the reader had not asked — the feed is already the
                  answer to "what should I read". The reason still travels with
                  the item in the data, so a "why this" affordance can bring it
                  back on demand without a schema change. */}
            </p>
            {post.stats.views > 0 ? (
              <span className="inline-flex shrink-0 items-center gap-1 tabular">
                <Eye className="size-3" aria-hidden />
                {fmt(post.stats.views)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* body — indented into the content column, level with the author's name */}
      <div className={cn(CONTENT_COLUMN, "pb-4 pt-1")}>
        <Link href={post.href} className="block">
          <h3 className="font-display text-[1rem] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {post.titleBn}
          </h3>
        </Link>

        {/* Scripture is the visual anchor when present. It is a quotation, not a
            card: a lead rule and a tinted panel keep the row itself the only
            container the reader has to parse. */}
        {post.arabic ? (
          <div className="mt-3 border-l-[3px] border-primary/40 bg-surface-3/70 px-3.5 py-3 parchment">
            <p className="arabic text-right text-[1.3125rem] leading-[2.05] text-foreground">
              {post.arabic}
            </p>
            {post.translationBn ? (
              <p className="mt-2.5 border-t border-border pt-2.5 text-[0.875rem] leading-relaxed text-muted-foreground">
                {post.translationBn}
              </p>
            ) : null}
            {post.refBn ? (
              <p className="mt-2 text-[0.6875rem] font-medium text-primary">{post.refBn}</p>
            ) : null}
          </div>
        ) : null}

        {post.rulingBn ? (
          <div className="mt-2.5 border-l-2 border-primary/50 bg-primary-soft/60 px-3.5 py-3">
            <p className="eyebrow mb-1 text-primary-soft-foreground">ফতোয়ার জবাব</p>
            <p className="text-[0.875rem] font-medium leading-relaxed text-primary-soft-foreground">
              {post.rulingBn}
            </p>
          </div>
        ) : null}

        {post.bodyBn && !post.rulingBn ? (
          <p className="mt-2 text-[0.875rem] leading-relaxed text-muted-foreground">
            {truncate(post.bodyBn, 180)}
          </p>
        ) : null}

        {post.contextBn ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral" size="xs">
              {post.contextBn}
            </Badge>
          </div>
        ) : null}
      </div>

      {/* The actions close the row on the same column as the body, so the item has
          a single left edge under the avatar, and the padding below them is the
          air the item keeps before the rule that ends it. */}
      <div className={cn(CONTENT_COLUMN, "pb-4 pt-2")}>
        <ReactionBar postId={post.href} stats={post.stats} />
      </div>
    </article>
  );
}

/** Skeleton matching the post card's rhythm. */
export function PostCardSkeleton() {
  return (
    // Same frame as the real row: the same top padding, the same avatar, and the
    // body on the same content column, so the stream does not jump when the
    // placeholder is swapped for the post.
    <div className="bg-surface px-3.5 pb-4 pt-3.5">
      <div className="flex items-start gap-2.5">
        <div className="size-10 shrink-0 animate-pulse rounded-full bg-surface-3" />
        <div className="min-w-0 flex-1 space-y-2 pr-3.5">
          <div className="h-3.5 w-1/3 animate-pulse rounded bg-surface-3" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-surface-3" />
        </div>
      </div>
      <div className={cn(CONTENT_COLUMN, "mt-4 space-y-2")}>
        <div className="h-4 w-4/5 animate-pulse rounded bg-surface-3" />
        <div className="h-3.5 w-full animate-pulse rounded bg-surface-3" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-3" />
      </div>
    </div>
  );
}

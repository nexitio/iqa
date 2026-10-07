"use client";

import Link from "next/link";
import {
  ArrowBigUp,
  CheckCircle2,
  Eye,
  Lock,
  MessagesSquare,
  Pin,
  ShieldAlert,
  Sparkles,
  Tag,
} from "lucide-react";
import type { Discussion, DiscussionReply } from "@/lib/types";
import { getUser } from "@/lib/data/personal";
import { getDepartment } from "@/lib/data/departments";
import { useI18n } from "@/lib/i18n";
import { cn, relativeTime, toParagraphs } from "@/lib/utils";
import { formatNumber } from "@/lib/bn";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Prose,
  VerifiedMark,
  asTone,
} from "@/components/ui";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";

/**
 * Community discussion cards.
 *
 * The product promise is that this stays a knowledge forum rather than becoming
 * a generic social network, so moderation state is rendered as a first-class
 * part of the card instead of being hidden in a menu.
 */

/** Moderation banner reused by the discussion cards and the thread page. */
export function ModerationNotice({
  state,
  note,
  className,
}: {
  state: Discussion["moderationState"];
  note?: string;
  className?: string;
}) {
  const { t, isBn } = useI18n();
  if (state === "clean") return null;

  const isLocked = state === "locked";

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border p-3",
        isLocked
          ? "border-border bg-surface-2"
          : "border-warning/35 bg-warning-soft/60",
        className,
      )}
      role="status"
    >
      {isLocked ? (
        <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      ) : (
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning-soft-foreground" aria-hidden />
      )}
      <div className="min-w-0">
        <p
          className={cn(
            "text-[0.75rem] font-semibold",
            isLocked ? "text-foreground" : "text-warning-soft-foreground",
          )}
        >
          {isLocked
            ? t("status.locked")
            : isBn
              ? "মডারেটর পর্যালোচনায়"
              : "Under moderator review"}
        </p>
        {note ? (
          <p className="mt-0.5 text-[0.75rem] leading-relaxed text-muted-foreground">{note}</p>
        ) : null}
      </div>
    </div>
  );
}

function AuthorLine({ authorId, timestamp }: { authorId: string; timestamp: string }) {
  const { locale, isBn } = useI18n();
  const author = getUser(authorId);
  const scholar = author?.scholarId ? SCHOLAR_BY_ID[author.scholarId] : undefined;

  return (
    <span className="flex min-w-0 items-center gap-2 text-[0.75rem] text-muted-foreground">
      <Avatar name={author?.name ?? "?"} color={author?.avatarColor} size="xs" />
      <span className="truncate font-medium">{author?.name ?? (isBn ? "সদস্য" : "Member")}</span>
      {scholar ? <Badge tone="scholar" size="xs">{isBn ? "আলেম" : "Scholar"}</Badge> : null}
      <span aria-hidden>·</span>
      <span className="shrink-0">{relativeTime(timestamp, locale)}</span>
    </span>
  );
}

export function DiscussionCard({
  discussion,
  layout = "grid",
}: {
  discussion: Discussion;
  layout?: "grid" | "list";
}) {
  const { pick, locale, isBn } = useI18n();
  const href = `/discussions/${discussion.slug}`;
  const locked = discussion.moderationState === "locked";

  const tags = (
    <div className="flex flex-wrap items-center gap-1.5">
      {discussion.pinned ? (
        <Badge tone="accent" size="xs" icon={Pin}>
          {isBn ? "পিন করা" : "Pinned"}
        </Badge>
      ) : null}
      {discussion.departmentIds.slice(0, 2).map((slug) => {
        const department = getDepartment(slug);
        if (!department) return null;
        return (
          <Chip
            key={slug}
            href={`/departments/${slug}`}
            tone={asTone(department.tone)}
            className="h-6 px-2 text-[0.6875rem]"
          >
            {pick(department.shortName)}
          </Chip>
        );
      })}
      {discussion.tags.slice(0, layout === "list" ? 1 : 2).map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2 py-0.5 text-[0.6875rem] text-muted-foreground"
        >
          <Tag className="size-2.5" aria-hidden />
          {tag}
        </span>
      ))}
    </div>
  );

  const stats = (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[0.6875rem] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <MessagesSquare className="size-3.5" aria-hidden />
        {formatNumber(discussion.replyCount, locale)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <ArrowBigUp className="size-3.5" aria-hidden />
        {formatNumber(discussion.upvotes, locale)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Eye className="size-3.5" aria-hidden />
        {formatNumber(discussion.viewCount, locale)}
      </span>
    </div>
  );

  if (layout === "list") {
    return (
      <Card interactive className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          {tags}
          <span className="shrink-0 text-[0.6875rem] text-subtle-foreground">
            {relativeTime(discussion.createdAt, locale)}
          </span>
        </div>
        <Link href={href} className="block">
          <h3 className="font-display text-[0.9375rem] font-semibold leading-snug text-foreground transition-colors hover:text-primary">
            {discussion.titleBn}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
            {discussion.bodyBn}
          </p>
        </Link>
        <ModerationNotice state={discussion.moderationState} note={discussion.moderationNoteBn} />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <AuthorLine authorId={discussion.authorId} timestamp={discussion.createdAt} />
          {stats}
        </div>
      </Card>
    );
  }

  return (
    <Card interactive className="flex h-full flex-col gap-3.5">
      {tags}
      <Link href={href} className="block">
        <h3 className="font-display text-[1.0625rem] font-semibold leading-snug text-foreground transition-colors hover:text-primary">
          {discussion.titleBn}
        </h3>
        <p className="mt-2 line-clamp-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {discussion.bodyBn}
        </p>
      </Link>

      <ModerationNotice state={discussion.moderationState} note={discussion.moderationNoteBn} />

      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
        <AuthorLine authorId={discussion.authorId} timestamp={discussion.createdAt} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          {stats}
          {locked ? (
            <span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-subtle-foreground">
              <Lock className="size-3.5" aria-hidden />
              {isBn ? "উত্তর বন্ধ" : "Replies closed"}
            </span>
          ) : (
            <Button href={href} variant="ghost" size="sm" icon={MessagesSquare}>
              {isBn ? "আলোচনায় যান" : "Join"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function DiscussionRow({ discussion }: { discussion: Discussion }) {
  const { locale } = useI18n();
  return (
    <Link
      href={`/discussions/${discussion.slug}`}
      className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-3"
    >
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-surface-3 text-muted-foreground">
        {discussion.moderationState === "locked" ? (
          <Lock className="size-4" aria-hidden />
        ) : (
          <Sparkles className="size-4" aria-hidden />
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.8125rem] font-semibold leading-snug text-foreground group-hover:text-primary">
          {discussion.titleBn}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[0.6875rem] text-subtle-foreground">
          <span>{relativeTime(discussion.createdAt, locale)}</span>
          <span aria-hidden>·</span>
          <span>{discussion.replyCount} replies</span>
        </span>
      </span>
    </Link>
  );
}

/**
 * A single reply. Scholar replies are visually privileged — tinted border,
 * scholar badge — because in this community their voice should be findable at a
 * glance inside a long thread.
 */
export function ReplyCard({
  reply,
  authorName,
  isScholarReply,
  accepted,
  className,
}: {
  reply: DiscussionReply;
  /** Optional override so the caller can supply a resolved display name. */
  authorName?: string;
  isScholarReply?: boolean;
  accepted?: boolean;
  className?: string;
}) {
  const { locale, t, isBn } = useI18n();
  const author = getUser(reply.authorId);
  const scholar = author?.scholarId ? SCHOLAR_BY_ID[author.scholarId] : undefined;
  const isScholar = isScholarReply ?? reply.isScholarReply;
  const isAccepted = accepted ?? reply.accepted;
  const name = authorName ?? author?.name ?? (isBn ? "সদস্য" : "Member");

  return (
    <article
      className={cn(
        "rounded-panel border bg-surface p-4 shadow-card",
        isScholar ? "border-role-scholar/40 bg-role-scholar-soft/25" : "border-border",
        isAccepted && "border-success/45",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar
            name={name}
            color={scholar?.avatarColor ?? author?.avatarColor}
            size="sm"
            verified={scholar?.verified}
          />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-[0.8125rem] font-semibold leading-tight text-foreground">
              {name}
              {scholar?.verified ? <VerifiedMark label={t("label.verified")} /> : null}
            </p>
            <p className="text-[0.6875rem] text-subtle-foreground">
              {scholar ? `${isBn ? "আলেম" : "Scholar"} · ` : ""}
              {relativeTime(reply.createdAt, locale)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isScholar ? (
            <Badge tone="scholar" size="xs">
              {t("label.verifiedScholar")}
            </Badge>
          ) : null}
          {isAccepted ? (
            <Badge tone="success" size="xs" icon={CheckCircle2}>
              {t("qa.acceptedAnswer")}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-3.5">
        <Prose paragraphs={toParagraphs(reply.bodyBn)} className="text-[0.875rem]" />
      </div>

      <div className="mt-3.5 flex items-center gap-4 border-t border-border pt-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowBigUp className="size-4" aria-hidden />
          <span className="tabular">{formatNumber(reply.upvotes, locale)}</span>
        </button>
        <button
          type="button"
          className="text-[0.75rem] font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          {t("action.reply")}
        </button>
      </div>
    </article>
  );
}

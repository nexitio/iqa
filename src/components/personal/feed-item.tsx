"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Info,
  MessageCircleQuestion,
  MessagesSquare,
  Route,
  Scale,
  ScrollText,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatNumber, toBnDigits } from "@/lib/bn";
import { cn, relativeTime } from "@/lib/utils";
import type { FeedItem, FeedKind } from "@/lib/types";
import { getArticle, getFatwa } from "@/lib/data/content";
import { getQuestion } from "@/lib/data/questions";
import { getDiscussion } from "@/lib/data/community";
import { getScholar } from "@/lib/data/scholars";
import { getDepartment } from "@/lib/data/departments";
import { JOURNEYS } from "@/lib/data/personal";
import { Badge, Card, Chip, VerifiedMark, type Tone } from "@/components/ui";
import { DailyAyahCard, DailyHadithCard } from "./daily-cards";
import { JourneyCard } from "./progress-cards";

const KIND_META: Record<FeedKind, { icon: LucideIcon; tone: Tone; bn: string; en: string }> = {
  "daily-ayah": { icon: Sparkles, tone: "primary", bn: "আজকের আয়াত", en: "Ayah of the day" },
  "daily-hadith": { icon: ScrollText, tone: "accent", bn: "আজকের হাদীস", en: "Hadith of the day" },
  answer: { icon: MessageCircleQuestion, tone: "success", bn: "নতুন উত্তর", en: "New answer" },
  article: { icon: FileText, tone: "info", bn: "প্রবন্ধ", en: "Article" },
  fatwa: { icon: Scale, tone: "scholar", bn: "ফতোয়া", en: "Fatwa" },
  discussion: { icon: MessagesSquare, tone: "user", bn: "আলোচনা", en: "Discussion" },
  question: { icon: MessageCircleQuestion, tone: "warning", bn: "প্রশ্ন", en: "Question" },
  journey: { icon: Route, tone: "accent", bn: "শিক্ষা যাত্রা", en: "Journey" },
};

export function FeedKindBadge({ kind, className }: { kind: FeedKind; className?: string }) {
  const { isBn } = useI18n();
  const meta = KIND_META[kind];
  return (
    <Badge tone={meta.tone} size="xs" icon={meta.icon} className={className}>
      {isBn ? meta.bn : meta.en}
    </Badge>
  );
}

/** The quiet "why am I seeing this?" line that keeps the feed honest. */
export function FeedReason({ reasonBn, className }: { reasonBn: string; className?: string }) {
  const { t } = useI18n();
  return (
    <p className={cn("flex items-center gap-1.5 text-[0.6875rem] text-subtle-foreground", className)}>
      <Info className="size-3 shrink-0" aria-hidden />
      <span className="truncate">
        <span className="font-medium">{t("label.whyThis")}:</span> {reasonBn}
      </span>
    </p>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Inline summary cards.
 *
 * The feed intentionally renders its own compact presentation for each target
 * type rather than reusing the full section cards: a feed entry should be
 * scannable, and this keeps the feed independent of the other component
 * groups.
 */
function InlineRow({
  href,
  icon: Icon,
  tone,
  eyebrow,
  title,
  body,
  meta,
  className,
}: {
  href: string;
  icon: LucideIcon;
  tone: Tone;
  eyebrow: string;
  title: string;
  body: string;
  meta?: string;
  className?: string;
}) {
  return (
    <Card interactive className={className} flush>
      <Link href={href} className="flex gap-3.5 p-5">
        <span
          className={cn(
            "mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl",
            tone === "primary" && "bg-primary-soft text-primary",
            tone === "accent" && "bg-accent-soft text-accent-soft-foreground",
            tone === "info" && "bg-info-soft text-info-soft-foreground",
            tone === "success" && "bg-success-soft text-success-soft-foreground",
            tone === "warning" && "bg-warning-soft text-warning-soft-foreground",
            tone === "danger" && "bg-danger-soft text-danger-soft-foreground",
            tone === "scholar" && "bg-role-scholar-soft text-role-scholar",
            tone === "user" && "bg-role-user-soft text-role-user",
            tone === "admin" && "bg-role-admin-soft text-role-admin",
            tone === "neutral" && "bg-surface-3 text-muted-foreground",
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
            {eyebrow}
          </p>
          <h3 className="mt-1 font-display text-[0.9375rem] font-semibold leading-snug text-foreground">
            {title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
            {body}
          </p>
          {meta ? <p className="mt-2 text-[0.6875rem] text-subtle-foreground">{meta}</p> : null}
        </div>
      </Link>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

export function FeedItemCard({ item, className }: { item: FeedItem; className?: string }) {
  const { t, pick, locale } = useI18n();

  const inner = (() => {
    switch (item.kind) {
      case "daily-ayah":
        return <DailyAyahCard ayahRef={item.ayahRef} />;

      case "daily-hadith":
        return <DailyHadithCard hadithId={item.hadithId} />;

      case "journey": {
        const journey = JOURNEYS.find((j) => j.id === item.journeyId);
        if (!journey) return null;
        return <JourneyCard journey={journey} />;
      }

      case "article": {
        const article = item.articleId ? getArticle(item.articleId) : undefined;
        if (!article) return null;
        const author = getScholar(article.authorId);
        const department = getDepartment(article.departmentIds[0]);
        return (
          <InlineRow
            href={`/articles/${article.slug}`}
            icon={FileText}
            tone="info"
            eyebrow={department ? pick(department.name) : t("label.article")}
            title={pick(article.title)}
            body={pick(article.excerpt)}
            meta={`${article.readingMinutes} ${t("label.minutes")} · ${formatNumber(article.viewCount, locale)} ${t("label.views")}${
              author ? ` · ${pick(author.honorific)} ${pick(author.name)}` : ""
            }`}
          />
        );
      }

      case "fatwa": {
        const fatwa = item.fatwaId ? getFatwa(item.fatwaId) : undefined;
        if (!fatwa) return null;
        const mufti = getScholar(fatwa.muftiId);
        return (
          <InlineRow
            href={`/fatwas/${fatwa.slug}`}
            icon={Scale}
            tone="scholar"
            eyebrow={`${t("label.fatwa")} · ${fatwa.fiqh === "hanafi" ? t("fatwa.hanafi") : t("fatwa.comparative")}`}
            title={fatwa.questionBn}
            body={fatwa.rulingBn}
            meta={`${t("label.mufti")}: ${mufti ? `${pick(mufti.honorific)} ${pick(mufti.name)}` : "—"}`}
          />
        );
      }

      case "question": {
        const question = item.questionId ? getQuestion(item.questionId) : undefined;
        if (!question) return null;
        const department = getDepartment(question.departmentIds[0]);
        return (
          <InlineRow
            href={`/questions/${question.slug}`}
            icon={MessageCircleQuestion}
            tone="warning"
            eyebrow={department ? pick(department.name) : t("label.question")}
            title={question.titleBn}
            body={question.bodyBn}
            meta={`${toBnDigits(question.answerCount)} ${t("qa.answerCount")} · ${relativeTime(question.createdAt, locale)}`}
          />
        );
      }

      case "discussion": {
        const discussion = item.discussionId ? getDiscussion(item.discussionId) : undefined;
        if (!discussion) return null;
        return (
          <InlineRow
            href={`/discussions/${discussion.slug}`}
            icon={MessagesSquare}
            tone="user"
            eyebrow={t("label.discussion")}
            title={discussion.titleBn}
            body={discussion.bodyBn}
            meta={`${toBnDigits(discussion.replyCount)} টি উত্তর · ${formatNumber(discussion.upvotes, locale)} ভোট`}
          />
        );
      }

      case "answer": {
        const question = item.questionId ? getQuestion(item.questionId) : undefined;
        const scholar = item.scholarId ? getScholar(item.scholarId) : undefined;
        if (!question || !scholar) return null;
        return (
          <Card interactive className="p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success-soft text-success-soft-foreground">
                <MessageCircleQuestion className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                  {t("label.answer")}
                </p>
                <Link
                  href={`/questions/${question.slug}`}
                  className="mt-1 block font-display text-[0.9375rem] font-semibold leading-snug text-foreground hover:text-primary"
                >
                  {question.titleBn}
                </Link>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="size-3.5" aria-hidden />
                    {pick(scholar.honorific)} {pick(scholar.name)}
                  </span>
                  {scholar.verified ? <VerifiedMark label={t("label.verifiedScholar")} /> : null}
                  <span className="text-border-strong">·</span>
                  <span>{relativeTime(item.createdAt, locale)}</span>
                </p>
              </div>
            </div>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {question.departmentIds.slice(0, 2).map((slug) => {
                const department = getDepartment(slug);
                if (!department) return null;
                return (
                  <Chip key={slug} href={`/departments/${slug}`} tone={department.tone} size="sm">
                    {pick(department.shortName)}
                  </Chip>
                );
              })}
            </div>
          </Card>
        );
      }

      default:
        return null;
    }
  })();

  // An item whose target cannot be resolved degrades to nothing rather than
  // rendering a broken shell.
  if (!inner) return null;

  return (
    <article className={cn("animate-fade-up", className)}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <FeedKindBadge kind={item.kind} />
        <span className="text-[0.6875rem] text-subtle-foreground">
          {relativeTime(item.createdAt, locale)}
        </span>
      </div>
      {inner}
      <FeedReason reasonBn={item.reasonBn} className="mt-2 px-1" />
    </article>
  );
}

export function PersonalizedFeed({
  items,
  className,
}: {
  items: FeedItem[];
  className?: string;
}) {
  const { t } = useI18n();
  if (items.length === 0) {
    return (
      <p className="rounded-panel border border-dashed border-border-strong bg-surface-2/60 p-8 text-center text-[0.875rem] text-muted-foreground">
        {t("state.empty")}
      </p>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          // Stagger the entrance so the feed settles rather than flashing in.
          // Inline style, not a generated class, so the delay is always applied.
          style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
        >
          <FeedItemCard item={item} />
        </div>
      ))}
    </div>
  );
}

/** Icon for a feed kind, exported so pages can decorate section headers. */
export function feedKindIcon(kind: FeedKind): LucideIcon {
  return KIND_META[kind].icon;
}

"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowBigUp,
  CheckCircle2,
  Eye,
  Flag,
  Lock,
  MapPin,
  MessageCircle,
  Scale,
  Share2,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import type { Answer, Question } from "@/lib/types";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";
import { getDepartment } from "@/lib/data/departments";
import { getUser } from "@/lib/data/personal";
import { useI18n } from "@/lib/i18n";
import { cn, relativeTime, toParagraphs } from "@/lib/utils";
import { findDistrict, formatNumber } from "@/lib/bn";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Prose,
  Skeleton,
  StatusBadge,
  VerifiedMark,
  asTone,
} from "@/components/ui";
import { ReferenceList } from "./reference-chip";

/**
 * Question and answer cards.
 *
 * Privacy is load-bearing here: a question asked anonymously must not leak the
 * asker through an avatar, a name or a district, so every identity affordance
 * funnels through `AskerLine` rather than reading `askerId` directly.
 */

/* ------------------------------------------------------------------- asker */

function AskerLine({ question, className }: { question: Question; className?: string }) {
  const { t, locale, isBn } = useI18n();
  const district = findDistrict(question.askerDistrict);

  const districtLabel = (
    <span className="inline-flex items-center gap-1">
      <MapPin className="size-3" aria-hidden />
      {district.name[locale]}
    </span>
  );

  if (question.visibility === "anonymous") {
    return (
      <span className={cn("flex items-center gap-2 text-[0.75rem] text-muted-foreground", className)}>
        <span className="grid size-6 place-items-center rounded-full bg-surface-3 text-subtle-foreground">
          <UserRound className="size-3.5" aria-hidden />
        </span>
        <span className="font-medium">{t("label.anonymous")}</span>
        <span aria-hidden>·</span>
        {districtLabel}
      </span>
    );
  }

  if (question.visibility === "private") {
    return (
      <span className={cn("flex items-center gap-2 text-[0.75rem] text-muted-foreground", className)}>
        <span className="grid size-6 place-items-center rounded-full bg-surface-3 text-subtle-foreground">
          <Lock className="size-3" aria-hidden />
        </span>
        <span className="font-medium">{t("label.private")}</span>
      </span>
    );
  }

  const asker = getUser(question.askerId);
  return (
    <span className={cn("flex items-center gap-2 text-[0.75rem] text-muted-foreground", className)}>
      <Avatar name={asker?.name ?? "?"} color={asker?.avatarColor} size="xs" />
      <span className="font-medium">{asker?.name ?? (isBn ? "সদস্য" : "Member")}</span>
      <span aria-hidden>·</span>
      {districtLabel}
    </span>
  );
}

/** Status + flags row shared by the question card and row. */
function QuestionFlags({ question }: { question: Question }) {
  const { pick, t } = useI18n();
  const statusLabel = {
    open: t("status.open"),
    routed: t("status.routed"),
    answered: t("status.answered"),
    closed: t("status.closed"),
  }[question.status];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge status={question.status} label={statusLabel} size="xs" />
      {question.urgency === "urgent" ? (
        <Badge tone="danger" size="xs" icon={AlertTriangle}>
          {t("label.urgent")}
        </Badge>
      ) : null}
      {question.fatwaRequested ? (
        <Badge tone="accent" size="xs" icon={Scale}>
          {t("label.fatwaRequested")}
        </Badge>
      ) : null}
      {question.departmentIds.slice(0, 2).map((slug) => {
        const department = getDepartment(slug);
        if (!department) return null;
        return (
          <Chip
            key={slug}
            href={`/departments/${slug}`}
            tone={asTone(department.tone)}
            size="sm"
            className="h-6 px-2 text-[0.6875rem]"
          >
            {pick(department.shortName)}
          </Chip>
        );
      })}
    </div>
  );
}

function QuestionStats({ question }: { question: Question }) {
  const { t, locale } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
      <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-medium text-muted-foreground">
        <MessageCircle className="size-3.5" aria-hidden />
        {formatNumber(question.answerCount, locale)} {t("label.answers")}
      </span>
      <span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground">
        <Users className="size-3.5" aria-hidden />
        {formatNumber(question.followerCount, locale)}
      </span>
      <span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground">
        <Eye className="size-3.5" aria-hidden />
        {formatNumber(question.views, locale)}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- the cards */

export function QuestionCard({
  question,
  layout = "grid",
}: {
  question: Question;
  layout?: "grid" | "list";
}) {
  const { locale, t } = useI18n();
  const href = `/questions/${question.slug}`;

  if (layout === "list") {
    return (
      <Card interactive className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <QuestionFlags question={question} />
          <span className="shrink-0 text-[0.6875rem] text-subtle-foreground">
            {relativeTime(question.createdAt, locale)}
          </span>
        </div>
        <Link href={href} className="block">
          <h3 className="font-display text-[0.9375rem] font-semibold leading-snug text-foreground transition-colors hover:text-primary">
            {question.titleBn}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
            {question.bodyBn}
          </p>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <AskerLine question={question} />
          <QuestionStats question={question} />
        </div>
      </Card>
    );
  }

  return (
    <Card interactive className="flex h-full flex-col gap-3.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <QuestionFlags question={question} />
        <span className="shrink-0 text-[0.6875rem] text-subtle-foreground">
          {relativeTime(question.createdAt, locale)}
        </span>
      </div>

      <Link href={href} className="block">
        <h3 className="font-display text-[1.0625rem] font-semibold leading-snug text-foreground transition-colors hover:text-primary">
          {question.titleBn}
        </h3>
        <p className="mt-2 line-clamp-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {question.bodyBn}
        </p>
      </Link>

      <div className="mt-auto flex flex-col gap-3.5 border-t border-border pt-4">
        <AskerLine question={question} />
        <QuestionStats question={question} />
        {question.status === "answered" ? (
          <Button href={href} variant="soft" size="sm" icon={MessageCircle} full>
            {t("action.readMore")}
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-[0.6875rem] text-subtle-foreground">
            <Sparkles className="size-3.5 text-primary" aria-hidden />
            {t("qa.noAnswerYet")}
          </div>
        )}
      </div>
    </Card>
  );
}

export function QuestionRow({ question }: { question: Question }) {
  const { locale } = useI18n();
  return (
    <Link
      href={`/questions/${question.slug}`}
      className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-3"
    >
      <span
        className={cn(
          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
          question.status === "answered"
            ? "bg-success-soft text-success-soft-foreground"
            : "bg-info-soft text-info-soft-foreground",
        )}
      >
        <MessageCircle className="size-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.8125rem] font-semibold leading-snug text-foreground group-hover:text-primary">
          {question.titleBn}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[0.6875rem] text-subtle-foreground">
          <span>{relativeTime(question.createdAt, locale)}</span>
          <span aria-hidden>·</span>
          <span>
            {question.answerCount} {question.answerCount === 1 ? "answer" : "answers"}
          </span>
        </span>
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ answers */

/**
 * A scholar's answer. Renders the byline, the reasoning, the attached evidence
 * and the escalation notice when the answer was later issued as a formal fatwa.
 */
export function AnswerCard({
  answer,
  question,
  accepted,
  scholarId,
  className,
}: {
  answer: Answer;
  /** The parent question, rendered as context above the answer when provided. */
  question?: Question;
  /** Overrides `answer.accepted` when the caller already resolved acceptance. */
  accepted?: boolean;
  /** Overrides the answer's own scholarId (rarely needed). */
  scholarId?: string;
  className?: string;
}) {
  const { pick, locale, t, isBn } = useI18n();
  const scholar = SCHOLAR_BY_ID[scholarId ?? answer.scholarId];
  const isAccepted = accepted ?? answer.accepted;
  const credential = scholar?.credentials[0];

  return (
    <article
      className={cn(
        "overflow-hidden rounded-panel border bg-surface shadow-card",
        isAccepted ? "border-success/45" : "border-border",
        className,
      )}
    >
      {question ? (
        <div className="border-b border-border bg-surface-2 px-4 py-3">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
            {t("label.question")}
          </p>
          <Link
            href={`/questions/${question.slug}`}
            className="mt-1 block font-display text-[0.875rem] font-semibold leading-snug text-foreground transition-colors hover:text-primary"
          >
            {question.titleBn}
          </Link>
        </div>
      ) : null}
      {isAccepted ? (
        <p className="flex items-center gap-2 border-b border-success/30 bg-success-soft px-4 py-2 text-[0.75rem] font-semibold text-success-soft-foreground">
          <CheckCircle2 className="size-4" aria-hidden />
          {t("qa.acceptedAnswer")}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        {scholar ? (
          <Link href={`/scholars/${scholar.slug}`} className="flex min-w-0 items-center gap-3">
            <Avatar
              name={pick(scholar.name)}
              color={scholar.avatarColor}
              size="md"
              verified={scholar.verified}
            />
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-[0.875rem] font-semibold leading-tight text-foreground">
                {pick(scholar.honorific)} {pick(scholar.name)}
                {scholar.verified ? <VerifiedMark label={t("label.verified")} /> : null}
              </span>
              {credential ? (
                <span className="mt-0.5 block truncate text-[0.6875rem] text-subtle-foreground">
                  {pick(credential.title)} · {pick(credential.institution)}
                </span>
              ) : null}
            </span>
          </Link>
        ) : (
          <span className="text-[0.8125rem] text-muted-foreground">{isBn ? "আলেম" : "Scholar"}</span>
        )}

        <span className="shrink-0 text-[0.6875rem] text-subtle-foreground">
          {t("label.answeredOn")} · {relativeTime(answer.createdAt, locale)}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <Prose paragraphs={toParagraphs(answer.bodyBn)} />
      </div>

      {answer.references.length > 0 ? (
        <div className="px-4 pb-4 sm:px-5">
          <ReferenceList references={answer.references} />
        </div>
      ) : null}

      {answer.becameFatwaSlug ? (
        <div className="mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-soft/50 p-3.5 sm:mx-5">
          <p className="flex items-center gap-2 text-[0.8125rem] font-medium text-accent-soft-foreground">
            <Scale className="size-4 shrink-0" aria-hidden />
            {isBn
              ? "এই প্রশ্নটি পরে আনুষ্ঠানিক ফতোয়া হিসেবে প্রকাশিত হয়েছে।"
              : "This question was later issued as a formal fatwa."}
          </p>
          <Button href={`/fatwas/${answer.becameFatwaSlug}`} variant="outline" size="sm">
            {t("label.fatwa")}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-[0.75rem] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <ArrowBigUp className="size-4" aria-hidden />
            <span className="tabular">{formatNumber(answer.upvotes, locale)}</span>
          </button>
          <span className="text-[0.6875rem] text-subtle-foreground">{t("label.helpful")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={Share2}>
            {t("action.share")}
          </Button>
          <Button variant="ghost" size="sm" icon={Flag}>
            {t("action.report")}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function AnswerSkeleton() {
  return (
    <div className="rounded-panel border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-11/12" />
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Invitation to ask.
 *
 * A full-width panel: an icon tile, the promise, the caveat about who answers,
 * and both routes onward. It closes question threads and article pages, and it
 * is also the last card in the home rail — the same invitation everywhere, so a
 * reader learns one shape for it.
 */
export function AskCtaCard({ className }: { className?: string }) {
  const { t, isBn } = useI18n();

  return (
    <Card variant="parchment" className={cn("text-center", className)}>
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
        <MessageCircle className="size-6" aria-hidden />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-foreground">
        {isBn ? "আপনার প্রশ্নটি জিজ্ঞাসা করুন" : "Ask your own question"}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-[0.8125rem] leading-relaxed text-muted-foreground">
        {t("qa.askIntro")}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button href="/questions/ask" icon={MessageCircle}>
          {t("action.askScholar")}
        </Button>
        <Button href="/scholars" variant="outline">
          {t("nav.scholars")}
        </Button>
      </div>
    </Card>
  );
}

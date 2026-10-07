"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookMarked,
  CheckCircle2,
  FileText,
  MessageCircleQuestion,
  Scale,
  Search,
  ThumbsUp,
} from "lucide-react";
import type { Scholar } from "@/lib/types";
import { getArticlesByAuthor, getFatwasByMufti } from "@/lib/data/content";
import { ANSWERS, getQuestion } from "@/lib/data/questions";
import { useI18n } from "@/lib/i18n";
import { cn, relativeTime, toParagraphs } from "@/lib/utils";
import { formatNumber } from "@/lib/bn";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Prose,
  SearchInput,
  StatusBadge,
} from "@/components/ui";
import { ArticleCard, FatwaCard } from "@/components/knowledge";

/**
 * The scholar's written body of work.
 *
 * These two exports are client components because the bio is long-form prose
 * that must follow the Bangla/English choice, and because the answer list needs
 * locale-aware dates and a working in-tab search.
 */

/** Renders the scholar's multi-paragraph biography in the active language. */
export function BioProse({ bio, className }: { bio: Scholar["bio"]; className?: string }) {
  const { pick } = useI18n();
  const paragraphs = useMemo(() => toParagraphs(pick(bio)), [pick, bio]);
  return <Prose paragraphs={paragraphs} className={className} />;
}

export function ProfileSections({
  scholar,
  tab,
}: {
  scholar: Scholar;
  tab: "articles" | "fatwas" | "answers";
}) {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");

  const articles = useMemo(() => getArticlesByAuthor(scholar.id), [scholar.id]);
  const fatwas = useMemo(() => getFatwasByMufti(scholar.id), [scholar.id]);
  const answers = useMemo(
    () =>
      ANSWERS.filter((a) => a.scholarId === scholar.id)
        .map((answer) => ({ answer, question: getQuestion(answer.questionId) }))
        .sort((a, b) => +new Date(b.answer.createdAt) - +new Date(a.answer.createdAt)),
    [scholar.id],
  );

  const q = query.trim().toLowerCase();
  const filteredArticles = q
    ? articles.filter((a) => `${a.title.bn} ${a.title.en}`.toLowerCase().includes(q))
    : articles;
  const filteredFatwas = q
    ? fatwas.filter((f) => `${f.rulingBn} ${f.questionBn}`.toLowerCase().includes(q))
    : fatwas;
  const filteredAnswers = q
    ? answers.filter((row) =>
        `${row.question?.titleBn ?? ""} ${row.answer.bodyBn}`.toLowerCase().includes(q),
      )
    : answers;

  // The in-tab search only earns its space once there is a list worth scanning.
  const needsSearch =
    (tab === "answers" && answers.length > 3) ||
    (tab === "articles" && articles.length > 3) ||
    (tab === "fatwas" && fatwas.length > 3);

  return (
    <div className="space-y-4">
      {needsSearch ? (
        <SearchInput
          icon={Search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="এই আলেমের লেখা খুঁজুন…"
          aria-label={t("action.search")}
          wrapperClassName="sm:max-w-sm"
        />
      ) : null}

      {/* ---------------- articles ---------------- */}
      {tab === "articles" ? (
        filteredArticles.length === 0 ? (
          <EmptyState
            compact
            icon={FileText}
            title={t("state.empty")}
            description="এই আলেমের কোনো প্রকাশিত প্রবন্ধ এখনো যুক্ত হয়নি।"
          />
        ) : (
          <div className="space-y-3">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} layout="list" />
            ))}
          </div>
        )
      ) : null}

      {/* ---------------- fatwas ---------------- */}
      {tab === "fatwas" ? (
        filteredFatwas.length === 0 ? (
          <EmptyState
            compact
            icon={Scale}
            title={t("state.empty")}
            description="এই মুফতির কোনো প্রকাশিত ফতোয়া এখনো যুক্ত হয়নি।"
          />
        ) : (
          <div className="space-y-3">
            {filteredFatwas.map((fatwa) => (
              <FatwaCard key={fatwa.id} fatwa={fatwa} layout="list" />
            ))}
          </div>
        )
      ) : null}

      {/* ---------------- answers ---------------- */}
      {tab === "answers" ? (
        filteredAnswers.length === 0 ? (
          <EmptyState
            compact
            icon={MessageCircleQuestion}
            title={t("state.empty")}
            description="এই আলেমের কোনো উত্তর এখনো যুক্ত হয়নি।"
          />
        ) : (
          <div className="space-y-3">
            {filteredAnswers.map(({ answer, question }) => (
              <Card key={answer.id} interactive padding="sm" className="flex gap-3.5">
                <span
                  className={cn(
                    "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
                    answer.accepted
                      ? "bg-success-soft text-success-soft-foreground"
                      : "bg-primary-soft text-primary",
                  )}
                  aria-hidden
                >
                  <MessageCircleQuestion className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {answer.accepted ? (
                      <Badge tone="success" size="xs" icon={CheckCircle2}>
                        {t("qa.acceptedAnswer")}
                      </Badge>
                    ) : null}
                    {question ? (
                      <StatusBadge
                        status={question.status}
                        label={t(
                          question.status === "answered"
                            ? "status.answered"
                            : question.status === "closed"
                              ? "status.closed"
                              : question.status === "routed"
                                ? "status.routed"
                                : "status.open",
                        )}
                        size="xs"
                      />
                    ) : null}
                    <span className="text-[0.6875rem] text-subtle-foreground">
                      {relativeTime(answer.createdAt, locale)}
                    </span>
                  </div>

                  {question ? (
                    <Link
                      href={`/questions/${question.slug}`}
                      className="mt-1.5 block font-display text-[0.9375rem] font-semibold leading-snug text-foreground transition-colors hover:text-primary"
                    >
                      {question.titleBn}
                    </Link>
                  ) : null}

                  <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
                    {answer.bodyBn}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[0.6875rem] text-subtle-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <ThumbsUp className="size-3.5" aria-hidden />
                      {formatNumber(answer.upvotes, locale)} {t("label.helpful")}
                    </span>
                    {answer.references.length > 0 ? (
                      <span className="inline-flex items-center gap-1.5">
                        <BookMarked className="size-3.5" aria-hidden />
                        {formatNumber(answer.references.length, locale)} {t("label.references")}
                      </span>
                    ) : null}
                    {question ? (
                      <Button
                        href={`/questions/${question.slug}`}
                        variant="link"
                        size="xs"
                        className="ml-auto"
                      >
                        {t("action.readMore")}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

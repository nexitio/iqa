"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Award,
  BadgeCheck,
  BookMarked,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Info,
  Landmark,
  Library,
  MessageCircleQuestion,
  Scale,
  ScrollText,
  Search,
  ThumbsUp,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { Scholar, ScholarBiography } from "@/lib/types";
import { getArticlesByAuthor, getFatwasByMufti } from "@/lib/data/content";
import { ANSWERS, getQuestion } from "@/lib/data/questions";
import { useI18n } from "@/lib/i18n";
import { cn, relativeTime, toParagraphs } from "@/lib/utils";
import { formatNumber, gregorianDateBn } from "@/lib/bn";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Prose,
  SearchInput,
  SectionHeader,
  StatusBadge,
} from "@/components/ui";
import { ArticleCard, FatwaCard } from "@/components/knowledge";

/**
 * The parts of a scholar's profile that are too long for the page shell.
 *
 * Two exports: the full biography (the life story plus the record it rests on)
 * and the tabbed body of work. Both are client components because the archive is
 * bilingual prose that must follow the Bangla/English choice, and because the
 * answer list needs locale-aware dates and a working in-tab search.
 */

/** Renders the scholar's multi-paragraph biography in the active language. */
export function BioProse({ bio, className }: { bio: Scholar["bio"]; className?: string }) {
  const { pick } = useI18n();
  const paragraphs = useMemo(() => toParagraphs(pick(bio)), [pick, bio]);
  return <Prose paragraphs={paragraphs} className={className} />;
}

/* -------------------------------------------------------------------------- */
/* Biography                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * One part of the archive, as a titled panel.
 *
 * The biography is long and factual rather than argumentative, and a reader
 * arrives looking for one thing — who taught him, what he wrote, where he serves
 * now. So the layout is index-like: six small panels, each answering one such
 * question, all reachable without reading the life story first.
 */
function BioBlock({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} icon={Icon} tone="scholar" />
      <div className="mt-4">{children}</div>
    </Card>
  );
}

/** A single named fact inside a `BioBlock`: who, what they did, and the detail. */
function BioEntry({
  title,
  meta,
  note,
}: {
  title: ReactNode;
  meta?: ReactNode;
  note?: ReactNode;
}) {
  return (
    <li className="relative border-l border-border-strong pl-3.5">
      <span
        className="absolute -left-[0.1875rem] top-[0.4rem] size-1.5 rounded-full bg-primary/50"
        aria-hidden
      />
      <p className="text-[0.875rem] font-medium leading-snug text-foreground">{title}</p>
      {meta ? (
        <p className="mt-0.5 text-[0.75rem] leading-relaxed text-subtle-foreground tabular">
          {meta}
        </p>
      ) : null}
      {note ? (
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">{note}</p>
      ) : null}
    </li>
  );
}

/**
 * The full biography: the life story, then the record it rests on.
 *
 * A profile page used to carry two sentences of bio and a degree list — enough to
 * decide whether to follow someone, not enough to know who they are. Everything a
 * reader can actually check lives here: the teachers, the licences they granted,
 * the posts held, the books written, the students taught, the sources drawn on,
 * and the date the whole thing was last verified against them.
 */
export function ScholarBiographySection({ biography }: { biography: ScholarBiography }) {
  const { pick, locale } = useI18n();
  const narrative = useMemo(
    () => toParagraphs(pick(biography.narrative)),
    [pick, biography.narrative],
  );
  // The archive records a check date, not a publish date; a biography that says
  // when it was last checked is a biography a reader can weigh.
  const checked = gregorianDateBn(new Date(biography.updatedAt), locale);

  const counts = [
    { label: "শিক্ষক", value: biography.teachers.length },
    { label: "সনদ", value: biography.ijazah.length },
    { label: "খিদমত", value: biography.service.length },
    { label: "রচনা", value: biography.works.length },
    { label: "ছাত্র", value: biography.students.length },
  ].filter((row) => row.value > 0);

  return (
    <section id="biography" className="scroll-mt-24">
      <SectionHeader
        title="পূর্ণ জীবনী"
        description="জন্ম থেকে বর্তমান দিন পর্যন্ত — শিক্ষা, শিক্ষক, সনদ, খিদমত ও রচনা"
        icon={ScrollText}
        tone="scholar"
        action={
          <span className="hidden items-center gap-1.5 text-[0.75rem] text-subtle-foreground sm:inline-flex">
            হালনাগাদ: {checked}
          </span>
        }
      />

      <div className="space-y-4">
        {/* ---------------- the life story ---------------- */}
        <Card>
          <CardHeader
            title="জীবনকথা"
            subtitle="প্রথম পাঠ, তালিম ও কর্মজীবনের ধারা"
            icon={BookOpen}
            tone="scholar"
          />

          <div className="mt-4">
            <Prose paragraphs={narrative} />
          </div>

          {/* Birth and family are the two facts a biography is expected to open
              with, so they sit together rather than inside the flowing prose. */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-panel bg-surface-2 p-3.5">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                জন্ম
              </p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-foreground/90">
                {pick(biography.born)}
              </p>
            </div>
            <div className="rounded-panel bg-surface-2 p-3.5">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                পরিবার ও শৈশব
              </p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-foreground/90">
                {pick(biography.family)}
              </p>
            </div>
          </div>

          {/* The present tense, called out: what the reader can ask him about. */}
          <div className="mt-4 rounded-panel border border-primary/20 bg-primary-soft/40 p-3.5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-primary">
              বর্তমানে
            </p>
            <p className="mt-1 text-[0.875rem] leading-relaxed text-foreground">
              {pick(biography.now)}
            </p>
          </div>

          {counts.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-4">
              {counts.map((row) => (
                <Badge key={row.label} tone="scholar" size="xs">
                  {row.label} {formatNumber(row.value, locale)}
                </Badge>
              ))}
            </div>
          ) : null}
        </Card>

        {/* ---------------- the record ---------------- */}
        <div className="grid gap-4 lg:grid-cols-2">
          {biography.teachers.length > 0 ? (
            <BioBlock
              icon={GraduationCap}
              title="শিক্ষকমণ্ডলী"
              subtitle="যাঁদের কাছে ইলম নিয়েছেন"
            >
              <ul className="space-y-3.5">
                {biography.teachers.map((teacher) => (
                  <BioEntry
                    key={teacher.id}
                    title={pick(teacher.name)}
                    note={pick(teacher.note)}
                  />
                ))}
              </ul>
            </BioBlock>
          ) : null}

          {biography.ijazah.length > 0 ? (
            <BioBlock
              icon={BadgeCheck}
              title="ইজাযা ও অনুমোদন"
              subtitle="কোন কিতাব পড়ানোর অনুমতি, কার কাছ থেকে"
            >
              <ul className="space-y-3.5">
                {biography.ijazah.map((grant) => (
                  <BioEntry
                    key={grant.id}
                    title={pick(grant.title)}
                    note={pick(grant.grantedBy)}
                  />
                ))}
              </ul>
            </BioBlock>
          ) : null}

          {biography.service.length > 0 ? (
            <BioBlock
              icon={Landmark}
              title="খিদমত ও দায়িত্ব"
              subtitle="শিক্ষাদান, ইফতা ও প্রশাসনের ধারা"
            >
              <ul className="space-y-3.5">
                {biography.service.map((post) => (
                  <BioEntry
                    key={post.id}
                    title={pick(post.title)}
                    meta={[pick(post.place), pick(post.period)].filter(Boolean).join(" · ")}
                    note={post.note ? pick(post.note) : undefined}
                  />
                ))}
              </ul>
            </BioBlock>
          ) : null}

          {biography.works.length > 0 ? (
            <BioBlock
              icon={Library}
              title="রচনা ও প্রকাশনা"
              subtitle="বই, অনুবাদ, সম্পাদনা ও গবেষণা"
            >
              <ul className="space-y-3.5">
                {biography.works.map((work) => (
                  <BioEntry
                    key={work.id}
                    title={pick(work.title)}
                    meta={`${pick(work.kind)} · ${pick(work.year)}`}
                    note={pick(work.note)}
                  />
                ))}
              </ul>
            </BioBlock>
          ) : null}

          {biography.students.length > 0 ? (
            <BioBlock
              icon={UsersRound}
              title="ছাত্রছাত্রী"
              subtitle="যাঁরা এই ধারা এগিয়ে নিচ্ছেন"
            >
              <ul className="space-y-3.5">
                {biography.students.map((student) => (
                  <BioEntry
                    key={student.id}
                    title={pick(student.name)}
                    note={pick(student.note)}
                  />
                ))}
              </ul>
            </BioBlock>
          ) : null}

          {biography.awards.length > 0 ? (
            <BioBlock icon={Award} title="স্বীকৃতি" subtitle="সম্মাননা ও তালিমের স্বীকৃতি">
              <ul className="space-y-3.5">
                {biography.awards.map((award) => (
                  <BioEntry
                    key={award.id}
                    title={pick(award.title)}
                    meta={pick(award.year)}
                    note={award.note ? pick(award.note) : undefined}
                  />
                ))}
              </ul>
            </BioBlock>
          ) : null}
        </div>

        {/* ---------------- provenance ---------------- */}
        <Card variant="flat" padding="sm">
          <div className="flex items-start gap-2.5">
            <Info className="mt-0.5 size-3.5 shrink-0 text-subtle-foreground" aria-hidden />
            <div className="min-w-0">
              <p className="text-[0.75rem] font-semibold text-foreground">তথ্যসূত্র</p>
              <ul className="mt-1.5 space-y-1">
                {biography.sources.map((source) => (
                  <li
                    key={pick(source)}
                    className="text-[0.75rem] leading-relaxed text-muted-foreground"
                  >
                    • {pick(source)}
                  </li>
                ))}
              </ul>
              <p className="mt-2.5 text-[0.6875rem] text-subtle-foreground">
                সর্বশেষ হালনাগাদ: {checked}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Authored work                                                              */
/* -------------------------------------------------------------------------- */

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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowBigUp,
  Clock,
  Compass,
  Eye,
  Lock,
  MessagesSquare,
  ShieldCheck,
  Tag,
  Users,
} from "@/components/icons";
import { T } from "@/components/i18n-text";
import { DiscussionRow, ModerationNotice, ReplyCard } from "@/components/knowledge";
import { ScholarMiniCard } from "@/components/people";
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardHeader,
  Chip,
  Prose,
  SectionHeader,
} from "@/components/ui";
import { DISCUSSIONS, getDiscussion, getRepliesForDiscussion } from "@/lib/data/community";
import { getDepartment } from "@/lib/data/departments";
import { getUser } from "@/lib/data/personal";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";
import { formatNumber } from "@/lib/bn";
import { relativeTime, toParagraphs } from "@/lib/utils";
import { ReplyComposer } from "./reply-composer";

export function generateStaticParams() {
  return DISCUSSIONS.map((discussion) => ({ slug: discussion.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const discussion = getDiscussion(slug);
  if (!discussion) return { title: "আলোচনা পাওয়া যায়নি" };
  return {
    title: discussion.titleBn,
    description: discussion.bodyBn.slice(0, 180),
  };
}

/**
 * Thread detail.
 *
 * Moderation state is surfaced above the body so a reader always knows whether
 * they are looking at settled content, content under review, or a closed thread.
 */
export default async function DiscussionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const discussion = getDiscussion(slug);
  if (!discussion) notFound();

  const replies = getRepliesForDiscussion(discussion.id);
  const sorted = [...replies].sort((a, b) => {
    if (a.accepted !== b.accepted) return a.accepted ? -1 : 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  const locked = discussion.moderationState === "locked";
  const author = getUser(discussion.authorId);

  const departments = discussion.departmentIds
    .map((id) => getDepartment(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const scholarReplies = sorted.filter((reply) => reply.isScholarReply);
  const scholarIds = [...new Set(scholarReplies.map((reply) => getUser(reply.authorId)?.scholarId))]
    .filter((id): id is string => Boolean(id))
    .map((id) => SCHOLAR_BY_ID[id])
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const related = DISCUSSIONS.filter(
    (other) =>
      other.id !== discussion.id &&
      other.departmentIds.some((id) => discussion.departmentIds.includes(id)),
  ).slice(0, 4);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "হোম", href: "/" },
          { label: "আলোচনা", href: "/discussions" },
          { label: discussion.titleBn.slice(0, 28) },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          {/* ------------------------------------------------------- thread */}
          <article className="overflow-hidden rounded-panel border border-border bg-surface shadow-card">
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-2 px-4 py-3 sm:px-5">
              {discussion.pinned ? (
                <Badge tone="accent" size="sm" icon={Tag}>
                  পিন করা
                </Badge>
              ) : null}
              {departments.map((department) => (
                <Chip
                  key={department.slug}
                  href={`/departments/${department.slug}`}
                  tone={department.tone}
                  size="sm"
                >
                  {department.name.bn}
                </Chip>
              ))}
              <span className="ml-auto inline-flex items-center gap-1.5 text-[0.6875rem] text-subtle-foreground">
                <Clock className="size-3.5" aria-hidden />
                {relativeTime(discussion.createdAt, "bn")}
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <h1 className="font-display text-xl font-bold leading-snug text-foreground sm:text-2xl">
                {discussion.titleBn}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.75rem] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" aria-hidden />
                  {author?.name ?? "সদস্য"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessagesSquare className="size-3.5" aria-hidden />
                  {formatNumber(discussion.replyCount, "bn")} উত্তর
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ArrowBigUp className="size-3.5" aria-hidden />
                  {formatNumber(discussion.upvotes, "bn")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-3.5" aria-hidden />
                  {formatNumber(discussion.viewCount, "bn")}
                </span>
              </div>

              {discussion.moderationState !== "clean" ? (
                <ModerationNotice
                  state={discussion.moderationState}
                  note={discussion.moderationNoteBn}
                  className="mt-4"
                />
              ) : null}

              <div className="mt-5 border-t border-border pt-5">
                <Prose paragraphs={toParagraphs(discussion.bodyBn)} />
              </div>

              {discussion.tags.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-1.5 border-t border-border pt-4">
                  {discussion.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-[0.6875rem] text-muted-foreground"
                    >
                      <Tag className="size-2.5" aria-hidden />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </article>

          {/* ------------------------------------------------------ replies */}
          <section>
            <SectionHeader
              icon={MessagesSquare}
              title={`উত্তর (${formatNumber(sorted.length, "bn")})`}
              description={
                scholarReplies.length > 0
                  ? `${formatNumber(scholarReplies.length, "bn")}টি উত্তরে আলেম অংশ নিয়েছেন`
                  : "সদস্যরা আলোচনায় অংশ নিচ্ছেন"
              }
            />

            {sorted.length === 0 ? (
              <Card>
                <p className="text-center text-[0.875rem] text-muted-foreground">
                  এখনো কোনো উত্তর নেই — আপনিই প্রথম উত্তরটি দিন।
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {sorted.map((reply) => (
                  <ReplyCard
                    key={reply.id}
                    reply={reply}
                    authorName={getUser(reply.authorId)?.name}
                  />
                ))}
              </div>
            )}
          </section>

          <ReplyComposer locked={locked} />
        </div>

        {/* ---------------------------------------------------------- rail */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {scholarIds.length > 0 ? (
            <section>
              <SectionHeader size="sm" icon={ShieldCheck} title="উত্তরে অংশ নিয়েছেন" />
              <div className="space-y-2.5">
                {scholarIds.map((scholar) => (
                  <ScholarMiniCard key={scholar.id} scholar={scholar} />
                ))}
              </div>
            </section>
          ) : null}

          <Card>
            <CardHeader icon={ShieldCheck} title="আলোচনার নিয়ম" />
            <ul className="mt-4 space-y-2.5">
              {[
                "আদব রক্ষা করুন — ব্যক্তিগত আক্রমণ নয়।",
                "দলিল দিন — কুরআন বা হাদীসের রেফারেন্স যুক্ত করুন।",
                "অপ্রাসঙ্গিক ও রাজনৈতিক বিতর্ক এখানে নিষিদ্ধ।",
                "জ্ঞানের প্রশ্নে আলেমের মতকে প্রাধান্য দিন।",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <Button href="/discussions" variant="outline" size="sm" full className="mt-4">
              সব আলোচনা
            </Button>
          </Card>

          {locked ? (
            <Card>
              <CardHeader icon={Lock} title="থ্রেড বন্ধ" subtitle="নতুন উত্তর যোগ করা যাবে না" />
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
                {discussion.moderationNoteBn ??
                  "মডারেটররা এই আলোচনাটি বন্ধ করেছেন, কারণ বিষয়টি সম্পূর্ণ আলোচিত হয়েছে।"}
              </p>
            </Card>
          ) : null}

          {related.length > 0 ? (
            <section>
              <SectionHeader size="sm" icon={Compass} title={<T k="label.relatedKnowledge" />} />
              <div className="space-y-1">
                {related.map((other) => (
                  <DiscussionRow key={other.id} discussion={other} />
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

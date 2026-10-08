import type { Metadata } from "next";
import Link from "next/link";
import {
  Bookmark,
  BookOpen,
  FileText,
  HandHeart,
  MessageCircleQuestion,
  MessagesSquare,
  NotebookPen,
  Route,
  Scale,
  ScrollText,
  Sparkles,
} from "@/components/icons";
import {
  BOOKMARKS,
  BOOKMARK_COLLECTIONS,
  CURRENT_USER,
  READING_PROGRESS,
  USER_STREAK_DAYS,
} from "@/lib/data/personal";
import type { BookmarkKind } from "@/lib/types";
import { BookmarkCard, BookmarkCollectionCard, ContinueLearningRail, StreakCard } from "@/components/personal";
import { Num, T } from "@/components/i18n-text";
import {
  Badge,
  Callout,
  Card,
  Chip,
  EmptyState,
  PageHeader,
  Progress,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "আমার লাইব্রেরি",
  description: "সংরক্ষিত আয়াত, হাদীস, প্রবন্ধ, ফতোয়া ও প্রশ্ন — আপনার নিজের ইসলামিক লাইব্রেরি।",
};

const KINDS: { kind: BookmarkKind; labelBn: string; icon: typeof BookOpen }[] = [
  { kind: "ayah", labelBn: "আয়াত", icon: BookOpen },
  { kind: "hadith", labelBn: "হাদীস", icon: ScrollText },
  { kind: "dua", labelBn: "দুআ", icon: HandHeart },
  { kind: "article", labelBn: "প্রবন্ধ", icon: FileText },
  { kind: "fatwa", labelBn: "ফতোয়া", icon: Scale },
  { kind: "answer", labelBn: "উত্তর", icon: MessageCircleQuestion },
  { kind: "question", labelBn: "প্রশ্ন", icon: MessageCircleQuestion },
  { kind: "discussion", labelBn: "আলোচনা", icon: MessagesSquare },
];

/**
 * The personal library.
 *
 * Filtering is driven entirely by search params and rendered as links rather
 * than client state, so a filtered view is shareable, bookmarkable and works
 * before any JavaScript has loaded.
 */
export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; kind?: string }>;
}) {
  const { collection, kind } = await searchParams;

  const activeCollection = BOOKMARK_COLLECTIONS.find((c) => c.id === collection);
  const activeKind = KINDS.find((k) => k.kind === kind);

  const items = BOOKMARKS.filter((bookmark) => {
    if (activeCollection && bookmark.collectionId !== activeCollection.id) return false;
    if (activeKind && bookmark.kind !== activeKind.kind) return false;
    return true;
  }).sort((a, b) => b.savedAt.localeCompare(a.savedAt));

  const counts = KINDS.map((k) => ({
    ...k,
    count: BOOKMARKS.filter((b) => b.kind === k.kind).length,
  })).filter((k) => k.count > 0);

  const inProgress = READING_PROGRESS.filter((p) => p.progress > 0 && p.progress < 100);
  const finished = READING_PROGRESS.filter((p) => p.progress >= 100).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={CURRENT_USER.name}
        title={<T k="library.title" />}
        description={<T k="library.subtitle" />}
        icon={Bookmark}
        patterned
        actions={
          <Badge tone="primary" size="md" icon={Sparkles}>
            <Num value={BOOKMARKS.length} />টি সংরক্ষিত
          </Badge>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="সংরক্ষিত"
            value={<Num value={BOOKMARKS.length} />}
            hint="সব ধরনের আইটেম মিলিয়ে"
            icon={Bookmark}
            tone="primary"
          />
          <StatTile
            label="সংগ্রহ"
            value={<Num value={BOOKMARK_COLLECTIONS.length} />}
            hint="আপনার নিজের সাজানো থিম"
            icon={Sparkles}
            tone="accent"
          />
          <StatTile
            label="পড়া চলছে"
            value={<Num value={inProgress.length} />}
            hint="যেগুলো এখনো শেষ হয়নি"
            icon={Route}
            tone="info"
          />
          <StatTile
            label="সম্পন্ন"
            value={<Num value={finished} />}
            hint="শেষ পর্যন্ত পড়া হয়েছে"
            icon={BookOpen}
            tone="success"
          />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          {/* collections */}
          <section>
            <SectionHeader
              title="সংগ্রহ"
              description="একই বিষয়ের সংরক্ষিত আইটেম একসাথে"
              icon={Sparkles}
              action={
                activeCollection || activeKind ? (
                  <Link
                    href="/library"
                    className="text-[0.8125rem] font-medium text-primary transition-colors hover:text-primary-hover"
                  >
                    সব সংরক্ষিত
                  </Link>
                ) : null
              }
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {BOOKMARK_COLLECTIONS.map((item) => (
                <BookmarkCollectionCard
                  key={item.id}
                  collection={item}
                  className={cn(activeCollection?.id === item.id && "border-primary/45 shadow-raised")}
                />
              ))}
            </div>
          </section>

          {/* kind filter — links, so the filtered view is shareable */}
          <section>
            <SectionHeader
              title="ধরন অনুসারে"
              description={`${counts.length}টি ধরনের কনটেন্ট সংরক্ষিত আছে`}
              icon={Bookmark}
              size="sm"
            />
            <div className="flex flex-wrap gap-2">
              <Chip href="/library" active={!activeKind && !activeCollection} size="sm">
                সব
              </Chip>
              {counts.map((item) => {
                const params = new URLSearchParams();
                if (activeCollection) params.set("collection", activeCollection.id);
                params.set("kind", item.kind);
                return (
                  <Chip
                    key={item.kind}
                    href={`/library?${params.toString()}`}
                    active={activeKind?.kind === item.kind}
                    size="sm"
                    icon={item.icon}
                    count={item.count}
                  >
                    {item.labelBn}
                  </Chip>
                );
              })}
            </div>
          </section>

          {activeCollection ? (
            <Callout tone="accent" title={`সংগ্রহ: ${activeCollection.nameBn}`}>
              এই সংগ্রহে <Num value={activeCollection.count} />টি আইটেম সংরক্ষিত আছে। সংগ্রহের নাম পরিবর্তন বা নতুন
              সংগ্রহ তৈরির সুবিধা ব্যাকএন্ড যুক্ত হওয়ার পর সক্রিয় হবে।
            </Callout>
          ) : null}

          {/* saved items */}
          <section>
            <SectionHeader
              title={activeKind ? `${activeKind.labelBn} — সংরক্ষিত` : "সব সংরক্ষিত"}
              description={
                activeCollection
                  ? `সংগ্রহ "${activeCollection.nameBn}" থেকে ${items.length}টি আইটেম`
                  : `${items.length}টি আইটেম দেখানো হচ্ছে`
              }
              icon={Bookmark}
            />
            {items.length === 0 ? (
              <Card flush>
                <EmptyState
                  icon={Bookmark}
                  title={<T k="library.empty" />}
                  description="কুরআনের কোনো আয়াত, হাদীস, প্রবন্ধ বা ফতোয়ায় সংরক্ষণ চিহ্নে চাপ দিলে সেটি এখানে জমা হবে।"
                  action={
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Link
                        href="/quran"
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-[0.875rem] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
                      >
                        <BookOpen className="size-4" aria-hidden />
                        কুরআন পড়ুন
                      </Link>
                      <Link
                        href="/articles"
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-border-strong bg-surface px-4 text-[0.875rem] font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary"
                      >
                        <FileText className="size-4" aria-hidden />
                        প্রবন্ধ পড়ুন
                      </Link>
                    </div>
                  }
                />
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((bookmark) => (
                  <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
            )}
          </section>

          {/* notes */}
          <section>
            <SectionHeader
              title={<T k="library.notes" />}
              description="সংরক্ষিত আইটেমের সাথে আপনার নিজের নোট"
              icon={NotebookPen}
              size="sm"
            />
            <Card>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-soft-foreground">
                  <NotebookPen className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.875rem] font-semibold text-foreground">
                    নোট লেখার সুবিধা শীঘ্রই আসছে
                  </p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                    তখন প্রতিটি সংরক্ষিত আয়াত বা প্রবন্ধের নিচে নিজের ভাষায় ব্যাখ্যা, প্রশ্ন বা মনে রাখার সূত্র লিখে
                    রাখতে পারবেন। নোট লেখা ও সম্পাদনার জন্য অ্যাকাউন্ট ও ডেটাবেস সংযোগ প্রয়োজন, তাই এই অংশটি এখন
                    প্রস্তুত রাখা হয়েছে।
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-dashed border-border-strong bg-surface-2 p-4">
                <p className="text-[0.75rem] font-medium text-subtle-foreground">নমুনা নোটের জায়গা</p>
                <p className="mt-1.5 text-[0.8125rem] italic leading-relaxed text-muted-foreground">
                  &ldquo;আয়াতুল কুরসি — প্রতিদিন ঘুমের আগে পড়ার অভ্যাস করতে হবে। পরিবারসহ পড়ব।&rdquo;
                </p>
              </div>
            </Card>
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          <StreakCard streakDays={USER_STREAK_DAYS} />

          <Card>
            <SectionHeader
              title={<T k="label.continueLearning" />}
              description="যেখানে থেমেছিলেন, সেখান থেকেই"
              icon={Route}
              size="sm"
            />
            {inProgress.length > 0 ? (
              <ul className="space-y-3.5">
                {inProgress.slice(0, 4).map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="group block">
                      <p className="text-[0.8125rem] font-semibold leading-snug text-foreground group-hover:text-primary">
                        {item.titleBn}
                      </p>
                      <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">{item.resumeLabelBn}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={item.progress} size="xs" />
                        <span className="shrink-0 text-[0.6875rem] font-semibold tabular text-subtle-foreground">
                          <Num value={item.progress} />%
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                এখন কোনো পড়া চলমান নেই। কুরআন বা কোনো প্রবন্ধ শুরু করলে সেটি এখানে দেখা যাবে।
              </p>
            )}
          </Card>
        </aside>
      </div>

      {/* full rail variant, kept below the fold on narrow screens */}
      {READING_PROGRESS.length > 0 ? (
        <section className="lg:hidden">
          <SectionHeader
            title={<T k="label.continueLearning" />}
            icon={Route}
            href="/daily"
            actionLabel="দৈনিক আয়াত"
            size="sm"
            className="mt-2"
          />
          <ContinueLearningRail items={READING_PROGRESS} />
        </section>
      ) : null}
    </div>
  );
}

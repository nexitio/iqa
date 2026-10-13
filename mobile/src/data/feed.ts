import type { Discussion, FeedItem, Localized } from "../lib/types";
import { toBnDigits } from "../lib/bn";
import type { Tone } from "../theme/tone";
import { ARTICLES, DISCUSSIONS, FATWAS, getQuestion } from "./content";
import { getDepartment, TOPICS } from "./departments";
import { getHadith } from "./hadith";
import { CURRENT_USER, getUser, JOURNEYS } from "./personal";
import { getAyah, getSurah } from "./quran";
import { getScholar } from "./scholars";

/**
 * The personalized home feed.
 *
 * Every item carries a Bangla `reasonBn` so the feed can explain itself — the
 * platform should feel like a study companion, not an opaque algorithmic slot
 * machine. This mobile slice references records present in the mobile dataset.
 */
export const FEED: FeedItem[] = [
  { id: "feed-1", kind: "daily-ayah", reasonBn: "আজকের আয়াত — প্রতিদিন সবার জন্য", createdAt: "2026-10-06T05:00:00+06:00", ayahRef: "2:255" },
  { id: "feed-2", kind: "daily-hadith", reasonBn: "আজকের হাদীস — প্রতিদিন সবার জন্য", createdAt: "2026-10-06T05:05:00+06:00", hadithId: "hadith-24" },
  { id: "feed-3", kind: "answer", reasonBn: "আপনি ফিকহ বিভাগ ফলো করেন", createdAt: "2026-10-05T21:40:00+06:00", questionId: "q-1", scholarId: "scholar-1" },
  { id: "feed-4", kind: "article", reasonBn: "আপনি মুফতি সাইফুল ইসলামকে ফলো করেন", createdAt: "2026-10-05T18:10:00+06:00", articleId: "art-1", scholarId: "scholar-3" },
  { id: "feed-5", kind: "discussion", reasonBn: "আপনার সংরক্ষিত বিষয়ের সাথে মিলেছে — সুদ ও অর্থনীতি", createdAt: "2026-10-05T14:40:00+06:00", discussionId: "disc-3" },
  { id: "feed-6", kind: "fatwa", reasonBn: "সাম্প্রতিক ফতোয়া — যাকাত ও অর্থ বিষয়ক", createdAt: "2026-10-05T11:15:00+06:00", fatwaId: "fatwa-1", scholarId: "scholar-3" },
  { id: "feed-7", kind: "answer", reasonBn: "আপনি পরিবার ও বিবাহ বিভাগ ফলো করেন", createdAt: "2026-10-04T19:20:00+06:00", questionId: "q-2", scholarId: "scholar-5" },
  { id: "feed-8", kind: "article", reasonBn: "আপনি আখলাক বিভাগ ফলো করেন", createdAt: "2026-10-04T16:45:00+06:00", articleId: "art-3", scholarId: "scholar-5" },
  { id: "feed-9", kind: "discussion", reasonBn: "আলোচিত বিষয় — মাযহাবগত মতপার্থক্য", createdAt: "2026-10-04T10:15:00+06:00", discussionId: "disc-1" },
  { id: "feed-10", kind: "fatwa", reasonBn: "আপনি পারিবারিক বিষয়ে আগ্রহ দেখিয়েছেন", createdAt: "2026-10-03T17:30:00+06:00", fatwaId: "fatwa-2", scholarId: "scholar-1" },
  { id: "feed-11", kind: "journey", reasonBn: "আপনি ৩০ দিনে কুরআন বোঝা যাত্রায় যুক্ত আছেন", createdAt: "2026-10-05T09:30:00+06:00", journeyId: "journey-2" },
  { id: "feed-12", kind: "daily-ayah", reasonBn: "গতকালের আয়াত — মিস করেছেন?", createdAt: "2026-10-05T05:00:00+06:00", ayahRef: "13:28" },
  { id: "feed-13", kind: "article", reasonBn: "যৌতুক নিয়ে আলোচিত প্রবন্ধ", createdAt: "2026-10-03T09:40:00+06:00", articleId: "art-2", scholarId: "scholar-1" },
  { id: "feed-14", kind: "journey", reasonBn: "আপনার পড়ার ইতিহাস অনুযায়ী প্রস্তাবিত", createdAt: "2026-10-02T20:25:00+06:00", journeyId: "journey-1" },
  { id: "feed-15", kind: "question", reasonBn: "নামাজ ও ইবাদত বিভাগের নতুন প্রশ্ন", createdAt: "2026-10-02T15:50:00+06:00", questionId: "q-3" },
  { id: "feed-16", kind: "discussion", reasonBn: "আপনি তরুণ বিভাগ ফলো করেন", createdAt: "2026-10-02T08:15:00+06:00", discussionId: "disc-2" },
];

/**
 * A feed item flattened into everything a post card needs to render.
 *
 * The feed is polymorphic by design (an article, a fatwa, an ayah, a thread …),
 * so this is the single place that turns any of those into one shape.
 */
export interface ResolvedPost {
  id: string;
  kind: FeedItem["kind"];
  href: string;
  titleBn: string;
  titleEn?: string;
  bodyBn?: string;
  arabic?: string;
  translationBn?: string;
  refBn?: string;
  refEn?: string;
  contextBn?: string;
  contextEn?: string;
  reasonBn: string;
  createdAt: string;
  author?: {
    nameBn: string;
    nameEn: string;
    color: string;
    verified: boolean;
    honorificBn?: string;
    honorificEn?: string;
    metaBn?: string;
    metaEn?: string;
    href?: string;
  };
  stats: { likes: number; comments: number; saves: number; views: number };
  badge: { labelBn: string; labelEn: string; tone: Tone };
  referenceCount?: number;
  rulingBn?: string;
}

const KIND_BADGE: Record<FeedItem["kind"], { labelBn: string; labelEn: string; tone: Tone }> = {
  "daily-ayah": { labelBn: "আজকের আয়াত", labelEn: "Ayah of the day", tone: "primary" },
  "daily-hadith": { labelBn: "আজকের হাদীস", labelEn: "Hadith of the day", tone: "accent" },
  answer: { labelBn: "উত্তর", labelEn: "Answer", tone: "success" },
  article: { labelBn: "প্রবন্ধ", labelEn: "Article", tone: "info" },
  fatwa: { labelBn: "ফতোয়া", labelEn: "Fatwa", tone: "warning" },
  discussion: { labelBn: "আলোচনা", labelEn: "Discussion", tone: "neutral" },
  question: { labelBn: "প্রশ্ন", labelEn: "Question", tone: "user" },
  journey: { labelBn: "শিক্ষা যাত্রা", labelEn: "Journey", tone: "scholar" },
};

function departmentContext(slugs: string[] | undefined): Localized | undefined {
  const first = slugs?.[0];
  if (!first) return undefined;
  return getDepartment(first)?.name ?? TOPICS.find((t) => t.slug === first)?.name;
}

function scholarAuthor(scholarId: string | undefined) {
  const scholar = scholarId ? getScholar(scholarId) : undefined;
  if (!scholar) return undefined;
  const primary = getDepartment(scholar.primaryDepartmentId);
  return {
    nameBn: scholar.name.bn,
    nameEn: scholar.name.en,
    color: scholar.avatarColor,
    verified: scholar.verified,
    honorificBn: scholar.honorific.bn,
    honorificEn: scholar.honorific.en,
    metaBn: primary?.name.bn,
    metaEn: primary?.name.en,
    href: `/scholars/${scholar.slug}`,
  };
}

/** Resolve a feed item, or `null` when its target cannot be found. */
export function resolveFeedPost(item: FeedItem): ResolvedPost | null {
  const base = {
    id: item.id,
    kind: item.kind,
    reasonBn: item.reasonBn,
    createdAt: item.createdAt,
    badge: KIND_BADGE[item.kind],
  };

  switch (item.kind) {
    case "article": {
      const article = ARTICLES.find((a) => a.id === item.articleId);
      if (!article) return null;
      const context = departmentContext(article.departmentIds);
      return {
        ...base,
        href: `/articles/${article.slug}`,
        titleBn: article.title.bn,
        titleEn: article.title.en,
        bodyBn: article.excerpt.bn,
        contextBn: context?.bn,
        contextEn: context?.en,
        author: scholarAuthor(article.authorId),
        stats: { likes: article.likeCount, comments: article.commentCount, saves: article.bookmarkCount, views: article.viewCount },
        referenceCount: article.referenceCount,
      };
    }
    case "fatwa": {
      const fatwa = FATWAS.find((f) => f.id === item.fatwaId);
      if (!fatwa) return null;
      const context = departmentContext(fatwa.departmentIds);
      return {
        ...base,
        href: `/fatwas/${fatwa.slug}`,
        titleBn: fatwa.questionBn,
        rulingBn: fatwa.rulingBn,
        bodyBn: fatwa.questionBn,
        contextBn: context?.bn,
        contextEn: context?.en,
        author: scholarAuthor(fatwa.muftiId),
        stats: { likes: 0, comments: 0, saves: fatwa.bookmarkCount, views: fatwa.viewCount },
        referenceCount: fatwa.referenceCount,
      };
    }
    case "question": {
      const question = getQuestion(item.questionId ?? "");
      if (!question) return null;
      const context = departmentContext(question.departmentIds);
      return {
        ...base,
        href: `/questions/${question.slug}`,
        titleBn: question.titleBn,
        bodyBn: question.bodyBn,
        contextBn: context?.bn,
        contextEn: context?.en,
        stats: { likes: question.followerCount, comments: question.answerCount, saves: 0, views: question.views },
      };
    }
    case "discussion": {
      const discussion = DISCUSSIONS.find((d) => d.id === item.discussionId) as Discussion | undefined;
      if (!discussion) return null;
      const author = getUser(discussion.authorId) ?? CURRENT_USER;
      const context = departmentContext(discussion.departmentIds);
      return {
        ...base,
        href: `/discussions/${discussion.slug}`,
        titleBn: discussion.titleBn,
        bodyBn: discussion.bodyBn,
        contextBn: context?.bn,
        contextEn: context?.en,
        author: {
          nameBn: author.name,
          nameEn: author.name,
          color: author.avatarColor,
          verified: author.isVerified,
        },
        stats: { likes: discussion.upvotes, comments: discussion.replyCount, saves: 0, views: discussion.viewCount },
      };
    }
    case "daily-ayah": {
      const ayah = getAyah(item.ayahRef ?? "");
      if (!ayah) return null;
      const surah = getSurah(ayah.surah);
      return {
        ...base,
        href: `/quran/${ayah.surah}?ayah=${ayah.number}`,
        titleBn: `সূরা ${surah?.name.bn ?? ayah.surah}`,
        titleEn: `Surah ${surah?.name.en ?? ayah.surah}`,
        arabic: ayah.arabic,
        translationBn: ayah.translationBn,
        refBn: `সূরা ${surah?.name.bn ?? ayah.surah} · আয়াত ${toBnDigits(ayah.number)}`,
        refEn: `Surah ${surah?.name.en ?? ayah.surah} · Ayah ${ayah.number}`,
        contextBn: "কুরআন",
        contextEn: "Qur'an",
        stats: { likes: 0, comments: 0, saves: 0, views: 0 },
      };
    }
    case "daily-hadith": {
      const hadith = getHadith(item.hadithId ?? "");
      if (!hadith) return null;
      return {
        ...base,
        href: `/hadith/${hadith.collectionSlug}/${hadith.id}`,
        titleBn: hadith.refBn,
        titleEn: hadith.refEn,
        arabic: hadith.arabic,
        translationBn: hadith.translationBn,
        refBn: hadith.refBn,
        refEn: hadith.refEn,
        bodyBn: hadith.lessonBn,
        stats: { likes: 0, comments: 0, saves: 0, views: 0 },
      };
    }
    case "answer": {
      const question = item.questionId ? getQuestion(item.questionId) : undefined;
      const context = departmentContext(question?.departmentIds);
      return {
        ...base,
        href: question ? `/questions/${question.slug}` : "/questions",
        titleBn: question?.titleBn ?? "একটি প্রশ্নের উত্তর",
        titleEn: question ? undefined : "An answer to a question",
        contextBn: context?.bn,
        contextEn: context?.en,
        author: scholarAuthor(item.scholarId),
        stats: {
          likes: question?.followerCount ?? 0,
          comments: question?.answerCount ?? 0,
          saves: 0,
          views: question?.views ?? 0,
        },
      };
    }
    case "journey": {
      const journey = JOURNEYS.find((j) => j.id === item.journeyId);
      if (!journey) return null;
      return {
        ...base,
        href: `/journey/${journey.slug}`,
        titleBn: journey.titleBn,
        bodyBn: journey.descriptionBn,
        contextBn: journey.categoryBn,
        stats: { likes: journey.enrolled, comments: 0, saves: 0, views: journey.enrolled },
      };
    }
    default:
      return null;
  }
}

/** Resolve a whole feed, dropping anything that no longer exists. */
export function resolveFeedItems(items: FeedItem[]): ResolvedPost[] {
  return items.map(resolveFeedPost).filter((post): post is ResolvedPost => post !== null);
}

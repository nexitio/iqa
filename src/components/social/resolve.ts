import type { Tone } from "@/components/ui/tone";
import { ARTICLES, FATWAS } from "@/lib/data/content";
import { TOPICS, getDepartment } from "@/lib/data/departments";
import { getHadith } from "@/lib/data/hadith";
import { JOURNEYS } from "@/lib/data/personal";
import { getQuestion } from "@/lib/data/questions";
import { getAyah, getSurah } from "@/lib/data/quran";
import { toBnDigits } from "@/lib/bn";
import { SCHOLAR_BY_ID, getScholar } from "@/lib/data/scholars";
import { getUser } from "@/lib/data/personal";
import type { FeedItem } from "@/lib/types";
import type { Discussion } from "@/lib/types";
import { DISCUSSIONS } from "@/lib/data/community";

/**
 * A feed item flattened into everything a post card needs to render.
 *
 * The feed is polymorphic by design (an article, a fatwa, an ayah, a thread …),
 * so this is the single place that turns any of those into one shape. Keeping it
 * here rather than inside the card means the resolution stays server-side and
 * the card only deals with presentation.
 */
export interface ResolvedPost {
  id: string;
  kind: FeedItem["kind"];
  href: string;
  /** Bangla headline of the post. */
  titleBn: string;
  /** Bangla body preview. */
  bodyBn?: string;
  /** Qur'anic / Hadith Arabic, when the post quotes scripture. */
  arabic?: string;
  /** Bangla translation to pair with `arabic`. */
  translationBn?: string;
  /** "সূরা আল-বাকারা, আয়াত ২৭৫" style citation. */
  refBn?: string;
  /** Department or topic context line. */
  contextBn?: string;
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
    href?: string;
  };
  stats: { likes: number; comments: number; saves: number; views: number };
  badge: { labelBn: string; labelEn: string; tone: Tone };
  referenceCount?: number;
  /** Highlighted ruling line for fatwas. */
  rulingBn?: string;
}

const KIND_BADGE: Record<
  FeedItem["kind"],
  { labelBn: string; labelEn: string; tone: Tone }
> = {
  "daily-ayah": { labelBn: "আজকের আয়াত", labelEn: "Ayah of the day", tone: "primary" },
  "daily-hadith": { labelBn: "আজকের হাদীস", labelEn: "Hadith of the day", tone: "accent" },
  answer: { labelBn: "উত্তর", labelEn: "Answer", tone: "success" },
  article: { labelBn: "প্রবন্ধ", labelEn: "Article", tone: "info" },
  fatwa: { labelBn: "ফতোয়া", labelEn: "Fatwa", tone: "warning" },
  discussion: { labelBn: "আলোচনা", labelEn: "Discussion", tone: "neutral" },
  question: { labelBn: "প্রশ্ন", labelEn: "Question", tone: "user" },
  journey: { labelBn: "শিক্ষা যাত্রা", labelEn: "Journey", tone: "scholar" },
};

function departmentContextBn(slugs: string[] | undefined): string | undefined {
  const first = slugs?.[0];
  if (!first) return undefined;
  return getDepartment(first)?.name.bn ?? TOPICS.find((t) => t.slug === first)?.name.bn;
}

function scholarAuthor(scholarId: string | undefined) {
  const scholar = scholarId ? SCHOLAR_BY_ID[scholarId] ?? getScholar(scholarId) : undefined;
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
      return {
        ...base,
        href: `/articles/${article.slug}`,
        titleBn: article.title.bn,
        bodyBn: article.excerpt.bn,
        contextBn: departmentContextBn(article.departmentIds),
        author: scholarAuthor(article.authorId),
        stats: {
          likes: article.likeCount,
          comments: article.commentCount,
          saves: article.bookmarkCount,
          views: article.viewCount,
        },
        referenceCount: article.referenceCount,
      };
    }
    case "fatwa": {
      const fatwa = FATWAS.find((f) => f.id === item.fatwaId);
      if (!fatwa) return null;
      return {
        ...base,
        href: `/fatwas/${fatwa.slug}`,
        titleBn: fatwa.questionBn,
        rulingBn: fatwa.rulingBn,
        bodyBn: fatwa.questionBn,
        contextBn: departmentContextBn(fatwa.departmentIds),
        author: scholarAuthor(fatwa.muftiId),
        stats: {
          likes: 0,
          comments: 0,
          saves: fatwa.bookmarkCount,
          views: fatwa.viewCount,
        },
        referenceCount: fatwa.referenceCount,
      };
    }
    case "question": {
      const question = getQuestion(item.questionId ?? "");
      if (!question) return null;
      return {
        ...base,
        href: `/questions/${question.slug}`,
        titleBn: question.titleBn,
        bodyBn: question.bodyBn,
        contextBn: departmentContextBn(question.departmentIds),
        stats: {
          likes: question.followerCount,
          comments: question.answerCount,
          saves: 0,
          views: question.views,
        },
      };
    }
    case "discussion": {
      const discussion = DISCUSSIONS.find((d) => d.id === item.discussionId) as Discussion | undefined;
      if (!discussion) return null;
      const author = getUser(discussion.authorId);
      return {
        ...base,
        href: `/discussions/${discussion.slug}`,
        titleBn: discussion.titleBn,
        bodyBn: discussion.bodyBn,
        contextBn: departmentContextBn(discussion.departmentIds),
        author: author
          ? {
              nameBn: author.name,
              nameEn: author.name,
              color: author.avatarColor,
              verified: author.isVerified,
            }
          : undefined,
        stats: {
          likes: discussion.upvotes,
          comments: discussion.replyCount,
          saves: 0,
          views: discussion.viewCount,
        },
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
        arabic: ayah.arabic,
        translationBn: ayah.translationBn,
        refBn: `সূরা ${surah?.name.bn ?? ayah.surah} · আয়াত ${toBnDigits(ayah.number)}`,
        contextBn: "কুরআন",
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
        arabic: hadith.arabic,
        translationBn: hadith.translationBn,
        refBn: hadith.refBn,
        bodyBn: hadith.lessonBn,
        stats: { likes: 0, comments: 0, saves: 0, views: 0 },
      };
    }
    case "answer": {
      const question = item.questionId ? getQuestion(item.questionId) : undefined;
      return {
        ...base,
        href: question ? `/questions/${question.slug}` : "/questions",
        titleBn: question?.titleBn ?? "একটি প্রশ্নের উত্তর",
        contextBn: departmentContextBn(question?.departmentIds),
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
        stats: {
          likes: journey.enrolled,
          comments: 0,
          saves: 0,
          views: journey.enrolled,
        },
      };
    }
    default:
      return null;
  }
}

/** Resolve a whole feed, dropping anything that no longer exists. */
export function resolveFeedItems(items: FeedItem[]): ResolvedPost[] {
  return items
    .map(resolveFeedPost)
    .filter((post): post is ResolvedPost => post !== null);
}

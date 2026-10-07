import type { FeedItem } from "@/lib/types";

/**
 * The personalized home feed.
 *
 * Every item carries a Bangla `reasonBn` so the feed can explain itself — the
 * platform should feel like a study companion, not an opaque algorithmic
 * slot machine.
 */

export const FEED: FeedItem[] = [
  {
    id: "feed-1",
    kind: "daily-ayah",
    reasonBn: "আজকের আয়াত — প্রতিদিন সবার জন্য",
    createdAt: "2026-10-06T05:00:00+06:00",
    ayahRef: "2:255",
  },
  {
    id: "feed-2",
    kind: "daily-hadith",
    reasonBn: "আজকের হাদীস — প্রতিদিন সবার জন্য",
    createdAt: "2026-10-06T05:05:00+06:00",
    hadithId: "hadith-24",
  },
  {
    id: "feed-3",
    kind: "answer",
    reasonBn: "আপনি ফিকহ বিভাগ ফলো করেন",
    createdAt: "2026-10-05T21:40:00+06:00",
    questionId: "q-4",
    scholarId: "scholar-1",
  },
  {
    id: "feed-4",
    kind: "article",
    reasonBn: "আপনি মুফতি আব্দুর রহমানকে ফলো করেন",
    createdAt: "2026-10-05T18:10:00+06:00",
    articleId: "art-1",
    scholarId: "scholar-1",
  },
  {
    id: "feed-5",
    kind: "discussion",
    reasonBn: "আপনার সংরক্ষিত বিষয়ের সাথে মিলেছে — সুদ ও অর্থনীতি",
    createdAt: "2026-10-05T14:40:00+06:00",
    discussionId: "disc-3",
  },
  {
    id: "feed-6",
    kind: "fatwa",
    reasonBn: "সাম্প্রতিক ফতোয়া — যাকাত বিষয়ক",
    createdAt: "2026-10-05T11:15:00+06:00",
    fatwaId: "fatwa-2",
    scholarId: "scholar-3",
  },
  {
    id: "feed-7",
    kind: "journey",
    reasonBn: "আপনি ৩০ দিনে কুরআন বোঝা যাত্রায় যুক্ত আছেন",
    createdAt: "2026-10-05T09:30:00+06:00",
    journeyId: "journey-2",
  },
  {
    id: "feed-8",
    kind: "question",
    reasonBn: "পরিবার বিভাগের নতুন প্রশ্ন",
    createdAt: "2026-10-04T22:05:00+06:00",
    questionId: "q-6",
  },
  {
    id: "feed-9",
    kind: "answer",
    reasonBn: "আপনি পরিবার ও বিবাহ বিভাগ ফলো করেন",
    createdAt: "2026-10-04T19:20:00+06:00",
    questionId: "q-8",
    scholarId: "scholar-5",
  },
  {
    id: "feed-10",
    kind: "article",
    reasonBn: "আপনি ইবাদত বিভাগ ফলো করেন",
    createdAt: "2026-10-04T16:45:00+06:00",
    articleId: "art-3",
    scholarId: "scholar-6",
  },
  {
    id: "feed-11",
    kind: "discussion",
    reasonBn: "আলোচিত বিষয় — আপনার এলাকার সাথে সম্পর্কিত",
    createdAt: "2026-10-04T10:15:00+06:00",
    discussionId: "disc-1",
  },
  {
    id: "feed-12",
    kind: "fatwa",
    reasonBn: "আপনি আর্থিক বিষয়ে আগ্রহ দেখিয়েছেন",
    createdAt: "2026-10-03T17:30:00+06:00",
    fatwaId: "fatwa-4",
    scholarId: "scholar-3",
  },
  {
    id: "feed-13",
    kind: "answer",
    reasonBn: "আপনার প্রশ্নের সাথে সম্পর্কিত একটি উত্তর",
    createdAt: "2026-10-03T13:05:00+06:00",
    questionId: "q-2",
    scholarId: "scholar-4",
  },
  {
    id: "feed-14",
    kind: "article",
    reasonBn: "তরুণ বিভাগে নতুন প্রকাশিত",
    createdAt: "2026-10-03T09:40:00+06:00",
    articleId: "art-5",
    scholarId: "scholar-7",
  },
  {
    id: "feed-15",
    kind: "journey",
    reasonBn: "আপনার পড়ার ইতিহাস অনুযায়ী প্রস্তাবিত",
    createdAt: "2026-10-02T20:25:00+06:00",
    journeyId: "journey-1",
  },
  {
    id: "feed-16",
    kind: "question",
    reasonBn: "আপনার জেলার কাছাকাছি থেকে জিজ্ঞাসা",
    createdAt: "2026-10-02T15:50:00+06:00",
    questionId: "q-10",
  },
  {
    id: "feed-17",
    kind: "daily-ayah",
    reasonBn: "গতকালের আয়াত — মিস করেছেন?",
    createdAt: "2026-10-05T05:00:00+06:00",
    ayahRef: "13:28",
  },
  {
    id: "feed-18",
    kind: "discussion",
    reasonBn: "আপনি আখলাক ও আত্মশুদ্ধি বিভাগ ফলো করেন",
    createdAt: "2026-10-02T08:15:00+06:00",
    discussionId: "disc-6",
  },
];

export interface FeedSection {
  id: string;
  titleBn: string;
  titleEn: string;
  kinds: FeedItem["kind"][];
}

export const FEED_SECTIONS: FeedSection[] = [
  {
    id: "knowledge",
    titleBn: "জ্ঞানের জন্য",
    titleEn: "For your knowledge",
    kinds: ["daily-ayah", "daily-hadith", "article"],
  },
  {
    id: "your-departments",
    titleBn: "আপনার বিভাগসমূহ",
    titleEn: "Your departments",
    kinds: ["fatwa", "answer"],
  },
  {
    id: "questions",
    titleBn: "প্রশ্নোত্তর",
    titleEn: "Questions & answers",
    kinds: ["question", "answer"],
  },
  {
    id: "learning",
    titleBn: "শেখার যাত্রা",
    titleEn: "Learning journeys",
    kinds: ["journey", "discussion"],
  },
];

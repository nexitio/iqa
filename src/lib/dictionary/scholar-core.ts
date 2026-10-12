/**
 * Scholar console copy — the console's own pages: its dashboard, the article
 * and fatwa lists, the Q&A queue landing and the composer's page shell.
 *
 * Keys are namespaced `scholar.core.*`. One area's copy lives in one file so
 * that several areas can be translated at once without two writers on the same
 * file. Every entry is `{ bn, en }`: `bn` is the wording the screen already
 * shows, `en` is its English twin. `{name}` placeholders are filled in by
 * `translate()`, and a **number** passed as a var is printed in the reader's own
 * digits (৩ or 3), so counts belong in a var rather than typed into the string.
 */
import type { Dict } from "./types";

export const SCHOLAR_CORE: Dict = {
  /* -------- dashboard -------- */
  "scholar.core.rating": { bn: "রেটিং", en: "Rating" },
  "scholar.core.helpfulVotes": { bn: "সহায়ক ভোট", en: "helpful votes" },
  "scholar.core.answerRate": { bn: "উত্তর দেওয়ার হার", en: "Answer rate" },
  "scholar.core.nowPending": { bn: "এখন অপেক্ষমাণ", en: "Pending now" },
  "scholar.core.pendingHint": {
    bn: "আপনার কাছে রাউট করা মোট {count}টি প্রশ্নের মধ্যে",
    en: "of the {count} questions routed to you",
  },
  "scholar.core.contributions": { bn: "জ্ঞানের অবদান", en: "Knowledge contributions" },
  "scholar.core.contributionsHint": {
    bn: "আপনার প্রোফাইলে প্রকাশিত মোট অবদান — পাঠকরা এটিই দেখেন",
    en: "Your published contributions as a total — this is what readers see on your profile",
  },
  "scholar.core.statAnswers": { bn: "প্রশ্নের উত্তর", en: "Questions answered" },
  "scholar.core.statFatwas": { bn: "প্রকাশিত ফতোয়া", en: "Published fatwas" },
  "scholar.core.statArticles": { bn: "প্রবন্ধ", en: "Articles" },
  "scholar.core.statFollowers": { bn: "অনুসারী", en: "Followers" },
  "scholar.core.hintAllTime": { bn: "সর্বকাল", en: "All time" },
  "scholar.core.hintFormalRulings": { bn: "আনুষ্ঠানিক রায়", en: "Formal rulings" },
  "scholar.core.hintPublishedAndDrafts": {
    bn: "প্রকাশিত ও খসড়া মিলিয়ে",
    en: "Published and drafts together",
  },
  "scholar.core.hintFollowYou": { bn: "আপনার প্রোফাইল ফলো করেন", en: "follow your profile" },
  "scholar.core.pendingInInbox": {
    bn: "প্রশ্ন বাক্সে অপেক্ষমাণ",
    en: "Waiting in your inbox",
  },
  "scholar.core.pendingInInboxHint": {
    bn: "আপনার কাছে সবচেয়ে অগ্রাধিকার নিয়ে আসা প্রশ্নগুলো",
    en: "The questions that reached you with the highest priority",
  },
  "scholar.core.allQuestions": { bn: "সব প্রশ্ন দেখুন", en: "See all questions" },
  "scholar.core.scholarFallback": { bn: "আলেম", en: "Scholar" },
  "scholar.core.allAnswered": {
    bn: "সব প্রশ্নের উত্তর দেওয়া হয়েছে",
    en: "Every question is answered",
  },
  "scholar.core.allAnsweredHint": {
    bn: "এখন অপেক্ষমাণ কোনো প্রশ্ন নেই — নতুন প্রশ্ন এলে এখানে দেখা যাবে।",
    en: "Nothing is waiting now — a new question will appear here.",
  },
  "scholar.core.avgResponseTime": { bn: "সাড়া দেওয়ার গড় সময়", en: "Average response time" },
  "scholar.core.avgResponseHint": {
    bn: "দ্রুত সাড়া দিলে প্রশ্ন রাউটিংয়ে আপনার অগ্রাধিকার বাড়ে — ব্যবহারকারীর অপেক্ষার সময় কমলে প্ল্যাটফর্মের ওপর আস্থাও বাড়ে।",
    en: "Answering quickly raises your priority in question routing — a shorter wait for the reader is also what builds trust in the platform.",
  },
  "scholar.core.streakTitle": { bn: "টানা উত্তর দেওয়ার ধারা", en: "Answering streak" },
  "scholar.core.streakSubtitle": {
    bn: "প্রতিদিন অন্তত একটি প্রশ্নের উত্তর দিন",
    en: "Answer at least one question a day",
  },
  "scholar.core.days": { bn: "দিন", en: "days" },
  "scholar.core.whyRouting": { bn: "কেন রাউটিং গুরুত্বপূর্ণ", en: "Why routing matters" },
  "scholar.core.whyRoutingLead": {
    bn: "কোনো ব্যবহারকারী প্রশ্ন করলে সংশ্লিষ্ট বিভাগের আলেমরা আগে পান। আপনি",
    en: "When a reader asks, that department's scholars see the question first. You are the lead specialist for the",
  },
  "scholar.core.whyRoutingTail": {
    bn: "বিভাগের প্রধান বিশেষজ্ঞ, তাই এই বিষয়ের প্রশ্নগুলো প্রথমে আপনার কাছে আসে।",
    en: "department, so questions on this subject reach you first.",
  },
  "scholar.core.explainRouting": { bn: "রাউটিং ব্যাখ্যা দেখুন", en: "See how routing works" },

  /* -------- question inbox landing -------- */
  "scholar.core.inboxDescription": {
    bn: "ব্যবহারকারীর প্রশ্ন আপনার বিভাগ অনুযায়ী রাউট হয়েছে। প্রতিটি প্রশ্নে দেখা যাবে কেন সেটি আপনার কাছে এসেছে — যাতে রাউটিং বিশ্বাসযোগ্য থাকে।",
    en: "Reader questions are routed to you by department. Each one shows why it reached you, so the routing stays something you can check rather than take on faith.",
  },

  /* -------- articles -------- */
  "scholar.core.articlesDescription": {
    bn: "আপনার লেখা প্রবন্ধের অবস্থা, পাঠকসংখ্যা ও পর্যালোচনার অবস্থা এক জায়গায়। খসড়া থেকে প্রকাশ পর্যন্ত পুরো প্রক্রিয়া এখানে দেখা যাবে।",
    en: "The status, readership and review state of everything you have written, in one place — the whole run from draft to published.",
  },
  "scholar.core.newArticle": { bn: "নতুন প্রবন্ধ লিখুন", en: "Write a new article" },
  "scholar.core.statTotalArticles": { bn: "মোট প্রবন্ধ", en: "Total articles" },
  "scholar.core.hintAllStatuses": { bn: "সব অবস্থা মিলিয়ে", en: "Across all statuses" },
  "scholar.core.hintOpenToReaders": { bn: "পাঠকের জন্য উন্মুক্ত", en: "Open to readers" },
  "scholar.core.hintUnfinished": { bn: "অসম্পূর্ণ লেখা", en: "Unfinished drafts" },
  "scholar.core.statTotalViews": { bn: "মোট পাঠ", en: "Total views" },
  "scholar.core.hintSavedTimes": {
    bn: "{count} বার সংরক্ষিত",
    en: "Saved {count} times",
  },
  "scholar.core.byStatus": { bn: "অবস্থা অনুসারে", en: "By status" },
  "scholar.core.byStatusHint": {
    bn: "প্রবন্ধের প্রকাশনার অবস্থা বেছে নিন",
    en: "Choose a publication status",
  },
  "scholar.core.statusRail": { bn: "অবস্থা", en: "Status" },
  "scholar.core.all": { bn: "সব", en: "All" },
  "scholar.core.noArticlesInStatus": {
    bn: "এই অবস্থায় কোনো প্রবন্ধ নেই",
    en: "No articles with this status",
  },
  "scholar.core.noArticlesHint": {
    bn: "অন্য অবস্থা বেছে নিন, অথবা একটি নতুন প্রবন্ধ লেখা শুরু করুন।",
    en: "Pick another status, or start writing a new article.",
  },
  "scholar.core.sendChanges": { bn: "পরিবর্তন করে পাঠান", en: "Send changes" },
  "scholar.core.referencesCount": { bn: "{count}টি রেফারেন্স", en: "{count} references" },
  "scholar.core.commentsCount": { bn: "{count}টি মন্তব্য", en: "{count} comments" },

  /* -------- fatwas -------- */
  "scholar.core.fatwasDescription": {
    bn: "আপনার দেওয়া আনুষ্ঠানিক ফিকহি রায়। প্রতিটি ফতোয়ায় দলিলের সংখ্যা ও প্রকাশনার অবস্থা স্পষ্ট রাখা হয়েছে, যাতে পাঠক রায়ের ভিত্তি যাচাই করতে পারেন।",
    en: "The formal fiqh rulings you have given. Every fatwa states its evidence count and its publication status plainly, so a reader can check what a ruling rests on.",
  },
  "scholar.core.newFatwa": { bn: "নতুন ফতোয়া লিখুন", en: "Write a new fatwa" },
  "scholar.core.statTotalFatwas": { bn: "মোট ফতোয়া", en: "Total fatwas" },
  "scholar.core.statEvidence": { bn: "সংযুক্ত দলিল", en: "Attached evidence" },
  "scholar.core.hintEvidenceMix": { bn: "আয়াত ও হাদীস মিলিয়ে", en: "Verses and hadith together" },
  "scholar.core.hintPinned": {
    bn: "{count}টি বিশেষভাবে চিহ্নিত",
    en: "{count} pinned",
  },
  "scholar.core.statusTitle": { bn: "অবস্থা", en: "Status" },
  "scholar.core.statusHint": {
    bn: "ফতোয়ার প্রকাশনার অবস্থা",
    en: "The fatwa's publication status",
  },
  "scholar.core.madhabTitle": { bn: "মাযহাবভিত্তিক", en: "By school" },
  "scholar.core.madhabHint": {
    bn: "রায় কোন পদ্ধতিতে দেওয়া হয়েছে",
    en: "Which method the ruling was given in",
  },
  "scholar.core.madhabRail": { bn: "মাযহাব", en: "School" },
  "scholar.core.noFatwas": { bn: "এখনো কোনো ফতোয়া লেখা হয়নি", en: "No fatwa written yet" },
  "scholar.core.noFatwasHint": {
    bn: "আপনার প্রথম আনুষ্ঠানিক রায়টি লিখুন — প্রশ্ন, সংক্ষিপ্ত জবাব এবং দলিলসহ।",
    en: "Write your first formal ruling — the question, a short answer, and the evidence.",
  },
  "scholar.core.noFatwasInFilter": {
    bn: "এই ফিল্টারে কোনো ফতোয়া নেই",
    en: "No fatwas match this filter",
  },
  "scholar.core.noFatwasInFilterHint": {
    bn: "অন্য অবস্থা বা মাযহাব বেছে নিন, অথবা সব ফতোয়া দেখুন।",
    en: "Pick another status or school, or view all fatwas.",
  },
  "scholar.core.seeAllFatwas": { bn: "সব ফতোয়া দেখুন", en: "See all fatwas" },
  "scholar.core.reviewPending": {
    bn: "ফতোয়া প্রকাশের আগে একজন পর্যালোচকের অনুমোদন প্রয়োজন হবে — সেই ওয়ার্কফ্লো ব্যাকএন্ড যুক্ত হলে সক্রিয় হবে। এখন ফতোয়াগুলো শুধু এই প্যানেলে দেখা যাচ্ছে।",
    en: "Publishing a fatwa will need a reviewer's approval — that workflow switches on when the backend lands. For now the fatwas are visible in this console only.",
  },
  "scholar.core.rememberLabel": { bn: "মনে রাখবেন:", en: "Remember:" },
  "scholar.core.rememberBody": {
    bn: "ফতোয়া হলো আনুষ্ঠানিক রায়, আর সাধারণ উত্তর হলো পথনির্দেশ। ব্যক্তিগত ও জটিল বিষয়ে প্রশ্নকারীকে সরাসরি স্থানীয় আলেমের সঙ্গে পরামর্শ করতে বলুন।",
    en: "A fatwa is a formal ruling; an ordinary answer is guidance. On personal or complex matters, tell the asker to consult a local scholar in person.",
  },
};

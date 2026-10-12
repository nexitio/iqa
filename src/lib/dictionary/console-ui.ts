/**
 * Console copy — the shared console components: data tables, dashboard panels,
 * the routing queue, the rich editor and the reference suggester. These render
 * inside both the scholar and the admin console, so their copy lives here
 * rather than in either area's file.
 *
 * Keys are namespaced `console.*`. Every entry is `{ bn, en }`: `bn` is the
 * wording the component already shows, `en` is its English twin. `{name}`
 * placeholders are filled in by `translate()`, and a **number** passed as a var
 * is printed in the reader's own digits (৩ or 3), so counts belong in a var
 * rather than typed into the string.
 *
 * Note: `dictionary.ts` is spread *after* this file, so a key that already
 * exists there wins over one defined here. Nothing below duplicates an existing
 * `console.*` key.
 */
import type { Dict } from "./types";

export const CONSOLE_UI: Dict = {
  /* -------- shared vocabulary -------- */

  // Roles, as they appear in the user table.
  "console.role.admin": { bn: "অ্যাডমিন", en: "Admin" },
  "console.role.scholar": { bn: "আলেম", en: "Scholar" },
  "console.role.user": { bn: "ব্যবহারকারী", en: "User" },
  // Account state. "Active" has no `status.*` key of its own.
  "console.statusActive": { bn: "সক্রিয়", en: "Active" },

  /* -------- scholars queue (data tables) -------- */

  "console.verificationPending": { bn: "যাচাই বাকি", en: "Verification pending" },
  "console.yearsExperience": {
    bn: "{years} বছরের অভিজ্ঞতা",
    en: "{years} years' experience",
  },
  "console.qualifications": { bn: "যোগ্যতা", en: "Qualifications" },
  "console.submittedBy": { bn: "জমা দিয়েছেন {time}", en: "Submitted {time}" },

  /* -------- table headers shared by the queues -------- */

  "console.content": { bn: "কনটেন্ট", en: "Content" },
  "console.author": { bn: "লেখক", en: "Author" },
  "console.words": { bn: "শব্দ", en: "Words" },
  "console.warnings": { bn: "সতর্কতা", en: "Warnings" },
  "console.submitted": { bn: "জমা", en: "Submitted" },
  "console.actions": { bn: "কার্যক্রম", en: "Actions" },
  "console.allClear": { bn: "ঠিক আছে", en: "Looks good" },
  "console.review": { bn: "পর্যালোচনা", en: "Review" },
  "console.contributions": { bn: "অবদান", en: "Contributions" },
  "console.answered": { bn: "উত্তর দেওয়া", en: "Answered" },

  /* -------- reports queue -------- */

  "console.type": { bn: "ধরন", en: "Type" },
  "console.reason": { bn: "কারণ", en: "Reason" },
  "console.reportedBy": { bn: "রিপোর্টকারী", en: "Reported by" },
  "console.time": { bn: "সময়", en: "Time" },
  "console.severity": { bn: "গুরুত্ব", en: "Severity" },
  "console.assignedTo": { bn: "দায়িত্বে", en: "Assigned to" },
  "console.severityHigh": { bn: "উচ্চ", en: "High" },
  "console.severityMedium": { bn: "মধ্যম", en: "Medium" },
  "console.severityLow": { bn: "নিম্ন", en: "Low" },
  "console.comment": { bn: "মন্তব্য", en: "Comment" },
  "console.resolved": { bn: "নিষ্পত্তি", en: "Resolved" },
  "console.dismissed": { bn: "খারিজ", en: "Dismissed" },
  "console.resolve": { bn: "নিষ্পত্তি", en: "Resolve" },
  "console.dismiss": { bn: "খারিজ", en: "Dismiss" },

  /* -------- dashboard panels -------- */

  "console.topDepartments": { bn: "শীর্ষ বিভাগসমূহ", en: "Top departments" },
  "console.byQuestionVolume": { bn: "প্রশ্নের পরিমাণ অনুসারে", en: "By question volume" },
  "console.weeklyNote": {
    bn: "সাপ্তাহিক হিসাব — মোট প্রশ্নের পরিমাণ অনুসারে সাজানো",
    en: "This week — ordered by question volume",
  },
  "console.others": { bn: "অন্যান্য", en: "Others" },
  "console.districtCount": { bn: "{count}টি জেলা", en: "{count} districts" },
  "console.unansweredOver24h": {
    bn: "{count} উত্তরহীন ২৪ ঘন্টার বেশি",
    en: "{count} unanswered over 24h",
  },
  "console.routingNeedsReview": {
    bn: "রাউটিং পুনর্বিবেচনা প্রয়োজন",
    en: "Routing needs review",
  },
  "console.publishedFatwasNote": { bn: "{count} ফতোয়া প্রকাশিত", en: "{count} fatwas published" },
  "console.awaitingModeration": { bn: "মডারেশনের অপেক্ষায়", en: "Awaiting moderation" },
  "console.avgAcrossRouted": {
    bn: "রাউটেড প্রশ্নে গড়",
    en: "Average across routed questions",
  },
  "console.fromUserFeedback": { bn: "ব্যবহারকারীর মতামত অনুসারে", en: "From reader feedback" },
  "console.awaitingPublish": { bn: "প্রকাশের অপেক্ষায়", en: "Awaiting publication" },
  "console.streakNote": { bn: "টানা উত্তর দেওয়ার ধারা", en: "Your run of answering days" },
  "console.weeklyAnswers": { bn: "সাপ্তাহিক উত্তর", en: "Answers this week" },
  "console.weeklyAnswersHelp": {
    bn: "গত ৭ দিনে প্রদত্ত উত্তর",
    en: "Answers given over the last 7 days",
  },
  "console.yourDeptSplit": {
    bn: "আপনার উত্তরসমূহের বিভাগভিত্তিক ভাগ",
    en: "How your answers split across departments",
  },
  "console.routed": { bn: "রাউটেড", en: "Routed" },
  "console.answeredThisWeekNote": {
    bn: "আপনি এই সপ্তাহে {count}টি প্রশ্নের উত্তর দিয়েছেন",
    en: "You answered {count} questions this week",
  },

  /* -------- routing queue -------- */

  "console.priorityRank": { bn: "অগ্রাধিকার {priority}", en: "Priority {priority}" },
  "console.matchPercent": { bn: "মিল {percent}%", en: "{percent}% match" },
  "console.notForMe": { bn: "আমার জন্য নয়", en: "Not for me" },
  "console.noDepartmentsChosen": {
    bn: "কোনো বিভাগ নির্বাচন করা হয়নি",
    en: "No department chosen",
  },
  "console.filter.all": { bn: "সব প্রশ্ন", en: "All questions" },
  "console.filter.urgent": { bn: "জরুরি", en: "Urgent" },
  "console.filter.fatwa": { bn: "ফতোয়া চাওয়া", en: "Fatwa requested" },
  "console.filter.today": { bn: "আজ এসেছে", en: "New today" },
  "console.filter.unanswered": { bn: "উত্তর হয়নি", en: "Unanswered" },

  /* -------- reference suggester -------- */

  "console.matchedTerms": { bn: "মিলে গেছে:", en: "Matched:" },
  "console.startWriting": { bn: "লেখা শুরু করুন", en: "Start writing" },
  "console.startWritingHelp": {
    bn: "আপনি লিখতে শুরু করলে বিষয়ের সাথে মিলে যাওয়া আয়াত ও হাদীস এখানে প্রস্তাব হিসেবে দেখা যাবে।",
    en: "As you write, ayahs and hadith matching your topic appear here as suggestions.",
  },
  "console.noRefsFound": { bn: "কোনো রেফারেন্স মেলেনি", en: "No reference matched" },
  "console.noRefsFoundHelp": {
    bn: "আপনার লেখার বিষয়ে সরাসরি মিলে যাওয়া কোনো আয়াত বা হাদীস পাওয়া যায়নি। বিষয়ভিত্তিক শব্দ যোগ করে দেখুন, যেমন ‘সুদ’, ‘যাকাত’, ‘মা-বাবা’।",
    en: "Nothing in the corpus matches your draft directly. Try adding a topical word, such as “riba”, “zakat” or “parents”.",
  },
  "console.showingMostRelevant": {
    bn: "সবচেয়ে প্রাসঙ্গিক রেফারেন্সগুলো দেখানো হচ্ছে",
    en: "Showing the most relevant references",
  },
  "console.keywordMatches": {
    bn: "{count}টি রেফারেন্স আপনার লেখার সাথে মিলে গেছে",
    en: "{count} references match your draft",
  },
  "console.removeReference": { bn: "{reference} সরান", en: "Remove {reference}" },
  "console.evidenceBalance": { bn: "দলিলের ভারসাম্য", en: "Evidence balance" },
  "console.evidenceCounts": {
    bn: "{attached}টি যুক্ত · {suggested}টি প্রস্তাবিত",
    en: "{attached} attached · {suggested} suggested",
  },
  "console.good": { bn: "ভালো", en: "Good" },
  "console.addMoreEvidence": { bn: "আরও দলিল দিন", en: "Add more evidence" },

  /* -------- rich editor -------- */

  // The word the toolbar writes when nothing is selected.
  "console.editorBoldDefault": { bn: "গুরুত্বপূর্ণ", en: "important" },
  "console.editorItalicDefault": { bn: "প্রবল", en: "emphasis" },
};

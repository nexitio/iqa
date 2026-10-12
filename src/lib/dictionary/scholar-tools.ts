/**
 * Scholar console copy — the working tools: the question inbox, the write
 * composer with its reference suggester, availability, and the profile editor.
 *
 * Keys are namespaced `scholar.tools.*`. One area's copy lives in one file so
 * that several areas can be translated at once without two writers on the same
 * file. Every entry is `{ bn, en }`: `bn` is the wording the screen already
 * shows, `en` is its English twin. `{name}` placeholders are filled in by
 * `translate()`, and a **number** passed as a var is printed in the reader's own
 * digits (৩ or 3), so counts belong in a var rather than typed into the string.
 */
import type { Dict } from "./types";

export const SCHOLAR_TOOLS: Dict = {
  /* ---------------------------------------------------- priority inbox */

  "scholar.tools.inbox.subtitle": {
    bn: "আপনার কাছে রাউট করা প্রশ্ন, অগ্রাধিকার অনুসারে সাজানো",
    en: "Questions routed to you, ordered by priority",
  },
  "scholar.tools.inbox.count": { bn: "{count}টি", en: "{count}" },
  "scholar.tools.inbox.emptyTitle": {
    bn: "এই ফিল্টারে কোনো প্রশ্ন নেই",
    en: "No questions match this filter",
  },
  "scholar.tools.inbox.emptyDescription": {
    bn: "অন্য ফিল্টার বেছে নিন, অথবা সব প্রশ্ন দেখুন।",
    en: "Pick another filter, or look at every question.",
  },
  "scholar.tools.inbox.unansweredHint": {
    bn: "{count}টি এখনো উত্তরহীন",
    en: "{count} still unanswered",
  },
  "scholar.tools.inbox.urgentLabel": { bn: "জরুরি প্রশ্ন", en: "Urgent questions" },
  "scholar.tools.inbox.urgentHint": { bn: "দ্রুত সাড়া প্রয়োজন", en: "Needs a fast reply" },
  "scholar.tools.inbox.fatwaLabel": {
    bn: "ফতোয়া চাওয়া হয়েছে",
    en: "Fatwa requested",
  },
  "scholar.tools.inbox.fatwaHint": {
    bn: "আনুষ্ঠানিক রায় প্রয়োজন",
    en: "Needs a formal ruling",
  },
  "scholar.tools.inbox.departmentsSubtitle": {
    bn: "যে বিভাগের প্রশ্ন প্রথমে আপনার কাছে আসে",
    en: "Departments whose questions reach you first",
  },
  "scholar.tools.inbox.answerRate": { bn: "উত্তর দেওয়ার হার", en: "Answer rate" },
  "scholar.tools.inbox.answerRateHint": {
    bn: "আপনার কাছে আসা প্রশ্নের মধ্যে এতগুলোতে উত্তর দেওয়া হয়েছে।",
    en: "That share of the questions routed to you has been answered.",
  },
  "scholar.tools.inbox.howRoutingTitle": {
    bn: "রাউটিং কীভাবে কাজ করে",
    en: "How routing works",
  },
  "scholar.tools.inbox.routingSteps": {
    bn: [
      "ব্যবহারকারী প্রশ্ন করার সময় এক বা একাধিক বিভাগ বেছে নেন।",
      "প্ল্যাটফর্ম সেই বিভাগের আলেমদের দক্ষতা, প্রশ্নের চাপ ও সাড়া দেওয়ার গতি মিলিয়ে স্কোর করে।",
      "সবচেয়ে বেশি স্কোর পাওয়া আলেম প্রথমে প্রশ্নটি পান — বাকিরা তালিকায় পরের অবস্থানে থাকেন।",
      "কেউ উত্তর না দিলে প্রশ্নটি পরের আলেমের কাছে চলে যায়, ফলে কোনো প্রশ্ন অনাদর থাকে না।",
    ],
    en: [
      "The asker picks one or more departments along with the question.",
      "The platform scores scholars in those departments by expertise, workload and how quickly they reply.",
      "The highest-scoring scholar receives the question first; the rest follow in order.",
      "If nobody answers, the question moves on to the next scholar, so none is left ignored.",
    ],
  },

  /* --------------------------------------------------------- author profile */

  "scholar.tools.profile.notFound": {
    bn: "আলেমের তথ্য পাওয়া যায়নি।",
    en: "This scholar's details could not be found.",
  },
  "scholar.tools.profile.description": {
    bn: "পাঠকরা আপনার প্রোফাইলে ঠিক যা দেখেন, তা এখানে হুবহু দেখানো হচ্ছে। নিচের সম্পাদনা প্যানেল থেকে পরিচয়, বিশেষজ্ঞতা ও ভাষা হালনাগাদ করতে পারেন।",
    en: "This is exactly what readers see on your profile. The editing panel below updates your introduction, specialisations and languages.",
  },
  "scholar.tools.profile.viewLive": {
    bn: "লাইভ প্রোফাইল দেখুন",
    en: "View live profile",
  },
  "scholar.tools.profile.unverifiedLead": {
    bn: "আপনার প্রোফাইল এখনো যাচাই হয়নি।",
    en: "Your profile is not verified yet.",
  },
  "scholar.tools.profile.unverifiedBody": {
    bn: "যাচাই ছাড়া প্রোফাইলে যাচাইকৃত চিহ্ন দেখানো হয় না এবং প্রশ্ন রাউটিংয়ে অগ্রাধিকার কম থাকে। অ্যাডমিন আপনার যোগ্যতা যাচাই করলে এটি স্বয়ংক্রিয়ভাবে হালনাগাদ হবে।",
    en: "Until it is verified the profile carries no verified mark and questions are routed to you with lower priority. This updates on its own once an admin checks your credentials.",
  },
  "scholar.tools.profile.asReadersSee": {
    bn: "পাঠকরা যেভাবে দেখেন",
    en: "How readers see it",
  },
  "scholar.tools.profile.bioTitle": { bn: "পরিচিতি", en: "Introduction" },
  "scholar.tools.profile.credentialsTitle": {
    bn: "শিক্ষাগত যোগ্যতা",
    en: "Educational credentials",
  },
  "scholar.tools.profile.credentialsDescription": {
    bn: "এই তথ্য যাচাইকৃত — পরিবর্তনের জন্য অ্যাডমিনের অনুমোদন প্রয়োজন",
    en: "This is verified information — changes need an admin's approval",
  },
  "scholar.tools.profile.factsTitle": { bn: "প্রোফাইলের তথ্য", en: "Profile details" },
  "scholar.tools.profile.joined": { bn: "যোগদান", en: "Joined" },
  "scholar.tools.profile.rating": { bn: "রেটিং", en: "Rating" },
  "scholar.tools.profile.ratingValue": { bn: "{rating} / ৫", en: "{rating} / 5" },
  "scholar.tools.profile.verification": { bn: "যাচাই", en: "Verification" },
  "scholar.tools.profile.responseTime": { bn: "সাড়া দেওয়ার সময়", en: "Response time" },
  "scholar.tools.profile.unverified": { bn: "যাচাই বাকি", en: "Not verified" },
  "scholar.tools.profile.specializationTitle": {
    bn: "বিশেষজ্ঞতা",
    en: "Specialisations",
  },
  "scholar.tools.profile.departmentsSubtitle": {
    bn: "রাউটিং এই বিভাগগুলোর ওপর নির্ভর করে",
    en: "Routing depends on these departments",
  },
  "scholar.tools.profile.primaryDepartment": {
    bn: "প্রধান বিভাগ:",
    en: "Primary department:",
  },

  /* ------------------------------------------------------- profile editor */

  "scholar.tools.profile.editTitle": {
    bn: "প্রোফাইল সম্পাদনা",
    en: "Edit profile",
  },
  "scholar.tools.profile.editSubtitle": {
    bn: "পাঠকরা যা দেখবেন তা এখান থেকে হালনাগাদ করুন",
    en: "Update what readers see from here",
  },
  "scholar.tools.profile.savedNotice": {
    bn: "পরিবর্তনগুলো সংরক্ষিত হয়েছে (ব্রাউজারে) — ব্যাকএন্ড যুক্ত হলে সার্ভারে যাবে।",
    en: "Changes saved in the browser — once the backend is live they will go to the server.",
  },
  "scholar.tools.profile.shortBioLabel": { bn: "সংক্ষিপ্ত পরিচয়", en: "Short introduction" },
  "scholar.tools.profile.shortBioHint": {
    bn: "এক লাইনে আপনার পরিচয় — প্রোফাইল কার্ডে এটিই দেখানো হয়।",
    en: "Your introduction in one line — this is what a profile card shows.",
  },
  "scholar.tools.profile.specializationDescription": {
    bn: "যে বিষয়ে আপনি নির্ভরযোগ্যভাবে উত্তর দিতে পারেন",
    en: "Subjects you can answer reliably",
  },
  "scholar.tools.profile.newSpecializationLabel": {
    bn: "নতুন বিশেষজ্ঞতা",
    en: "New specialisation",
  },
  "scholar.tools.profile.newSpecializationPlaceholder": {
    bn: "যেমন: উত্তরাধিকার ও ফারায়েজ",
    en: "e.g. Inheritance and Faraid",
  },
  "scholar.tools.profile.languagesDescription": {
    bn: "যে ভাষায় আপনি উত্তর দিতে স্বচ্ছন্দ",
    en: "Languages you are comfortable answering in",
  },
  "scholar.tools.profile.newLanguageLabel": { bn: "নতুন ভাষা", en: "New language" },
  "scholar.tools.profile.newLanguagePlaceholder": {
    bn: "যেমন: ফারসি",
    en: "e.g. Persian",
  },
  "scholar.tools.profile.fiqhTitle": { bn: "ফিকহি পদ্ধতি", en: "Fiqh approach" },
  "scholar.tools.profile.availabilityDescription": {
    bn: "বন্ধ রাখলে নতুন প্রশ্ন আপনার কাছে রাউট হবে না, তবে বিদ্যমান প্রশ্ন দেখা যাবে।",
    en: "Switched off, new questions stop being routed to you, but the existing ones stay visible.",
  },
  "scholar.tools.profile.availabilityOn": {
    bn: "এখন নতুন প্রশ্ন গ্রহণ করছেন।",
    en: "You are accepting new questions.",
  },
  "scholar.tools.profile.availabilityOff": {
    bn: "প্রশ্ন গ্রহণ বন্ধ করা হয়েছে — বিদ্যমান প্রশ্ন আগের মতোই থাকবে।",
    en: "Question intake is off — the existing questions are unchanged.",
  },
  "scholar.tools.profile.adminApprovalNote": {
    bn: "নাম, মাদরাসা ও শিক্ষাগত যোগ্যতা পরিবর্তন করতে অ্যাডমিনের অনুমোদন প্রয়োজন, কারণ সেগুলো যাচাইকৃত তথ্য। বিভাগ পরিবর্তনের আবেদনও অ্যাডমিন প্যানেল থেকে নিশ্চিত করা হয়।",
    en: "Changing your name, madrasah or credentials needs an admin's approval, because that information is verified. Department changes are confirmed from the admin console too.",
  },

  /* ------------------------------------------------------------ composer */

  "scholar.tools.composer.writingAs": {
    bn: "{name} হিসেবে লিখছেন",
    en: "Writing as {name}",
  },
  "scholar.tools.composer.saving": { bn: "সংরক্ষণ হচ্ছে…", en: "Saving…" },
  "scholar.tools.composer.autosaveHint": {
    bn: "স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে",
    en: "Saves automatically",
  },
  "scholar.tools.composer.wordCount": { bn: "{count} শব্দ", en: "{count} words" },
  "scholar.tools.composer.attachNotice": {
    bn: "“{ref}” খসড়ায় যুক্ত করা হয়েছে।",
    en: "“{ref}” added to the draft.",
  },
  "scholar.tools.composer.removedNotice": {
    bn: "রেফারেন্সটি সরানো হয়েছে।",
    en: "Reference removed.",
  },
  "scholar.tools.composer.draftSavedNotice": {
    bn: "খসড়া সংরক্ষিত হয়েছে (ব্রাউজারে)।",
    en: "Draft saved in the browser.",
  },
  "scholar.tools.composer.reviewSentNotice": {
    bn: "পর্যালোচনার জন্য পাঠানো হয়েছে — পর্যালোচক দেখবেন।",
    en: "Sent for review — a reviewer will take it from here.",
  },
  "scholar.tools.composer.publishNotice": {
    bn: "প্রকাশের জন্য প্রস্তুত — ব্যাকএন্ড যুক্ত হলে এখান থেকেই প্রকাশ হবে।",
    en: "Ready to publish — once the backend is live this is where it goes out.",
  },
  "scholar.tools.composer.articleTypeDescription": {
    bn: "বিস্তারিত জ্ঞানভিত্তিক লেখা",
    en: "A detailed knowledge piece",
  },
  "scholar.tools.composer.fatwaTypeDescription": {
    bn: "দলিলসহ আনুষ্ঠানিক রায়",
    en: "A formal ruling with evidence",
  },
  "scholar.tools.composer.answerTypeDescription": {
    bn: "ব্যবহারকারীর প্রশ্নের উত্তর",
    en: "An answer to a reader's question",
  },
  "scholar.tools.composer.questionField": {
    bn: "প্রশ্নকারীর প্রশ্ন",
    en: "The asker's question",
  },
  "scholar.tools.composer.questionHint": {
    bn: "ব্যবহারকারী ঠিক যা লিখেছেন তা লিখুন — রায়ের প্রেক্ষাপট স্পষ্ট থাকবে।",
    en: "Reproduce what the asker wrote — it keeps the context of the ruling clear.",
  },
  "scholar.tools.composer.questionPlaceholder": {
    bn: "যেমন: ব্যাংকের সুদ থেকে পাওয়া টাকা দিয়ে কি কুরবানি করা যাবে?",
    en: "e.g. May a qurbani be funded from interest paid by a bank?",
  },
  "scholar.tools.composer.titlePlaceholderAnswer": {
    bn: "যেমন: সুদ ও হালাল উপার্জনের পার্থক্য",
    en: "e.g. Interest and lawful earnings: the difference",
  },
  "scholar.tools.composer.titlePlaceholderDefault": {
    bn: "লেখার বিষয় অনুযায়ী একটি স্পষ্ট শিরোনাম লিখুন",
    en: "Write a clear title for what you are writing",
  },
  "scholar.tools.composer.rulingField": {
    bn: "সংক্ষিপ্ত জবাব (রায়)",
    en: "Short answer (the ruling)",
  },
  "scholar.tools.composer.rulingHint": {
    bn: "দুই-তিন বাক্যে মূল রায় — পাঠক প্রথমেই এটি পড়বেন।",
    en: "The ruling in two or three sentences — it is the first thing a reader meets.",
  },
  "scholar.tools.composer.rulingPlaceholder": {
    bn: "সংক্ষেপে হুকুম লিখুন, তারপর নিচে দলিলসহ বিস্তারিত লিখুন।",
    en: "State the ruling briefly, then write the evidence in full below.",
  },
  "scholar.tools.composer.backToEditing": {
    bn: "সম্পাদনায় ফিরুন",
    en: "Back to editing",
  },
  "scholar.tools.composer.previewEmpty": {
    bn: "প্রিভিউ দেখতে কিছু লিখুন।",
    en: "Write something to see the preview.",
  },
  "scholar.tools.composer.departmentsTitle": {
    bn: "আপনার বিভাগ ও প্রকাশের প্রভাব",
    en: "Your departments and what publishing does",
  },
  "scholar.tools.composer.departmentsNote": {
    bn: "এই বিভাগে প্রকাশ করলে ভবিষ্যতে একই বিষয়ের প্রশ্নগুলো প্রথমে আপনার কাছে রাউট হবে, এবং লেখাটি বিভাগের পাতায় পাঠকদের কাছে দেখানো হবে।",
    en: "Publishing in these departments routes future questions on the same subject to you first, and lists the piece on the department's page.",
  },
  "scholar.tools.composer.rulesTitle": {
    bn: "রেফারেন্স যোগ করার নিয়ম",
    en: "Rules for attaching references",
  },
  "scholar.tools.composer.rulesSubtitle": {
    bn: "দলিল ছাড়া রায় নয়",
    en: "No ruling without evidence",
  },
  "scholar.tools.composer.rules": {
    bn: [
      "প্রতিটি রায়ের পাশে অন্তত একটি আয়াত বা হাদীস যুক্ত করুন।",
      "আয়াতের নম্বর ও সূরার নাম স্পষ্টভাবে উল্লেখ করুন।",
      "হাদীস হলে সংকলন ও হাদীস নম্বর দিন, যাতে পাঠক যাচাই করতে পারেন।",
      "মাযহাবভেদ থাকলে সেটি স্পষ্টভাবে উল্লেখ করুন এবং সূত্র দিন।",
    ],
    en: [
      "Attach at least one verse or hadith beside every ruling.",
      "Name the surah and the verse number plainly.",
      "For a hadith, give the collection and the hadith number so a reader can check it.",
      "Where the schools differ, say so explicitly and give your source.",
    ],
  },
  "scholar.tools.composer.answerInstead": {
    bn: "প্রশ্নের উত্তর হিসেবে লিখতে চান?",
    en: "Writing this as an answer instead?",
  },
  "scholar.tools.composer.readyToPublish": {
    bn: "প্রকাশের জন্য প্রস্তুত — রেফারেন্সসহ যাচাই করে নিন",
    en: "Ready to publish — check it with the references in place",
  },
  "scholar.tools.composer.notReady": {
    bn: "শিরোনাম ও অন্তত কয়েক প্যারাগ্রাফ লেখা প্রয়োজন",
    en: "A title and at least a few paragraphs are needed",
  },
};

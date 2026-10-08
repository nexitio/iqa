/**
 * The bilingual string dictionary and the pure functions that resolve it.
 *
 * This module deliberately has NO "use client" directive: server components
 * cannot import from a client module, and pages need to translate too. The
 * React provider lives in `i18n.tsx`; everything here is plain data and pure
 * functions so it can be used from anywhere.
 */

import type { Locale, Localized } from "./types";


/** Chrome strings are single lines, except a few curated lists (e.g. rules). */
type LangValue = { bn: string | string[]; en: string | string[] };

type Dict = Record<string, LangValue>;

export const DICTIONARY: Dict = {
  /* -------- navigation -------- */
  "nav.home": { bn: "হোম", en: "Home" },
  "nav.quran": { bn: "কুরআন", en: "Quran" },
  "nav.hadith": { bn: "হাদীস", en: "Hadith" },
  "nav.questions": { bn: "প্রশ্নোত্তর", en: "Q&A" },
  "nav.fatwas": { bn: "ফতোয়া", en: "Fatwas" },
  "nav.articles": { bn: "প্রবন্ধ", en: "Articles" },
  "nav.scholars": { bn: "আলেমগণ", en: "Scholars" },
  "nav.topics": { bn: "বিষয়সমূহ", en: "Topics" },
  "nav.discussions": { bn: "আলোচনা", en: "Discussions" },
  "nav.library": { bn: "আমার লাইব্রেরি", en: "My Library" },
  "nav.journey": { bn: "শিক্ষা যাত্রা", en: "Learning Journey" },
  "nav.daily": { bn: "দৈনিক আয়াত", en: "Daily Ayah" },
  "nav.profile": { bn: "প্রোফাইল", en: "Profile" },
  "nav.settings": { bn: "সেটিংস", en: "Settings" },
  "nav.notifications": { bn: "বিজ্ঞপ্তি", en: "Notifications" },
  "nav.more": { bn: "আরও", en: "More" },
  "nav.menu": { bn: "মেনু", en: "Menu" },
  "nav.scholarConsole": { bn: "আলেম প্যানেল", en: "Scholar Console" },
  "nav.adminConsole": { bn: "অ্যাডমিন প্যানেল", en: "Admin Console" },
  "nav.overview": { bn: "সারসংক্ষেপ", en: "Overview" },
  "nav.inbox": { bn: "প্রশ্ন বাক্স", en: "Question Inbox" },
  "nav.write": { bn: "লিখুন", en: "Compose" },
  "nav.departments": { bn: "বিভাগসমূহ", en: "Departments" },
  "nav.manageScholars": { bn: "আলেম ব্যবস্থাপনা", en: "Manage Scholars" },
  "nav.reviewQueue": { bn: "পর্যালোচনা", en: "Review Queue" },
  "nav.reports": { bn: "রিপোর্ট", en: "Reports" },
  "nav.analytics": { bn: "বিশ্লেষণ", en: "Analytics" },
  "nav.users": { bn: "ব্যবহারকারী", en: "Users" },
  "nav.moderation": { bn: "মডারেশন", en: "Moderation" },

  /* -------- actions -------- */
  "action.search": { bn: "খুঁজুন", en: "Search" },
  "action.searchPlaceholder": {
    bn: "কুরআন, হাদীস, প্রশ্ন বা আলেম খুঁজুন…",
    en: "Search Quran, Hadith, questions or scholars…",
  },
  "action.ask": { bn: "প্রশ্ন করুন", en: "Ask a Question" },
  "action.askScholar": { bn: "আলেমকে প্রশ্ন করুন", en: "Ask a Scholar" },
  "action.save": { bn: "সংরক্ষণ", en: "Save" },
  "action.saved": { bn: "সংরক্ষিত", en: "Saved" },
  "action.share": { bn: "শেয়ার", en: "Share" },
  "action.copyLink": { bn: "লিংক কপি", en: "Copy link" },
  "action.copied": { bn: "কপি হয়েছে", en: "Copied" },
  "action.follow": { bn: "ফলো করুন", en: "Follow" },
  "action.following": { bn: "ফলো করছেন", en: "Following" },
  "action.unfollow": { bn: "আনফলো", en: "Unfollow" },
  "action.readMore": { bn: "আরও পড়ুন", en: "Read more" },
  "action.viewAll": { bn: "সব দেখুন", en: "View all" },
  "action.answer": { bn: "উত্তর দিন", en: "Answer" },
  "action.publish": { bn: "প্রকাশ করুন", en: "Publish" },
  "action.saveDraft": { bn: "খসড়া সংরক্ষণ", en: "Save draft" },
  "action.requestReview": { bn: "পর্যালোচনায় পাঠান", en: "Send for review" },
  "action.cancel": { bn: "বাতিল", en: "Cancel" },
  "action.submit": { bn: "জমা দিন", en: "Submit" },
  "action.filter": { bn: "ফিল্টার", en: "Filter" },
  "action.sort": { bn: "সাজান", en: "Sort" },
  "action.more": { bn: "আরও", en: "More" },
  "action.play": { bn: "শুনুন", en: "Listen" },
  "action.report": { bn: "রিপোর্ট", en: "Report" },
  "action.reply": { bn: "উত্তর লিখুন", en: "Reply" },
  "action.loadMore": { bn: "আরও দেখুন", en: "Load more" },
  "action.back": { bn: "ফিরে যান", en: "Back" },
  "action.next": { bn: "পরবর্তী", en: "Next" },
  "action.previous": { bn: "পূর্ববর্তী", en: "Previous" },
  "action.close": { bn: "বন্ধ করুন", en: "Close" },
  "action.clear": { bn: "মুছুন", en: "Clear" },
  "action.select": { bn: "নির্বাচন করুন", en: "Select" },
  "action.selected": { bn: "নির্বাচিত", en: "Selected" },
  "action.markAllRead": {
    bn: "সব পড়া হয়েছে বলে চিহ্নিত করুন",
    en: "Mark all as read",
  },
  "action.addScholar": { bn: "নতুন আলেম যোগ করুন", en: "Add Scholar" },
  "action.edit": { bn: "সম্পাদনা", en: "Edit" },
  "action.delete": { bn: "মুছে ফেলুন", en: "Delete" },
  "action.approve": { bn: "অনুমোদন", en: "Approve" },
  "action.reject": { bn: "প্রত্যাখ্যান", en: "Reject" },
  "action.suspend": { bn: "স্থগিত", en: "Suspend" },
  "action.useReference": { bn: "ব্যবহার করুন", en: "Use" },
  "action.insert": { bn: "যোগ করুন", en: "Insert" },
  "action.signIn": { bn: "প্রবেশ করুন", en: "Sign in" },
  "action.signUp": { bn: "অ্যাকাউন্ট খুলুন", en: "Create account" },
  "action.signOut": { bn: "লগ আউট", en: "Sign out" },
  "action.continueReading": { bn: "পড়া চালিয়ে যান", en: "Continue reading" },
  "action.startLearning": { bn: "শেখা শুরু করুন", en: "Start learning" },
  "action.enrollNow": { bn: "যুক্ত হোন", en: "Enroll" },
  "action.tryAgain": { bn: "আবার চেষ্টা করুন", en: "Try again" },
  "action.resume": { bn: "চালিয়ে যান", en: "Resume" },
  "action.markComplete": { bn: "সম্পন্ন করুন", en: "Mark complete" },
  "action.becomeScholar": { bn: "আলেম হিসেবে আবেদন", en: "Apply as Scholar" },

  /* -------- states -------- */
  "state.loading": { bn: "লোড হচ্ছে…", en: "Loading…" },
  "state.empty": { bn: "এখানে এখনো কিছু নেই", en: "Nothing here yet" },
  "state.noResults": { bn: "কিছু পাওয়া যায়নি", en: "No results found" },
  "state.error": { bn: "কিছু ভুল হয়েছে", en: "Something went wrong" },
  "state.comingSoon": { bn: "শীঘ্রই আসছে", en: "Coming soon" },
  "state.contentPending": {
    bn: "এই অংশের অনুবাদ এখনো যুক্ত করা হয়নি",
    en: "This content has not been added yet",
  },
  "state.endOfList": { bn: "শেষ পর্যন্ত পৌঁছে গেছেন", en: "You've reached the end" },

  /* -------- labels -------- */
  "label.verified": { bn: "যাচাইকৃত", en: "Verified" },
  "label.verifiedScholar": { bn: "যাচাইকৃত আলেম", en: "Verified Scholar" },
  "label.topScholar": { bn: "শীর্ষ আলেম", en: "Top Scholar" },
  "label.trending": { bn: "আলোচিত", en: "Trending" },
  "label.new": { bn: "নতুন", en: "New" },
  "label.priority": { bn: "অগ্রাধিকার", en: "Priority" },
  "label.department": { bn: "বিভাগ", en: "Department" },
  "label.departments": { bn: "বিভাগসমূহ", en: "Departments" },
  "label.topic": { bn: "বিষয়", en: "Topic" },
  "label.topics": { bn: "বিষয়সমূহ", en: "Topics" },
  "label.answer": { bn: "উত্তর", en: "Answer" },
  "label.answers": { bn: "উত্তর", en: "Answers" },
  "label.article": { bn: "প্রবন্ধ", en: "Article" },
  "label.articles": { bn: "প্রবন্ধ", en: "Articles" },
  "label.fatwa": { bn: "ফতোয়া", en: "Fatwa" },
  "label.fatwas": { bn: "ফতোয়া", en: "Fatwas" },
  "label.question": { bn: "প্রশ্ন", en: "Question" },
  "label.questions": { bn: "প্রশ্ন", en: "Questions" },
  "label.discussion": { bn: "আলোচনা", en: "Discussion" },
  "label.discussions": { bn: "আলোচনা", en: "Discussions" },
  "label.references": { bn: "রেফারেন্স", en: "References" },
  "label.reference": { bn: "রেফারেন্স", en: "Reference" },
  "label.readingTime": { bn: "পড়ার সময়", en: "Reading time" },
  "label.views": { bn: "বার পঠিত", en: "views" },
  "label.followers": { bn: "অনুসারী", en: "Followers" },
  "label.helpful": { bn: "সহায়ক", en: "Helpful" },
  "label.askedBy": { bn: "প্রশ্নকারী", en: "Asked by" },
  "label.answeredBy": { bn: "উত্তর দিয়েছেন", en: "Answered by" },
  "label.answeredOn": { bn: "উত্তর দেওয়া হয়েছে", en: "Answered on" },
  "label.publishedOn": { bn: "প্রকাশিত", en: "Published" },
  "label.updatedOn": { bn: "সর্বশেষ হালনাগাদ", en: "Updated" },
  "label.alsoAsk": { bn: "এটিও জেনে রাখুন", en: "Also good to know" },
  "label.relatedKnowledge": { bn: "সম্পর্কিত জ্ঞান", en: "Related knowledge" },
  "label.relatedQuestions": { bn: "সম্পর্কিত প্রশ্ন", en: "Related questions" },
  "label.relatedAyahs": { bn: "সম্পর্কিত আয়াত", en: "Related Ayahs" },
  "label.relatedHadiths": { bn: "সম্পর্কিত হাদীস", en: "Related Hadith" },
  "label.continueLearning": { bn: "শেখা চালিয়ে যান", en: "Continue learning" },
  "label.dailyAyah": { bn: "আজকের আয়াত", en: "Ayah of the Day" },
  "label.dailyHadith": { bn: "আজকের হাদীস", en: "Hadith of the Day" },
  "label.yourFeed": { bn: "আপনার ফিড", en: "Your Feed" },
  "label.prayerTimes": { bn: "নামাজের সময়সূচি", en: "Prayer Times" },
  "label.nextPrayer": { bn: "পরবর্তী নামাজ", en: "Next Prayer" },
  "label.qibla": { bn: "কিবলা দিক", en: "Qibla Direction" },
  "label.todaysDate": { bn: "আজকের তারিখ", en: "Today's date" },
  "label.expertise": { bn: "বিশেষজ্ঞতা", en: "Expertise" },
  "label.credentials": { bn: "শিক্ষাগত যোগ্যতা", en: "Credentials" },
  "label.languages": { bn: "ভাষা", en: "Languages" },
  "label.madrasah": { bn: "মাদরাসা", en: "Madrasah" },
  "label.district": { bn: "জেলা", en: "District" },
  "label.division": { bn: "বিভাগ", en: "Division" },
  "label.joinedOn": { bn: "যুক্ত হয়েছেন", en: "Joined" },
  "label.responseTime": { bn: "সাধারণত উত্তর দেন", en: "Usually replies in" },
  "label.available": { bn: "প্রশ্নের জন্য উপলব্ধ", en: "Available for questions" },
  "label.busy": { bn: "ব্যস্ত", en: "Busy" },
  "label.unavailable": { bn: "অনুপলব্ধ", en: "Unavailable" },
  "label.whyThis": { bn: "কেন এই প্রস্তাব", en: "Why this suggestion" },
  "label.matchScore": { bn: "মিলের মাত্রা", en: "Match" },
  "label.smartReferences": { bn: "স্মার্ট রেফারেন্স", en: "Smart References" },
  "label.yourLibrary": { bn: "আপনার ইসলামিক লাইব্রেরি", en: "Your Islamic Library" },
  "label.progress": { bn: "অগ্রগতি", en: "Progress" },
  "label.streak": { bn: "দিনের ধারা", en: "Streak" },
  "label.days": { bn: "দিন", en: "days" },
  "label.minutes": { bn: "মিনিট", en: "min" },
  "label.ayah": { bn: "আয়াত", en: "Ayah" },
  "label.ayahs": { bn: "আয়াত", en: "Ayahs" },
  "label.hadith": { bn: "হাদীস", en: "Hadith" },
  "label.surah": { bn: "সূরা", en: "Surah" },
  "label.juz": { bn: "পারা", en: "Juz" },
  "label.narrator": { bn: "বর্ণনাকারী", en: "Narrator" },
  "label.grade": { bn: "মান", en: "Grade" },
  "label.collection": { bn: "সংকলন", en: "Collection" },
  "label.book": { bn: "অধ্যায়", en: "Book" },
  "label.translation": { bn: "অনুবাদ", en: "Translation" },
  "label.transliteration": { bn: "উচ্চারণ", en: "Transliteration" },
  "label.tafsir": { bn: "তাফসীর", en: "Tafsir" },
  "label.audio": { bn: "অডিও", en: "Audio" },
  "label.copyArabic": { bn: "আরবি কপি", en: "Copy Arabic" },
  "label.fontSize": { bn: "ফন্ট সাইজ", en: "Font size" },
  "label.reciter": { bn: "ক্বারী", en: "Reciter" },
  "label.ruing": { bn: "ফতোয়ার জবাব", en: "Ruling" },
  "label.questioner": { bn: "প্রশ্ন", en: "Question" },
  "label.mufti": { bn: "মুফতি", en: "Mufti" },
  "label.coSigned": { bn: "সহ-স্বাক্ষরকারী", en: "Co-signed by" },
  "label.fiqh": { bn: "ফিকহ", en: "Fiqh" },
  "label.visibility": { bn: "দৃশ্যমানতা", en: "Visibility" },
  "label.anonymous": { bn: "নাম প্রকাশে অনিচ্ছুক", en: "Anonymous" },
  "label.private": { bn: "ব্যক্তিগত", en: "Private" },
  "label.public": { bn: "প্রকাশ্য", en: "Public" },
  "label.urgent": { bn: "জরুরি", en: "Urgent" },
  "label.fatwaRequested": { bn: "ফতোয়া চাওয়া হয়েছে", en: "Fatwa requested" },
  "label.routedTo": { bn: "পাঠানো হয়েছে", en: "Routed to" },
  "label.askingTips": { bn: "ভালো প্রশ্নের জন্য", en: "For a good question" },
  "label.moderation": { bn: "মডারেশন", en: "Moderation" },
  "label.reports": { bn: "রিপোর্ট", en: "Reports" },
  "label.total": { bn: "মোট", en: "Total" },
  "label.today": { bn: "আজ", en: "Today" },
  "label.thisWeek": { bn: "এই সপ্তাহ", en: "This week" },
  "label.thisMonth": { bn: "এই মাস", en: "This month" },
  "label.allTime": { bn: "সর্বকাল", en: "All time" },
  "label.change": { bn: "পরিবর্তন", en: "Change" },
  "label.status": { bn: "অবস্থা", en: "Status" },
  "label.name": { bn: "নাম", en: "Name" },
  "label.email": { bn: "ইমেইল", en: "Email" },
  "label.role": { bn: "ভূমিকা", en: "Role" },
  "label.password": { bn: "পাসওয়ার্ড", en: "Password" },
  "label.rememberMe": { bn: "মনে রাখুন", en: "Remember me" },
  "label.forgotPassword": { bn: "পাসওয়ার্ড ভুলে গেছেন?", en: "Forgot password?" },
  "label.orContinueWith": { bn: "অথবা", en: "or continue with" },
  "label.noAccount": { bn: "অ্যাকাউন্ট নেই?", en: "Don't have an account?" },
  "label.hasAccount": { bn: "আগেই অ্যাকাউন্ট আছে?", en: "Already have an account?" },

  /* -------- statuses -------- */
  "status.open": { bn: "খোলা", en: "Open" },
  "status.routed": { bn: "আলেমের কাছে", en: "Routed" },
  "status.answered": { bn: "উত্তর দেওয়া হয়েছে", en: "Answered" },
  "status.closed": { bn: "সম্পন্ন", en: "Closed" },
  "status.draft": { bn: "খসড়া", en: "Draft" },
  "status.inReview": { bn: "পর্যালোচনায়", en: "In review" },
  "status.published": { bn: "প্রকাশিত", en: "Published" },
  "status.changesRequested": { bn: "পরিবর্তন প্রয়োজন", en: "Changes requested" },
  "status.pending": { bn: "অপেক্ষমাণ", en: "Pending" },
  "status.approved": { bn: "অনুমোদিত", en: "Approved" },
  "status.rejected": { bn: "প্রত্যাখ্যাত", en: "Rejected" },
  "status.suspended": { bn: "স্থগিত", en: "Suspended" },
  "status.clean": { bn: "পরিষ্কার", en: "Clean" },
  "status.underReview": { bn: "পর্যালোচনায়", en: "Under review" },
  "status.locked": { bn: "বন্ধ", en: "Locked" },

  /* -------- hadith grades -------- */
  "grade.sahih": { bn: "সহীহ", en: "Sahih" },
  "grade.hasan": { bn: "হাসান", en: "Hasan" },
  "grade.daif": { bn: "দুর্বল", en: "Da'if" },
  "grade.muttafaqunAlaih": { bn: "মুত্তাফাকুন আলাইহি", en: "Muttafaqun Alaih" },

  /* -------- revelation -------- */
  "revelation.meccan": { bn: "মাক্কী", en: "Meccan" },
  "revelation.medinan": { bn: "মাদানী", en: "Medinan" },

  /* -------- home -------- */
  "home.greetingMorning": { bn: "শুভ সকাল", en: "Good morning" },
  "home.greetingAfternoon": { bn: "শুভ অপরাহ্ন", en: "Good afternoon" },
  "home.greetingEvening": { bn: "শুভ সন্ধ্যা", en: "Good evening" },
  "home.greetingNight": { bn: "শুভ রাত্রি", en: "Good evening" },
  "home.subtitle": {
    bn: "আজ একটু ইলম অর্জন করুন — প্রশ্ন করুন, পড়ুন, প্রতিফলিত হোন।",
    en: "Grow a little in knowledge today — ask, read, reflect.",
  },
  "home.dailyDua": { bn: "জ্ঞানের দুআ", en: "Dua for knowledge" },
  "home.journeyCta": { bn: "আজকের শিক্ষা যাত্রা", en: "Today's learning journey" },
  "home.streakMessage": {
    bn: "টানা {n} দিন জ্ঞান অর্জন করছেন — চালিয়ে যান!",
    en: "You've learned {n} days in a row — keep going!",
  },
  "home.followedScholars": { bn: "যাদের ফলো করছেন", en: "Scholars you follow" },
  "home.yourInterests": { bn: "আপনার আগ্রহ", en: "Your interests" },
  "home.recommendedScholars": { bn: "আপনার জন্য আলেম", en: "Scholars for you" },
  "home.trendingNow": { bn: "এখন আলোচিত", en: "Trending now" },
  "home.newAnswers": { bn: "নতুন উত্তর", en: "New answers" },
  "home.freshFatwas": { bn: "সাম্প্রতিক ফতোয়া", en: "Recent fatwas" },
  "home.weeklyJourney": { bn: "সাপ্তাহিক জ্ঞান যাত্রা", en: "Weekly journey" },
  "home.jumuahNote": {
    bn: "আজ জুমার দিন — সূরা কাহফ পড়ার সময় হয়েছে",
    en: "It's Jumu'ah — a good time to read Surah Al-Kahf",
  },

  /* -------- quran -------- */
  "quran.title": { bn: "আল-কুরআনুল কারীম", en: "The Holy Quran" },
  "quran.subtitle": {
    bn: "আরবি, উচ্চারণ ও বাংলা অনুবাদসহ — ইলম ফাউন্ডেশন অনুবাদ অনুসরণে",
    en: "Arabic with Bengali transliteration and translation",
  },
  "quran.searchPlaceholder": { bn: "সূরার নাম বা নম্বর লিখুন…", en: "Search surah name or number…" },
  "quran.allSurahs": { bn: "সকল সূরা", en: "All Surahs" },
  "quran.ayahCount": { bn: "আয়াত সংখ্যা", en: "Ayahs" },
  "quran.notAdded": {
    bn: "এই সূরার অনুবাদ এখনো যুক্ত করা হয়নি। শীঘ্রই আসছে ইনশাআল্লাহ।",
    en: "This surah's translation has not been added yet.",
  },
  "quran.readSurah": { bn: "সূরা পড়ুন", en: "Read Surah" },
  "quran.bismillah": { bn: "বিসমিল্লাহির রাহমানির রাহীম", en: "In the name of Allah, the Most Merciful" },

  /* -------- hadith -------- */
  "hadith.title": { bn: "হাদীস সংকলন", en: "Hadith Collections" },
  "hadith.subtitle": {
    bn: "সহীহ হাদীস আরবি, বাংলা অনুবাদ ও বর্ণনাকারীসহ",
    en: "Authentic hadith with Arabic, translation and narrator",
  },
  "hadith.searchPlaceholder": { bn: "হাদীস খুঁজুন…", en: "Search hadith…" },
  "hadith.allCollections": { bn: "সকল সংকলন", en: "All collections" },

  /* -------- q&a -------- */
  "qa.title": { bn: "প্রশ্ন ও উত্তর", en: "Questions & Answers" },
  "qa.subtitle": {
    bn: "বিশ্বস্ত আলেমদের কাছ থেকে আপনার প্রশ্নের উত্তর",
    en: "Answers to your questions from trusted scholars",
  },
  "qa.askTitle": { bn: "আপনার প্রশ্ন লিখুন", en: "Write your question" },
  "qa.askIntro": {
    bn: "প্রশ্ন যত স্পষ্ট হবে, উত্তর তত নির্ভুল হবে। আপনার বিভাগ বেছে নিন — সংশ্লিষ্ট বিভাগের আলেমরা অগ্রাধিকার পাবেন।",
    en: "The clearer the question, the more precise the answer. Pick a department — relevant scholars get priority.",
  },
  "qa.questionField": { bn: "আপনার প্রশ্ন", en: "Your question" },
  "qa.detailsField": { bn: "বিস্তারিত বর্ণনা", en: "Additional details" },
  "qa.detailsHelp": {
    bn: "পরিস্থিতি, স্থান বা প্রেক্ষাপট লিখুন — এতে উত্তর আরও নির্ভুল হবে।",
    en: "Add situation, place or context so the answer can be precise.",
  },
  "qa.chooseDepartment": { bn: "বিভাগ নির্বাচন করুন", en: "Choose department" },
  "qa.visibilityHelp": {
    bn: "নাম প্রকাশে অনিচ্ছুক হলে আপনার পরিচয় গোপন থাকবে।",
    en: "Anonymous keeps your identity hidden from other users.",
  },
  "qa.requestFatwa": { bn: "আমি আনুষ্ঠানিক ফতোয়া চাই", en: "I need a formal fatwa" },
  "qa.markUrgent": { bn: "জরুরি হিসেবে চিহ্নিত করুন", en: "Mark as urgent" },
  "qa.waitTime": { bn: "সাধারণত উত্তরের অপেক্ষা", en: "Typical wait time" },
  "qa.typicals": { bn: "সাধারণ উত্তর", en: "Typical answer" },
  "qa.noAnswerYet": {
    bn: "এখনো কোনো উত্তর আসেনি — সংশ্লিষ্ট বিভাগের আলেমদের জানানো হয়েছে",
    en: "No answer yet — relevant scholars have been notified",
  },
  "qa.acceptedAnswer": { bn: "গৃহীত উত্তর", en: "Accepted answer" },
  "qa.answerCount": { bn: "টি উত্তর", en: "answers" },

  /* -------- fatwa -------- */
  "fatwa.title": { bn: "ফতোয়া সংকলন", en: "Fatwa Archive" },
  "fatwa.subtitle": {
    bn: "মুফতিদের যাচাইকৃত ফিকহি রায়, দলিলসহ",
    en: "Verified fiqhi rulings from qualified muftis, with evidence",
  },
  "fatwa.hanafi": { bn: "হানাফী মাযহাব", en: "Hanafi" },
  "fatwa.comparative": { bn: "তুলনামূলক", en: "Comparative" },
  "fatwa.muftis": { bn: "মুফতি", en: "Mufti" },

  /* -------- scholars -------- */
  "scholars.title": { bn: "আলেম ও মুফতি", en: "Scholars & Muftis" },
  "scholars.subtitle": {
    bn: "যোগ্যতা, বিভাগ ও অবদান যাচাই করে তৈরি প্রোফাইল",
    en: "Profiles verified by credentials, departments and contributions",
  },
  "scholars.sortRank": { bn: "অবদান অনুসারে", en: "By contribution" },
  "scholars.sortFollowers": { bn: "অনুসারী অনুসারে", en: "By followers" },
  "scholars.sortResponse": { bn: "দ্রুত উত্তরদাতা", en: "Fastest responders" },
  "scholars.knowledgeContributions": { bn: "জ্ঞানের অবদান", en: "Knowledge contributions" },

  /* -------- discussions -------- */
  "discussions.title": { bn: "জ্ঞানভিত্তিক আলোচনা", en: "Knowledge Discussions" },
  "discussions.subtitle": {
    bn: "মডারেটেড, শালীন ও জ্ঞানকেন্দ্রিক আলোচনা — সাধারণ সোশ্যাল নেটওয়ার্ক নয়",
    en: "Moderated, adab-first, knowledge-focused — not another social network",
  },
  "discussions.guidelines": { bn: "আলোচনার নীতিমালা", en: "Discussion guidelines" },
  "discussions.rules": {
    bn: [
      "আদব রক্ষা করুন — ব্যক্তিগত আক্রমণ নয়, মতের ভিন্নতা স্বাভাবিক।",
      "দলিল দিন — কুরআন বা হাদীসের রেফারেন্স সংযুক্ত করুন।",
      "অপ্রাসঙ্গিক ও রাজনৈতিক বিতর্ক এখানে নিষিদ্ধ।",
      "জ্ঞানের প্রশ্নে আলেমের মতকে প্রাধান্য দিন।",
    ],
    en: [
      "Maintain adab — disagree with ideas, never attack people.",
      "Bring evidence — attach Quran or Hadith references.",
      "Off-topic and partisan political debate is not allowed.",
      "On knowledge matters, defer to the scholars' position.",
    ],
  },

  /* -------- library -------- */
  "library.title": { bn: "আমার ইসলামিক লাইব্রেরি", en: "My Islamic Library" },
  "library.subtitle": {
    bn: "সংরক্ষিত আয়াত, হাদীস, প্রবন্ধ ও ফতোয়া — এক জায়গায়",
    en: "Saved ayahs, hadith, articles and fatwas in one place",
  },
  "library.collections": { bn: "সংগ্রহ", en: "Collections" },
  "library.allSaved": { bn: "সব সংরক্ষিত", en: "All saved" },
  "library.empty": {
    bn: "আপনার লাইব্রেরি খালি। কোনো আয়াত বা প্রবন্ধ সংরক্ষণ করে শুরু করুন।",
    en: "Your library is empty. Save an ayah or article to begin.",
  },
  "library.notes": { bn: "আমার নোট", en: "My notes" },
  "library.addNote": { bn: "নোট যোগ করুন", en: "Add note" },

  /* -------- journey -------- */
  "journey.title": { bn: "শিক্ষা যাত্রা", en: "Learning Journeys" },
  "journey.subtitle": {
    bn: "ছোট ছোট ধাপে কাঠামোবদ্ধ ইলম — প্রতিদিন কয়েক মিনিটেই",
    en: "Structured knowledge in small steps — a few minutes a day",
  },
  "journey.dayOf": { bn: "দিন", en: "Day" },
  "journey.enrolled": { bn: "জন যুক্ত হয়েছেন", en: "enrolled" },
  "journey.continueJourney": { bn: "যাত্রা চালিয়ে যান", en: "Continue journey" },
  "journey.completed": { bn: "সম্পন্ন", en: "Completed" },
  "journey.yourJourneys": { bn: "আপনার যাত্রা", en: "Your journeys" },
  "journey.discover": { bn: "নতুন যাত্রা খুঁজুন", en: "Discover journeys" },

  /* -------- profile / settings -------- */
  "profile.title": { bn: "আমার প্রোফাইল", en: "My Profile" },
  "profile.activity": { bn: "কার্যক্রম", en: "Activity" },
  "profile.myQuestions": { bn: "আমার প্রশ্ন", en: "My questions" },
  "profile.myAnswers": { bn: "আমার উত্তর", en: "My answers" },
  "profile.savedItems": { bn: "সংরক্ষিত", en: "Saved" },
  "settings.title": { bn: "সেটিংস", en: "Settings" },
  "settings.language": { bn: "ভাষা", en: "Language" },
  "settings.appearance": { bn: "থিম", en: "Appearance" },
  "settings.light": { bn: "উজ্জ্বল", en: "Light" },
  "settings.dark": { bn: "অন্ধকার", en: "Dark" },
  "settings.system": { bn: "সিস্টেম", en: "System" },
  "settings.location": { bn: "অবস্থান", en: "Location" },
  "settings.locationHelp": {
    bn: "নামাজের সময় ও স্থানীয় কনটেন্টের জন্য আপনার জেলা বেছে নিন।",
    en: "Choose your district for prayer times and local content.",
  },
  "settings.madhab": { bn: "মাযহাব", en: "Madhab" },
  "settings.notifications": { bn: "বিজ্ঞপ্তি", en: "Notifications" },
  "settings.quranFontSize": { bn: "কুরআনের ফন্ট সাইজ", en: "Quran font size" },
  "settings.interests": { bn: "আগ্রহের বিষয়", en: "Interests" },
  "settings.interestsHelp": {
    bn: "আপনার ফিড এই বিষয়গুলোর ভিত্তিতে সাজানো হবে।",
    en: "Your feed is arranged around these topics.",
  },
  "settings.dailyReminder": { bn: "দৈনিক আয়াতের অনুস্মারক", en: "Daily ayah reminder" },
  "settings.privacy": { bn: "গোপনীয়তা", en: "Privacy" },

  /* -------- admin -------- */
  "admin.title": { bn: "অ্যাডমিন প্যানেল", en: "Admin Console" },
  "admin.overview": { bn: "প্ল্যাটফর্ম সারসংক্ষেপ", en: "Platform Overview" },
  "admin.totalUsers": { bn: "মোট ব্যবহারকারী", en: "Total users" },
  "admin.activeToday": { bn: "আজ সক্রিয়", en: "Active today" },
  "admin.totalScholars": { bn: "মোট আলেম", en: "Total scholars" },
  "admin.pendingApplications": { bn: "অপেক্ষমাণ আবেদন", en: "Pending applications" },
  "admin.openQuestions": { bn: "খোলা প্রশ্ন", en: "Open questions" },
  "admin.unanswered24h": { bn: "২৪ ঘন্টার বেশি উত্তরহীন", en: "Unanswered > 24h" },
  "admin.publishedFatwas": { bn: "প্রকাশিত ফতোয়া", en: "Published fatwas" },
  "admin.pendingReview": { bn: "পর্যালোচনায় অপেক্ষমাণ", en: "Pending review" },
  "admin.flagged": { bn: "ফ্ল্যাগড কনটেন্ট", en: "Flagged content" },
  "admin.quranReads": { bn: "৭ দিনে কুরআন পাঠ", en: "Quran reads (7d)" },
  "admin.addScholar": { bn: "নতুন আলেম যোগ করুন", en: "Add a Scholar" },
  "admin.addScholarIntro": {
    bn: "আলেমের যোগ্যতা যাচাই করে প্রোফাইল তৈরি করুন। বিভাগ নির্ধারণ প্রশ্ন রাউটিংয়ে সরাসরি প্রভাব ফেলে।",
    en: "Create a verified profile. Department assignment directly affects question routing.",
  },
  "admin.basicInfo": { bn: "মূল তথ্য", en: "Basic information" },
  "admin.assignDepartments": { bn: "বিভাগ নির্ধারণ", en: "Assign departments" },
  "admin.primaryDepartment": { bn: "প্রধান বিভাগ", en: "Primary department" },
  "admin.credentialsSection": { bn: "যোগ্যতা ও শিক্ষা", en: "Credentials" },
  "admin.accountSection": { bn: "অ্যাকাউন্ট", en: "Account" },
  "admin.verifyProfile": { bn: "প্রোফাইল যাচাই করুন", en: "Verify this profile" },
  "admin.sendInvite": { bn: "আমন্ত্রণ পাঠান", en: "Send invitation" },
  "admin.routingPreview": { bn: "প্রশ্ন রাউটিং প্রিভিউ", en: "Question routing preview" },
  "admin.routingPreviewHelp": {
    bn: "এই বিভাগগুলোর প্রশ্ন প্রথমে যাদের কাছে যাবে",
    en: "Who will receive this scholar's department questions first",
  },
  "admin.scholarsTable": { bn: "আলেম তালিকা", en: "Scholar directory" },
  "admin.departmentManagement": { bn: "বিভাগ ব্যবস্থাপনা", en: "Department management" },
  "admin.scholarCount": { bn: "আলেম", en: "scholars" },
  "admin.reviewQueue": { bn: "পর্যালোচনা সারি", en: "Review queue" },
  "admin.reportsQueue": { bn: "রিপোর্ট সারি", en: "Report queue" },
  "admin.recentActivity": { bn: "সাম্প্রতিক কার্যক্রম", en: "Recent activity" },
  "admin.districtBreakdown": { bn: "জেলা অনুসারে ব্যবহারকারী", en: "Users by district" },

  /* -------- scholar console -------- */
  "console.title": { bn: "আলেম প্যানেল", en: "Scholar Console" },
  "console.welcome": { bn: "আসসালামু আলাইকুম", en: "Assalamu Alaikum" },
  "console.routedQuestions": { bn: "আপনার কাছে আসা প্রশ্ন", en: "Routed to you" },
  "console.answeredThisWeek": { bn: "এই সপ্তাহে উত্তর", en: "Answered this week" },
  "console.avgResponse": { bn: "গড় উত্তর সময়", en: "Avg. response time" },
  "console.helpfulRate": { bn: "সহায়ক রেটিং", en: "Helpful rate" },
  "console.newFollowers": { bn: "নতুন অনুসারী", en: "New followers" },
  "console.pendingDrafts": { bn: "অসম্পূর্ণ খসড়া", en: "Pending drafts" },
  "console.streak": { bn: "উত্তর দেওয়ার ধারা", en: "Answering streak" },
  "console.hours": { bn: "ঘন্টা", en: "hours" },
  "console.priorityInbox": { bn: "অগ্রাধিকার তালিকা", en: "Priority inbox" },
  "console.whyYou": { bn: "কেন আপনার কাছে এসেছে", en: "Why this reached you" },
  "console.yourDepartments": { bn: "আপনার বিভাগসমূহ", en: "Your departments" },
  "console.writeTitle": { bn: "নতুন লেখা তৈরি করুন", en: "Create content" },
  "console.writeSubtitle": {
    bn: "লেখার সময় কুরআন ও হাদীসের প্রাসঙ্গিক রেফারেন্স প্রস্তাব পাবেন — এক ক্লিকে সরাসরি যুক্ত করুন।",
    en: "Relevant Quran and Hadith are suggested as you write — insert them in one click.",
  },
  "console.chooseType": { bn: "কী লিখতে চান?", en: "What are you writing?" },
  "console.articleType": { bn: "প্রবন্ধ", en: "Article" },
  "console.fatwaType": { bn: "ফতোয়া", en: "Fatwa" },
  "console.answerType": { bn: "প্রশ্নের উত্তর", en: "Answer" },
  "console.titleField": { bn: "শিরোনাম", en: "Title" },
  "console.bodyField": { bn: "মূল লেখা", en: "Body" },
  "console.bodyPlaceholder": {
    bn: "এখানে লিখুন… লেখার বিষয়ের সাথে মিলে যাওয়া আয়াত ও হাদীস ডান দিকে প্রস্তাব হিসেবে দেখা যাবে।",
    en: "Write here… matching ayahs and hadith appear as suggestions on the right.",
  },
  "console.suggestedRefs": { bn: "প্রস্তাবিত রেফারেন্স", en: "Suggested references" },
  "console.suggestedRefsHelp": {
    bn: "আপনার লেখার বিষয়বস্তু বিশ্লেষণ করে প্রস্তাব দেওয়া হয়েছে",
    en: "Suggested by analysing your draft's topic",
  },
  "console.attachedRefs": { bn: "যুক্ত করা রেফারেন্স", en: "Attached references" },
  "console.noRefsYet": {
    bn: "এখনো কোনো রেফারেন্স যুক্ত করা হয়নি",
    en: "No references attached yet",
  },
  "console.refreshSuggestions": { bn: "নতুন প্রস্তাব", en: "Refresh suggestions" },
  "console.preview": { bn: "প্রিভিউ", en: "Preview" },
  "console.publishNow": { bn: "এখনই প্রকাশ করুন", en: "Publish now" },
  "console.savedAt": { bn: "সংরক্ষিত", en: "Saved" },
  "console.answerQuestion": { bn: "প্রশ্নের উত্তর দিন", en: "Answer the question" },
  "console.questionContext": { bn: "প্রশ্নের প্রেক্ষাপট", en: "Question context" },
  "console.myArticles": { bn: "আমার প্রবন্ধ", en: "My articles" },
  "console.myFatwas": { bn: "আমার ফতোয়া", en: "My fatwas" },
  "console.myAnswers": { bn: "আমার উত্তর", en: "My answers" },
  "console.publicProfile": { bn: "পাবলিক প্রোফাইল", en: "Public profile" },

  /* -------- misc -------- */
  "misc.bismillah": { bn: "বিসমিল্লাহির রাহমানির রাহীম", en: "Bismillahir Rahmanir Rahim" },
  "misc.readInBangla": { bn: "বাংলায় পড়ুন", en: "Read in Bangla" },
  "misc.readInEnglish": { bn: "ইংরেজিতে পড়ুন", en: "Read in English" },
  "misc.languageToggle": { bn: "ভাষা", en: "Language" },
  "misc.themeToggle": { bn: "থিম বদলান", en: "Toggle theme" },
  "misc.madeWithAdab": {
    bn: "বাংলাদেশের মুসলিমদের জন্য ভালোবাসা ও আদবের সাথে তৈরি",
    en: "Built with love and adab for the Muslims of Bangladesh",
  },
  "misc.footerAbout": {
    bn: "ইলম — ইসলামিক জ্ঞান, কুরআন, হাদীস, প্রশ্নোত্তর, ফতোয়া ও প্রবন্ধের একটি জীবন্ত প্ল্যাটফর্ম।",
    en: "Ilm — a living platform for Islamic knowledge: Quran, Hadith, Q&A, Fatwa and Articles.",
  },
  "misc.footerDisclaimer": {
    bn: "গুরুত্বপূর্ণ বিষয়ে সিদ্ধান্তের আগে স্থানীয় আলেমের সাথে সরাসরি পরামর্শ করুন।",
    en: "For important matters, consult a local scholar directly before deciding.",
  },
  "misc.dhikrNow": { bn: "এখন পড়ুন", en: "Recite now" },
};

export type TKey = keyof typeof DICTIONARY;

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    vars[k] === undefined ? `{${k}}` : String(vars[k]),
  );
}

/** Collapse a dictionary entry to a single display string. */
function asText(value: string | string[] | undefined): string {
  if (value === undefined) return "";
  return Array.isArray(value) ? value.join(" ") : value;
}

/** Expand a dictionary entry into a list. */
function asList(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function pickLocale(value: Localized | undefined, locale: Locale, fallback = "") {
  return value ? value[locale] || value.bn || fallback : fallback;
}

/** Translate a chrome string outside React. */
export function translate(
  key: string,
  locale: Locale,
  vars?: Record<string, string | number>,
) {
  const entry = DICTIONARY[key];
  if (!entry) return key;
  return interpolate(asText(entry[locale] ?? entry.bn), vars);
}

/** Resolve a dictionary list outside React. */
export function translateList(key: string, locale: Locale) {
  const entry = DICTIONARY[key];
  if (!entry) return [];
  return asList(entry[locale] ?? entry.bn);
}


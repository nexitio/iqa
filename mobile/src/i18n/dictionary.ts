import type { Locale, Localized } from "../lib/types";

/**
 * Interface copy, Bangla-first, mirroring the web app's dictionary. Only the
 * keys the mobile surfaces use are ported; `translate` tolerates a missing key
 * by returning the key itself so a gap is visible rather than blank.
 */
type Entry = Localized | string[];

export const DICTIONARY: Record<string, Entry> = {
  /* ------------------------------------------------------------- actions */
  "action.search": { bn: "খুঁজুন", en: "Search" },
  "action.close": { bn: "বন্ধ করুন", en: "Close" },
  "action.save": { bn: "সংরক্ষণ", en: "Save" },
  "action.share": { bn: "শেয়ার", en: "Share" },
  "action.copied": { bn: "কপি হয়েছে", en: "Copied" },
  "action.signIn": { bn: "প্রবেশ", en: "Sign in" },
  "action.signUp": { bn: "নিবন্ধন", en: "Sign up" },
  "action.signOut": { bn: "প্রস্থান", en: "Sign out" },
  "action.askScholar": { bn: "আলেমকে প্রশ্ন করুন", en: "Ask a scholar" },
  "action.viewAll": { bn: "সব দেখুন", en: "View all" },
  "action.readMore": { bn: "আরও পড়ুন", en: "Read more" },
  "action.previous": { bn: "আগের", en: "Previous" },
  "action.next": { bn: "পরের", en: "Next" },
  "action.retry": { bn: "আবার চেষ্টা করুন", en: "Try again" },
  "action.open": { bn: "খুলুন", en: "Open" },

  /* --------------------------------------------------------------- labels */
  "label.yourFeed": { bn: "আপনার ফিড", en: "Your feed" },
  "label.helpful": { bn: "সহায়ক", en: "Helpful" },
  "label.answers": { bn: "উত্তর", en: "Answers" },
  "label.references": { bn: "রেফারেন্স", en: "References" },
  "label.verified": { bn: "যাচাইকৃত", en: "Verified" },
  "label.surah": { bn: "সূরা", en: "Surah" },
  "label.ayah": { bn: "আয়াত", en: "Ayah" },
  "label.juz": { bn: "পারা", en: "Juz" },
  "label.meccan": { bn: "মাক্কি", en: "Meccan" },
  "label.medinan": { bn: "মাদানি", en: "Medinan" },
  "label.ruing": { bn: "অভিমত", en: "Ruling" },
  "label.fatwa": { bn: "ফতোয়া", en: "Fatwa" },
  "label.answer": { bn: "উত্তর", en: "Answer" },
  "label.article": { bn: "প্রবন্ধ", en: "Article" },
  "label.question": { bn: "প্রশ্ন", en: "Question" },
  "label.discussion": { bn: "আলোচনা", en: "Discussion" },
  "label.translation": { bn: "অর্থ", en: "Translation" },
  "label.transliteration": { bn: "উচ্চারণ", en: "Transliteration" },
  "label.tafsir": { bn: "তাফসির", en: "Tafsir" },
  "label.lesson": { bn: "শিক্ষা", en: "Lesson" },
  "label.narrator": { bn: "বর্ণনাকারী", en: "Narrator" },
  "label.grade": { bn: "মান", en: "Grade" },
  "label.about": { bn: "সম্পর্কে", en: "About" },
  "label.revelation": { bn: "অবতীর্ণ", en: "Revelation" },
  "label.times": { bn: "বার", en: "Times" },

  /* ---------------------------------------------------------- navigation */
  "nav.menu": { bn: "মেনু", en: "Menu" },
  "nav.home": { bn: "হোম", en: "Home" },
  "nav.quran": { bn: "কুরআন", en: "Quran" },
  "nav.hadith": { bn: "হাদীস", en: "Hadith" },
  "nav.library": { bn: "লাইব্রেরি", en: "Library" },
  "nav.articles": { bn: "প্রবন্ধ", en: "Articles" },
  "nav.fatwas": { bn: "ফতোয়া", en: "Fatwas" },
  "nav.questions": { bn: "প্রশ্নোত্তর", en: "Q&A" },
  "nav.discussions": { bn: "আলোচনা", en: "Discussions" },
  "nav.scholars": { bn: "আলেম ও মুফতি", en: "Scholars" },
  "nav.daily": { bn: "দৈনিক আয়াত", en: "Daily Ayah" },
  "nav.duas": { bn: "দুআ ও জিকির", en: "Duas & Dhikr" },
  "nav.journey": { bn: "শিক্ষা যাত্রা", en: "Learning Journey" },
  "nav.topics": { bn: "বিষয়সমূহ", en: "Topics" },
  "nav.profile": { bn: "প্রোফাইল", en: "Profile" },
  "nav.settings": { bn: "সেটিংস", en: "Settings" },
  "nav.notifications": { bn: "বিজ্ঞপ্তি", en: "Notifications" },
  "nav.learn": { bn: "জ্ঞান অর্জন", en: "Learn" },
  "nav.askDiscuss": { bn: "প্রশ্ন ও আলোচনা", en: "Ask & Discuss" },
  "nav.myPractice": { bn: "আমার চর্চা", en: "My Practice" },

  /* --------------------------------------------------------------- groups */
  "group.today": { bn: "আজকের জন্য", en: "For today" },
  "group.knowledgeFlow": { bn: "জ্ঞানের ধারা", en: "Knowledge flow" },
  "group.browse": { bn: "ব্রাউজ", en: "Browse" },

  /* ----------------------------------------------------------------- home */
  "home.greetingMorning": { bn: "শুভ সকাল", en: "Good morning" },
  "home.greetingAfternoon": { bn: "শুভ অপরাহ্ন", en: "Good afternoon" },
  "home.greetingEvening": { bn: "শুভ সন্ধ্যা", en: "Good evening" },
  "home.greetingNight": { bn: "শুভ রাত্রি", en: "Good evening" },
  "home.followedScholars": { bn: "আপনার অনুসরণ করা আলেমগণ", en: "Scholars you follow" },
  "home.askPlaceholder": { bn: "আপনার প্রশ্ন লিখুন, আলেম উত্তর দেবেন…", en: "Write your question, a scholar will answer…" },
  "home.newPosts": { bn: "টি নতুন পোস্ট", en: "new posts" },
  "home.feedEnd": {
    bn: "ফিড এখানেই শেষ — নতুন উত্তর বা প্রবন্ধ এলে এখানে দেখা যাবে।",
    en: "That is the end of the feed — new answers and articles will appear here.",
  },
  "home.newCount": { bn: "টি নতুন", en: "new" },

  /* --------------------------------------------------------------- quran */
  "quran.title": { bn: "আল-কুরআনুল কারীম", en: "The Noble Qur'an" },
  "quran.subtitle": {
    bn: "সূরাগুলো শেষ করার পর সূরা তালিকা থেকে পড়া শুরু করুন — অর্থ, উচ্চারণ ও তাফসিরসহ।",
    en: "Browse the surahs with translation, transliteration and tafsir.",
  },
  "quran.notAdded": {
    bn: "এই সূরার সম্পূর্ণ টেক্সট এখনো যোগ করা হয়নি।",
    en: "This surah's full text has not been added yet.",
  },
  "quran.searchSurah": { bn: "সূরা খুঁজুন", en: "Search surahs" },

  /* -------------------------------------------------------------- hadith */
  "hadith.title": { bn: "হাদীস সংকলন", en: "Hadith collections" },
  "hadith.subtitle": {
    bn: "বিশুদ্ধ সংকলন থেকে বাছাই করা হাদীস — সনদ ও মানসহ।",
    en: "Selected narrations from the authentic collections, with grade and reference.",
  },

  /* ---------------------------------------------------------------- duas */
  "duas.title": { bn: "দুআ ও জিকির", en: "Duas & Dhikr" },
  "duas.subtitle": {
    bn: "প্রতিদিনের মুহূর্তগুলোকে ঘিরে সাজানো দুআ — অর্থ ও ফজিলতসহ।",
    en: "Daily duas arranged by occasion, with meaning and virtue.",
  },

  /* --------------------------------------------------------------- daily */
  "daily.title": { bn: "আজকের জন্য", en: "For today" },
  "daily.subtitle": {
    bn: "আজকের আয়াত, হাদীস ও দুআ এক জায়গায়।",
    en: "Today's ayah, hadith and dua in one place.",
  },
  "daily.prayerTimes": { bn: "নামাজের সময়সূচি", en: "Prayer times" },
  "daily.nextPrayer": { bn: "পরবর্তী নামাজ", en: "Next prayer" },
  "daily.qibla": { bn: "কিবলা দিক", en: "Qibla direction" },

  /* -------------------------------------------------------------- topics */
  "topics.title": { bn: "বিষয়সমূহ", en: "Topics" },
  "topics.subtitle": { bn: "বিষয় অনুযায়ী জ্ঞান খুঁজুন।", en: "Explore knowledge by topic." },

  /* ------------------------------------------------------------ scholars */
  "scholars.title": { bn: "আলেম ও মুফতি", en: "Scholars & Muftis" },
  "scholars.subtitle": { bn: "যাচাইকৃত আলেমদের তালিকা।", en: "Verified scholars of the platform." },

  /* ------------------------------------------------------------- library */
  "library.title": { bn: "আমার লাইব্রেরি", en: "My Library" },
  "library.subtitle": { bn: "সংরক্ষিত আয়াত, হাদীস, প্রবন্ধ ও ফতোয়া।", en: "Saved ayat, hadith, articles and fatwas." },
  "library.collections": { bn: "সংগ্রহ", en: "Collections" },
  "library.continueReading": { bn: "পড়া চালিয়ে যান", en: "Continue reading" },
  "library.empty": { bn: "এখনো কিছু সংরক্ষিত নেই।", en: "Nothing saved yet." },

  /* ------------------------------------------------------------- profile */
  "profile.title": { bn: "প্রোফাইল", en: "Profile" },
  "profile.streak": { bn: "দিনের ধারা", en: "day streak" },
  "profile.following": { bn: "অনুসরণ করছেন", en: "Following" },
  "profile.interests": { bn: "আগ্রহের বিভাগ", en: "Departments of interest" },
  "profile.progress": { bn: "পড়ার অগ্রগতি", en: "Reading progress" },

  /* ------------------------------------------------------- notifications */
  "notifications.title": { bn: "বিজ্ঞপ্তি", en: "Notifications" },
  "notifications.markAll": { bn: "সব পড়া হিসেবে চিহ্নিত করুন", en: "Mark all read" },
  "notifications.empty": { bn: "নতুন কোনো বিজ্ঞপ্তি নেই।", en: "No new notifications." },

  /* ------------------------------------------------------------ settings */
  "settings.title": { bn: "সেটিংস", en: "Settings" },
  "settings.appearance": { bn: "অ্যাপের রূপ", en: "Appearance" },
  "settings.language": { bn: "ভাষা", en: "Language" },
  "settings.themeLight": { bn: "উজ্জ্বল", en: "Light" },
  "settings.themeDark": { bn: "অন্ধকার", en: "Dark" },
  "settings.themeSystem": { bn: "সিস্টেম", en: "System" },
  "settings.district": { bn: "জেলা", en: "District" },

  /* ------------------------------------------------------------ compose */
  "compose.title": { bn: "কী করতে চান?", en: "What would you like to do?" },
  "compose.askQuestion": { bn: "নতুন প্রশ্ন", en: "Ask a question" },
  "compose.askQuestionHint": { bn: "আলেমের কাছে প্রশ্ন পাঠান", en: "Send a question to a scholar" },
  "compose.writeArticle": { bn: "প্রবন্ধ লিখুন", en: "Write an article" },
  "compose.writeArticleHint": { bn: "নতুন প্রবন্ধ শুরু করুন", en: "Start a new article" },
  "compose.newDiscussion": { bn: "আলোচনা শুরু করুন", en: "Start a discussion" },
  "compose.newDiscussionHint": { bn: "সম্প্রদায়ের সাথে আলোচনা করুন", en: "Discuss with the community" },

  /* ----------------------------------------------------------- misc/framing */
  "frame.searchPlaceholder": { bn: "কুরআন, হাদীস, প্রশ্ন খুঁজুন…", en: "Search Quran, Hadith, questions…" },
  "frame.all": { bn: "সব", en: "All" },
  "frame.results": { bn: "ফলাফল", en: "results" },
  "frame.noResults": { bn: "কিছু পাওয়া যায়নি।", en: "Nothing found." },
  "frame.offline": { bn: "ইন্টারনেট সংযোগ নেই।", en: "No internet connection." },
};

/** Keys that hold a list rather than a phrase. */
const LIST_KEYS = new Set<string>();

/** Translate an interface key, interpolating `{var}` placeholders. */
export function translate(
  key: string,
  locale: Locale = "bn",
  vars?: Record<string, string | number>,
): string {
  const entry = DICTIONARY[key];
  let value: string;
  if (!entry) value = key;
  else if (Array.isArray(entry)) value = entry[0] ?? key;
  else value = entry[locale] ?? entry.bn;

  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${name}\\}`, "g"), String(replacement));
    }
  }
  return value;
}

export function translateList(key: string, locale: Locale = "bn"): string[] {
  const entry = DICTIONARY[key];
  if (!Array.isArray(entry)) return [];
  return entry;
}

export function hasList(key: string) {
  return LIST_KEYS.has(key);
}

/** Resolve a bilingual data field, falling back to Bangla. */
export function pickLocale(
  value: Localized | undefined,
  locale: Locale = "bn",
  fallback = "",
): string {
  if (!value) return fallback;
  return value[locale] || value.bn || fallback;
}

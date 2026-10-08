/**
 * The dua collection.
 *
 * A dua is the most *used* knowledge in the app and was the least served: nine
 * of them lived inside the daily page's fixture with no source, no search and no
 * place of their own, so a reader who wanted the dua for travelling had to
 * remember it was on the daily page somewhere. They are now a collection with
 * the same shape as the rest of the library — categories by occasion, a source
 * on every entry, and a search of their own.
 *
 * Two rules hold everywhere in this file. Nothing is included without a
 * reference, and the Bangla is a translation of the Arabic rather than a
 * paraphrase of it. Where a source states a virtue or a count, it is recorded
 * beside the dua instead of being mixed into the translation — a reader should
 * be able to tell what the Prophet ﷺ said from what it means.
 */

import type { Dua, DuaCategory } from "../types";
import { getTodayIndex } from "./daily";

/** Occasion groups, ordered as a day is lived: night, prayer, food, then the rest. */
export const DUA_CATEGORIES: DuaCategory[] = [
  {
    id: "cat-sleep",
    slug: "sleep",
    name: { bn: "ঘুম ও রাত", en: "Sleep & Night" },
    description: {
      bn: "শোবার আগে ও ঘুম থেকে উঠে পড়ার দুআ — রাতের যিকিরসহ",
      en: "For lying down and for waking, with the night's dhikr",
    },
    icon: "MoonStar",
    tone: "accent",
  },
  {
    id: "cat-salah",
    slug: "salah",
    name: { bn: "নামাজ ও জিকির", en: "Salah & Dhikr" },
    description: {
      bn: "নামাজের ভেতরে ও পরে পড়ার দুআ ও তাসবিহ",
      en: "Duas and tasbih for during and after the prayer",
    },
    icon: "Sparkles",
    tone: "primary",
  },
  {
    id: "cat-food",
    slug: "food",
    name: { bn: "খাবার ও পানীয়", en: "Food & Drink" },
    description: {
      bn: "খাওয়ার আগে-পরে এবং রোজার ইফতারের দুআ",
      en: "Before and after eating, and for breaking the fast",
    },
    icon: "Utensils",
    tone: "success",
  },
  {
    id: "cat-travel",
    slug: "travel",
    name: { bn: "সফর", en: "Travel" },
    description: {
      bn: "যানবাহনে ওঠা, রওনা হওয়া ও ফিরে আসার দুআ",
      en: "For boarding, setting out and coming home",
    },
    icon: "Plane",
    tone: "info",
  },
  {
    id: "cat-health",
    slug: "health",
    name: { bn: "অসুস্থতা ও শিফা", en: "Illness & Healing" },
    description: {
      bn: "রোগীর জন্য দুআ, ব্যথার স্থানে পড়ার দুআ ও সুরক্ষার কালিমা",
      en: "For the sick, for pain, and protective words",
    },
    icon: "HeartPulse",
    tone: "danger",
  },
  {
    id: "cat-knowledge",
    slug: "knowledge",
    name: { bn: "জ্ঞান ও পড়াশোনা", en: "Knowledge & Study" },
    description: {
      bn: "ইলম বৃদ্ধি, বক্ষ প্রশস্ততা ও পরীক্ষার প্রস্তুতির দুআ",
      en: "For more knowledge, a calm heart, and study",
    },
    icon: "BookOpen",
    tone: "primary",
  },
  {
    id: "cat-distress",
    slug: "distress",
    name: { bn: "দুশ্চিন্তা ও বিপদ", en: "Distress & Protection" },
    description: {
      bn: "হতাশা, ঋণ, ভয় ও কঠিন সময়ের দুআ",
      en: "For anxiety, debt, fear and hard moments",
    },
    icon: "LifeBuoy",
    tone: "warning",
  },
  {
    id: "cat-daily",
    slug: "daily",
    name: { bn: "দৈনন্দিন দুআ", en: "Everyday" },
    description: {
      bn: "ঘর থেকে বেরোনো, ঘরে ঢোকা, পোশাক ও বৃষ্টির দুআ",
      en: "Leaving and entering home, clothing and rain",
    },
    icon: "Home",
    tone: "accent",
  },
];

export const DUAS: Dua[] = [
  /* ------------------------------------------------------------- sleep ---- */
  {
    id: "dua-sleep",
    slug: "sleep-before-sleeping",
    categorySlug: "sleep",
    title: { bn: "শোবার আগের দুআ", en: "Before sleeping" },
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliterationBn: "বিসমিকা আল্লাহুম্মা আমুতু ওয়া আহইয়া",
    meaning: {
      bn: "হে আল্লাহ, আপনার নামেই আমি মরি এবং বাঁচি।",
      en: "In Your name, O Allah, I die and I live.",
    },
    reference: { bn: "সহীহ বুখারী ৬৩২৪", en: "Sahih al-Bukhari 6324" },
    occasion: { bn: "শয্যায় শোবার আগে", en: "Before lying down to sleep" },
    tags: ["ঘুম", "রাত", "শোয়া", "sleep", "night"],
  },
  {
    id: "dua-wake",
    slug: "waking-up",
    categorySlug: "sleep",
    title: { bn: "ঘুম থেকে ওঠার দুআ", en: "On waking up" },
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliterationBn: "আলহামদুলিল্লাহিল্লাযি আহইয়ানা বা'দা মা আমাতানা ওয়া ইলাইহিন নুশুর",
    meaning: {
      bn: "সকল প্রশংসা আল্লাহর, যিনি আমাদের মৃত্যুর পর জীবিত করেছেন এবং তাঁর কাছেই প্রত্যাবর্তন।",
      en: "All praise is for Allah who gave us life after He had caused us to die, and to Him is the return.",
    },
    reference: { bn: "সহীহ বুখারী ৬৩১২", en: "Sahih al-Bukhari 6312" },
    occasion: { bn: "সকালে ঘুম থেকে উঠে", en: "On waking in the morning" },
    tags: ["ঘুম", "সকাল", "ওঠা", "wake", "morning"],
  },
  {
    id: "dua-sleep-tasbih",
    slug: "night-tasbih",
    categorySlug: "sleep",
    title: { bn: "শোবার আগের তাসবিহ", en: "The night's tasbih" },
    arabic: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَاللَّهُ أَكْبَرُ",
    transliterationBn: "সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার",
    meaning: {
      bn: "আল্লাহ পবিত্র, সকল প্রশংসা আল্লাহর, আল্লাহ সর্বশ্রেষ্ঠ।",
      en: "Glory be to Allah, all praise is for Allah, and Allah is the greatest.",
    },
    reference: { bn: "সহীহ বুখারী ৬৩১৮", en: "Sahih al-Bukhari 6318" },
    occasion: { bn: "শয্যায় শোবার আগে", en: "Before sleeping" },
    repeat: { bn: "প্রতিটি ৩৩ বার, তাকবির ৩৪ বার", en: "33 times each, and takbir 34 times" },
    virtue: {
      bn: "নবীজি ﷺ ফাতিমা (রা.)-কে এটি শিখিয়েছিলেন এবং বলেছিলেন, ঘরের কাজে সাহায্যের চেয়ে এটি তোমার জন্য উত্তম।",
      en: "The Prophet ﷺ taught this to Fatimah (ra) and said it was better for her than a servant for the household work.",
    },
    tags: ["তাসবিহ", "রাত", "ঘুম", "tasbih", "dhikr"],
  },

  /* ------------------------------------------------------------- salah ---- */
  {
    id: "dua-after-salah",
    slug: "after-the-prayer",
    categorySlug: "salah",
    title: { bn: "নামাজ শেষের দুআ", en: "After the prayer" },
    arabic:
      "أَسْتَغْفِرُ اللَّهَ، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliterationBn:
      "আস্তাগফিরুল্লাহ (৩ বার)। আল্লাহুম্মা আনতাস সালাম, ওয়া মিনকাস সালাম, তাবারকতা ইয়া যাল জালালি ওয়াল ইকরাম",
    meaning: {
      bn: "আমি আল্লাহর কাছে ক্ষমা চাই। হে আল্লাহ, আপনি শান্তির উৎস, আপনার কাছ থেকেই শান্তি আসে। আপনি বরকতময়, হে মহিমা ও সম্মানের অধিকারী।",
      en: "I seek Allah's forgiveness. O Allah, You are Peace and from You comes peace. Blessed are You, Owner of majesty and honour.",
    },
    reference: { bn: "সহীহ মুসলিম ৫৯১", en: "Sahih Muslim 591" },
    occasion: { bn: "ফরজ নামাজ শেষ করে", en: "Right after the obligatory prayer" },
    repeat: { bn: "আস্তাগফিরুল্লাহ তিনবার", en: "Istighfar three times" },
    tags: ["নামাজ", "ইস্তিগফার", "নামাজের পর", "salah", "istighfar"],
  },
  {
    id: "dua-sajdah",
    slug: "in-sujud",
    categorySlug: "salah",
    title: { bn: "সিজদার তাসবিহ", en: "In sujud" },
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    transliterationBn: "সুবহানা রাব্বিয়াল আ'লা",
    meaning: {
      bn: "আমার সর্বোচ্চ প্রতিপালক পবিত্র।",
      en: "Glory be to my Lord, the Most High.",
    },
    reference: { bn: "সহীহ মুসলিম ৭৭২", en: "Sahih Muslim 772" },
    occasion: { bn: "প্রতিটি সিজদায়", en: "In every prostration" },
    repeat: { bn: "ন্যূনতম তিনবার", en: "At least three times" },
    tags: ["সিজদা", "নামাজ", "তাসবিহ", "sujud", "salah"],
  },
  {
    id: "dua-dhikr-after-salah",
    slug: "dhikr-after-salah",
    categorySlug: "salah",
    title: { bn: "নামাজের পর জিকিরের দুআ", en: "Du'a for keeping up dhikr" },
    arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    transliterationBn: "আল্লাহুম্মা আ'ইন্নি আলা যিকরিকা ওয়া শুকরিকা ওয়া হুসনি ইবাদাতিকা",
    meaning: {
      bn: "হে আল্লাহ, আপনার জিকির, আপনার শোকর ও সুন্দরভাবে আপনার ইবাদত করার ব্যাপারে আমাকে সাহায্য করুন।",
      en: "O Allah, help me to remember You, to thank You, and to worship You well.",
    },
    reference: { bn: "সুনানে আবু দাউদ ১৫২২", en: "Sunan Abi Dawud 1522" },
    occasion: { bn: "প্রতি নামাজের শেষে মুয়াজ (রা.)-কে শেখানো দুআ", en: "Taught to Mu'adh (ra) after every prayer" },
    tags: ["জিকির", "নামাজ", "শোকর", "dhikr", "gratitude"],
  },

  /* -------------------------------------------------------------- food ---- */
  {
    id: "dua-eat-before",
    slug: "before-eating",
    categorySlug: "food",
    title: { bn: "খাওয়ার আগের দুআ", en: "Before eating" },
    arabic: "بِسْمِ اللَّهِ",
    transliterationBn: "বিসমিল্লাহ",
    meaning: { bn: "আল্লাহর নামে (শুরু করছি)।", en: "In the name of Allah." },
    reference: { bn: "সুনানে আবু দাউদ ৩৭৬৭", en: "Sunan Abi Dawud 3767" },
    occasion: { bn: "খাবার শুরু করার আগে", en: "Before starting to eat" },
    virtue: {
      bn: "শুরুতে বিসমিল্লাহ ভুলে গেলে বলুন: বিসমিল্লাহি আউয়ালাহু ওয়া আখিরাহ।",
      en: "If you forget at the start, say: Bismillahi awwalahu wa akhirahu.",
    },
    tags: ["খাবার", "বিসমিল্লাহ", "খাওয়া", "food", "bismillah"],
  },
  {
    id: "dua-eat-after",
    slug: "after-eating",
    categorySlug: "food",
    title: { bn: "খাওয়ার পরের দুআ", en: "After eating" },
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliterationBn:
      "আলহামদুলিল্লাহিল্লাযি আত'আমানি হাযা ওয়া রাযাকানিহি মিন গাইরি হাউলিন মিন্নি ওয়া লা কুওয়াহ",
    meaning: {
      bn: "সকল প্রশংসা আল্লাহর, যিনি আমাকে এই খাবার দিয়েছেন এবং আমার কোনো শক্তি-সামর্থ্য ছাড়াই এটি রিযিক হিসেবে দান করেছেন।",
      en: "All praise is for Allah who fed me this and provided it to me without any power or strength of my own.",
    },
    reference: { bn: "সুনানে তিরমিযী ৩৪৫৮", en: "Jami' at-Tirmidhi 3458" },
    occasion: { bn: "খাওয়া শেষ করে", en: "After finishing a meal" },
    virtue: {
      bn: "যে ব্যক্তি খাবারের পর এটি পড়ে, তার পূর্বের গুনাহ ক্ষমা করে দেওয়া হয়।",
      en: "Whoever says this after eating is forgiven for what came before.",
    },
    tags: ["খাবার", "শোকর", "আলহামদুলিল্লাহ", "food", "gratitude"],
  },
  {
    id: "dua-iftar",
    slug: "after-iftar",
    categorySlug: "food",
    title: { bn: "ইফতারের পরের দুআ", en: "After breaking the fast" },
    arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
    transliterationBn: "যাহাবাজ জামা' ওয়াবতাল্লাতিল উরুকু ওয়া ছাবাতাল আজরু ইনশাআল্লাহ",
    meaning: {
      bn: "পিপাসা দূর হলো, শিরা-উপশিরা সিক্ত হলো এবং আল্লাহ চাইলে প্রতিদান নিশ্চিত হলো।",
      en: "The thirst is gone, the veins are moistened, and the reward is certain, if Allah wills.",
    },
    reference: { bn: "সুনানে আবু দাউদ ২৩৫৭", en: "Sunan Abi Dawud 2357" },
    occasion: { bn: "রোজার ইফতারের পর", en: "After breaking a fast" },
    tags: ["রোজা", "ইফতার", "রমজান", "fasting", "iftar", "ramadan"],
  },

  /* ------------------------------------------------------------ travel ---- */
  {
    id: "dua-travel",
    slug: "boarding-a-vehicle",
    categorySlug: "travel",
    title: { bn: "যানবাহনে ওঠার দুআ", en: "Boarding a vehicle" },
    arabic:
      "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliterationBn:
      "সুবহানাল্লাযি সাখখারা লানা হাযা ওয়া মা কুন্না লাহু মুকরিনিন, ওয়া ইন্না ইলা রাব্বিনা লামুনকালিবুন",
    meaning: {
      bn: "পবিত্র সেই সত্তা, যিনি এটি আমাদের অধীন করেছেন, অথচ আমরা এটিকে বশ করতে সক্ষম ছিলাম না। আর নিশ্চয়ই আমরা আমাদের প্রতিপালকের কাছে ফিরে যাব।",
      en: "Glory to Him who made this subservient to us, though we could not have subdued it, and indeed to our Lord we shall return.",
    },
    reference: { bn: "সূরা আয-যুখরুফ ৪৩:১৩-১৪ · সহীহ মুসলিম ১৩৪২", en: "Surah Az-Zukhruf 43:13-14 · Sahih Muslim 1342" },
    occasion: { bn: "গাড়ি, বাস, ট্রেন বা বিমানে ওঠার সময়", en: "When getting into a car, bus, train or plane" },
    tags: ["সফর", "যানবাহন", "গাড়ি", "travel", "vehicle"],
  },
  {
    id: "dua-travel-set-out",
    slug: "setting-out-on-a-journey",
    categorySlug: "travel",
    title: { bn: "সফরে রওনা হওয়ার দুআ", en: "Setting out on a journey" },
    arabic:
      "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى",
    transliterationBn:
      "আল্লাহুম্মা ইন্না নাসআলুকা ফি সাফারিনা হাযাল বিররা ওয়াত তাকওয়া, ওয়া মিনাল আমালি মা তারদা",
    meaning: {
      bn: "হে আল্লাহ, এই সফরে আমরা আপনার কাছে নেকি ও তাকওয়া চাই, আর এমন আমল চাই যা আপনি পছন্দ করেন।",
      en: "O Allah, we ask You on this journey for righteousness and piety, and for deeds that please You.",
    },
    reference: { bn: "সহীহ মুসলিম ১৩৪২", en: "Sahih Muslim 1342" },
    occasion: { bn: "সফর শুরু করার সময়", en: "When beginning a journey" },
    tags: ["সফর", "তাকওয়া", "রওনা", "travel", "journey"],
  },
  {
    id: "dua-travel-return",
    slug: "returning-from-a-journey",
    categorySlug: "travel",
    title: { bn: "সফর থেকে ফেরার দুআ", en: "Returning from a journey" },
    arabic: "آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ",
    transliterationBn: "আয়িবুনা, তায়িবুনা, আবিদুনা, লিরাব্বিনা হামিদুন",
    meaning: {
      bn: "আমরা ফিরছি, তওবা করছি, ইবাদত করছি এবং আমাদের প্রতিপালকের প্রশংসা করছি।",
      en: "We return, we repent, we worship, and to our Lord we give praise.",
    },
    reference: { bn: "সহীহ মুসলিম ১৩৪৪", en: "Sahih Muslim 1344" },
    occasion: { bn: "সফর শেষে ঘরে ফেরার পথে", en: "On the way back at the end of a journey" },
    tags: ["সফর", "ফেরা", "তওবা", "travel", "return"],
  },

  /* ------------------------------------------------------------ health ---- */
  {
    id: "dua-illness",
    slug: "for-the-sick",
    categorySlug: "health",
    title: { bn: "অসুস্থ ব্যক্তির জন্য দুআ", en: "For a sick person" },
    arabic: "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ",
    transliterationBn: "আসআলুল্লাহাল আযীম, রাব্বাল আরশিল আযীম, আন ইয়াশফিয়াক",
    meaning: {
      bn: "আমি মহান আল্লাহ, মহান আরশের প্রতিপালকের কাছে আপনার শিফা কামনা করছি।",
      en: "I ask Allah the Almighty, Lord of the Mighty Throne, to heal you.",
    },
    reference: { bn: "সুনানে তিরমিযী ২০৮৩ · সুনানে আবু দাউদ ৩১০৬", en: "Jami' at-Tirmidhi 2083 · Sunan Abi Dawud 3106" },
    occasion: { bn: "অসুস্থ ব্যক্তির পাশে গিয়ে", en: "When visiting someone who is ill" },
    repeat: { bn: "সাতবার", en: "Seven times" },
    virtue: {
      bn: "রোগী সুস্থ না হওয়ার আগেই সাতবার পড়া হয় না — অসুস্থ ব্যক্তির পাশে দাঁড়িয়ে পড়তে হয়।",
      en: "It is said before the sick person; the Prophet ﷺ said whoever does so will be cured.",
    },
    tags: ["অসুস্থ", "শিফা", "রোগ", "illness", "healing", "shifa"],
  },
  {
    id: "dua-pain",
    slug: "when-in-pain",
    categorySlug: "health",
    title: { bn: "শরীরে ব্যথা হলে", en: "When something hurts" },
    arabic: "أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ",
    transliterationBn: "আউযু বিল্লাহি ওয়া কুদরাতিহি মিন শাররি মা আজিদু ওয়া উহাযির",
    meaning: {
      bn: "আমি আল্লাহ ও তাঁর কুদরতের কাছে সেই কষ্ট থেকে আশ্রয় চাই যা আমি পাচ্ছি এবং যার ভয় করছি।",
      en: "I seek refuge with Allah and His power from the harm I feel and fear.",
    },
    reference: { bn: "সহীহ মুসলিম ২২০২", en: "Sahih Muslim 2202" },
    occasion: { bn: "ব্যথার জায়গায় হাত রেখে বিসমিল্লাহ তিনবার, তারপর এই দুআ", en: "Hand on the pain, say Bismillah three times, then this" },
    repeat: { bn: "বিসমিল্লাহ ৩ বার, দুআ ৭ বার", en: "Bismillah 3 times, the du'a 7 times" },
    tags: ["ব্যথা", "সুস্থতা", "রুকইয়াহ", "pain", "health"],
  },
  {
    id: "dua-protection-words",
    slug: "protective-words",
    categorySlug: "health",
    title: { bn: "সকাল-সন্ধ্যার সুরক্ষার কালিমা", en: "Morning and evening protection" },
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliterationBn: "আউযু বিকালিমাতিল্লাহিত তাম্মাতি মিন শাররি মা খালাক",
    meaning: {
      bn: "আমি আল্লাহর পূর্ণ কালিমার মাধ্যমে তাঁর সৃষ্টির অনিষ্ট থেকে আশ্রয় চাই।",
      en: "I seek refuge in Allah's perfect words from the evil of what He created.",
    },
    reference: { bn: "সহীহ মুসলিম ২৭০৮", en: "Sahih Muslim 2708" },
    occasion: { bn: "সন্ধ্যায় (সকালেও) তিনবার — সাপ-বিচ্ছু বা ক্ষতির আশঙ্কায়", en: "Three times in the evening — against bites and harm" },
    repeat: { bn: "তিনবার", en: "Three times" },
    tags: ["সুরক্ষা", "সকাল", "সন্ধ্যা", "protection", "ruqyah"],
  },

  /* --------------------------------------------------------- knowledge ---- */
  {
    id: "dua-knowledge",
    slug: "for-more-knowledge",
    categorySlug: "knowledge",
    title: { bn: "জ্ঞান বৃদ্ধির দুআ", en: "For more knowledge" },
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliterationBn: "রাব্বি যিদনি ইলমা",
    meaning: {
      bn: "হে আমার প্রতিপালক, আমার জ্ঞান বাড়িয়ে দিন।",
      en: "My Lord, increase me in knowledge.",
    },
    reference: { bn: "সূরা ত্বা-হা ২০:১১৪", en: "Surah Ta-Ha 20:114" },
    occasion: { bn: "পড়াশোনার আগে ও প্রতি ফরজ নামাজের পর", en: "Before study and after every obligatory prayer" },
    tags: ["জ্ঞান", "পড়া", "ইলম", "knowledge", "study"],
  },
  {
    id: "dua-before-exam",
    slug: "before-a-hard-task",
    categorySlug: "knowledge",
    title: { bn: "পরীক্ষা বা কঠিন কাজের আগে", en: "Before an exam or a hard task" },
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    transliterationBn: "রাব্বিশরাহলি সাদরি ওয়া ইয়াসসিরলি আমরি",
    meaning: {
      bn: "হে আমার প্রতিপালক, আমার বক্ষ প্রশস্ত করুন এবং আমার কাজ সহজ করুন।",
      en: "My Lord, expand my chest and make my task easy for me.",
    },
    reference: { bn: "সূরা ত্বা-হা ২০:২৫-২৬", en: "Surah Ta-Ha 20:25-26" },
    occasion: { bn: "পরীক্ষা, সাক্ষাৎকার বা কঠিন সিদ্ধান্তের আগে", en: "Before an exam, an interview or a hard decision" },
    tags: ["পরীক্ষা", "পড়াশোনা", "সহজ", "exam", "study"],
  },
  {
    id: "dua-beneficial-knowledge",
    slug: "beneficial-knowledge",
    categorySlug: "knowledge",
    title: { bn: "উপকারী জ্ঞান ও পবিত্র রিযিকের দুআ", en: "For beneficial knowledge" },
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا",
    transliterationBn: "আল্লাহুম্মা ইন্নি আসআলুকা ইলমান নাফি'আ, ওয়া রিযকান তাইয়িবা, ওয়া আমালান মুতাকাব্বালা",
    meaning: {
      bn: "হে আল্লাহ, আমি আপনার কাছে উপকারী জ্ঞান, পবিত্র রিযিক এবং কবুলযোগ্য আমল চাই।",
      en: "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.",
    },
    reference: { bn: "সুনানে ইবনে মাজাহ ৯২৫", en: "Sunan Ibn Majah 925" },
    occasion: { bn: "ফজরের নামাজের পর", en: "After the Fajr prayer" },
    tags: ["জ্ঞান", "রিযিক", "আমল", "knowledge", "rizq"],
  },

  /* ---------------------------------------------------------- distress ---- */
  {
    id: "dua-distress",
    slug: "in-distress",
    categorySlug: "distress",
    title: { bn: "বিপদে পড়ার দুআ", en: "In distress" },
    arabic:
      "لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
    transliterationBn:
      "লা ইলাহা ইল্লাল্লাহুল আযীমুল হালীম, লা ইলাহা ইল্লাল্লাহু রাব্বুল আরশিল আযীম, লা ইলাহা ইল্লাল্লাহু রাব্বুস সামাওয়াতি ওয়া রাব্বুল আরদি ওয়া রাব্বুল আরশিল কারীম",
    meaning: {
      bn: "মহান ও সহনশীল আল্লাহ ছাড়া কোনো উপাস্য নেই; মহান আরশের প্রতিপালক আল্লাহ ছাড়া কোনো উপাস্য নেই; আসমান-জমিন ও সম্মানিত আরশের প্রতিপালক আল্লাহ ছাড়া কোনো উপাস্য নেই।",
      en: "There is no god but Allah, the Mighty, the Forbearing; no god but Allah, Lord of the Mighty Throne; no god but Allah, Lord of the heavens, the earth and the Noble Throne.",
    },
    reference: { bn: "সহীহ বুখারী ৬৩৪৫", en: "Sahih al-Bukhari 6345" },
    occasion: { bn: "বড় বিপদ বা কঠিন সময়ে", en: "In a serious difficulty" },
    tags: ["বিপদ", "দুশ্চিন্তা", "কষ্ট", "distress", "hardship"],
  },
  {
    id: "dua-anxiety",
    slug: "anxiety-and-sorrow",
    categorySlug: "distress",
    title: { bn: "দুশ্চিন্তা, দুঃখ ও ঋণের দুআ", en: "For anxiety, sorrow and debt" },
    arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
    transliterationBn:
      "আল্লাহুম্মা ইন্নি আউযু বিকা মিনাল হাম্মি ওয়াল হাযান, ওয়াল আজযি ওয়াল কাসাল, ওয়াল বুখলি ওয়াল জুবন, ওয়া দালা'ইদ দাইনি ওয়া কাহরির রিজাল",
    meaning: {
      bn: "হে আল্লাহ, আমি আপনার কাছে দুশ্চিন্তা ও দুঃখ, অক্ষমতা ও অলসতা, কৃপণতা ও ভীরুতা, ঋণের বোঝা এবং মানুষের প্রভাব থেকে আশ্রয় চাই।",
      en: "O Allah, I seek refuge with You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debt, and being overpowered by others.",
    },
    reference: { bn: "সহীহ বুখারী ২৮৯৩", en: "Sahih al-Bukhari 2893" },
    occasion: { bn: "সকাল-সন্ধ্যা এবং দুশ্চিন্তার সময়", en: "Morning and evening, and in moments of worry" },
    tags: ["দুশ্চিন্তা", "দুঃখ", "ঋণ", "anxiety", "debt"],
  },
  {
    id: "dua-hasbunallah",
    slug: "relying-on-allah",
    categorySlug: "distress",
    title: { bn: "ভয়ের সময় আল্লাহর উপর ভরসা", en: "Trusting Allah when afraid" },
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliterationBn: "হাসবুনাল্লাহু ওয়া নি'মাল ওয়াকিল",
    meaning: {
      bn: "আল্লাহই আমাদের জন্য যথেষ্ট, তিনি কতই না উত্তম কর্মবিধায়ক।",
      en: "Allah is sufficient for us, and He is the best disposer of affairs.",
    },
    reference: { bn: "সূরা আলে ইমরান ৩:১৭৩ · সহীহ বুখারী ৪৫৬৩", en: "Surah Ali 'Imran 3:173 · Sahih al-Bukhari 4563" },
    occasion: { bn: "ভয়, হুমকি বা বড় সিদ্ধান্তের মুখে", en: "When afraid, threatened or facing a big decision" },
    tags: ["ভরসা", "ভয়", "তাওয়াক্কুল", "trust", "fear"],
  },

  /* ------------------------------------------------------------- daily ---- */
  {
    id: "dua-leaving-home",
    slug: "leaving-the-house",
    categorySlug: "daily",
    title: { bn: "ঘর থেকে বেরোনোর দুআ", en: "Leaving the house" },
    arabic: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliterationBn: "বিসমিল্লাহ, তাওয়াক্কালতু আলাল্লাহ, ওয়া লা হাউলা ওয়া লা কুওয়াতা ইল্লা বিল্লাহ",
    meaning: {
      bn: "আল্লাহর নামে বের হচ্ছি, আল্লাহর উপরই ভরসা করলাম; আল্লাহর সাহায্য ছাড়া কোনো শক্তি ও সামর্থ্য নেই।",
      en: "In Allah's name, I place my trust in Allah; there is no power or strength except with Allah.",
    },
    reference: { bn: "সুনানে তিরমিযী ৩৪২৬", en: "Jami' at-Tirmidhi 3426" },
    occasion: { bn: "ঘর থেকে বেরোনোর সময়", en: "When stepping out of the house" },
    virtue: {
      bn: "এটি পড়লে বলা হয়: তোমাকে হেদায়েত দেওয়া হয়েছে, রক্ষা করা হয়েছে ও নিরাপদ রাখা হয়েছে।",
      en: "It is said to the one who says it: you are guided, protected and kept safe.",
    },
    tags: ["ঘর", "বেরোনো", "ভরসা", "home", "leaving"],
  },
  {
    id: "dua-entering-home",
    slug: "entering-the-house",
    categorySlug: "daily",
    title: { bn: "ঘরে ঢোকার দুআ", en: "Entering the house" },
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا",
    transliterationBn: "বিসমিল্লাহি ওয়ালাজনা, ওয়া বিসমিল্লাহি খারাজনা, ওয়া আলা রাব্বিনা তাওয়াক্কালনা",
    meaning: {
      bn: "আল্লাহর নামে আমরা প্রবেশ করলাম, আল্লাহর নামেই বের হলাম, এবং আমাদের প্রতিপালকের উপরই ভরসা করলাম।",
      en: "In Allah's name we enter, in Allah's name we leave, and upon our Lord we rely.",
    },
    reference: { bn: "সুনানে আবু দাউদ ৫০৯৬", en: "Sunan Abi Dawud 5096" },
    occasion: { bn: "ঘরে ঢোকার সময়, সঙ্গে সালাম দিয়ে", en: "On entering home, together with the salaam" },
    tags: ["ঘর", "সালাম", "প্রবেশ", "home", "entering"],
  },
  {
    id: "dua-rain",
    slug: "when-it-rains",
    categorySlug: "daily",
    title: { bn: "বৃষ্টির সময়ের দুআ", en: "When it rains" },
    arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا",
    transliterationBn: "আল্লাহুম্মা সাইয়িবান নাফি'আ",
    meaning: {
      bn: "হে আল্লাহ, উপকারী বৃষ্টি দিন।",
      en: "O Allah, make it a beneficial rain.",
    },
    reference: { bn: "সহীহ বুখারী ১০৩২", en: "Sahih al-Bukhari 1032" },
    occasion: { bn: "বৃষ্টি শুরু হলে (বৃষ্টি হবার সময় দুআ কবুল হয়)", en: "When the rain begins — a time when du'a is answered" },
    tags: ["বৃষ্টি", "আবহাওয়া", "রহমত", "rain", "weather"],
  },
  {
    id: "dua-new-clothes",
    slug: "wearing-new-clothes",
    categorySlug: "daily",
    title: { bn: "নতুন পোশাক পরার দুআ", en: "Wearing new clothes" },
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliterationBn: "আলহামদুলিল্লাহিল্লাযি কাসানি হাযাস সাওবা ওয়া রাযাকানিহি মিন গাইরি হাউলিন মিন্নি ওয়া লা কুওয়াহ",
    meaning: {
      bn: "সকল প্রশংসা আল্লাহর, যিনি আমাকে এই পোশাক পরিধান করিয়েছেন এবং আমার কোনো শক্তি-সামর্থ্য ছাড়াই তা দান করেছেন।",
      en: "All praise is for Allah who clothed me in this garment and provided it to me without any power or strength of my own.",
    },
    reference: { bn: "সুনানে আবু দাউদ ৪০২৩", en: "Sunan Abi Dawud 4023" },
    occasion: { bn: "নতুন পোশাক পরার সময়", en: "When putting on a new garment" },
    virtue: {
      bn: "এটি পড়লে পুরনো গুনাহ ক্ষমা করে দেওয়া হয়।",
      en: "Whoever says it has his previous sins forgiven.",
    },
    tags: ["পোশাক", "জামা", "শোকর", "clothing", "gratitude"],
  },
];

/** One dua by slug — the address a saved dua, a link and the palette share. */
export function getDua(slug: string): Dua | undefined {
  return DUAS.find((dua) => dua.slug === slug);
}

export function getDuaCategory(slug: string): DuaCategory | undefined {
  return DUA_CATEGORIES.find((category) => category.slug === slug);
}

export function duasInCategory(slug: string): Dua[] {
  return DUAS.filter((dua) => dua.categorySlug === slug);
}

/**
 * The dua of the day — the one the home strip and the daily page spotlight.
 *
 * Rotation is by the day of the year, shared with the ayah, hadith and dhikr
 * picks, so everything the app calls "today" turns over on the same morning.
 */
export function duaOfToday(date: Date = new Date()): Dua {
  return DUAS[getTodayIndex(DUAS.length, date)];
}

/** Everything the two search boxes match a query against, in one string. */
export function duaSearchText(dua: Dua): string {
  return [
    dua.title.bn,
    dua.title.en,
    dua.meaning.bn,
    dua.meaning.en,
    dua.occasion.bn,
    dua.occasion.en,
    dua.reference.bn,
    dua.reference.en,
    dua.transliterationBn,
    dua.categorySlug,
    ...dua.tags,
  ]
    .join(" ")
    .toLowerCase();
}

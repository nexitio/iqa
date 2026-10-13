import type { Dua, DuaCategory } from "../lib/types";

/**
 * The dua collection (mobile subset).
 *
 * Two rules hold everywhere in this file. Nothing is included without a
 * reference, and the Bangla is a translation of the Arabic rather than a
 * paraphrase of it. Where a source states a virtue or a count, it is recorded
 * beside the dua instead of being mixed into the translation.
 */

/** Occasion groups, ordered as a day is lived: night, prayer, food, then the rest. */
export const DUA_CATEGORIES: DuaCategory[] = [
  {
    id: "cat-sleep",
    slug: "sleep",
    name: { bn: "ঘুম ও রাত", en: "Sleep & Night" },
    description: { bn: "শোবার আগে ও ঘুম থেকে উঠে পড়ার দুআ — রাতের যিকিরসহ", en: "For lying down and for waking, with the night's dhikr" },
    icon: "MoonStar",
    tone: "accent",
  },
  {
    id: "cat-salah",
    slug: "salah",
    name: { bn: "নামাজ ও জিকির", en: "Salah & Dhikr" },
    description: { bn: "নামাজের ভেতরে ও পরে পড়ার দুআ ও তাসবিহ", en: "Duas and tasbih for during and after the prayer" },
    icon: "Sparkles",
    tone: "primary",
  },
  {
    id: "cat-food",
    slug: "food",
    name: { bn: "খাবার ও পানীয়", en: "Food & Drink" },
    description: { bn: "খাওয়ার আগে-পরে এবং রোজার ইফতারের দুআ", en: "Before and after eating, and for breaking the fast" },
    icon: "Utensils",
    tone: "success",
  },
  {
    id: "cat-travel",
    slug: "travel",
    name: { bn: "সফর", en: "Travel" },
    description: { bn: "যানবাহনে ওঠা, রওনা হওয়া ও ফিরে আসার দুআ", en: "For boarding, setting out and coming home" },
    icon: "Plane",
    tone: "info",
  },
  {
    id: "cat-health",
    slug: "health",
    name: { bn: "অসুস্থতা ও শিফা", en: "Illness & Healing" },
    description: { bn: "রোগীর জন্য দুআ ও সুরক্ষার কালিমা", en: "For the sick and protective words" },
    icon: "HeartPulse",
    tone: "danger",
  },
  {
    id: "cat-knowledge",
    slug: "knowledge",
    name: { bn: "জ্ঞান ও পড়াশোনা", en: "Knowledge & Study" },
    description: { bn: "ইলম বৃদ্ধি, বক্ষ প্রশস্ততা ও পরীক্ষার প্রস্তুতির দুআ", en: "For more knowledge, a calm heart, and study" },
    icon: "BookOpen",
    tone: "primary",
  },
  {
    id: "cat-distress",
    slug: "distress",
    name: { bn: "দুশ্চিন্তা ও বিপদ", en: "Distress & Protection" },
    description: { bn: "হতাশা, ঋণ, ভয় ও কঠিন সময়ের দুআ", en: "For anxiety, debt, fear and hard moments" },
    icon: "LifeBuoy",
    tone: "warning",
  },
  {
    id: "cat-daily",
    slug: "daily",
    name: { bn: "দৈনন্দিন দুআ", en: "Everyday" },
    description: { bn: "ঘর থেকে বেরোনো, ঘরে ঢোকা, পোশাক ও বৃষ্টির দুআ", en: "Leaving and entering home, clothing and rain" },
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
    meaning: { bn: "হে আল্লাহ, আপনার নামেই আমি মরি এবং বাঁচি।", en: "In Your name, O Allah, I die and I live." },
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
    meaning: { bn: "সকল প্রশংসা আল্লাহর, যিনি আমাদের মৃত্যুর পর জীবিত করেছেন এবং তাঁর কাছেই প্রত্যাবর্তন।", en: "All praise is for Allah who gave us life after He had caused us to die, and to Him is the return." },
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
    meaning: { bn: "আল্লাহ পবিত্র, সকল প্রশংসা আল্লাহর, আল্লাহ সর্বশ্রেষ্ঠ।", en: "Glory be to Allah, all praise is for Allah, and Allah is the greatest." },
    reference: { bn: "সহীহ বুখারী ৬৩১৮", en: "Sahih al-Bukhari 6318" },
    occasion: { bn: "শয্যায় শোবার আগে", en: "Before sleeping" },
    repeat: { bn: "প্রতিটি ৩৩ বার, তাকবির ৩৪ বার", en: "33 times each, and takbir 34 times" },
    virtue: { bn: "নবীজি ﷺ ফাতিমা (রা.)-কে এটি শিখিয়েছিলেন এবং বলেছিলেন, ঘরের কাজে সাহায্যের চেয়ে এটি তোমার জন্য উত্তম।", en: "The Prophet ﷺ taught this to Fatimah (ra) and said it was better for her than a servant." },
    tags: ["তাসবিহ", "রাত", "ঘুম", "tasbih", "dhikr"],
  },

  /* ------------------------------------------------------------- salah ---- */
  {
    id: "dua-after-salah",
    slug: "after-the-prayer",
    categorySlug: "salah",
    title: { bn: "নামাজ শেষের দুআ", en: "After the prayer" },
    arabic: "أَسْتَغْفِرُ اللَّهَ، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliterationBn: "আস্তাগফিরুল্লাহ (৩ বার)। আল্লাহুম্মা আনতাস সালাম, ওয়া মিনকাস সালাম, তাবারকতা ইয়া যাল জালালি ওয়াল ইকরাম",
    meaning: { bn: "আমি আল্লাহর কাছে ক্ষমা চাই। হে আল্লাহ, আপনি শান্তির উৎস, আপনার কাছ থেকেই শান্তি আসে। আপনি বরকতময়, হে মহিমা ও সম্মানের অধিকারী।", en: "I seek Allah's forgiveness. O Allah, You are Peace and from You comes peace. Blessed are You, Owner of majesty and honour." },
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
    meaning: { bn: "আমার সর্বোচ্চ প্রতিপালক পবিত্র।", en: "Glory be to my Lord, the Most High." },
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
    meaning: { bn: "হে আল্লাহ, আপনার জিকির, আপনার শোকর ও সুন্দরভাবে আপনার ইবাদত করার ব্যাপারে আমাকে সাহায্য করুন।", en: "O Allah, help me to remember You, to thank You, and to worship You well." },
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
    virtue: { bn: "শুরুতে বিসমিল্লাহ ভুলে গেলে বলুন: বিসমিল্লাহি আউয়ালাহু ওয়া আখিরাহ।", en: "If you forget at the start, say: Bismillahi awwalahu wa akhirahu." },
    tags: ["খাবার", "বিসমিল্লাহ", "খাওয়া", "food", "bismillah"],
  },
  {
    id: "dua-eat-after",
    slug: "after-eating",
    categorySlug: "food",
    title: { bn: "খাওয়ার পরের দুআ", en: "After eating" },
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliterationBn: "আলহামদুলিল্লাহিল্লাযি আত'আমানি হাযা ওয়া রাযাকানিহি মিন গাইরি হাউলিন মিন্নি ওয়া লা কুওয়াহ",
    meaning: { bn: "সকল প্রশংসা আল্লাহর, যিনি আমাকে এই খাবার দিয়েছেন এবং আমার কোনো শক্তি-সামর্থ্য ছাড়াই এটি রিযিক হিসেবে দান করেছেন।", en: "All praise is for Allah who fed me this and provided it to me without any power or strength of my own." },
    reference: { bn: "সুনানে তিরমিযী ৩৪৫৮", en: "Jami' at-Tirmidhi 3458" },
    occasion: { bn: "খাওয়া শেষ করে", en: "After finishing a meal" },
    virtue: { bn: "যে ব্যক্তি খাবারের পর এটি পড়ে, তার পূর্বের গুনাহ ক্ষমা করে দেওয়া হয়।", en: "Whoever says this after eating is forgiven for what came before." },
    tags: ["খাবার", "শোকর", "আলহামদুলিল্লাহ", "food", "gratitude"],
  },
  {
    id: "dua-iftar",
    slug: "after-iftar",
    categorySlug: "food",
    title: { bn: "ইফতারের পরের দুআ", en: "After breaking the fast" },
    arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّه",
    transliterationBn: "যাহাবাজ জামা' ওয়াবতাল্লাতিল উরুকু ওয়া ছাবাতাল আজরু ইনশাআল্লাহ",
    meaning: { bn: "পিপাসা দূর হলো, শিরা-উপশিরা সিক্ত হলো এবং আল্লাহ চাইলে প্রতিদান নিশ্চিত হলো।", en: "The thirst is gone, the veins are moistened, and the reward is certain, if Allah wills." },
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
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliterationBn: "সুবহানাল্লাযি সাখখারা লানা হাযা ওয়া মা কুন্না লাহু মুকরিনিন, ওয়া ইন্না ইলা রাব্বিনা লামুনকালিবুন",
    meaning: { bn: "পবিত্র সেই সত্তা, যিনি এটি আমাদের অধীন করেছেন, অথচ আমরা এটিকে বশ করতে সক্ষম ছিলাম না। আর নিশ্চয়ই আমরা আমাদের প্রতিপালকের কাছে ফিরে যাব।", en: "Glory to Him who made this subservient to us, though we could not have subdued it, and indeed to our Lord we shall return." },
    reference: { bn: "সূরা আয-যুখরুফ ৪৩:১৩-১৪ · সহীহ মুসলিম ১৩৪২", en: "Surah Az-Zukhruf 43:13-14 · Sahih Muslim 1342" },
    occasion: { bn: "গাড়ি, বাস, ট্রেন বা বিমানে ওঠার সময়", en: "When getting into a car, bus, train or plane" },
    tags: ["সফর", "যানবাহন", "গাড়ি", "travel", "vehicle"],
  },
  {
    id: "dua-travel-set-out",
    slug: "setting-out-on-a-journey",
    categorySlug: "travel",
    title: { bn: "সফরে রওনা হওয়ার দুআ", en: "Setting out on a journey" },
    arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى",
    transliterationBn: "আল্লাহুম্মা ইন্না নাসআলুকা ফি সাফারিনা হাযাল বিররা ওয়াত তাকওয়া, ওয়া মিনাল আমালি মা তারদা",
    meaning: { bn: "হে আল্লাহ, এই সফরে আমরা আপনার কাছে নেকি ও তাকওয়া চাই, আর এমন আমল চাই যা আপনি পছন্দ করেন।", en: "O Allah, we ask You on this journey for righteousness and piety, and for deeds that please You." },
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
    meaning: { bn: "আমরা ফিরছি, তওবা করছি, ইবাদত করছি এবং আমাদের প্রতিপালকের প্রশংসা করছি।", en: "We return, we repent, we worship, and to our Lord we give praise." },
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
    meaning: { bn: "আমি মহান আল্লাহ, মহান আরশের প্রতিপালকের কাছে আপনার শিফা কামনা করছি।", en: "I ask Allah the Almighty, Lord of the Mighty Throne, to heal you." },
    reference: { bn: "সুনানে তিরমিযী ২০৮৩ · সুনানে আবু দাউদ ৩১০৬", en: "Jami' at-Tirmidhi 2083 · Sunan Abi Dawud 3106" },
    occasion: { bn: "অসুস্থ ব্যক্তির পাশে গিয়ে", en: "When visiting someone who is ill" },
    repeat: { bn: "সাতবার", en: "Seven times" },
    tags: ["অসুস্থ", "শিফা", "রোগ", "health", "healing"],
  },
];

export function getDuaCategory(slug: string): DuaCategory | undefined {
  return DUA_CATEGORIES.find((c) => c.slug === slug);
}

export function getDuasForCategory(slug: string): Dua[] {
  return DUAS.filter((d) => d.categorySlug === slug);
}

export function getDua(slug: string): Dua | undefined {
  return DUAS.find((d) => d.slug === slug || d.id === slug);
}

/** Search text covering both scripts plus the Latin keywords. */
export function duaSearchText(dua: Dua) {
  return [
    dua.title.bn,
    dua.title.en,
    dua.transliterationBn,
    dua.meaning.bn,
    dua.meaning.en,
    dua.reference.bn,
    dua.reference.en,
    dua.occasion.bn,
    dua.occasion.en,
    ...dua.tags,
  ]
    .join(" ")
    .toLowerCase();
}

/** A stable "dua of the day": the day of the year picks one from the set. */
export function duaOfToday(date: Date = new Date()): Dua {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return DUAS[dayOfYear % DUAS.length];
}

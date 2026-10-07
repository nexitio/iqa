/**
 * Daily rotating content.
 *
 * The Daily Ayah / Hadith is the platform's heartbeat — something meaningful
 * waiting every single day. Rotation is a real deterministic function of the
 * date so the same day always yields the same selection on server and client.
 */

export const DAILY_AYAH_REFS: string[] = [
  "2:255",
  "2:286",
  "3:139",
  "13:28",
  "17:23",
  "39:53",
  "40:60",
  "65:2",
  "94:5",
  "2:152",
];

/**
 * Eight real hadith from `hadith.ts`, chosen so the daily rotation spans every
 * collection present in the dataset (Bukhari, Muslim, Abu Dawud, Tirmizi,
 * Nasai, Ibnu Majah) and covers a different uplifting theme each: intention,
 * knowledge, parents, character, charity, patience, trust and seeking ilm.
 */
export const DAILY_HADITH_IDS: string[] = [
  "hadith-1", // সহীহ বুখারী — নিয়ত ও ইখলাস
  "hadith-24", // সুনানে তিরমিযী — জ্ঞান অন্বেষণের প্রতিদান
  "hadith-7", // সুনানে নাসাঈ — মায়ের সেবা, জান্নাতের পথ
  "hadith-5", // সহীহ মুসলিম — শক্তিশালী মুমিনের মর্যাদা
  "hadith-9", // সুনানে তিরমিযী — হাসিমুখও সদকা
  "hadith-19", // সহীহ বুখারী — বিপদের প্রথম আঘাতে ধৈর্য
  "hadith-15", // সুনানে আবু দাউদ — পরামর্শ দেওয়া আমানত
  "hadith-6", // সুনানে ইবনে মাজাহ — জ্ঞান অন্বেষণ ফরজ
];

/**
 * Day-of-year based rotation. Deliberately dependency-free and identical on
 * server and client so the daily content never flickers after hydration.
 */
export function getTodayIndex(listLength: number, date: Date = new Date()): number {
  if (listLength <= 0) return 0;
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfYear = Math.floor((current - start) / 86_400_000);
  return ((dayOfYear % listLength) + listLength) % listLength;
}

export interface DhikrItem {
  id: string;
  arabic: string;
  transliterationBn: string;
  meaningBn: string;
  count: string;
  virtueBn: string;
}

/** Well-known adhkar for the daily dhikr routine. */
export const DHIKR_ROUTINE: DhikrItem[] = [
  {
    id: "dhikr-tasbih-sabah",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliterationBn: "সুবহানাল্লাহি ওয়া বিহামদিহি",
    meaningBn: "আল্লাহ পবিত্র, এবং সকল প্রশংসা তাঁরই।",
    count: "১০০ বার",
    virtueBn: "যে ব্যক্তি দিনে ও রাতে ১০০ বার পড়ে, তার গুনাহ ক্ষমা করা হয় যদিও তা সমুদ্রের ফেনার সমান হয়।",
  },
  {
    id: "dhikr-sayyidul-istighfar",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliterationBn:
      "আল্লাহুম্মা আনতা রাব্বি লা ইলাহা ইল্লা আনতা, খালাকতানি ওয়া আনা আবদুকা…",
    meaningBn:
      "হে আল্লাহ, আপনি আমার প্রতিপালক, আপনি ছাড়া কোনো উপাস্য নেই। আপনি আমাকে সৃষ্টি করেছেন এবং আমি আপনার বান্দা। আপনার প্রতিশ্রুতি ও সাক্ষ্য অনুযায়ী আমি সাধ্য অনুসারে আছি। আমি আমার কৃতকর্মের অনিষ্ট থেকে আপনার আশ্রয় চাই। আমি আপনার অনুগ্রহ স্বীকার করছি এবং আমার গুনাহও স্বীকার করছি — আমাকে ক্ষমা করুন, কারণ আপনি ছাড়া কেউ গুনাহ ক্ষমা করতে পারে না।",
    count: "সকালে ও সন্ধ্যায় ১ বার",
    virtueBn: "নবীজি ﷺ বলেছেন, এই দুআ সকালে পড়ে কেউ মারা গেলে সে জান্নাতে প্রবেশ করবে।",
  },
  {
    id: "dhikr-darud",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    transliterationBn: "আল্লাহুম্মা সল্লি আলা মুহাম্মাদিন ওয়া আলা আলি মুহাম্মাদ",
    meaningBn: "হে আল্লাহ, মুহাম্মদ ﷺ ও তাঁর পরিবারের উপর রহমত বর্ষণ করুন।",
    count: "১০ বার",
    virtueBn: "যে আমার উপর একবার দরুদ পাঠ করে, আল্লাহ তার উপর দশবার রহমত পাঠান।",
  },
  {
    id: "dhikr-tasbih-fatimi",
    arabic: "سُبْحَانَ اللَّهِ — الْحَمْدُ لِلَّهِ — اللَّهُ أَكْبَرُ",
    transliterationBn: "সুবহানাল্লাহ — আলহামদুলিল্লাহ — আল্লাহু আকবার",
    meaningBn: "আল্লাহ পবিত্র — সকল প্রশংসা আল্লাহর — আল্লাহ সর্বশ্রেষ্ঠ।",
    count: "৩৩ + ৩৩ + ৩৪ বার",
    virtueBn: "ফাতিমা (রাঃ)-কে নবীজি ﷺ এই তাসবীহ শিক্ষা দিয়েছিলেন ঘরের কাজের ক্লান্তির জন্য।",
  },
  {
    id: "dhikr-ayatul-kursi",
    arabic:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
    transliterationBn: "আল্লাহু লা ইলাহা ইল্লা হুয়াল হাইয়্যুল কাইয়্যুম, লা তা'খুযুহু সিনাতুন ওয়া লা নাউম",
    meaningBn:
      "আল্লাহ, তিনি ছাড়া কোনো উপাস্য নেই। তিনি চিরঞ্জীব, সর্বসত্তার ধারক। তাঁর ক্লান্তি আসে না, তন্দ্রাও আসে না।",
    count: "প্রতি নামাজের পর ও ঘুমের আগে ১ বার",
    virtueBn: "যে রাতে আয়াতুল কুরসি পড়বে, সকাল পর্যন্ত তার জন্য আল্লাহর পক্ষ থেকে একজন রক্ষক নিযুক্ত থাকে।",
  },
  {
    id: "dhikr-sleep",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliterationBn: "বিসমিকা আল্লাহুম্মা আমুতু ওয়া আহইয়া",
    meaningBn: "হে আল্লাহ, আপনার নামেই আমি মরি এবং বাঁচি।",
    count: "ঘুমানোর সময় ১ বার",
    virtueBn: "নবীজি ﷺ শোবার সময় এই দুআ পড়তেন এবং ডান কাত হয়ে শুতেন।",
  },
];

export interface DuaItem {
  id: string;
  titleBn: string;
  arabic: string;
  transliterationBn: string;
  meaningBn: string;
  situationBn: string;
}

/** Authentic everyday duas. */
export const DUAS: DuaItem[] = [
  {
    id: "dua-sleep",
    titleBn: "ঘুমাতে যাওয়ার দুআ",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliterationBn: "বিসমিকা আল্লাহুম্মা আমুতু ওয়া আহইয়া",
    meaningBn: "হে আল্লাহ, আপনার নামেই আমি মরি এবং বাঁচি।",
    situationBn: "শয্যায় শোবার আগে",
  },
  {
    id: "dua-wake",
    titleBn: "ঘুম থেকে ওঠার দুআ",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliterationBn: "আলহামদুলিল্লাহিল্লাযি আহইয়ানা বা'দা মা আমাতানা ওয়া ইলাইহিন নুশুর",
    meaningBn: "সকল প্রশংসা আল্লাহর, যিনি আমাদের মৃত্যুর পর জীবিত করেছেন এবং তাঁর কাছেই প্রত্যাবর্তন।",
    situationBn: "সকালে ঘুম থেকে উঠে",
  },
  {
    id: "dua-eat-before",
    titleBn: "খাওয়ার আগের দুআ",
    arabic: "بِسْمِ اللَّهِ",
    transliterationBn: "বিসমিল্লাহ",
    meaningBn: "আল্লাহর নামে (শুরু করছি)।",
    situationBn: "খাবার শুরু করার আগে",
  },
  {
    id: "dua-eat-after",
    titleBn: "খাওয়ার পরের দুআ",
    arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliterationBn:
      "আলহামদুলিল্লাহিল্লাযি আত'আমানি হাযা ওয়া রাযাকানিহি মিন গাইরি হাউলিন মিন্নি ওয়া লা কুওয়াহ",
    meaningBn:
      "সকল প্রশংসা আল্লাহর, যিনি আমাকে এই খাবার দিয়েছেন এবং আমার কোনো শক্তি-সামর্থ্য ছাড়াই এটি রিযিক হিসেবে দান করেছেন।",
    situationBn: "খাওয়া শেষ করে",
  },
  {
    id: "dua-travel",
    titleBn: "ভ্রমণের দুআ",
    arabic:
      "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliterationBn:
      "সুবহানাল্লাযি সাখখারা লানা হাযা ওয়া মা কুন্না লাহু মুকরিনিন, ওয়া ইন্না ইলা রাব্বিনা লামুনকালিবুন",
    meaningBn:
      "পবিত্র সেই সত্তা, যিনি এটি আমাদের অধীন করেছেন, অথচ আমরা এটিকে বশ করতে সক্ষম ছিলাম না। আর নিশ্চয়ই আমরা আমাদের প্রতিপালকের কাছে ফিরে যাব।",
    situationBn: "যানবাহনে ওঠার সময়",
  },
  {
    id: "dua-illness",
    titleBn: "অসুস্থ ব্যক্তির জন্য দুআ",
    arabic: "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ",
    transliterationBn: "আসআলুল্লাহাল আযীম, রাব্বাল আরশিল আযীম, আন ইয়াশফিয়াক",
    meaningBn: "আমি মহান আল্লাহ, মহান আরশের প্রতিপালকের কাছে আপনার শেফা কামনা করছি।",
    situationBn: "অসুস্থ ব্যক্তির পাশে গিয়ে সাতবার",
  },
  {
    id: "dua-jannah",
    titleBn: "জান্নাত কামনার দুআ",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ",
    transliterationBn: "আল্লাহুম্মা ইন্নি আসআলুকাল জান্নাতা ওয়া আউযু বিকা মিনান নার",
    meaningBn: "হে আল্লাহ, আমি আপনার কাছে জান্নাত চাই এবং জাহান্নাম থেকে আশ্রয় চাই।",
    situationBn: "নামাজের সিজদায় ও মুক্ত সময়ে",
  },
  {
    id: "dua-knowledge",
    titleBn: "জ্ঞান বৃদ্ধির দুআ",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliterationBn: "রাব্বি যিদনি ইলমা",
    meaningBn: "হে আমার প্রতিপালক, আমার জ্ঞান বাড়িয়ে দিন।",
    situationBn: "পড়াশোনার আগে ও প্রতি ফরজ নামাজের পর",
  },
  {
    id: "dua-before-exam",
    titleBn: "পরীক্ষা বা কঠিন কাজের আগে",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    transliterationBn: "রাব্বিশরাহলি সাদরি ওয়া ইয়াসসিরলি আমরি",
    meaningBn: "হে আমার প্রতিপালক, আমার বক্ষ প্রশস্ত করুন এবং আমার কাজ সহজ করুন।",
    situationBn: "পরীক্ষা, সাক্ষাৎকার বা কঠিন সিদ্ধান্তের আগে",
  },
];

export interface FocusTheme {
  id: string;
  titleBn: string;
  emoji: string;
  descriptionBn: string;
  departmentSlugs: string[];
  targetMinutes: number;
}

/** Weekly rotating focus themes that give the feed a gentle sense of season. */
export const FOCUS_THEMES: FocusTheme[] = [
  {
    id: "theme-parents",
    titleBn: "পিতা-মাতার হক",
    emoji: "🤲",
    descriptionBn: "এই সপ্তাহে বাবা-মায়ের অধিকার, তাঁদের সাথে সদাচরণ এবং দোয়ার গুরুত্ব নিয়ে শিখুন।",
    departmentSlugs: ["family", "akhlaq"],
    targetMinutes: 75,
  },
  {
    id: "theme-salah",
    titleBn: "নামাজে খুশু",
    emoji: "🕌",
    descriptionBn: "নামাজে মনোযোগ ধরে রাখার কৌশল, ওয়াসওয়াসার সমাধান এবং সিজদার দুআ।",
    departmentSlugs: ["ibadah", "akhlaq"],
    targetMinutes: 90,
  },
  {
    id: "theme-finance",
    titleBn: "হালাল রুজি",
    emoji: "💼",
    descriptionBn: "সুদমুক্ত জীবন, ব্যবসায় সততা, যাকাতের হিসাব ও আধুনিক ব্যাংকিং প্রশ্ন।",
    departmentSlugs: ["finance", "fiqh"],
    targetMinutes: 80,
  },
  {
    id: "theme-seerah",
    titleBn: "সীরাতের আলো",
    emoji: "📖",
    descriptionBn: "নবীজি ﷺ-এর মক্কী জীবন থেকে তরুণদের জন্য শিক্ষণীয় ঘটনাগুলো।",
    departmentSlugs: ["seerah", "hadith"],
    targetMinutes: 70,
  },
  {
    id: "theme-quran",
    titleBn: "কুরআন বোঝা",
    emoji: "📗",
    descriptionBn: "প্রতিদিন একটি আয়াতের অর্থ, প্রেক্ষাপট ও জীবনযোগ্য শিক্ষা।",
    departmentSlugs: ["quran-tafsir"],
    targetMinutes: 100,
  },
  {
    id: "theme-youth",
    titleBn: "তরুণদের চ্যালেঞ্জ",
    emoji: "⚡",
    descriptionBn: "পড়াশোনা, ক্যারিয়ার, বন্ধুত্ব ও সামাজিক চাপ — দ্বীনের আলোকে উত্তর।",
    departmentSlugs: ["youth", "technology"],
    targetMinutes: 65,
  },
];

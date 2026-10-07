import type { Scholar } from "@/lib/types";

/**
 * Verified scholar directory.
 *
 * `departmentIds` is the exact inverse of `Department.scholarIds` in
 * `./departments.ts`, and `primaryDepartmentId` is always one of them. The
 * question-routing engine scores candidates from these two facts, so they must
 * stay consistent.
 */

export const SCHOLARS: Scholar[] = [
  {
    id: "scholar-1",
    slug: "mufti-abdur-rahman",
    name: { bn: "মুফতি আব্দুর রহমান", en: "Mufti Abdur Rahman" },
    honorific: { bn: "মুফতি", en: "Mufti" },
    avatarColor: "#0d6b4f",
    shortBio: {
      bn: "ফিকহ ও ফতোয়া শাস্ত্রের অভিজ্ঞ মুফতি, ১৮ বছরের শিক্ষাদান অভিজ্ঞতা",
      en: "Experienced mufti in fiqh and ifta, 18 years of teaching",
    },
    bio: {
      bn: "মুফতি আব্দুর রহমান দাওরায়ে হাদীস সম্পন্ন করার পর দারুল ইফতায় সাত বছর ইফতার প্রশিক্ষণ নিয়েছেন। তিনি পারিবারিক ও লেনদেন সংক্রান্ত মাসআলায় বিশেষ পারদর্শী এবং ধৈর্যসহকারে দলিলভিত্তিক উত্তর দেওয়ার জন্য পরিচিত। তাঁর কাছে প্রশ্ন এলে তিনি কেবল রায় দেন না — কোন কিতাবের কোন অধ্যায় থেকে রায়টি এসেছে তাও বলে দেন।",
      en: "Mufti Abdur Rahman completed Dawra-e-Hadith and trained for seven years in a darul ifta. He specialises in family and transactional rulings and is known for patient, evidence-backed answers that name the exact chapter a ruling comes from.",
    },
    departmentIds: ["fiqh", "ibadah", "finance"],
    primaryDepartmentId: "fiqh",
    specialization: [
      { bn: "পারিবারিক ও বিবাহ ফিকহ", en: "Family and marriage fiqh" },
      { bn: "আর্থিক লেনদেন ও ফতোয়া", en: "Financial transactions and ifta" },
      { bn: "ইবাদতের বিধান", en: "Rulings of worship" },
      { bn: "ফারায়েজ ও উত্তরাধিকার", en: "Faraid and inheritance" },
    ],
    languages: ["বাংলা", "আরবি", "ইংরেজি"],
    credentials: [
      { id: "cred-1-1", title: { bn: "দাওরায়ে হাদীস (মাস্টার্স সমমান)", en: "Dawra-e-Hadith (Masters equivalent)" }, institution: { bn: "জামিয়া আহলিয়া দারুল উলূম মুঈনুল ইসলাম, হাটহাজারী", en: "Jamia Ahlia Darul Ulum Moinul Islam, Hathazari" }, year: "২০০৫" },
      { id: "cred-1-2", title: { bn: "ইফতা কোর্স (দারুল ইফতা)", en: "Ifta course (Darul Ifta)" }, institution: { bn: "দারুল ইফতা, হাটহাজারী, চট্টগ্রাম", en: "Darul Ifta, Hathazari, Chattogram" }, year: "২০১২" },
      { id: "cred-1-3", title: { bn: "উসুলুল ফিকহ প্রশিক্ষণ", en: "Training in Usul al-Fiqh" }, institution: { bn: "আল-আজহার বিশ্ববিদ্যালয়, কায়রো", en: "Al-Azhar University, Cairo" }, year: "২০১৫" },
    ],
    madrasah: { bn: "জামিয়া রাহমানিয়া আরাবিয়া, ঢাকা", en: "Jamia Rahmania Arabia, Dhaka" },
    district: "dhaka",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 6,
    rating: 4.9,
    stats: { answers: 2418, articles: 64, fatwas: 812, followers: 52400, helpfulVotes: 18620 },
    joinedAt: "2023-02-14T09:00:00.000Z",
    fiqhFocus: ["hanafi", "usul"],
  },
  {
    id: "scholar-2",
    slug: "dr-imran-hossain",
    name: { bn: "ড. ইমরান হোসেন", en: "Dr. Imran Hossain" },
    honorific: { bn: "অধ্যাপক ড.", en: "Prof. Dr." },
    avatarColor: "#1f6f9e",
    shortBio: {
      bn: "আকীদা ও তুলনামূলক ধর্ম বিষয়ে গবেষক, বিশ্ববিদ্যালয়ের অধ্যাপক",
      en: "Researcher in aqeedah and comparative religion, university professor",
    },
    bio: {
      bn: "ড. ইমরান হোসেন আধুনিক সন্দেহ ও নাস্তিক্যবাদের জবাবে ইসলামি আকীদার যুক্তিভিত্তিক উপস্থাপনায় কাজ করেন। তিনি ঢাকা বিশ্ববিদ্যালয়ে ইসলামিক স্টাডিজে শিক্ষকতা করেন এবং তরুণদের মনস্তাত্ত্বিক প্রশ্নগুলোকে কেবল ধমক দিয়ে নয়, বরং প্রমাণ দিয়ে সমাধান করার পক্ষে। তাঁর বহু লেখা ইংরেজি ও বাংলায় প্রকাশিত।",
      en: "Dr. Imran Hossain works on rational presentations of Islamic creed in response to modern doubt and atheism. He teaches Islamic Studies at the University of Dhaka and argues for answering young people's questions with evidence rather than rebuke. Many of his works are published in both Bangla and English.",
    },
    departmentIds: ["aqeedah", "dawah", "hadith"],
    primaryDepartmentId: "aqeedah",
    specialization: [
      { bn: "তাওহীদ ও আকীদা", en: "Tawhid and creed" },
      { bn: "নাস্তিক্যবাদ ও সন্দেহের জবাব", en: "Atheism and answering doubts" },
      { bn: "তুলনামূলক ধর্মতত্ত্ব", en: "Comparative theology" },
      { bn: "হাদীসের সনদ যাচাই", en: "Hadith authentication" },
    ],
    languages: ["বাংলা", "ইংরেজি", "আরবি"],
    credentials: [
      { id: "cred-2-1", title: { bn: "ইসলামিক স্টাডিজে পিএইচডি", en: "PhD in Islamic Studies" }, institution: { bn: "ঢাকা বিশ্ববিদ্যালয়", en: "University of Dhaka" }, year: "২০১৪" },
      { id: "cred-2-2", title: { bn: "এমএ, ইসলামিক স্টাডিজ", en: "MA in Islamic Studies" }, institution: { bn: "ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া", en: "Islamic University, Kushtia" }, year: "২০০৭" },
      { id: "cred-2-3", title: { bn: "হাদীস গবেষণা ডিপ্লোমা", en: "Diploma in Hadith research" }, institution: { bn: "ইসলামিক ইউনিভার্সিটি অব মদীনা", en: "Islamic University of Madinah" }, year: "২০১১" },
    ],
    madrasah: { bn: "ঢাকা বিশ্ববিদ্যালয়, ইসলামিক স্টাডিজ বিভাগ", en: "University of Dhaka, Department of Islamic Studies" },
    district: "dhaka",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 12,
    rating: 4.8,
    stats: { answers: 1642, articles: 88, fatwas: 96, followers: 44100, helpfulVotes: 14280 },
    joinedAt: "2023-03-02T10:30:00.000Z",
    fiqhFocus: ["general", "comparative"],
  },
  {
    id: "scholar-3",
    slug: "mufti-saiful-islam",
    name: { bn: "মুফতি সাইফুল ইসলাম", en: "Mufti Saiful Islam" },
    honorific: { bn: "মুফতি", en: "Mufti" },
    avatarColor: "#a97a1f",
    shortBio: {
      bn: "ইসলামি ব্যাংকিং ও হালাল বিনিয়োগ বিষয়ে শরীয়াহ উপদেষ্টা",
      en: "Shariah advisor on Islamic banking and halal investment",
    },
    bio: {
      bn: "মুফতি সাইফুল ইসলাম দেশের কয়েকটি ইসলামি ব্যাংকের শরীয়াহ বোর্ডে দায়িত্ব পালন করেছেন এবং সুদমুক্ত ব্যাংকিংয়ের বাস্তব চ্যালেঞ্জগুলো প্রত্যক্ষভাবে জানেন। তিনি ক্রেডিট কার্ড, ডিপিএস, সঞ্চয়পত্র ও অনলাইন আয়ের হালাল-হারাম নিয়ে স্পষ্ট রায় দেন। ব্যবসায়ীদের জন্য তাঁর লেখাগুলো বাংলাদেশের বাজারের বাস্তবতা মাথায় রেখে লেখা।",
      en: "Mufti Saiful Islam has served on the Shariah boards of several Bangladeshi Islamic banks and knows the practical challenges of interest-free banking first-hand. He gives clear rulings on credit cards, DPS, savings certificates and online income, writing for business owners in the realities of the Bangladeshi market.",
    },
    departmentIds: ["finance", "fiqh", "technology"],
    primaryDepartmentId: "finance",
    specialization: [
      { bn: "ইসলামি ব্যাংকিং ও শরীয়াহ অডিট", en: "Islamic banking and Shariah audit" },
      { bn: "হালাল বিনিয়োগ ও শেয়ারবাজার", en: "Halal investment and the stock market" },
      { bn: "সুদ ও আধুনিক আর্থিক পণ্য", en: "Riba and modern financial products" },
      { bn: "আনলাইন আয় ও ক্রিপ্টোকারেন্সি", en: "Online income and cryptocurrency" },
    ],
    languages: ["বাংলা", "আরবি", "ইংরেজি"],
    credentials: [
      { id: "cred-3-1", title: { bn: "দাওরায়ে হাদীস ও ইফতা", en: "Dawra-e-Hadith and Ifta" }, institution: { bn: "জামিয়া আহলিয়া দারুল উলূম মুঈনুল ইসলাম, হাটহাজারী", en: "Jamia Ahlia Darul Ulum Moinul Islam, Hathazari" }, year: "২০০৮" },
      { id: "cred-3-2", title: { bn: "ইসলামিক ফাইন্যান্সে এমবিএ", en: "MBA in Islamic Finance" }, institution: { bn: "ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া", en: "Islamic University, Kushtia" }, year: "২০১৬" },
      { id: "cred-3-3", title: { bn: "শরীয়াহ অ্যাডভাইজরি সার্টিফিকেট", en: "Shariah advisory certificate" }, institution: { bn: "দারুল ইফতা, ঢাকা", en: "Darul Ifta, Dhaka" }, year: "২০১৯" },
    ],
    madrasah: { bn: "ইসলামিক রিসার্চ সেন্টার, ঢাকা", en: "Islamic Research Centre, Dhaka" },
    district: "dhaka",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 9,
    rating: 4.8,
    stats: { answers: 1876, articles: 71, fatwas: 738, followers: 38900, helpfulVotes: 15420 },
    joinedAt: "2023-01-22T07:45:00.000Z",
    fiqhFocus: ["hanafi", "comparative"],
  },
  {
    id: "scholar-4",
    slug: "shaykh-ataur-rahman",
    name: { bn: "শায়খ আতাউর রহমান", en: "Shaykh Ataur Rahman" },
    honorific: { bn: "মুহাদ্দিস", en: "Muhaddith" },
    avatarColor: "#6b7f3a",
    shortBio: {
      bn: "হাদীস শাস্ত্রের শিক্ষক, সনদ যাচাই ও সীরাত গবেষণায় নিবেদিত",
      en: "Teacher of hadith sciences, devoted to authentication and seerah research",
    },
    bio: {
      bn: "শায়খ আতাউর রহমান দুই দশকেরও বেশি সময় ধরে সহীহ বুখারী ও সহীহ মুসলিমের দরস পরিচালনা করছেন। সমাজে প্রচলিত ভুল ও যঈফ হাদীস চিহ্নিত করে সেগুলোর বিকল্প সহীহ দলিল দেখানো তাঁর বিশেষ অবদান। সীরাতের ঘটনাগুলো বিশুদ্ধ সূত্র থেকে বর্ণনা করার উপর তিনি বিশেষ জোর দেন।",
      en: "Shaykh Ataur Rahman has taught Sahih al-Bukhari and Sahih Muslim for over two decades. His particular contribution is identifying weak narrations in common circulation and offering authentic alternatives. He lays heavy emphasis on narrating seerah from verified sources.",
    },
    departmentIds: ["hadith", "seerah", "quran-tafsir"],
    primaryDepartmentId: "hadith",
    specialization: [
      { bn: "হাদীসের সনদ ও ইলাল", en: "Hadith chains and hidden defects" },
      { bn: "সীরাত বিশ্লেষণ", en: "Seerah analysis" },
      { bn: "মুহাদ্দিসীনের পদ্ধতি", en: "The muhaddithin's methodology" },
      { bn: "তাফসীরে রিওয়ায়াত", en: "Tafsir by narration" },
    ],
    languages: ["বাংলা", "আরবি", "উর্দু"],
    credentials: [
      { id: "cred-4-1", title: { bn: "দাওরায়ে হাদীস", en: "Dawra-e-Hadith" }, institution: { bn: "জামিয়া ইসলামিয়া পটিয়া, চট্টগ্রাম", en: "Jamia Islamia Patiya, Chattogram" }, year: "১৯৯৬" },
      { id: "cred-4-2", title: { bn: "হাদীসে উচ্চতর গবেষণা (তাখাসসুস)", en: "Advanced specialisation in Hadith (Takhassus)" }, institution: { bn: "মাদানী কারখানা, দারুল উলূম দেওবন্দ ধারা", en: "Madani Markaz, Darul Uloom Deoband tradition" }, year: "২০০১" },
      { id: "cred-4-3", title: { bn: "তাহকীকুল হাদীস কোর্স", en: "Tahqiq al-Hadith course" }, institution: { bn: "বেফাকুল মাদারিসিল আরাবিয়া, বাংলাদেশ", en: "Befaqul Madarisil Arabia, Bangladesh" }, year: "২০০৪" },
    ],
    madrasah: { bn: "জামিয়া ইসলামিয়া পটিয়া, চট্টগ্রাম", en: "Jamia Islamia Patiya, Chattogram" },
    district: "chattogram",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 18,
    rating: 4.9,
    stats: { answers: 1324, articles: 96, fatwas: 128, followers: 36700, helpfulVotes: 13980 },
    joinedAt: "2023-04-11T06:15:00.000Z",
    fiqhFocus: ["hanafi", "usul"],
  },
  {
    id: "scholar-5",
    slug: "dr-faridah-yasmin",
    name: { bn: "ড. ফরিদা ইয়াসমিন", en: "Dr. Faridah Yasmin" },
    honorific: { bn: "ড.", en: "Dr." },
    avatarColor: "#a3405f",
    shortBio: {
      bn: "পারিবারিক ফিকহ ও নারী বিষয়ে বিশেষজ্ঞ, মহিলা আলেমা",
      en: "Specialist in family fiqh and women's matters",
    },
    bio: {
      bn: "ড. ফরিদা ইয়াসমিন পারিবারিক সহিংসতা, যৌতুক ও তালাক-পরবর্তী জটিলতায় নারীদের পাশে দাঁড়ানোর জন্য পরিচিত। তিনি মহিলাদের জন্য আলাদা ফিকহ ক্লাস পরিচালনা করেন যেখানে লজ্জা ছাড়াই হায়েজ-নেফাস ও দাম্পত্য জীবনের প্রশ্ন করা যায়। তাঁর রায়গুলো কঠোর নয়, বরং পরিবার টিকে থাকার পথ সন্ধান করে।",
      en: "Dr. Faridah Yasmin is known for standing with women through domestic violence, dowry pressure and post-divorce difficulty. She runs separate fiqh classes where women can ask about menstruation and married life without embarrassment. Her rulings seek to preserve families rather than break them.",
    },
    departmentIds: ["family", "women", "akhlaq"],
    primaryDepartmentId: "family",
    specialization: [
      { bn: "নারীর ফিকহি বিধান", en: "Fiqhi rulings for women" },
      { bn: "যৌতুক ও পারিবারিক সহিংসতা", en: "Dowry and domestic violence" },
      { bn: "তালাক, খুলা ও ভরণপোষণ", en: "Divorce, khula and maintenance" },
      { bn: "সন্তান প্রতিপালন", en: "Parenting" },
    ],
    languages: ["বাংলা", "ইংরেজি", "আরবি"],
    credentials: [
      { id: "cred-5-1", title: { bn: "ইসলামিক স্টাডিজে পিএইচডি", en: "PhD in Islamic Studies" }, institution: { bn: "ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া", en: "Islamic University, Kushtia" }, year: "২০১৫" },
      { id: "cred-5-2", title: { bn: "ইফতা ও নারী ফিকহ কোর্স", en: "Ifta and women's fiqh course" }, institution: { bn: "তামিরুল মিল্লাত কামিল মাদ্রাসা, টঙ্গী", en: "Tamirul Millat Kamil Madrasah, Tongi" }, year: "২০১০" },
      { id: "cred-5-3", title: { bn: "ফ্যামিলি কাউন্সেলিং সনদ", en: "Family counselling certificate" }, institution: { bn: "বাংলাদেশ ইনস্টিটিউট অব ইসলামিক স্টাডিজ", en: "Bangladesh Institute of Islamic Studies" }, year: "২০১৮" },
    ],
    madrasah: { bn: "মহিলা মাদ্রাসা ও ফতোয়া কেন্দ্র, ঢাকা", en: "Women's Madrasah and Fatwa Centre, Dhaka" },
    district: "dhaka",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 7,
    rating: 4.9,
    stats: { answers: 2104, articles: 58, fatwas: 496, followers: 46300, helpfulVotes: 17840 },
    joinedAt: "2023-02-27T11:00:00.000Z",
    fiqhFocus: ["hanafi", "general"],
  },
  {
    id: "scholar-6",
    slug: "mufti-nurul-amin",
    name: { bn: "মুফতি নুরুল আমিন", en: "Mufti Nurul Amin" },
    honorific: { bn: "মুফতি", en: "Mufti" },
    avatarColor: "#0f7a4a",
    shortBio: {
      bn: "ইবাদত ও হালাল-হারাম বিষয়ে নির্ভরযোগ্য মুফতি, গ্রামীণ মাসআলায় অভিজ্ঞ",
      en: "Trusted mufti on worship and halal matters, experienced in rural questions",
    },
    bio: {
      bn: "মুফতি নুরুল আমিন দীর্ঘদিন মফস্বলে ইমামতি ও ইফতা সেবা দিয়েছেন, ফলে সাধারণ মানুষের বাস্তব সমস্যাগুলো ভালোভাবে জানেন — কখন সেহরি পড়তে হয়, মাসিকের সময় নামাজের কী হয়, বাজারের কোন খাবার হালাল। তিনি সহজ ভাষায় উত্তর দেন এবং প্রয়োজনে না-করা-যাবে তা স্পষ্ট বলতে দ্বিধা করেন না।",
      en: "Mufti Nurul Amin has long served as an imam and mufti outside the capital, so he knows ordinary people's real problems: when sehri ends, what happens to prayers during menstruation, which market food is lawful. He answers in plain language and is not afraid to say clearly when something is not permitted.",
    },
    departmentIds: ["ibadah", "halal-food", "fiqh"],
    primaryDepartmentId: "ibadah",
    specialization: [
      { bn: "নামাজ, রোযা ও পবিত্রতা", en: "Prayer, fasting and purity" },
      { bn: "খাদ্য ও পণ্যের হালাল-হারাম", en: "Halal status of food and goods" },
      { bn: "কুরবানি ও যাকাত", en: "Qurbani and zakat" },
      { bn: "জানাজা ও দাফন", en: "Funeral rites" },
    ],
    languages: ["বাংলা", "আরবি"],
    credentials: [
      { id: "cred-6-1", title: { bn: "দাওরায়ে হাদীস ও ইফতা", en: "Dawra-e-Hadith and Ifta" }, institution: { bn: "জামিয়া রাহমানিয়া আরাবিয়া, ঢাকা", en: "Jamia Rahmania Arabia, Dhaka" }, year: "২০০৩" },
      { id: "cred-6-2", title: { bn: "ফিকহুল ইবাদাত তাখাসসুস", en: "Takhassus in Fiqh al-Ibadat" }, institution: { bn: "দারুল ইফতা, হাটহাজারী", en: "Darul Ifta, Hathazari" }, year: "২০০৬" },
    ],
    madrasah: { bn: "জামিয়া ইসলামিয়া, কুমিল্লা", en: "Jamia Islamia, Cumilla" },
    district: "cumilla",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 4,
    rating: 4.7,
    stats: { answers: 2260, articles: 42, fatwas: 1042, followers: 31700, helpfulVotes: 16120 },
    joinedAt: "2023-05-19T05:30:00.000Z",
    fiqhFocus: ["hanafi"],
  },
  {
    id: "scholar-7",
    slug: "ustadh-tanvir-ahmed",
    name: { bn: "উস্তাদ তানভীর আহমেদ", en: "Ustadh Tanvir Ahmed" },
    honorific: { bn: "উস্তাদ", en: "Ustadh" },
    avatarColor: "#256d8c",
    shortBio: {
      bn: "তরুণদের প্রশ্নে বিশেষজ্ঞ, ক্যাম্পাস ও অনলাইন দাওয়াহ কর্মী",
      en: "Specialist in youth questions, campus and online dawah worker",
    },
    bio: {
      bn: "উস্তাদ তানভীর আহমেদ ঢাকা ও চট্টগ্রামের ক্যাম্পাসগুলোতে শিক্ষার্থীদের সাথে সরাসরি কাজ করেন। পড়াশোনা, প্রেম, আসক্তি, গেমিং ও ক্যারিয়ার নিয়ে তরুণদের যে প্রশ্নগুলো মাদ্রাসায় সাধারণত জিজ্ঞেস করা হয় না, সেগুলোর উত্তর তিনি বাস্তব উদাহরণ দিয়ে দেন। তাঁর ভাষা সহজ এবং তিনি তরুণদের দুঃখকে ছোট করে দেখেন না।",
      en: "Ustadh Tanvir Ahmed works directly with students on campuses in Dhaka and Chattogram. He answers the questions young people rarely bring to a madrasah — study, relationships, addiction, gaming, career — with real examples. His language is plain and he never belittles what a young person is going through.",
    },
    departmentIds: ["youth", "technology", "akhlaq"],
    primaryDepartmentId: "youth",
    specialization: [
      { bn: "শিক্ষার্থী ও ক্যাম্পাস জীবন", en: "Student and campus life" },
      { bn: "সোশ্যাল মিডিয়া ও আসক্তি", en: "Social media and addiction" },
      { bn: "তরুণদের মানসিক দুশ্চিন্তা", en: "Anxiety among the young" },
      { bn: "আধুনিক প্রযুক্তি ও ফিকহ", en: "Modern technology and fiqh" },
    ],
    languages: ["বাংলা", "ইংরেজি"],
    credentials: [
      { id: "cred-7-1", title: { bn: "ইসলামিক স্টাডিজে স্নাতকোত্তর", en: "MA in Islamic Studies" }, institution: { bn: "ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া", en: "Islamic University, Kushtia" }, year: "২০১৯" },
      { id: "cred-7-2", title: { bn: "ইসলামিক স্টাডিজে স্নাতক", en: "BA in Islamic Studies" }, institution: { bn: "ঢাকা কলেজ", en: "Dhaka College" }, year: "২০১৭" },
      { id: "cred-7-3", title: { bn: "ইউথ ডেভেলপমেন্ট ডিপ্লোমা", en: "Diploma in youth development" }, institution: { bn: "ইসলামিক ফাউন্ডেশন বাংলাদেশ", en: "Islamic Foundation Bangladesh" }, year: "২০২১" },
    ],
    madrasah: { bn: "ইসলামিক স্টাডিজ সেন্টার, ঢাকা", en: "Islamic Studies Centre, Dhaka" },
    district: "dhaka",
    verified: false,
    availableForQuestions: true,
    responseTimeHours: 3,
    rating: 4.6,
    stats: { answers: 1188, articles: 52, fatwas: 46, followers: 28400, helpfulVotes: 8960 },
    joinedAt: "2024-01-08T14:20:00.000Z",
    fiqhFocus: ["hanafi", "general"],
  },
  {
    id: "scholar-8",
    slug: "dr-habibur-rahman",
    name: { bn: "ড. হাবিবুর রহমান", en: "Dr. Habibur Rahman" },
    honorific: { bn: "ড.", en: "Dr." },
    avatarColor: "#0d6b4f",
    shortBio: {
      bn: "কুরআন ও তাফসীর বিভাগের প্রধান, তাফসীরে রুহুল মাআনী গবেষক",
      en: "Head of Quran and Tafsir, researcher in classical tafsir",
    },
    bio: {
      bn: "ড. হাবিবুর রহমান কুরআন বুঝে পড়ার সহজ পদ্ধতি শেখানোর জন্য পরিচিত। তিনি আল-কুরআনের প্রতিটি সূরার প্রেক্ষাপট, সংগতি ও শিক্ষা নিয়ে ধারাবাহিক দরস পরিচালনা করেন। তাঁর মতে কুরআন অনুবাদ পড়েই থেমে থাকা উচিত নয় — অন্তত একটি তাফসীরের সাথে মিলিয়ে পড়া উচিত।",
      en: "Dr. Habibur Rahman is known for teaching an easy method of reading the Quran with understanding. He runs a continuous dars covering each surah's context, coherence and lessons. In his view one should not stop at a translation — at least one tafsir should be read alongside it.",
    },
    departmentIds: ["quran-tafsir", "aqeedah", "ibadah"],
    primaryDepartmentId: "quran-tafsir",
    specialization: [
      { bn: "তাফসীরে কুরআন", en: "Quranic exegesis" },
      { bn: "ঈজাযুল কুরআন", en: "Inimitability of the Quran" },
      { bn: "আকীদা ও তাওহীদ", en: "Creed and tawhid" },
      { bn: "কিরাআত ও তাজবীদ", en: "Qira'at and tajwid" },
    ],
    languages: ["বাংলা", "আরবি", "ইংরেজি"],
    credentials: [
      { id: "cred-8-1", title: { bn: "তাফসীর বিভাগে পিএইচডি", en: "PhD in Tafsir" }, institution: { bn: "আল-আজহার বিশ্ববিদ্যালয়, কায়রো", en: "Al-Azhar University, Cairo" }, year: "২০১৩" },
      { id: "cred-8-2", title: { bn: "কিরাআত সনদ (সাব'আ)", en: "Ijazah in the seven qira'at" }, institution: { bn: "মাকতাবাতুল কুরআন, কায়রো", en: "Maktabat al-Quran, Cairo" }, year: "২০১১" },
      { id: "cred-8-3", title: { bn: "দাওরায়ে হাদীস", en: "Dawra-e-Hadith" }, institution: { bn: "তামিরুল মিল্লাত কামিল মাদ্রাসা, টঙ্গী", en: "Tamirul Millat Kamil Madrasah, Tongi" }, year: "২০০২" },
    ],
    madrasah: { bn: "মারকাযুল কুরআন, ঢাকা", en: "Markazul Quran, Dhaka" },
    district: "dhaka",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 15,
    rating: 4.9,
    stats: { answers: 1462, articles: 104, fatwas: 88, followers: 41200, helpfulVotes: 15340 },
    joinedAt: "2023-03-28T08:10:00.000Z",
    fiqhFocus: ["hanafi", "general"],
  },
  {
    id: "scholar-9",
    slug: "mufti-ashraful-haque",
    name: { bn: "মুফতি আশরাফুল হক", en: "Mufti Ashraful Haque" },
    honorific: { bn: "মুফতি", en: "Mufti" },
    avatarColor: "#b06d0a",
    shortBio: {
      bn: "চিকিৎসা, ওষুধ ও খাদ্য নিরাপত্তার হালাল-হারাম নির্ধারণে বিশেষজ্ঞ",
      en: "Specialist in the halal status of medicine, treatment and food safety",
    },
    bio: {
      bn: "মুফতি আশরাফুল হক ডাক্তার ও ফার্মাসিস্টদের সাথে কাজ করে এমন মাসআলা সমাধান করেন যা সাধারণ ফতোয়া কিতাবে সরাসরি পাওয়া যায় না — ইনসুলিন, ভ্যাকসিন, অঙ্গদান, কসমেটিকস ও ই-নম্বরযুক্ত খাদ্য। তিনি নির্ভুল তথ্য ছাড়া হারাম বলা থেকে বিরত থাকার জন্য বিশেষভাবে সুপরিচিত।",
      en: "Mufti Ashraful Haque works alongside doctors and pharmacists to resolve questions the classical fatwa books do not cover directly — insulin, vaccines, organ donation, cosmetics and food with E-numbers. He is especially known for refusing to declare something haram without verified information.",
    },
    departmentIds: ["halal-food", "medical", "fiqh"],
    primaryDepartmentId: "halal-food",
    specialization: [
      { bn: "ওষুধ ও চিকিৎসার হালাল-হারাম", en: "Halal status of medicine and treatment" },
      { bn: "খাদ্য উপাদান ও ই-নম্বর", en: "Food additives and E-numbers" },
      { bn: "অঙ্গদান ও জৈবনৈতিক ফিকহ", en: "Organ donation and bioethics" },
      { bn: "কসমেটিকস ও পোশাক", en: "Cosmetics and clothing" },
    ],
    languages: ["বাংলা", "আরবি", "ইংরেজি"],
    credentials: [
      { id: "cred-9-1", title: { bn: "দাওরায়ে হাদীস ও ইফতা", en: "Dawra-e-Hadith and Ifta" }, institution: { bn: "জামিয়া ইসলামিয়া পটিয়া, চট্টগ্রাম", en: "Jamia Islamia Patiya, Chattogram" }, year: "২০০৭" },
      { id: "cred-9-2", title: { bn: "বিজ্ঞান ও ধর্মে উচ্চতর ডিপ্লোমা", en: "Advanced diploma in science and religion" }, institution: { bn: "ইসলামিক ফাউন্ডেশন বাংলাদেশ", en: "Islamic Foundation Bangladesh" }, year: "২০১৭" },
    ],
    madrasah: { bn: "দারুল ইফতা ও গবেষণা কেন্দ্র, চট্টগ্রাম", en: "Darul Ifta and Research Centre, Chattogram" },
    district: "chattogram",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 21,
    rating: 4.7,
    stats: { answers: 986, articles: 38, fatwas: 264, followers: 22800, helpfulVotes: 7420 },
    joinedAt: "2023-08-04T09:40:00.000Z",
    fiqhFocus: ["hanafi", "comparative"],
  },
  {
    id: "scholar-10",
    slug: "ustadha-sumaiya-khanam",
    name: { bn: "উস্তাদা সুমাইয়া খানম", en: "Ustadha Sumaiya Khanam" },
    honorific: { bn: "উস্তাদা", en: "Ustadha" },
    avatarColor: "#a3405f",
    shortBio: {
      bn: "আখলাক ও আত্মশুদ্ধি বিষয়ে শিক্ষিকা, মেয়েদের দ্বীনি ক্লাস পরিচালক",
      en: "Teacher of akhlaq and self-purification, runs classes for girls",
    },
    bio: {
      bn: "উস্তাদা সুমাইয়া খানম মেয়েদের জন্য অনলাইন ও অফলাইন দ্বীনি ক্লাস পরিচালনা করেন, যেখানে গীবত, হিংসা, আত্মসম্মান ও আত্মবিশ্বাস নিয়ে খোলামেলা আলোচনা হয়। তিনি আত্মশুদ্ধিকে কেবল কিছু আমলের তালিকা হিসেবে নয়, বরং অন্তরের চরিত্র গঠন হিসেবে দেখান। তাঁর আলোচনায় বাংলা গল্প ও বাস্তব উদাহরণ বেশি থাকে।",
      en: "Ustadha Sumaiya Khanam runs religious classes for girls, online and in person, where gossip, envy, self-worth and confidence are discussed openly. She presents tazkiyah not as a checklist of practices but as the formation of the heart's character, using plenty of Bangla stories and everyday examples.",
    },
    departmentIds: ["akhlaq", "women", "family"],
    primaryDepartmentId: "akhlaq",
    specialization: [
      { bn: "তাযকিয়া ও আত্মশুদ্ধি", en: "Tazkiyah and self-purification" },
      { bn: "চরিত্র গঠন ও শিষ্টাচার", en: "Character and adab" },
      { bn: "নারীদের দ্বীনি শিক্ষা", en: "Religious education for women" },
      { bn: "পারিবারিক সম্প্রীতি", en: "Family harmony" },
    ],
    languages: ["বাংলা", "আরবি", "ইংরেজি"],
    credentials: [
      { id: "cred-10-1", title: { bn: "দাওরায়ে হাদীস (মহিলা শাখা)", en: "Dawra-e-Hadith (women's section)" }, institution: { bn: "মহিলা মাদ্রাসা, ঢাকা", en: "Women's Madrasah, Dhaka" }, year: "২০১২" },
      { id: "cred-10-2", title: { bn: "আত্মশুদ্ধি ও তাযকিয়া কোর্স", en: "Course in tazkiyah" }, institution: { bn: "আল-জামিয়া আল-ইসলামিয়া, ঢাকা", en: "Al-Jamia Al-Islamia, Dhaka" }, year: "২০১৬" },
      { id: "cred-10-3", title: { bn: "বাংলা সাহিত্যে স্নাতক", en: "BA in Bangla Literature" }, institution: { bn: "ঢাকা বিশ্ববিদ্যালয়", en: "University of Dhaka" }, year: "২০১০" },
    ],
    madrasah: { bn: "নূরানী মহিলা মাদ্রাসা, ঢাকা", en: "Nurani Women's Madrasah, Dhaka" },
    district: "dhaka",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 10,
    rating: 4.8,
    stats: { answers: 1294, articles: 62, fatwas: 34, followers: 31600, helpfulVotes: 10840 },
    joinedAt: "2023-06-15T12:00:00.000Z",
    fiqhFocus: ["hanafi", "general"],
  },
  {
    id: "scholar-11",
    slug: "dr-mahmudul-hasan",
    name: { bn: "ড. মাহমুদুল হাসান", en: "Dr. Mahmudul Hasan" },
    honorific: { bn: "ড.", en: "Dr." },
    avatarColor: "#6b7f3a",
    shortBio: {
      bn: "সীরাত ও ইসলামের ইতিহাসের অধ্যাপক, দাওয়াহ প্রশিক্ষক",
      en: "Professor of seerah and Islamic history, dawah trainer",
    },
    bio: {
      bn: "ড. মাহমুদুল হাসান সীরাতের ঘটনাগুলোকে আজকের বাংলাদেশের প্রেক্ষাপটে কীভাবে বুঝতে হবে সেটি শেখান। তিনি দাওয়াহ প্রশিক্ষণে বিশেষ জোর দেন — কীভাবে বিতর্ক এড়িয়ে, সম্মান রেখে ইসলামের দিকে ডাকা যায়। দেশভাগ, মসজিদ স্থাপত্য ও সুফি ধারার ইতিহাস নিয়েও তাঁর গবেষণা রয়েছে।",
      en: "Dr. Mahmudul Hasan teaches how to understand the events of the seerah in the context of today's Bangladesh. He places strong emphasis on dawah training — how to invite people to Islam respectfully and without polemics. He has also researched partition, mosque architecture and Sufi traditions in the region.",
    },
    departmentIds: ["seerah", "dawah", "aqeedah"],
    primaryDepartmentId: "seerah",
    specialization: [
      { bn: "সীরাতে রাসূল ﷺ", en: "The Prophet's biography" },
      { bn: "উপমহাদেশের ইসলামি ইতিহাস", en: "Islamic history of the subcontinent" },
      { bn: "দাওয়াহ পদ্ধতি", en: "Methods of dawah" },
      { bn: "আকীদা ও প্রাচ্যবাদ", en: "Creed and orientalism" },
    ],
    languages: ["বাংলা", "ইংরেজি", "আরবি", "উর্দু"],
    credentials: [
      { id: "cred-11-1", title: { bn: "সীরাত ও ইসলামের ইতিহাসে পিএইচডি", en: "PhD in Seerah and Islamic History" }, institution: { bn: "ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া", en: "Islamic University, Kushtia" }, year: "২০১২" },
      { id: "cred-11-2", title: { bn: "ইসলামের ইতিহাসে এমএ", en: "MA in Islamic History" }, institution: { bn: "রাজশাহী বিশ্ববিদ্যালয়", en: "University of Rajshahi" }, year: "২০০৬" },
      { id: "cred-11-3", title: { bn: "দাওয়াহ প্রশিক্ষণ সনদ", en: "Dawah training certificate" }, institution: { bn: "ইসলামিক ফাউন্ডেশন বাংলাদেশ", en: "Islamic Foundation Bangladesh" }, year: "২০১৪" },
    ],
    madrasah: { bn: "সীরাত গবেষণা একাডেমি, রাজশাহী", en: "Seerah Research Academy, Rajshahi" },
    district: "rajshahi",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 24,
    rating: 4.8,
    stats: { answers: 874, articles: 84, fatwas: 26, followers: 26400, helpfulVotes: 8120 },
    joinedAt: "2023-07-21T07:25:00.000Z",
    fiqhFocus: ["general", "comparative"],
  },
  {
    id: "scholar-12",
    slug: "mufti-rahimullah",
    name: { bn: "মুফতি রহিমুল্লাহ", en: "Mufti Rahimullah" },
    honorific: { bn: "মুফতি", en: "Mufti" },
    avatarColor: "#256d8c",
    shortBio: {
      bn: "প্রযুক্তি ও আধুনিক মাসআলায় গবেষক, ডিজিটাল অর্থনীতি বিষয়ে ফতোয়া",
      en: "Researcher in technology and modern issues, rulings on the digital economy",
    },
    bio: {
      bn: "মুফতি রহিমুল্লাহ ক্রিপ্টোকারেন্সি, ফ্রিল্যান্সিং আয়, অনলাইন গেমিং, ডেটা গোপনীয়তা ও কৃত্রিম বুদ্ধিমত্তা সংক্রান্ত প্রশ্নে কাজ করেন — এমন বিষয় যেখানে পূর্ববর্তী ফতোয়া কিতাবে সরাসরি উত্তর নেই। তিনি নতুন প্রযুক্তিকে না-বলা বা হ্যাঁ-বলা নয়, বরং এর মাঝের শরীয়াহ সীমা নির্ণয় করার পদ্ধতি শেখান।",
      en: "Mufti Rahimullah works on questions around cryptocurrency, freelancing income, online gaming, data privacy and artificial intelligence — areas the classical fatwa collections never addressed. Rather than a blanket yes or no, he teaches a method for establishing where the shariah boundary lies in a new technology.",
    },
    departmentIds: ["technology", "finance", "medical"],
    primaryDepartmentId: "technology",
    specialization: [
      { bn: "ক্রিপ্টোকারেন্সি ও ডিজিটাল সম্পদ", en: "Cryptocurrency and digital assets" },
      { bn: "ফ্রিল্যান্সিং ও অনলাইন আয়", en: "Freelancing and online income" },
      { bn: "ডেটা গোপনীয়তা ও এআই", en: "Data privacy and AI" },
      { bn: "আধুনিক চিকিৎসা প্রযুক্তি", en: "Modern medical technology" },
    ],
    languages: ["বাংলা", "ইংরেজি", "আরবি"],
    credentials: [
      { id: "cred-12-1", title: { bn: "দাওরায়ে হাদীস ও ইফতা", en: "Dawra-e-Hadith and Ifta" }, institution: { bn: "জামিয়া রাহমানিয়া আরাবিয়া, ঢাকা", en: "Jamia Rahmania Arabia, Dhaka" }, year: "২০১০" },
      { id: "cred-12-2", title: { bn: "কম্পিউটার সায়েন্সে স্নাতক", en: "BSc in Computer Science" }, institution: { bn: "ইউনাইটেড ইন্টারন্যাশনাল ইউনিভার্সিটি, ঢাকা", en: "United International University, Dhaka" }, year: "২০১৫" },
      { id: "cred-12-3", title: { bn: "ইসলামি অর্থনীতি ডিপ্লোমা", en: "Diploma in Islamic economics" }, institution: { bn: "ইসলামিক ইউনিভার্সিটি অব মদীনা", en: "Islamic University of Madinah" }, year: "২০১৮" },
    ],
    madrasah: { bn: "সেন্টার ফর ইসলামিক টেকনোলজি, ঢাকা", en: "Centre for Islamic Technology, Dhaka" },
    district: "dhaka",
    verified: false,
    availableForQuestions: true,
    responseTimeHours: 8,
    rating: 4.6,
    stats: { answers: 762, articles: 46, fatwas: 182, followers: 24100, helpfulVotes: 6840 },
    joinedAt: "2024-03-11T13:10:00.000Z",
    fiqhFocus: ["hanafi", "comparative"],
  },
];

export const SCHOLAR_BY_ID: Record<string, Scholar> = Object.fromEntries(
  SCHOLARS.map((s) => [s.id, s]),
);

export const SCHOLAR_BY_SLUG: Record<string, Scholar> = Object.fromEntries(
  SCHOLARS.map((s) => [s.slug, s]),
);

export function getScholar(id: string): Scholar | undefined {
  return SCHOLAR_BY_ID[id];
}

export function getScholarBySlug(slug: string): Scholar | undefined {
  return SCHOLAR_BY_SLUG[slug];
}

/** Everyone who belongs to a department, primary members listed first. */
export function getScholarsByDepartment(slug: string): Scholar[] {
  return SCHOLARS.filter((s) => s.departmentIds.includes(slug)).sort((a, b) => {
    if (a.primaryDepartmentId === slug && b.primaryDepartmentId !== slug) return -1;
    if (b.primaryDepartmentId === slug && a.primaryDepartmentId !== slug) return 1;
    return b.stats.answers - a.stats.answers;
  });
}

/** Current user's followed scholars — ids match `CURRENT_USER` in `./personal`. */
export const FOLLOWED_SCHOLAR_IDS = ["scholar-1", "scholar-4", "scholar-5", "scholar-8"];

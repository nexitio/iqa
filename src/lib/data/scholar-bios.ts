import type { ScholarBiography } from "@/lib/types";

/**
 * The biographical archive.
 *
 * A profile page had a two-sentence paragraph and a list of degrees — enough to
 * decide whether to follow someone, not enough to know who they are. A reader
 * comes to a scholar's page to learn where they were formed, who they sat with,
 * what they were authorised to teach, what they wrote, and who they taught; that
 * material is longer than a profile card should carry, so it lives here, keyed by
 * scholar id, and only the profile page ever loads it.
 *
 * Three rules hold across the archive. Nothing contradicts the record in
 * `scholars.ts` (degrees, madrasah and district are the same facts told at
 * greater length, never a second version of them). Every date is a real ordering
 * of that person's life — a teacher cannot be met after their student graduated.
 * And a claim that is not a matter of record is written as what it is: service,
 * teaching, research, authorship. Where a biography cannot know something, it
 * does not invent it — the `sources` list says where the archive's facts come
 * from, and it is honest about being an in-house record rather than a chain of
 * transmissions.
 *
 * The whole archive is authored fixture content, like the rest of the dataset:
 * the people are fictional and so are their teachers, and the names are written
 * as a biography would write them, with the role and the place beside the name.
 */

export const SCHOLAR_BIOGRAPHIES: ScholarBiography[] = [
  {
    scholarId: "scholar-1",
    born: {
      bn: "১৯৭৯ সালে নোয়াখালীর সেনবাগ উপজেলার এক কৃষক পরিবারে জন্ম।",
      en: "Born in 1979 into a farming family in Senbagh, Noakhali.",
    },
    family: {
      bn: "বাবা ছিলেন গ্রামের মসজিদের ইমাম, মা পড়িয়েছিলেন কুরআন। ছয় ভাইবোনের মধ্যে তিনি ছিলেন সবার ছোট — বাড়িতেই কুরআন পড়া শুরু, তারপর গ্রামের মাদ্রাসায় ভর্তি।",
      en: "His father was the village mosque's imam and his mother taught Quran. The youngest of six siblings, he learned to read at home before entering the village madrasah.",
    },
    narrative: {
      bn: "হাটহাজারীতে দাওরায়ে হাদীস শেষ করেন ২০০৫ সালে। এরপর সাত বছর দারুল ইফতায় কাটিয়েছেন — প্রতিদিন প্রশ্ন আসত, আর প্রতিটি ফতোয়ার খসড়া শায়খদের সামনে পড়ে তার ভুল ধরিয়ে নিতে হতো। তিনি বলেন, ওই সাত বছরেই তিনি শিখেছেন উত্তর দেওয়া মানে কেবল হ্যাঁ-না বলা নয়, বরং প্রশ্নকর্তার পরিস্থিতি বোঝা।\n\n২০০৮ থেকে ২০১৬ সাল পর্যন্ত তিনি চট্টগ্রাম ও পরে ঢাকায় মাসআলা শিক্ষা দিয়েছেন। পারিবারিক বিবাহবিচ্ছেদ, মোহরানা ও ফারায়েজের জটিল হিসাব — এই তিন বিষয়ে লোকেরা তাঁকে খুঁজে আসত, আর সেখান থেকেই তাঁর বিশেষ আগ্রহ তৈরি হয়। আল-আজহারে উসুলুল ফিকহে প্রশিক্ষণ (২০১৫) তাঁকে মাসআলার দলিল ও প্রয়োগের মধ্যে সংযোগটি আরও স্পষ্টভাবে দেখতে শিখিয়েছে।\n\n২০১৬ সাল থেকে তিনি জামিয়া রাহমানিয়া আরাবিয়া, ঢাকার দারুল ইফতায় মাসআলা গবেষণার কাজে আছেন। তাঁর পাঠদানের ধরন সহজ: মাসআলার রায় এক লাইনে, তারপর দলিল, তারপর প্রশ্নকর্তার বাস্তবতার সাথে সেই রায়ের সংযোগ। বলপ্রয়োগে নয়, কিতাবের অধ্যায় ধরে ধরে তিনি উত্তর সাজান — এই অভ্যাসটিই তাঁকে সহকর্মীদের কাছে আলাদা করেছে।",
      en: "He finished Dawra-e-Hadith at Hathazari in 2005, then spent seven years in a darul ifta, where every ruling was drafted and read back to his teachers until the error was found. Those years, he says, taught him that answering means understanding the questioner's situation, not merely choosing between two verdicts.\n\nFrom 2008 to 2016 he taught masail in Chattogram and then Dhaka. Complex divorce, mahr and inheritance accounts found their way to him, and that is where his lasting specialism comes from. A training in usul at Al-Azhar (2015) sharpened his sense of the join between a ruling's evidence and its application.\n\nSince 2016 he has worked and taught in the darul ifta of Jamia Rahmania Arabia, Dhaka. His method is plain: the ruling in one line, the evidence after it, then the connection between that ruling and the circumstances of the person asking. He argues from the chapter of a book rather than from authority — the habit that sets his answers apart.",
    },
    now: {
      bn: "বর্তমানে তিনি জামিয়া রাহমানিয়া আরাবিয়ার দারুল ইফতায় মাসআলা গবেষণা ও প্রশিক্ষণের দায়িত্বে আছেন, সরকারি যাকাত ও উত্তরাধিকার সংক্রান্ত প্রশ্নগুলোতে সহায়তা করেন এবং সহকর্মী মুফতিদের ফতোয়া সম্পাদনার কাজ দেখেন। ইলমে পারিবারিক ও লেনদেন ফিকহের প্রশ্নে দলিলভিত্তিক উত্তর তাঁর কাছেই সবচেয়ে বেশি এসেছে।",
      en: "He now works in the darul ifta of Jamia Rahmania Arabia, assists on state zakat and inheritance questions, and reviews the drafting of younger muftis. Family and transactional fiqh are the departments whose questions reach him most on Ilm.",
    },
    teachers: [
      {
        id: "b1-t1",
        name: { bn: "শায়খ ইদ্রিস আলম (রাহ.), শায়খুল হাদীস, হাটহাজারী", en: "Shaykh Idris Alam (rh.), Shaykh al-Hadith, Hathazari" },
        note: { bn: "দাওরায়ে হাদীসে সহীহ বুখারী ও মুসলিমের দরস তাঁর কাছেই; সনদ গ্রহণ ২০০৫।", en: "Read Bukhari and Muslim in the Dawra under him; his ijazah in hadith dates from 2005." },
      },
      {
        id: "b1-t2",
        name: { bn: "মুফতি কামাল উদ্দীন, প্রধান মুফতি, দারুল ইফতা হাটহাজারী", en: "Mufti Kamal Uddin, senior mufti, Darul Ifta Hathazari" },
        note: { bn: "সাত বছরের ইফতা প্রশিক্ষণের তত্ত্বাবধায়ক; ফারায়েজে তাঁর দরসেই ভিত্তি।", en: "Supervised his seven years of ifta training; his grounding in faraid comes from his lessons." },
      },
      {
        id: "b1-t3",
        name: { bn: "শায়খ মুহাম্মদ আওয়ামাহ, উসুলুল ফিকহ, আল-আজহার", en: "Shaykh Muhammad Awamah, usul al-fiqh, Al-Azhar" },
        note: { bn: "২০১৫ সালের উসুল প্রশিক্ষণে মাসআলার দলিল-পদ্ধতি ও তাহকীক পড়েছেন।", en: "Studied the structure of legal evidence and textual criticism in the 2015 usul training." },
      },
    ],
    ijazah: [
      {
        id: "b1-i1",
        title: { bn: "সহীহ সিত্তার সনদ (বুখারী, মুসলিম, আবু দাউদ, তিরমিযী, নাসাঈ, ইবনে মাজাহ)", en: "Ijazah in the six books of hadith" },
        grantedBy: { bn: "হাটহাজারী দারুল উলূমের শায়খুল হাদীস, ২০০৫", en: "The Shaykh al-Hadith of Darul Ulum Hathazari, 2005" },
      },
      {
        id: "b1-i2",
        title: { bn: "ইফতা ও ফারায়েজে অনুমোদন (তাখাররুজ)", en: "Licence in ifta and faraid (takharrus)" },
        grantedBy: { bn: "দারুল ইফতা, হাটহাজারী, ২০১২", en: "Darul Ifta, Hathazari, 2012" },
      },
    ],
    service: [
      {
        id: "b1-s1",
        title: { bn: "মাসআলা শিক্ষক ও মুরাব্বি, তারবিয়াতুল উম্মাহ", en: "Teacher of masail and student mentor, Tarbiyatul Ummah" },
        place: { bn: "চট্টগ্রাম", en: "Chattogram" },
        period: { bn: "২০০৮–২০১২", en: "2008–2012" },
      },
      {
        id: "b1-s2",
        title: { bn: "ইফতা বিভাগের মুফতি ও প্রশিক্ষক", en: "Mufti and trainer, ifta department" },
        place: { bn: "জামিয়া রাহমানিয়া আরাবিয়া, ঢাকা", en: "Jamia Rahmania Arabia, Dhaka" },
        period: { bn: "২০১২–২০১৬", en: "2012–2016" },
        note: { bn: "ফতোয়ার খসড়া সম্পাদনা ও জুনিয়র মুফতিদের প্রশিক্ষণ।", en: "Edited rulings and trained junior muftis." },
      },
      {
        id: "b1-s3",
        title: { bn: "দারুল ইফতা পরিষদের সদস্য", en: "Member, darul ifta council" },
        place: { bn: "জামিয়া রাহমানিয়া আরাবিয়া, ঢাকা", en: "Jamia Rahmania Arabia, Dhaka" },
        period: { bn: "২০১৬–বর্তমান", en: "2016–present" },
        note: { bn: "ফারায়েজ ও লেনদেন সংক্রান্ত কঠিন মাসআলার গবেষণা।", en: "Researches the hard cases in inheritance and transactions." },
      },
    ],
    works: [
      {
        id: "b1-w1",
        title: { bn: "ফারায়েজের হিসাব: প্রশ্ন থেকে রায় পর্যন্ত", en: "The Faraid Ledger: From Question to Ruling" },
        year: { bn: "২০২০", en: "2020" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "উত্তরাধিকারের বণ্টন ধাপে ধাপে, সাথে বাস্তব প্রশ্নের সমাধান।", en: "Inheritance distribution step by step, worked through real questions." },
      },
      {
        id: "b1-w2",
        title: { bn: "বিবাহ ও তালাকের কাগজ", en: "Marriage and Divorce Papers" },
        year: { bn: "২০২২", en: "2022" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "মোহরানা, ইদ্দত ও ভরণপোষণের হুকুম কাগজপত্রে কীভাবে লিখতে হয়।", en: "How mahr, iddah and maintenance clauses are written into documents." },
      },
      {
        id: "b1-w3",
        title: { bn: "সুদি কিস্তি থেকে বের হওয়ার পথ", en: "Leaving the Interest Instalment Behind" },
        year: { bn: "২০২৪", en: "2024" },
        kind: { bn: "গবেষণা", en: "Research" },
        note: { bn: "ঋণগত সুদে পড়া পরিবারের জন্য ধাপে ধাপে বেরোনোর পরিকল্পনা।", en: "A staged exit plan for households already carrying debt." },
      },
    ],
    students: [
      {
        id: "b1-st1",
        name: { bn: "মুফতি সাঈদ আহমেদ", en: "Mufti Sayeed Ahmed" },
        note: { bn: "ইফতা কোর্স ২০২১; এখন কুমিল্লার দারুল ইফতায় ফারায়েজের দায়িত্বে।", en: "Ifta course, 2021; now handles faraid at a darul ifta in Cumilla." },
      },
      {
        id: "b1-st2",
        name: { bn: "মুফতি জুবায়ের হোসেন", en: "Mufti Jubayer Hossain" },
        note: { bn: "২০১৯ সালে মাসআলা গবেষণার সহকারী ছিলেন; ব্যাংকিং ফতোয়া নিয়ে কাজ করেন।", en: "Assisted his research in 2019; now works on banking rulings." },
      },
    ],
    awards: [
      {
        id: "b1-a1",
        title: { bn: "ফতোয়া গবেষণায় বেফাকুল মাদারিসিল আরাবিয়ার স্বীকৃতি", en: "Befaq recognition for research in ifta" },
        year: { bn: "২০২৩", en: "2023" },
        note: { bn: "ফারায়েজ বিষয়ক গবেষণার জন্য।", en: "For the faraid research project." },
      },
    ],
    sources: [
      { bn: "সনদ ও ডিগ্রির কাগজপত্র যাচাই করা হয়েছে জামিয়া রাহমানিয়া আরাবিয়া, ঢাকা ও দারুল ইফতা, হাটহাজারীর মাধ্যমে।", en: "Degrees and licences verified through Jamia Rahmania Arabia, Dhaka and Darul Ifta, Hathazari." },
      { bn: "জীবনীর বর্ণনাগুলো তাঁর নিজের সাক্ষাৎকার ও দারুল ইফতার নথিভুক্ত পরিষদ-সম্মেলনের ভিত্তিতে লেখা।", en: "The narrative follows his own interviews and the council minutes of the darul ifta." },
    ],
    updatedAt: "2026-07-18",
  },
  {
    scholarId: "scholar-2",
    born: {
      bn: "১৯৮১ সালে রাজশাহীর বাঘা উপজেলার এক শিক্ষক পরিবারে জন্ম।",
      en: "Born in 1981 into a teaching family in Bagha, Rajshahi.",
    },
    family: {
      bn: "দাদা ছিলেন গ্রামের প্রাথমিক বিদ্যালয়ের প্রধান শিক্ষক, বাবা কলেজের বাংলা শিক্ষক। বইয়ের ঘর ও তর্কের অভ্যাস — দুটোই তাঁর পরিবারের উত্তরাধিকার।",
      en: "His grandfather led the village primary school and his father taught Bangla at a college. A house full of books and a habit of argument are both family inheritances.",
    },
    narrative: {
      bn: "তিনি ধর্মীয় দর্শন নিয়ে পড়াশোনা শুরু করেন ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়ায় (এমএ ২০০৭)। এরপর মদীনার ইসলামিক ইউনিভার্সিটিতে হাদীস গবেষণার ডিপ্লোমা (২০১১) — সেখানেই তিনি শিখেছেন, সনদ যাচাইয়ের কঠোরতাটা আকীদার প্রশ্নে কতটা জরুরি। ডক্টরেট ২০১৪ সালে ঢাকা বিশ্ববিদ্যালয়ের ইসলামিক স্টাডিজ বিভাগ থেকে।\n\nনাস্তিক্যবাদ ও আধুনিক সন্দেহের জবাবে তাঁর কাজ শুরু হয় ক্যাম্পাসের প্রশ্ন থেকে। ২০১৫ সালের পর তিনি লক্ষ করেন, তরুণদের প্রশ্নগুলো আর 'কেন হারাম' ধাঁচের নয় — সেগুলো অভিজ্ঞতা, নৈতিকতা ও বিজ্ঞানের ভাষায় আসে। তখন থেকে তিনি যুক্তি ধরে ধরে উত্তর সাজাতে শুরু করেন, ধমকের বদলে প্রমাণ ব্যবহার করেন।\n\nতিনি ঢাকা বিশ্ববিদ্যালয়ে ইসলামিক স্টাডিজে শিক্ষকতা করেন এবং তুলনামূলক ধর্মতত্ত্বের ক্লাস নেন। তাঁর হাদীসের দরসে সনদের আলোচনা প্রায় সর্বদা উপস্থিত থাকে — কে বলেছেন, কোন পথে এসেছে, কোন শর্তে গ্রহণযোগ্য। এই পদ্ধতিটিই তিনি তরুণ প্রশ্নকর্তাদের জন্য তাঁর সবচেয়ে বড় উপহার মনে করেন।",
      en: "He read religious philosophy at Islamic University, Kushtia (MA 2007), then took a diploma in hadith research at the Islamic University of Madinah (2011), where he learned how much a creedal claim depends on rigour in authentication. His doctorate came from the Department of Islamic Studies at the University of Dhaka in 2014.\n\nHis work on atheism and modern doubt began with questions asked on campus. After 2015 he noticed that young people's objections were no longer about what is forbidden — they were framed in the language of experience, ethics and science. He began answering through argument rather than rebuke, and with evidence in place of alarm.\n\nHe teaches Islamic Studies and comparative theology at the University of Dhaka. Authenticity is almost always present in his hadith lessons: who said it, by which route it arrived, and on what terms it is accepted — the method he considers his real gift to young questioners.",
    },
    now: {
      bn: "বর্তমানে তিনি ঢাকা বিশ্ববিদ্যালয়ের ইসলামিক স্টাডিজ বিভাগে অধ্যাপনা করছেন, আকীদা ও তুলনামূলক ধর্মতত্ত্বে স্নাতকোত্তর শিক্ষার্থীদের গবেষণা তত্ত্বাবধান করেন এবং ইলমে নাস্তিক্যবাদ ও সন্দেহ সংক্রান্ত প্রশ্নের দলিলভিত্তিক উত্তর দেন।",
      en: "He now teaches in the Department of Islamic Studies at the University of Dhaka, supervises postgraduate research in creed and comparative theology, and answers Ilm's questions on atheism and doubt with documented evidence.",
    },
    teachers: [
      {
        id: "b2-t1",
        name: { bn: "অধ্যাপক ড. ফজলুল কাদির, ইসলামিক স্টাডিজ, ইসলামী বিশ্ববিদ্যালয়", en: "Prof. Dr. Fazlul Qadir, Islamic Studies, Islamic University" },
        note: { bn: "স্নাতকোত্তর গবেষণার তত্ত্বাবধায়ক; ইলমুল কালামের পাঠ তাঁর কাছেই।", en: "Supervised his masters research; introduced him to the systematic study of creed." },
      },
      {
        id: "b2-t2",
        name: { bn: "শায়খ আব্দুল্লাহ বিন সাঈদ, হাদীস শাস্ত্র, মদীনা", en: "Shaykh Abdullah bin Saeed, hadith studies, Madinah" },
        note: { bn: "২০১১ সালে সনদ যাচাইয়ের ডিপ্লোমায় মূল পাঠ ও তাহকীকের প্রশিক্ষণ।", en: "Trained him in textual criticism and source reading during the 2011 diploma." },
      },
      {
        id: "b2-t3",
        name: { bn: "অধ্যাপক ড. শামসুন নাহার, তুলনামূলক ধর্মতত্ত্ব", en: "Prof. Dr. Shamsun Nahar, comparative theology" },
        note: { bn: "ডক্টরেটে ধর্মতত্ত্বের তুলনা করার পদ্ধতি ও ধারণার ইতিহাস।", en: "Guided the methodology and conceptual history of his doctoral comparison." },
      },
    ],
    ijazah: [
      {
        id: "b2-i1",
        title: { bn: "হাদীস গবেষণা ও তাহকীকে ডিপ্লোমা সনদ", en: "Diploma licence in hadith research and textual criticism" },
        grantedBy: { bn: "ইসলামিক ইউনিভার্সিটি অব মদীনা, ২০১১", en: "Islamic University of Madinah, 2011" },
      },
      {
        id: "b2-i2",
        title: { bn: "সহীহ বুখারীর সনদ", en: "Ijazah in Sahih al-Bukhari" },
        grantedBy: { bn: "মদীনার দরস-পরিষদ, ২০১১", en: "The Madinah study circle, 2011" },
      },
    ],
    service: [
      {
        id: "b2-s1",
        title: { bn: "প্রভাষক, ইসলামিক স্টাডিজ", en: "Lecturer, Islamic Studies" },
        place: { bn: "ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া", en: "Islamic University, Kushtia" },
        period: { bn: "২০০৮–২০১৩", en: "2008–2013" },
      },
      {
        id: "b2-s2",
        title: { bn: "সহকারী অধ্যাপক, ইসলামিক স্টাডিজ বিভাগ", en: "Assistant professor, Department of Islamic Studies" },
        place: { bn: "ঢাকা বিশ্ববিদ্যালয়", en: "University of Dhaka" },
        period: { bn: "২০১৪–বর্তমান", en: "2014–present" },
        note: { bn: "স্নাতকোত্তর কোর্স: তুলনামূলক ধর্মতত্ত্ব ও আকীদার ইতিহাস।", en: "Postgraduate courses: comparative theology and the history of creed." },
      },
      {
        id: "b2-s3",
        title: { bn: "সদস্য, তরুণ গবেষক পরিষদ", en: "Member, young researchers' council" },
        place: { bn: "বাংলাদেশ ইসলামিক স্টাডিজ সোসাইটি", en: "Bangladesh Islamic Studies Society" },
        period: { bn: "২০১৭–বর্তমান", en: "2017–present" },
        note: { bn: "ক্যাম্পাসে সন্দেহ ও আকীদা বিষয়ক গবেষণা সমন্বয়।", en: "Coordinates campus research on doubt and creed." },
      },
    ],
    works: [
      {
        id: "b2-w1",
        title: { bn: "সন্দেহের ভাষা: আধুনিক প্রশ্নের আকীদাভিত্তিক উত্তর", en: "The Language of Doubt: Creedal Answers to Modern Questions" },
        year: { bn: "২০১৮", en: "2018" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "নাস্তিক্যবাদ, নৈতিকতার উৎস ও বিজ্ঞানের সীমা নিয়ে আলোচনা।", en: "Atheism, the source of morality, and the limits of science as an argument." },
      },
      {
        id: "b2-w2",
        title: { bn: "সনদ ও যুক্তি: হাদীস যাচাইয়ের পদ্ধতি", en: "Chain and Argument: How Hadith Are Authenticated" },
        year: { bn: "২০২১", en: "2021" },
        kind: { bn: "গবেষণা", en: "Research" },
        note: { bn: "শিক্ষার্থীদের জন্য যাচাইয়ের ব্যবহারিক নির্দেশিকা।", en: "A practical guide to authentication for students." },
      },
      {
        id: "b2-w3",
        title: { bn: "তুলনামূলক ধর্মতত্ত্বের পাঠ", en: "Readings in Comparative Theology" },
        year: { bn: "২০২৩", en: "2023" },
        kind: { bn: "অনুবাদ ও সম্পাদনা", en: "Translation and edition" },
        note: { bn: "ইংরেজি পাঠ্যক্রমে ধর্মতত্ত্বের মূল ধারণাগুলোর বাংলা সংস্করণ।", en: "A Bangla version of the core concepts used in English-language theology courses." },
      },
    ],
    students: [
      {
        id: "b2-st1",
        name: { bn: "মাহমুদা আক্তার", en: "Mahmuda Akter" },
        note: { bn: "ডক্টরেট গবেষক; নাস্তিক্যবাদ ও নৈতিকতার প্রশ্নে কাজ করছেন।", en: "Doctoral researcher working on atheism and moral realism." },
      },
      {
        id: "b2-st2",
        name: { bn: "সাদমান রহমান", en: "Sadman Rahman" },
        note: { bn: "স্নাতকোত্তর; ক্যাম্পাস প্রশ্নের দলিলভিত্তিক উত্তর নিয়ে থিসিস করছেন।", en: "Postgraduate; writing on evidence-based answers to campus questions." },
      },
    ],
    awards: [
      {
        id: "b2-a1",
        title: { bn: "অধ্যাপক ড. মুহাম্মদ এনামুল হক গবেষণা পুরস্কার", en: "Prof. Dr. Muhammad Enamul Haque Research Award" },
        year: { bn: "২০২২", en: "2022" },
        note: { bn: "আকীদা ও তুলনামূলক ধর্মতত্ত্বে গবেষণার জন্য।", en: "For research in creed and comparative theology." },
      },
    ],
    sources: [
      { bn: "ডিগ্রি ও থিসিসের তথ্য ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া ও ঢাকা বিশ্ববিদ্যালয়ের একাডেমিক রেকর্ড থেকে নেওয়া।", en: "Degree and thesis details come from the academic records of Islamic University, Kushtia and the University of Dhaka." },
      { bn: "প্রকাশনার তথ্য বইয়ের কপিরাইট পৃষ্ঠা ও বিভাগীয় প্রকাশনা তালিকা অনুসারে যাচাই করা।", en: "Publication details checked against copyright pages and departmental lists." },
    ],
    updatedAt: "2026-07-24",
  },
  {
    scholarId: "scholar-3",
    born: {
      bn: "১৯৮৩ সালে সিলেটের বিয়ানীবাজার উপজেলার এক ব্যবসায়ী পরিবারে জন্ম, যেখানে লেনদেনের হিসাব ও ফিকহ একসাথে শেখা শুরু।",
      en: "Born in 1983 in a merchant family in Beanibazar, Sylhet, where bookkeeping and fiqh were learned side by side.",
    },
    family: {
      bn: "বাবা ছিলেন পণ্যের মোকামের ব্যবসায়ী; উঠানে বসে চুক্তির শর্ত শুনে শুনেই তিনি টাকা, সময় ও ঝুঁকির কথা বোঝা শুরু করেন।",
      en: "His father traded at the goods market; listening to contracts being settled in their yard is where he first learned about money, time and risk.",
    },
    narrative: {
      bn: "হাটহাজারীতে দাওরায়ে হাদীস ও ইফতা শেষ করেন ২০০৮ সালে। ইসলামি ব্যাংকে যোগ দেওয়ার আগে তিনি নিজের গ্রামের ব্যবসায়ীদের হিসাব দেখতে শেখেন — দাতা, গ্রহীতা, কিস্তি এবং পণ্যে সময়ভিত্তিক লাভের পার্থক্য।\n\n২০১০ সালে তিনি একটি ইসলামি ব্যাংকের শরীয়াহ অডিট টিমে যোগ দেন, আর সেখানে প্রথমবার দেখেন কাগজে শরীয়াহ-সম্মত বলে লেখা পণ্য বাস্তবে সুদের হিসাবে চলে কীভাবে। এই অভিজ্ঞতা থেকেই ২০১৬ সালে ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া থেকে ইসলামিক ফাইন্যান্সে এমবিএ করেন। তাঁর লেখার বিশেষত্ব এখানেই: হুকুম সাধারণভাবে নয়, বাংলাদেশের বাজারের শর্ত মাথায় রেখে।\n\nতিনি ক্রেডিট কার্ড, ডিপিএস, সঞ্চয়পত্র, শেয়ারবাজার ও অনলাইন আয় নিয়ে স্পষ্ট রায় দেন এবং তা প্রতিষ্ঠানের নাম ধরে ধরে ব্যাখ্যা করতে পারেন। ২০১৯ সালে দারুল ইফতা, ঢাকার শরীয়াহ অ্যাডভাইজরি সনদ পাওয়ার পর তিনি কয়েকটি ব্যাংকের শরীয়াহ বোর্ডে দায়িত্ব নেন।",
      en: "He completed Dawra-e-Hadith and ifta at Hathazari in 2008. Before entering Islamic banking he studied the books of his own village traders — lender, borrower, instalments, and the difference between profit in goods and gain on time.\n\nIn 2010 he joined the Shariah audit team of an Islamic bank, where he first saw how a product written as Shariah-compliant on paper behaves as interest in practice. That experience took him to an MBA in Islamic Finance at Islamic University, Kushtia (2016). It is also the signature of his writing: not the ruling in general, but the ruling in the terms of the Bangladeshi market.\n\nHe gives clear rulings on credit cards, DPS, savings certificates, the stock market and online income, and he names the mechanism rather than the brand. After earning a Shariah advisory certificate from Darul Ifta, Dhaka in 2019, he took seats on the Shariah boards of several banks.",
    },
    now: {
      bn: "বর্তমানে তিনি ইসলামিক রিসার্চ সেন্টার, ঢাকার শরীয়াহ গবেষণা বিভাগে আছেন, কয়েকটি ইসলামি ব্যাংকের শরীয়াহ বোর্ডে পরামর্শক এবং ইলমে সুদ, হালাল বিনিয়োগ ও আধুনিক আর্থিক পণ্যের প্রশ্নে রায় দেন।",
      en: "He now works in the Shariah research department at the Islamic Research Centre, Dhaka, advises several Islamic banks' Shariah boards, and answers Ilm's questions on riba, halal investment and modern financial products.",
    },
    teachers: [
      {
        id: "b3-t1",
        name: { bn: "মুফতি হাবীবুর রহমান, ইফতা বিভাগ, হাটহাজারী", en: "Mufti Habibur Rahman, ifta faculty, Hathazari" },
        note: { bn: "ইফতা ও লেনদেনের মাসআলায় তাঁর প্রধান শিক্ষক, সনদ ২০০৮।", en: "His principal teacher in ifta and transactional rulings; licence granted in 2008." },
      },
      {
        id: "b3-t2",
        name: { bn: "ড. নাজমুল হাসান, ইসলামিক ফাইন্যান্স, ইসলামী বিশ্ববিদ্যালয়", en: "Dr. Nazmul Hasan, Islamic finance, Islamic University" },
        note: { bn: "এমবিএ তত্ত্বাবধায়ক; শরীয়াহ অডিটের পদ্ধতি তাঁর কাছেই শেখা।", en: "Supervised the MBA and taught him the method of a Shariah audit." },
      },
      {
        id: "b3-t3",
        name: { bn: "মুফতি আব্দুস সালাম, শরীয়াহ অ্যাডভাইজরি পরিষদ, ঢাকা", en: "Mufti Abdus Salam, Shariah advisory council, Dhaka" },
        note: { bn: "২০১৯ সালের সনদ প্রশিক্ষণে আধুনিক ব্যাংকিং পণ্যের ফিকহি বিশ্লেষণ।", en: "Analysed modern banking products with him in the 2019 certification." },
      },
    ],
    ijazah: [
      {
        id: "b3-i1",
        title: { bn: "ইফতা ও লেনদেন ফিকহে অনুমোদন", en: "Licence in ifta and muamalat" },
        grantedBy: { bn: "হাটহাজারী দারুল উলূম, ২০০৮", en: "Darul Ulum Hathazari, 2008" },
      },
      {
        id: "b3-i2",
        title: { bn: "শরীয়াহ অ্যাডভাইজরি সনদ", en: "Shariah advisory certificate" },
        grantedBy: { bn: "দারুল ইফতা, ঢাকা, ২০১৯", en: "Darul Ifta, Dhaka, 2019" },
      },
    ],
    service: [
      {
        id: "b3-s1",
        title: { bn: "শরীয়াহ অডিট কর্মকর্তা", en: "Shariah audit officer" },
        place: { bn: "একটি ইসলামি ব্যাংক, ঢাকা", en: "An Islamic bank, Dhaka" },
        period: { bn: "২০১০–২০১৬", en: "2010–2016" },
        note: { bn: "পণ্যের কাগজ ও বাস্তব হিসাব মিলিয়ে দেখা।", en: "Checked products' paperwork against how they actually behaved." },
      },
      {
        id: "b3-s2",
        title: { bn: "শরীয়াহ বোর্ডের সদস্য", en: "Member, Shariah board" },
        place: { bn: "দুইটি ইসলামি ব্যাংক ও একটি বিনিয়োগ প্রতিষ্ঠান", en: "Two Islamic banks and an investment house" },
        period: { bn: "২০১৯–বর্তমান", en: "2019–present" },
        note: { bn: "নতুন পণ্যের ফিকহি পর্যালোচনা ও বার্ষিক শরীয়াহ প্রতিবেদন।", en: "Reviews new products and signs the annual Shariah report." },
      },
      {
        id: "b3-s3",
        title: { bn: "গবেষক, শরীয়াহ গবেষণা বিভাগ", en: "Researcher, Shariah research department" },
        place: { bn: "ইসলামিক রিসার্চ সেন্টার, ঢাকা", en: "Islamic Research Centre, Dhaka" },
        period: { bn: "২০১৭–বর্তমান", en: "2017–present" },
      },
    ],
    works: [
      {
        id: "b3-w1",
        title: { bn: "সুদমুক্ত ব্যাংক: কাগজ ও বাস্তবতা", en: "The Interest-Free Bank: Paper and Practice" },
        year: { bn: "২০১৯", en: "2019" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "মুরাবাহা, ইজারা ও মুশারাকার বাস্তব প্রয়োগ ও ফাঁকগুলো।", en: "Murabaha, ijara and musharka in practice, and where they leak." },
      },
      {
        id: "b3-w2",
        title: { bn: "ক্রেডিট কার্ড, ডিপিএস ও সঞ্চয়পত্রের হুকুম", en: "Rulings on Cards, DPS and Savings Certificates" },
        year: { bn: "২০২১", en: "2021" },
        kind: { bn: "গবেষণা", en: "Research" },
        note: { bn: "প্রতিটি পণ্যের শর্ত ধরে ধরে হালাল-হারামের বিশ্লেষণ।", en: "Product by product, clause by clause." },
      },
      {
        id: "b3-w3",
        title: { bn: "অনলাইন আয় ও ডিজিটাল অর্থ: ব্যবসায়ীর নির্দেশিকা", en: "Online Income and Digital Money: A Merchant's Guide" },
        year: { bn: "২০২৪", en: "2024" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "ফ্রিল্যান্সিং, পেমেন্ট গেটওয়ে ও ক্রিপ্টো নিয়ে বাস্তব রায়।", en: "Practical rulings on freelancing, payment gateways and crypto." },
      },
    ],
    students: [
      {
        id: "b3-st1",
        name: { bn: "মুফতি তানজিল আহমেদ", en: "Mufti Tanzil Ahmed" },
        note: { bn: "শরীয়াহ অডিট বিভাগে তাঁর সহকর্মী; এখন ব্যাংকিং ফতোয়া লেখেন।", en: "Worked beside him in Shariah audit; now writes banking rulings." },
      },
    ],
    awards: [
      {
        id: "b3-a1",
        title: { bn: "ইসলামিক ফাইন্যান্স গবেষণায় সেন্টার ফর ইসলামিক ইকোনমিক্স স্বীকৃতি", en: "Centre for Islamic Economics recognition in finance research" },
        year: { bn: "২০২৪", en: "2024" },
      },
    ],
    sources: [
      { bn: "ডিগ্রি ও সনদের তথ্য হাটহাজারী, ইসলামী বিশ্ববিদ্যালয় ও দারুল ইফতা, ঢাকার রেকর্ড অনুসারে।", en: "Degrees and certificates follow the records of Hathazari, Islamic University and Darul Ifta, Dhaka." },
      { bn: "শরীয়াহ বোর্ডের দায়িত্বের সময়কাল সংশ্লিষ্ট প্রতিষ্ঠানের বার্ষিক প্রতিবেদন থেকে নেওয়া।", en: "Board service dates come from the institutions' annual reports." },
    ],
    updatedAt: "2026-08-01",
  },
  {
    scholarId: "scholar-4",
    born: {
      bn: "১৯৭৪ সালে চট্টগ্রামের পটিয়া উপজেলার এক মাদ্রাসা-শিক্ষক পরিবারে জন্ম।",
      en: "Born in 1974 into a madrasah-teaching family in Patiya, Chattogram.",
    },
    family: {
      bn: "বাবা ছিলেন স্থানীয় মাদ্রাসার আরবি শিক্ষক, এবং বাড়ির পাঠশালায় সকালেই কিতাব পড়া শুরু হতো — সেই অভ্যাস আজও আছে।",
      en: "His father taught Arabic at the local madrasah, and lessons began at home each morning — a habit he has kept.",
    },
    narrative: {
      bn: "জামিয়া ইসলামিয়া পটিয়ায় দাওরায়ে হাদীস শেষ করেন ১৯৯৬ সালে। এরপর হাদীসে উচ্চতর গবেষণা (তাখাসসুস) করেন দারুল উলূম দেওবন্দ ধারার মাদানী কারখানায় (২০০১), আর ২০০৪ সালে বেফাকুল মাদারিসের তাহকীকুল হাদীস কোর্স সম্পন্ন করেন — এই দুই ধাপে তাঁর আগ্রহ সনদের দিকে চলে যায়, মাসআলার দিকে নয়।\n\n২০০৫ থেকে তিনি পটিয়ায় হাদীসের দরস নেন। তাঁর ক্লাসে সহীহ বুখারীর পাঠ শুরু হয় সনদের আলোচনা দিয়ে: কোন সূত্রে রেওয়ায়েতটি এল, শাব্দিক পার্থক্য কোথায়, আর কোন শর্তে হাদীসটি হুজ্জত হিসেবে প্রতিষ্ঠিত। শিক্ষার্থীদের তিনি একটি অভ্যাস শেখান — সনদের কাগজ না দেখে কোনো রেওয়ায়েত মুখস্থ না করা।\n\nসীরাতের প্রতি তাঁর আগ্রহ এসেছে হাদীসের ভেতর থেকেই: রাসূল ﷺ-এর জীবনী পড়াতে গিয়ে তিনি দেখেন, ঘটনাগুলোর ক্রম ও দলিল একসাথে রাখা যায়, এবং সেটি যেকোনো আবেগের ভাষণের চেয়ে বেশি প্রভাব ফেলে।",
      en: "He finished Dawra-e-Hadith at Jamia Islamia Patiya in 1996, went on to higher research in hadith at the Madani workshop of the Darul Ulum Deoband tradition (2001), and completed the Befaq tahqiq al-hadith course in 2004. Those two stages turned his attention from verdicts toward chains of transmission.\n\nHe has taught hadith at Patiya since 2005. His Bukhari lessons begin with the chain: by which route the report arrived, where the wording differs, and on what terms it stands as a proof. He teaches his students one habit — never memorise a report without seeing the paper it came from.\n\nHis interest in seerah grew out of hadith itself: teaching the Prophet's ﷺ life showed him that chronology and evidence can be kept together, and that this lands harder than any emotional speech.",
    },
    now: {
      bn: "বর্তমানে তিনি জামিয়া ইসলামিয়া পটিয়ায় হাদীসের দরস দেন, বেফাকের তাহকীকুল হাদীস কোর্সে শিক্ষকতা করেন এবং ইলমে সনদ যাচাই ও সীরাত সংক্রান্ত প্রশ্নের উত্তর দেন।",
      en: "He now teaches hadith at Jamia Islamia Patiya, teaches in Befaq's tahqiq al-hadith course, and answers Ilm's questions on authentication and seerah.",
    },
    teachers: [
      {
        id: "b4-t1",
        name: { bn: "শায়খ লুৎফুর রহমান (রাহ.), শায়খুল হাদীস, পটিয়া", en: "Shaykh Lutfur Rahman (rh.), Shaykh al-Hadith, Patiya" },
        note: { bn: "দাওরায়ে হাদীসের প্রধান শিক্ষক, ১৯৯৬ সালে সনদ দেন।", en: "His principal Dawra teacher, who granted his ijazah in 1996." },
      },
      {
        id: "b4-t2",
        name: { bn: "শায়খ আশরাফ আলী, তাখাসসুস ফিল হাদীস, মাদানী কারখানা", en: "Shaykh Ashraf Ali, takhassus in hadith, Madani workshop" },
        note: { bn: "২০০১ সালের উচ্চতর গবেষণায় মুত্তাফাকুন আলাইহি রেওয়ায়েতের তাহকীক।", en: "Supervised his work on the agreed-upon reports in 2001." },
      },
      {
        id: "b4-t3",
        name: { bn: "মুহাদ্দিস আব্দুল মতিন, তাহকীকুল হাদীস কোর্স, বেফাক", en: "Muhaddith Abdul Matin, tahqiq al-hadith course, Befaq" },
        note: { bn: "২০০৪ সালে সনদ-বিশ্লেষণ ও মুদ্রিত কিতাবের পাঠ-পার্থক্য নিয়ে পড়া।", en: "Studied chain analysis and the variant readings of printed editions in 2004." },
      },
    ],
    ijazah: [
      {
        id: "b4-i1",
        title: { bn: "সহীহ সিত্তার সনদ", en: "Ijazah in the six books" },
        grantedBy: { bn: "শায়খুল হাদীস, জামিয়া ইসলামিয়া পটিয়া, ১৯৯৬", en: "The Shaykh al-Hadith of Jamia Islamia Patiya, 1996" },
      },
      {
        id: "b4-i2",
        title: { bn: "মুত্তাফাকুন আলাইহি রেওয়ায়েতের তাহকীকে অনুমোদন", en: "Licence in the authentication of the agreed-upon reports" },
        grantedBy: { bn: "মাদানী কারখানা, ২০০১", en: "The Madani workshop, 2001" },
      },
    ],
    service: [
      {
        id: "b4-s1",
        title: { bn: "হাদীসের শিক্ষক", en: "Teacher of hadith" },
        place: { bn: "জামিয়া ইসলামিয়া পটিয়া, চট্টগ্রাম", en: "Jamia Islamia Patiya, Chattogram" },
        period: { bn: "২০০৫–বর্তমান", en: "2005–present" },
      },
      {
        id: "b4-s2",
        title: { bn: "সনদ-যাচাই কমিটির সদস্য", en: "Member, authentication committee" },
        place: { bn: "বেফাকুল মাদারিসিল আরাবিয়া, বাংলাদেশ", en: "Befaqul Madarisil Arabia, Bangladesh" },
        period: { bn: "২০১০–বর্তমান", en: "2010–present" },
        note: { bn: "মাদ্রাসার সিলেবাসে বাছাই করা রেওয়ায়েত যাচাই।", en: "Vets the reports selected for madrasah syllabi." },
      },
      {
        id: "b4-s3",
        title: { bn: "সীরাত পাঠচক্রের পরিচালক", en: "Convenor, seerah reading circle" },
        place: { bn: "জামিয়া ইসলামিয়া পটিয়া", en: "Jamia Islamia Patiya" },
        period: { bn: "২০১৩–বর্তমান", en: "2013–present" },
        note: { bn: "মাসিক পাঠ; ক্রম ও দলিল ধরে সীরাত পড়া হয়।", en: "A monthly reading that follows chronology and evidence together." },
      },
    ],
    works: [
      {
        id: "b4-w1",
        title: { bn: "সনদের পাঠ: রেওয়ায়েত যাচাইয়ের ব্যবহারিক পদ্ধতি", en: "Reading the Chain: A Practical Method of Authentication" },
        year: { bn: "২০১৫", en: "2015" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "দাওরায়ে হাদীসের শিক্ষার্থীদের জন্য, উদাহরণসহ।", en: "Written for Dawra students, with worked examples." },
      },
      {
        id: "b4-w2",
        title: { bn: "মুদ্রিত কিতাবের পাঠ-পার্থক্য", en: "Variant Readings in Printed Editions" },
        year: { bn: "২০১৮", en: "2018" },
        kind: { bn: "গবেষণা", en: "Research" },
        note: { bn: "কয়েকটি বহুল মুদ্রিত হাদীস গ্রন্থের পাঠান্তর নিয়ে তুলনামূলক কাজ।", en: "A comparison of readings across widely printed hadith collections." },
      },
      {
        id: "b4-w3",
        title: { bn: "সীরাতের ক্রম: মক্কী জীবন", en: "The Order of the Seerah: The Meccan Years" },
        year: { bn: "২০২২", en: "2022" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "মক্কী যুগের ঘটনাগুলো সনদ ধরে সাজানো।", en: "The Meccan period arranged by the evidence behind each event." },
      },
    ],
    students: [
      {
        id: "b4-st1",
        name: { bn: "মুহাদ্দিস রফিকুল ইসলাম", en: "Muhaddith Rafiqul Islam" },
        note: { bn: "তাহকীকুল হাদীস কোর্স ২০১৯; এখন পটিয়ার সহশিক্ষক।", en: "Tahqiq course, 2019; now his colleague at Patiya." },
      },
      {
        id: "b4-st2",
        name: { bn: "শায়খ ইফতেখার আলম", en: "Shaykh Iftekhar Alam" },
        note: { bn: "সনদ-যাচাই কমিটির সহকারী গবেষক।", en: "Assistant researcher on the authentication committee." },
      },
    ],
    awards: [
      {
        id: "b4-a1",
        title: { bn: "হাদীস গবেষণায় বেফাক সম্মাননা", en: "Befaq honour for hadith research" },
        year: { bn: "২০২২", en: "2022" },
        note: { bn: "মুদ্রিত কিতাবের পাঠ-পার্থক্য গবেষণার জন্য।", en: "For the variant-readings research." },
      },
    ],
    sources: [
      { bn: "শিক্ষা ও সনদের তথ্য জামিয়া ইসলামিয়া পটিয়া ও বেফাকের নথি থেকে।", en: "Education and licences come from the records of Jamia Islamia Patiya and Befaq." },
      { bn: "রচনার তালিকা প্রকাশকের ক্যাটালগ ও গ্রন্থাগারের তালিকা মিলিয়ে যাচাই করা।", en: "The list of works was checked against publishers' catalogues and library holdings." },
    ],
    updatedAt: "2026-06-30",
  },
  {
    scholarId: "scholar-5",
    born: {
      bn: "১৯৮০ সালে রংপুরের গঙ্গাচড়া উপজেলার এক পরিবারে জন্ম।",
      en: "Born in 1980 in Gangachara, Rangpur.",
    },
    family: {
      bn: "মা ছিলেন বাড়ির প্রথম শিক্ষক; পিতার ইন্তেকালের পর পরিবারের দায়িত্ব নিয়ে পড়াশোনা চালিয়ে যেতে হয়েছিল — এই অভিজ্ঞতাই তাঁর কাজের দৃষ্টিভঙ্গি তৈরি করেছে।",
      en: "Her mother was her first teacher, and after her father's death she continued her studies while helping carry the household — an experience that shaped how she reads other women's situations.",
    },
    narrative: {
      bn: "তিনি ইফতা ও নারী ফিকহ কোর্স সম্পন্ন করেন তামিরুল মিল্লাত কামিল মাদ্রাসা, টঙ্গীতে (২০১০), তারপর ইসলামিক স্টাডিজে পিএইচডি করেন ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া থেকে (২০১৫)। পরিবার কাউন্সেলিংয়ের সনদ (২০১৮) তাঁর কাজের ধরন পাল্টে দেয় — ফিকহি রায় আর পারিবারিক বাস্তবতা একসাথে দেখার অভ্যাস সেখান থেকেই।\n\nতাঁর গবেষণার মূল প্রশ্ন: নারীরা মাসআলা জানতে গিয়ে কেন বারবার অভিভাবক বা স্বামীর মাধ্যমে জিজ্ঞাসা করতে বাধ্য হন? তিনি দেখেন, অনেক মাসআলার ভাষা এমনভাবে লেখা হয় যেন প্রশ্নকর্তা পুরুষ। তখন থেকে তিনি প্রশ্নকর্তার অবস্থান ধরে ধরে উত্তর লেখা শুরু করেন — ব্রেস্টফিডিং, ইদ্দত, কর্মক্ষেত্র ও মোহরানা সংক্রান্ত প্রশ্নে এই সূক্ষ্মতা জরুরি।\n\n২০১২ সাল থেকে তিনি মহিলা মাদ্রাসা ও ফতোয়া কেন্দ্র, ঢাকার নারী-ইফতা বিভাগে আছেন। তাঁর ক্লাসে দুই ধরনের শিক্ষার্থী আসেন — মাদ্রাসার ছাত্রী এবং স্নাতক শিক্ষিত নারী, যারা ফিকহি ভাষা জানেন না। তাঁর শিক্ষাদান তাই দুই ভাষায় চলে: একই রায়, একবার কিতাবের পরিভাষায়, আর একবার দৈনন্দিন কথায়।",
      en: "She completed the ifta and women's fiqh course at Tamirul Millat Kamil Madrasah, Tongi (2010), then a doctorate in Islamic Studies at Islamic University, Kushtia (2015). A family-counselling certificate (2018) changed the shape of her work: it is where she learned to hold a ruling and a household's reality in view at the same time.\n\nHer research asks a pointed question: why must women learn rulings through a guardian or a husband? Much ruling literature, she found, is written as though the questioner is male. She began writing answers from the questioner's position instead — a distinction that matters in questions on breastfeeding, iddah, work and mahr.\n\nSince 2012 she has been in the women's ifta section of the Women's Madrasah and Fatwa Centre, Dhaka. Two kinds of students come to her classes: madrasah students, and graduates who have never learned the vocabulary of fiqh. She therefore teaches every ruling twice — once in the language of the books, once in the language of a kitchen table.",
    },
    now: {
      bn: "বর্তমানে তিনি মহিলা মাদ্রাসা ও ফতোয়া কেন্দ্র, ঢাকার নারী-ইফতা বিভাগের প্রধান হিসেবে মাসআলা গবেষণা ও প্রশিক্ষণে আছেন এবং ইলমে পারিবারিক ফিকহ ও নারী বিষয়ক প্রশ্নের উত্তর দেন।",
      en: "She now heads research and training in the women's ifta section at the Women's Madrasah and Fatwa Centre, Dhaka, and answers Ilm's family and women's fiqh questions.",
    },
    teachers: [
      {
        id: "b5-t1",
        name: { bn: "উস্তাদা রাহেলা খাতুন (রাহ.), ইফতা ও নারী ফিকহ, টঙ্গী", en: "Ustadha Rahela Khatun (rh.), ifta and women's fiqh, Tongi" },
        note: { bn: "নারীর ফিকহে তাঁর প্রধান শিক্ষিকা; সনদ ২০১০।", en: "Her principal teacher in women's fiqh; licence in 2010." },
      },
      {
        id: "b5-t2",
        name: { bn: "অধ্যাপক ড. নূরজাহান বেগম, ইসলামিক স্টাডিজ, ইসলামী বিশ্ববিদ্যালয়", en: "Prof. Dr. Nurjahan Begum, Islamic Studies, Islamic University" },
        note: { bn: "ডক্টরেট তত্ত্বাবধায়ক; নারীর মাসআলা-প্রাপ্তি নিয়ে গবেষণা।", en: "Supervised the doctorate on how women access rulings." },
      },
      {
        id: "b5-t3",
        name: { bn: "ড. সেলিনা হক, পারিবারিক কাউন্সেলিং", en: "Dr. Selina Haque, family counselling" },
        note: { bn: "২০১৮ সালের কাউন্সেলিং প্রশিক্ষণে সমস্যা চিহ্নিত করার পদ্ধতি।", en: "Taught her how to map a household's problem before judging it." },
      },
    ],
    ijazah: [
      {
        id: "b5-i1",
        title: { bn: "ইফতা (নারী ফিকহ) সনদ", en: "Ijazah in ifta with a focus on women's fiqh" },
        grantedBy: { bn: "তামিরুল মিল্লাত কামিল মাদ্রাসা, টঙ্গী, ২০১০", en: "Tamirul Millat Kamil Madrasah, Tongi, 2010" },
      },
      {
        id: "b5-i2",
        title: { bn: "পারিবারিক কাউন্সেলিং সনদ", en: "Family counselling certificate" },
        grantedBy: { bn: "বাংলাদেশ ইনস্টিটিউট অব ইসলামিক স্টাডিজ, ২০১৮", en: "Bangladesh Institute of Islamic Studies, 2018" },
      },
    ],
    service: [
      {
        id: "b5-s1",
        title: { bn: "শিক্ষিকা, নারী ফিকহ ক্লাস", en: "Teacher, women's fiqh classes" },
        place: { bn: "মহিলা মাদ্রাসা, ঢাকা", en: "Women's Madrasah, Dhaka" },
        period: { bn: "২০১০–২০১২", en: "2010–2012" },
      },
      {
        id: "b5-s2",
        title: { bn: "মুফতিয়া, নারী-ইফতা বিভাগ", en: "Muftia, women's ifta section" },
        place: { bn: "মহিলা মাদ্রাসা ও ফতোয়া কেন্দ্র, ঢাকা", en: "Women's Madrasah and Fatwa Centre, Dhaka" },
        period: { bn: "২০১২–বর্তমান", en: "2012–present" },
        note: { bn: "ইদ্দত, ভরণপোষণ ও কর্মক্ষেত্র সংক্রান্ত প্রশ্নের দলিলভিত্তিক উত্তর।", en: "Documented answers on iddah, maintenance and women's work." },
      },
      {
        id: "b5-s3",
        title: { bn: "প্রশিক্ষক, পরিবার কাউন্সেলিং কোর্স", en: "Trainer, family counselling course" },
        place: { bn: "কয়েকটি নারী সংগঠন ও মাদ্রাসা", en: "Several women's organisations and madrasahs" },
        period: { bn: "২০১৯–বর্তমান", en: "2019–present" },
      },
    ],
    works: [
      {
        id: "b5-w1",
        title: { bn: "নারীর মাসআলা, নারীর ভাষায়", en: "Women's Rulings in Women's Words" },
        year: { bn: "২০১৭", en: "2017" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "পঞ্চাশটি দৈনন্দিন প্রশ্নের রায়, সহজ ভাষায়।", en: "Fifty everyday questions answered in plain language." },
      },
      {
        id: "b5-w2",
        title: { bn: "ইদ্দত ও ভরণপোষণ: বিধান ও প্রয়োগ", en: "Iddah and Maintenance: Ruling and Application" },
        year: { bn: "২০২০", en: "2020" },
        kind: { bn: "গবেষণা", en: "Research" },
        note: { bn: "বাংলাদেশের আদালতের বাস্তবতার সাথে ফিকহি বিধানের তুলনা।", en: "Compares the fiqh rule with how Bangladeshi courts actually behave." },
      },
      {
        id: "b5-w3",
        title: { bn: "মেয়েদের দ্বীনি শিক্ষার পথ", en: "A Path for Girls' Religious Education" },
        year: { bn: "২০২৩", en: "2023" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "মাদ্রাসা ও সাধারণ শিক্ষার মধ্যে সমন্বয় নিয়ে ব্যবহারিক পরামর্শ।", en: "Practical advice on combining madrasah and general education." },
      },
    ],
    students: [
      {
        id: "b5-st1",
        name: { bn: "উস্তাদা সুমাইয়া খানম", en: "Ustadha Sumaiya Khanam" },
        note: { bn: "নারীর ইফতা ক্লাসে তাঁর শিক্ষার্থী; এখন স্বতন্ত্রভাবে আখলাক ও মাসআলা শিক্ষা দেন।", en: "Studied in her women's fiqh class; now teaches akhlaq and rulings independently." },
      },
      {
        id: "b5-st2",
        name: { bn: "উস্তাদা মারইয়াম আক্তার", en: "Ustadha Maryam Akter" },
        note: { bn: "কাউন্সেলিং কোর্সের প্রশিক্ষণার্থী; উত্তরবঙ্গে নারীদের প্রশ্নে কাজ করেন।", en: "Trained in the counselling course; works on women's questions in the north." },
      },
    ],
    awards: [
      {
        id: "b5-a1",
        title: { bn: "নারী শিক্ষা ও ফিকহে অবদানের স্বীকৃতি", en: "Recognition for work in women's education and fiqh" },
        year: { bn: "২০২৩", en: "2023" },
      },
    ],
    sources: [
      { bn: "সনদ ও ডিগ্রির তথ্য তামিরুল মিল্লাত কামিল মাদ্রাসা ও ইসলামী বিশ্ববিদ্যালয়ের রেকর্ড থেকে।", en: "Certificates and degrees follow the records of Tamirul Millat Kamil Madrasah and Islamic University." },
      { bn: "জীবনীর অংশগুলো তাঁর নিজের সাক্ষাৎকার ও নারী-ইফতা বিভাগের প্রকাশিত রিপোর্ট অনুসারে।", en: "The narrative follows her own interviews and the published reports of the women's ifta section." },
    ],
    updatedAt: "2026-07-05",
  },
  {
    scholarId: "scholar-6",
    born: {
      bn: "১৯৭৭ সালে কুমিল্লার দেবিদ্বার উপজেলার এক মসজিদ-ইমাম পরিবারে জন্ম।",
      en: "Born in 1977 into an imam's family in Debidwar, Cumilla.",
    },
    family: {
      bn: "বাবা ছিলেন গ্রামের মসজিদের ইমাম, মা বাড়িতেই নামাজ ও সিয়ামের নিয়ম শিখিয়েছেন। নামাজ সংক্রান্ত মাসআলার প্রতি তাঁর নিবেদন শৈশবের ওই পাঠ থেকেই।",
      en: "His father was the village imam and his mother taught the household the discipline of prayer and fasting. His devotion to the rulings of worship goes back to those childhood lessons.",
    },
    narrative: {
      bn: "২০০৩ সালে তিনি জামিয়া রাহমানিয়া আরাবিয়া, ঢাকা থেকে দাওরায়ে হাদীস ও ইফতা সম্পন্ন করেন, তারপর দারুল ইফতা, হাটহাজারীতে ফিকহুল ইবাদাত তাখাসসুস (২০০৬) করেন। ইবাদতের বিধান নিয়ে তাঁর আগ্রহ প্রথম থেকেই ছিল স্পষ্ট: নামাজ, রোজা, হজ ও কুরবানি — এই চার বিষয়ে প্রশ্নের উত্তর দিতে গিয়ে তিনি বাস্তব জটিলতাগুলো লিখে রাখতে শুরু করেন।\n\n২০০৭ থেকে তিনি জামিয়া ইসলামিয়া, কুমিল্লায় ইবাদতের মাসআলা শিক্ষা দেন। তাঁর ক্লাসের বৈশিষ্ট্য হলো প্রশ্নের হিসাব রাখা: কোন মাসআলায় বেশি ভুল হয়, কোথায় গ্রামে ও সহরে বিধান আলাদা হয়ে দাঁড়ায়, এবং কোন প্রশ্নটি আসলে বিদআতের ভয় থেকে আসে — প্রতিটি টুকে রাখেন। এই নোট থেকেই পরে তাঁর বইগুলো লেখা হয়েছে।\n\n২০২০ সালের করোনা-পরিস্থিতিতে মসজিদ বন্ধ হওয়া, জামাতে দূরত্ব রাখা, অসুস্থ ব্যক্তির রোজা ও ওষুধের হুকুম — এই প্রশ্নগুলো উত্তরবিহীন হয়ে পড়লে তিনি গ্রামে-গ্রামে প্রশিক্ষণ চালান ও কয়েকটি নির্দেশিকা প্রচার করেন। তাঁর সব কাজে একটি রেখা: ইবাদত সহজ করে বলা, হুকুম হারানো নয়।",
      en: "He completed Dawra-e-Hadith and ifta at Jamia Rahmania Arabia, Dhaka in 2003, then a takhassus in fiqh al-ibadat at Darul Ifta, Hathazari (2006). His focus was clear from the start: keeping a record of the confusions that actually arise in prayer, fasting, Hajj and sacrifice.\n\nHe has taught the rulings of worship at Jamia Islamia, Cumilla since 2007. His classes are built on a tally — which rulings people get wrong most often, where village and city conditions produce different answers, and which questions are really driven by the fear of innovation. Those notes became his books.\n\nWhen mosques closed in 2020 and questions piled up about distanced congregations, fasting while ill and medicine during Ramadan, he ran training sessions village by village and wrote circulars for imams. One line runs through all of it: make worship easy to do, never easier to skip.",
    },
    now: {
      bn: "বর্তমানে তিনি জামিয়া ইসলামিয়া, কুমিল্লায় ইবাদতের মাসআলা শিক্ষক, জেলা ইমাম প্রশিক্ষণ কার্যক্রমের প্রশিক্ষক এবং ইলমে ইবাদত ও হালাল-হারাম সংক্রান্ত প্রশ্নের উত্তর দেন।",
      en: "He now teaches the rulings of worship at Jamia Islamia, Cumilla, trains imams in the district programme, and answers Ilm's questions on worship.",
    },
    teachers: [
      {
        id: "b6-t1",
        name: { bn: "মুফতি আলী হুসাইন, দারুল ইফতা, ঢাকা", en: "Mufti Ali Husein, Darul Ifta, Dhaka" },
        note: { bn: "দাওরায়ে হাদীস ও ইফতার শিক্ষক; সনদ ২০০৩।", en: "His Dawra and ifta teacher; licence in 2003." },
      },
      {
        id: "b6-t2",
        name: { bn: "মুফতি তরিকুল ইসলাম, ফিকহুল ইবাদাত, হাটহাজারী", en: "Mufti Tariqul Islam, fiqh al-ibadat, Hathazari" },
        note: { bn: "২০০৬ সালের তাখাসসুসে নামাজ ও রোজার বিধানের খুঁটিনাটি।", en: "Taught the fine points of prayer and fasting in the 2006 takhassus." },
      },
      {
        id: "b6-t3",
        name: { bn: "শায়খ মহিউদ্দীন খান, হজ ও কুরবানির মাসআলা", en: "Shaykh Mohiuddin Khan, Hajj and sacrifice" },
        note: { bn: "হজের সময়সূচি ও কুরবানির জন্তুর শর্ত নিয়ে বিশেষ পাঠ।", en: "A dedicated reading on Hajj timings and the conditions of sacrificial animals." },
      },
    ],
    ijazah: [
      {
        id: "b6-i1",
        title: { bn: "ইফতা সনদ", en: "Ijazah in ifta" },
        grantedBy: { bn: "জামিয়া রাহমানিয়া আরাবিয়া, ঢাকা, ২০০৩", en: "Jamia Rahmania Arabia, Dhaka, 2003" },
      },
      {
        id: "b6-i2",
        title: { bn: "ফিকহুল ইবাদাতে তাখাসসুস সনদ", en: "Licence in fiqh al-ibadat" },
        grantedBy: { bn: "দারুল ইফতা, হাটহাজারী, ২০০৬", en: "Darul Ifta, Hathazari, 2006" },
      },
    ],
    service: [
      {
        id: "b6-s1",
        title: { bn: "ইবাদতের মাসআলা শিক্ষক", en: "Teacher of the rulings of worship" },
        place: { bn: "জামিয়া ইসলামিয়া, কুমিল্লা", en: "Jamia Islamia, Cumilla" },
        period: { bn: "২০০৭–বর্তমান", en: "2007–present" },
      },
      {
        id: "b6-s2",
        title: { bn: "জেলা ইমাম প্রশিক্ষণ প্রশিক্ষক", en: "Trainer, district imam programme" },
        place: { bn: "কুমিল্লা জেলা", en: "Cumilla district" },
        period: { bn: "২০১৫–বর্তমান", en: "2015–present" },
        note: { bn: "ইমামদের জন্য নামাজ ও কুরবানি সংক্রান্ত ব্যবহারিক প্রশিক্ষণ।", en: "Practical training for imams on prayer and sacrifice." },
      },
      {
        id: "b6-s3",
        title: { bn: "মাসজিদ পুনরুদ্ধার ও করোনাকালীন নির্দেশিকা প্রণেতা", en: "Author of the 2020 mosque-reopening guidance" },
        place: { bn: "কুমিল্লা ও পার্শ্ববর্তী জেলা", en: "Cumilla and neighbouring districts" },
        period: { bn: "২০২০–২০২১", en: "2020–2021" },
        note: { bn: "জামাতে দূরত্ব, অসুস্থ ব্যক্তির রোজা ও ওষুধ নিয়ে স্পষ্ট নির্দেশনা।", en: "Clear guidance on distanced congregations, fasting while ill, and medicine." },
      },
    ],
    works: [
      {
        id: "b6-w1",
        title: { bn: "নামাজের মাসআলা: প্রশ্নে যেভাবে আসে", en: "The Rulings of Prayer, as They Arrive in Questions" },
        year: { bn: "২০১৪", en: "2014" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "বাস্তব প্রশ্ন ধরে সাজানো নামাজের বিধান, সাথে সমাধান।", en: "The rulings of salah arranged around real questions, each answered." },
      },
      {
        id: "b6-w2",
        title: { bn: "রোজা ও ওষুধ", en: "Fasting and Medicine" },
        year: { bn: "২০১৯", en: "2019" },
        kind: { bn: "গবেষণা", en: "Research" },
        note: { bn: "ইনহেলার, ইনজেকশন ও রিং ব্যবহারে রোজার হুকুম।", en: "The ruling on inhalers, injections and rings while fasting." },
      },
      {
        id: "b6-w3",
        title: { bn: "কুরবানি: শর্ত থেকে বাস্তব প্রশ্ন", en: "Sacrifice: From Conditions to Common Questions" },
        year: { bn: "২০২২", en: "2022" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "গরু-ছাগলের অংশীদারিত্ব, বয়স ও সময় নিয়ে নির্দেশিকা।", en: "Shares, age and timing, with the questions people actually ask." },
      },
    ],
    students: [
      {
        id: "b6-st1",
        name: { bn: "মুফতি মাহফুজুর রহমান", en: "Mufti Mahfuzur Rahman" },
        note: { bn: "তাঁর ক্লাস থেকে ইবাদতের মাসআলা নিয়ে কাজ করছেন কুমিল্লায়।", en: "Teaches the rulings of worship in Cumilla, trained in his classes." },
      },
      {
        id: "b6-st2",
        name: { bn: "হাফেজ ইমরান হোসাইন", en: "Hafez Imran Hossain" },
        note: { bn: "ইমাম প্রশিক্ষণ কার্যক্রমের সহপ্রশিক্ষক।", en: "Co-trainer in the imam programme." },
      },
    ],
    awards: [
      {
        id: "b6-a1",
        title: { bn: "কুমিল্লা জেলার ইমাম প্রশিক্ষণে অবদানের স্বীকৃতি", en: "Recognition for contribution to Cumilla's imam training" },
        year: { bn: "২০২১", en: "2021" },
      },
    ],
    sources: [
      { bn: "শিক্ষা ও সনদের তথ্য জামিয়া রাহমানিয়া আরাবিয়া, ঢাকা ও দারুল ইফতা, হাটহাজারীর নথি থেকে।", en: "Education and licences follow the records of Jamia Rahmania Arabia, Dhaka and Darul Ifta, Hathazari." },
      { bn: "২০২০ সালের নির্দেশিকা সংশ্লিষ্ট জেলা প্রশাসনের সাথে আলোচনার নথিতে সংরক্ষিত।", en: "The 2020 guidance is on file in the district administration's records." },
    ],
    updatedAt: "2026-07-12",
  },
  {
    scholarId: "scholar-7",
    born: {
      bn: "১৯৯৪ সালে ঢাকার মিরপুরে এক সরকারি কর্মচারীর পরিবারে জন্ম।",
      en: "Born in 1994 in Mirpur, Dhaka, into a government officer's family.",
    },
    family: {
      bn: "বাবা চাকরি সূত্রে বদলি হতেন, তাই ছোটবেলায় স্কুল বদলেছে কয়েকবার — নতুন জায়গায় বন্ধু বানানোর অভ্যাসই পরে ক্যাম্পাস-দাওয়াহর কাজে লাগে।",
      en: "His father's postings moved the family, so he changed schools several times; learning to make friends in a new place is what later served him on campus.",
    },
    narrative: {
      bn: `তিনি ঢাকা কলেজ থেকে ইসলামিক স্টাডিজে স্নাতক (২০১৭) ও ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া থেকে স্নাতকোত্তর (২০১৯) শেষ করেন, তারপর ইসলামিক ফাউন্ডেশন বাংলাদেশের ইউথ ডেভেলপমেন্ট ডিপ্লোমা (২০২১)। তাঁর প্রজন্মের প্রশ্নগুলো তাঁকে ভেতর থেকেই চেনে, কারণ তিনি নিজে ক্যাম্পাস-বিতর্ক, হোস্টেল-আড্ডা ও অনলাইন কমেন্টের ভেতরেই বেড়ে উঠেছেন।\n\n২০১৮ সাল থেকে তিনি সাভার ও মিরপুরের কলেজে ছোট ছোট পাঠচক্র চালান — প্রথমে ছয়-সাত জনের, পরে সেগুলো নিজেরাই সাপ্তাহিক ক্লাস হয়ে যায়। তিনি বিশ্বাস করেন নসিহতের চেয়ে সঙ্গ বেশি কাজ করে, তাই ক্লাসের মাঝপথে রাজনীতি বা পড়াশোনার চাপ নিয়ে খোলাখুলি কথা হয়।\n\nঅনলাইনে তাঁর উত্তরগুলো ছোট — প্রশ্ন এক লাইনে, উত্তর পাঁচ লাইনে, শেষে একটি কাজ। তিনি বলেন, তরুণরা উপদেশ চায় না, দিক চায়; তাই প্রতিটি উত্তরের শেষে একটি কাজ থাকে যা আজ রাতেই করা যায়।`,
      en: `He took a BA in Islamic Studies at Dhaka College (2017) and an MA at Islamic University, Kushtia (2019), then the Islamic Foundation's youth development diploma (2021). The questions of his generation are familiar to him from the inside: he grew up in campus debate, hall gossip and comment threads.\n\nSince 2018 he has run small reading circles in colleges in Savar and Mirpur — six or seven people at first, several of which grew into weekly classes of their own. He is convinced that company does more than advice, so a session will stop mid-way for an honest talk about politics or exam pressure.\n\nHis answers online are short: the question in one line, the answer in five, one act at the end. Young people do not want a lecture, he says, they want a direction — so every answer closes with something that can be done tonight.`,
    },
    now: {
      bn: "বর্তমানে তিনি ইসলামিক স্টাডিজ সেন্টার, ঢাকার যুব কর্মসূচি সমন্বয়ক, ক্যাম্পাস পাঠচক্র পরিচালনা করেন এবং ইলমে তরুণদের প্রশ্ন ও দ্বীনি শুরু করার বিষয়ে উত্তর দেন।",
      en: "He now coordinates the youth programme at the Islamic Studies Centre, Dhaka, runs the campus circles, and answers Ilm's questions on faith at the starting line of adult life.",
    },
    teachers: [
      {
        id: "b7-t1",
        name: { bn: "অধ্যাপক মোস্তাফিজুর রহমান, ইসলামিক স্টাডিজ, ঢাকা কলেজ", en: "Prof. Mostafizur Rahman, Islamic Studies, Dhaka College" },
        note: { bn: "স্নাতকে সীরাত ও আকীদা পাঠ; সেমিনারে বিতর্কের শৃঙ্খলা শেখা।", en: "Taught him seerah and creed, and the discipline of arguing in a seminar." },
      },
      {
        id: "b7-t2",
        name: { bn: "ড. রুবাইয়া হক, যুব উন্নয়ন, ইসলামিক ফাউন্ডেশন", en: "Dr. Rubaiya Haque, youth development, Islamic Foundation" },
        note: { bn: "২০২১ সালের ডিপ্লোমায় পাঠচক্র পরিচালনা ও পরামর্শের পদ্ধতি।", en: "Taught him how to run a circle and counsel within it during the 2021 diploma." },
      },
      {
        id: "b7-t3",
        name: { bn: "মুফতি শফিকুল আযম, মাসআলা", en: "Mufti Shafiqul Azam, masail" },
        note: { bn: "তরুণদের প্রশ্নে হুকুম বলার সীমা ও সংযম তাঁর কাছেই শেখা।", en: "Where he learned the limits and restraint of issuing a ruling to the young." },
      },
    ],
    ijazah: [
      {
        id: "b7-i1",
        title: { bn: "ইউথ ডেভেলপমেন্ট ডিপ্লোমা", en: "Diploma in youth development" },
        grantedBy: { bn: "ইসলামিক ফাউন্ডেশন বাংলাদেশ, ২০২১", en: "Islamic Foundation Bangladesh, 2021" },
      },
    ],
    service: [
      {
        id: "b7-s1",
        title: { bn: "পাঠচক্র পরিচালক", en: "Circle convenor" },
        place: { bn: "সাভার ও মিরপুরের কলেজ", en: "Colleges in Savar and Mirpur" },
        period: { bn: "২০১৮–বর্তমান", en: "2018–present" },
      },
      {
        id: "b7-s2",
        title: { bn: "যুব কর্মসূচি সমন্বয়ক", en: "Youth programme coordinator" },
        place: { bn: "ইসলামিক স্টাডিজ সেন্টার, ঢাকা", en: "Islamic Studies Centre, Dhaka" },
        period: { bn: "২০২১–বর্তমান", en: "2021–present" },
        note: { bn: "বিশ্ববিদ্যালয়ে দ্বীনি প্রশিক্ষণ ও পরামর্শ কক্ষ।", en: "Campus training and a walk-in counselling desk." },
      },
    ],
    works: [
      {
        id: "b7-w1",
        title: { bn: "শুরু করার দশ ধাপ", en: "Ten Steps to Begin" },
        year: { bn: "২০২২", en: "2022" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "নামাজ ও কুরআন শুরু করার জন্য কিশোর-তরুণদের ব্যবহারিক পথ।", en: "A practical path into salah and Quran reading for teenagers and students." },
      },
      {
        id: "b7-w2",
        title: { bn: "ক্যাম্পাসে দ্বীন: প্রশ্ন ও জবাব", en: "Faith on Campus: Questions and Answers" },
        year: { bn: "২০২৪", en: "2024" },
        kind: { bn: "গবেষণা", en: "Research" },
        note: { bn: "তিনশো ক্যাম্পাস প্রশ্নের বাছাই, সাথে সংক্ষিপ্ত উত্তর।", en: "Three hundred campus questions, selected, with short answers." },
      },
    ],
    students: [
      {
        id: "b7-st1",
        name: { bn: "রাকিব হাসান", en: "Rakib Hasan" },
        note: { bn: "সাভারের পাঠচক্রের প্রথম ব্যাচ থেকে; এখন নিজেই একটি ক্লাস চালান।", en: "From the first Savar circle; now runs a class of his own." },
      },
    ],
    awards: [
      {
        id: "b7-a1",
        title: { bn: "ইসলামিক ফাউন্ডেশনের যুব প্রশিক্ষণ স্বীকৃতি", en: "Islamic Foundation youth training recognition" },
        year: { bn: "২০২৩", en: "2023" },
      },
    ],
    sources: [
      { bn: "ডিগ্রি ও ডিপ্লোমার তথ্য ঢাকা কলেজ, ইসলামী বিশ্ববিদ্যালয় ও ইসলামিক ফাউন্ডেশনের রেকর্ড থেকে।", en: "Degree details follow the records of Dhaka College, Islamic University and the Islamic Foundation." },
      { bn: "যুব কর্মসূচির বর্ণনা সেন্টারের বাৎসরিক প্রতিবেদন অনুসারে লেখা।", en: "The youth programme account follows the centre's annual reports." },
    ],
    updatedAt: "2026-08-04",
  },
  {
    scholarId: "scholar-8",
    born: {
      bn: "১৯৭৮ সালে টাঙ্গাইলের মধুপুর উপজেলার এক পরিবারে জন্ম।",
      en: "Born in 1978 in Madhupur, Tangail.",
    },
    family: {
      bn: "শৈশবে মসজিদের ইমামের পাশে বসে কুরআন শোনা ছিল প্রতিদিনের অভ্যাস",
      en: "Listening to the Quran beside the village imam was the daily routine of his childhood.",
    },
    narrative: {
      bn: `তিনি তামিরুল মিল্লাত কামিল মাদ্রাসা, টঙ্গী থেকে দাওরায়ে হাদীস শেষ করেন ২০০২ সালে। এরপর কায়রোর মাকতাবাতুল কুরআনে কিরাআতের সনদ (সাব'আ, ২০১১) অর্জন করেন এবং আল-আজহার বিশ্ববিদ্যালয় থেকে তাফসীর বিভাগে পিএইচডি করেন (২০১৩)। এই তিন ধাপে তাঁর পড়ার ধরন নির্ধারিত হয়: পাঠ, সুর ও অর্থ — তিনটিকে কখনো আলাদা না করা।\n\n২০১৪ সাল থেকে তিনি মারকাযুল কুরআন, ঢাকায় তাফসীরের দরস দেন। কুরআন তিলাওয়াতের ভুল ধরার আগে তিনি অর্থ পড়েন — কারণ, তাঁর কথায়, কেবল সুর ঠিক করা শেখালে মানুষ কুরআনকে ধ্বনি মনে করে, আর কেবল অর্থ বললে তিলাওয়াতের হক হারিয়ে যায়।\n\nতাঁর গবেষণার কেন্দ্রে আছে সূরা আল-ফাতিহার ভূমিকা: একটি সূরা যেটি প্রতি রাকাতে পড়া হয়, অথচ যার গভীরতা নিয়ে কম কথা হয়। এই সূরার ব্যাখ্যা নিয়ে তাঁর ক্লাস বছরজুড়ে চলে, আর সেখান থেকেই তাঁর উল্লেখযোগ্য রচনা তৈরি হয়েছে।`,
      en: `He completed Dawra-e-Hadith at Tamirul Millat Kamil Madrasah, Tongi in 2002, went on to a qira'at licence in Cairo covering the seven readings (2011), and took his doctorate in tafsir at Al-Azhar (2013). Those three stages shaped one rule he has never split: text, recitation and meaning are studied together or not at all.\n\nHe has taught tafsir at Markazul Quran, Dhaka since 2014. Before he corrects a recitation he reads the meaning — because teaching only the sound makes people hear the Quran as a sound, he says, while teaching only the meaning loses the right of recitation.\n\nHis research centres on Surah al-Fatihah: a chapter recited in every unit of prayer whose depth is discussed far less than its length suggests. His class spends a year on it, and his most-cited work came out of that year.`,
    },
    now: {
      bn: "বর্তমানে তিনি মারকাযুল কুরআন, ঢাকার তাফসীর বিভাগের প্রধান, কিরাআত প্রশিক্ষণ পরিষদের সদস্য এবং ইলমে তাফসীর ও তিলাওয়াত সংক্রান্ত প্রশ্নের উত্তর দেন।",
      en: "He now heads tafsir at Markazul Quran, Dhaka, sits on the qira'at training board, and answers Ilm's questions on tafsir and recitation.",
    },
    teachers: [
      {
        id: "b8-t1",
        name: { bn: "শায়খ মুহাম্মদ সালেহ, কিরাআত, কায়রো", en: "Shaykh Muhammad Saleh, qira'at, Cairo" },
        note: { bn: "২০১১ সালে সাব'আ কিরাআতের সনদ তাঁর কাছেই।", en: "Granted his licence in the seven readings in 2011." },
      },
      {
        id: "b8-t2",
        name: { bn: "অধ্যাপক ড. ইউসুফ আব্দুল্লাহ, তাফসীর, আল-আজহার", en: "Prof. Dr. Yusuf Abdullah, tafsir, Al-Azhar" },
        note: { bn: "ডক্টরেটে তাফসীর পদ্ধতি ও ভাষাতাত্ত্বিক পাঠের প্রশিক্ষণ।", en: "Supervised his doctoral training in tafsir method and linguistic reading." },
      },
      {
        id: "b8-t3",
        name: { bn: "মুফতি আশরাফ আলী, তাজবীদ, টঙ্গী", en: "Mufti Ashraf Ali, tajweed, Tongi" },
        note: { bn: "দাওরায়ে হাদীসের সময় মাখরাজ ও তাজবীদের প্রাথমিক শিক্ষা।", en: "Taught him the points of articulation and tajweed during his Dawra years." },
      },
    ],
    ijazah: [
      {
        id: "b8-i1",
        title: { bn: "সাব'আ কিরাআতের সনদ", en: "Ijazah in the seven readings" },
        grantedBy: { bn: "মাকতাবাতুল কুরআন, কায়রো, ২০১১", en: "Maktabat al-Quran, Cairo, 2011" },
      },
      {
        id: "b8-i2",
        title: { bn: "তাফসীরে তাখাসসুস সনদ", en: "Licence in tafsir" },
        grantedBy: { bn: "তামিরুল মিল্লাত কামিল মাদ্রাসা, টঙ্গী, ২০০৫", en: "Tamirul Millat Kamil Madrasah, Tongi, 2005" },
      },
    ],
    service: [
      {
        id: "b8-s1",
        title: { bn: "তাফসীরের শিক্ষক", en: "Teacher of tafsir" },
        place: { bn: "মারকাযুল কুরআন, ঢাকা", en: "Markazul Quran, Dhaka" },
        period: { bn: "২০১৪–বর্তমান", en: "2014–present" },
      },
      {
        id: "b8-s2",
        title: { bn: "কিরাআত প্রশিক্ষণের তত্ত্বাবধায়ক", en: "Supervisor, qira'at training" },
        place: { bn: "মারকাযুল কুরআন, ঢাকা", en: "Markazul Quran, Dhaka" },
        period: { bn: "২০১৫–বর্তমান", en: "2015–present" },
        note: { bn: "তাজবীদ ও মাখরাজের ব্যবহারিক ক্লাস।", en: "Hands-on classes in tajweed and articulation." },
      },
      {
        id: "b8-s3",
        title: { bn: "তাফসীর বিভাগের প্রধান", en: "Head of tafsir" },
        place: { bn: "মারকাযুল কুরআন, ঢাকা", en: "Markazul Quran, Dhaka" },
        period: { bn: "২০১৯–বর্তমান", en: "2019–present" },
      },
    ],
    works: [
      {
        id: "b8-w1",
        title: { bn: "ফাতিহার আলো", en: "The Light of al-Fatihah" },
        year: { bn: "২০১৭", en: "2017" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "সূরা আল-ফাতিহার শব্দে-শব্দে ব্যাখ্যা ও নামাজে তার প্রভাব।", en: "A word-by-word reading of al-Fatihah and what it does inside salah." },
      },
      {
        id: "b8-w2",
        title: { bn: "তিলাওয়াতের হক", en: "The Right of Recitation" },
        year: { bn: "২০২০", en: "2020" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "মাখরাজ, ওয়াকফ ও গতি নিয়ে শিক্ষার্থীদের নির্দেশিক।", en: "A student's guide to articulation, pauses and pace." },
      },
      {
        id: "b8-w3",
        title: { bn: "তাফসীরের পদ্ধতি: কিতাব থেকে ক্লাসে", en: "Method in Tafsir: From Book to Classroom" },
        year: { bn: "২০২৩", en: "2023" },
        kind: { bn: "গবেষণা", en: "Research" },
        note: { bn: "ক্লাসিক তাফসীরের রীতি আজ কীভাবে পড়ানো যায়।", en: "How the classical tafsir tradition can be taught today." },
      },
    ],
    students: [
      {
        id: "b8-st1",
        name: { bn: "হাফেজ আবু বকর সিদ্দিক", en: "Hafez Abu Bakr Siddiq" },
        note: { bn: "সাব'আ কিরাআতে প্রশিক্ষণরত; এখন কিরাআতের সহশিক্ষক।", en: "Training in the seven readings; now co-teaches qira'at." },
      },
      {
        id: "b8-st2",
        name: { bn: "ক্বারী মাহবুব আলম", en: "Qari Mahbub Alam" },
        note: { bn: "তিলাওয়াতের হক-এর পাঠ থেকে উঠে আসা শিক্ষার্থী।", en: "Came up through the recitation classes." },
      },
    ],
    awards: [
      {
        id: "b8-a1",
        title: { bn: "তাফসীর গবেষণায় আন্তর্জাতিক কুরআন পরিষদের স্বীকৃতি", en: "International Quran council recognition in tafsir" },
        year: { bn: "২০২২", en: "2022" },
      },
    ],
    sources: [
      { bn: "ডিগ্রি, সনদ ও কিরাআত প্রশিক্ষণের তথ্য টঙ্গী, কায়রো ও আল-আজহারের রেকর্ড থেকে।", en: "Degrees, licences and qira'at training follow the records of Tongi, Cairo and Al-Azhar." },
      { bn: "প্রকাশনার তথ্য প্রকাশকের তালিকা ও মারকাযুল কুরআনের পাঠক্রম অনুসারে।", en: "Publications checked against the publisher's list and the syllabus of Markazul Quran." },
    ],
    updatedAt: "2026-07-21",
  },
  {
    scholarId: "scholar-9",
    born: {
      bn: "১৯৮২ সালে চট্টগ্রামের সীতাকুণ্ড উপজেলার এক পরিবারে জন্ম।",
      en: "Born in 1982 in Sitakunda, Chattogram.",
    },
    family: {
      bn: "বাবা ছিলেন শহরের ওষুধের দোকানের কর্মচারী; ছোটবেলা থেকে ওষুধের নাম, মেয়াদ ও মিশ্রণের হিসাব দেখে বড় হয়েছেন।",
      en: "His father worked in a city pharmacy, so he grew up around the names, expiry dates and mixtures of medicines.",
    },
    narrative: {
      bn: `দাওরায়ে হাদীস ও ইফতা শেষ করেন জামিয়া ইসলামিয়া পটিয়া, চট্টগ্রাম থেকে ২০০৭ সালে। ইফতার কাজ করতে গিয়ে তিনি দেখেন, প্রশ্নের একটি বড় অংশ খাদ্য, ওষুধ ও চিকিৎসা নিয়ে — অথচ উত্তর দেওয়ার সময় ফিকহি পরিভাষা আর চিকিৎসাবিজ্ঞানের ভাষা মেলানো কঠিন হয়ে পড়ে।\n\n২০১৭ সালে তিনি ইসলামিক ফাউন্ডেশন বাংলাদেশ থেকে বিজ্ঞান ও ধর্মে উচ্চতর ডিপ্লোমা করেন। এরপর থেকে তাঁর কাজের ধরন বদলে যায়: তিনি আর কেবল “হালাল” বা “হারাম” বলেন না, বরং উপাদান, প্রস্তুতপ্রণালী ও মিশ্রণের শতাংশ ধরে ধরে হুকুম ব্যাখ্যা করেন — রং, জেলাটিন, ই-নম্বর, অ্যালকোহলযুক্ত সিরাপ, ইনসুলিন ও টিকা সবই আসে।\n\nতিনি দারুল ইফতা ও গবেষণা কেন্দ্র, চট্টগ্রামে খাদ্য ও ওষুধ সংক্রান্ত গবেষণা ইউনিট চালান এবং স্থানীয় ব্যবসায়ীদের সঙ্গে প্রায়ই বসেন — কনফেকশনারি, রেস্তোরাঁ ও প্যাকেজিং শিল্পের বাস্তবতা না জেনে ফতোয়া লেখা যায় না, এটি তাঁর স্পষ্ট বিশ্বাস।`,
      en: `He completed Dawra-e-Hadith and ifta at Jamia Islamia Patiya, Chattogram in 2007. Working in ifta, he found that a large share of questions were about food, medicine and treatment — and that answering them meant reconciling the vocabulary of fiqh with the vocabulary of clinical science.\n\nIn 2017 he took the Islamic Foundation's higher diploma in science and religion. His answers changed shape after it: instead of “halal” or “haram”, he explains the ruling from ingredients, processing and percentages — colours, gelatine, E numbers, alcohol-based syrups, insulin and vaccines all arrive at his desk.\n\nHe runs the food and medicine research unit at the Darul Ifta and Research Centre in Chattogram, and he sits with local manufacturers often — a ruling cannot be written without understanding how a confectioner, restaurant or packaging plant actually works.`,
    },
    now: {
      bn: "বর্তমানে তিনি দারুল ইফতা ও গবেষণা কেন্দ্র, চট্টগ্রামের খাদ্য ও ওষুধ গবেষণা ইউনিটের প্রধান এবং ইলমে খাদ্য, ওষুধ ও চিকিৎসা সংক্রান্ত হালাল-হারামের প্রশ্নে রায় দেন।",
      en: "He now heads the food and medicine research unit at the Darul Ifta and Research Centre, Chattogram, and answers Ilm's halal-and-haram questions on food, medicine and treatment.",
    },
    teachers: [
      {
        id: "b9-t1",
        name: { bn: "মুফতি শফিউল্লাহ, ইফতা বিভাগ, পটিয়া", en: "Mufti Shafiullah, ifta faculty, Patiya" },
        note: { bn: "ইফতার প্রশিক্ষণ ও সনদ ২০০৭; লেনদেন ও খাদ্য ফিকহে তাঁর দরস।", en: "His ifta training and licence in 2007; classes in transactional and food fiqh." },
      },
      {
        id: "b9-t2",
        name: { bn: "ড. মাহবুব আলম, খাদ্য ও পুষ্টি, ইসলামিক ফাউন্ডেশন", en: "Dr. Mahbub Alam, food and nutrition, Islamic Foundation" },
        note: { bn: "২০১৭ সালের ডিপ্লোমায় খাদ্য উপাদান ও সংযোজন নিয়ে পড়াশোনা।", en: "Studied food ingredients and additives with him in the 2017 diploma." },
      },
      {
        id: "b9-t3",
        name: { bn: "ডা. সাঈদা রহমান, ফার্মাকোলজি", en: "Dr. Saeeda Rahman, pharmacology" },
        note: { bn: "২০১৬ সাল থেকে ওষুধ ও টিকা সংক্রান্ত প্রশ্নে পরামর্শদাতা।", en: "Has advised him on medicine and vaccine questions since 2016." },
      },
    ],
    ijazah: [
      {
        id: "b9-i1",
        title: { bn: "ইফতা সনদ", en: "Ijazah in ifta" },
        grantedBy: { bn: "জামিয়া ইসলামিয়া পটিয়া, চট্টগ্রাম, ২০০৭", en: "Jamia Islamia Patiya, Chattogram, 2007" },
      },
      {
        id: "b9-i2",
        title: { bn: "বিজ্ঞান ও ধর্মে উচ্চতর ডিপ্লোমা", en: "Higher diploma in science and religion" },
        grantedBy: { bn: "ইসলামিক ফাউন্ডেশন বাংলাদেশ, ২০১৭", en: "Islamic Foundation Bangladesh, 2017" },
      },
    ],
    service: [
      {
        id: "b9-s1",
        title: { bn: "মুফতি, খাদ্য ও ওষুধ বিভাগ", en: "Mufti, food and medicine desk" },
        place: { bn: "দারুল ইফতা, চট্টগ্রাম", en: "Darul Ifta, Chattogram" },
        period: { bn: "২০০৭–২০১৩", en: "2007–2013" },
      },
      {
        id: "b9-s2",
        title: { bn: "উপাদান যাচাই পরিষদের সদস্য", en: "Member, ingredient verification panel" },
        place: { bn: "স্থানীয় খাদ্য ও ওষুধ প্রতিষ্ঠানসমূহ", en: "Local food and medicine firms" },
        period: { bn: "২০১৩–বর্তমান", en: "2013–present" },
        note: { bn: "পণ্যের উপাদান তালিকা ও প্রক্রিয়া পরীক্ষা করে হালাল সনদের পরামর্শ।", en: "Reviews ingredient lists and process lines for halal certification advice." },
      },
      {
        id: "b9-s3",
        title: { bn: "খাদ্য ও ওষুধ গবেষণা ইউনিটের প্রধান", en: "Head, food and medicine research unit" },
        place: { bn: "দারুল ইফতা ও গবেষণা কেন্দ্র, চট্টগ্রাম", en: "Darul Ifta and Research Centre, Chattogram" },
        period: { bn: "২০১৮–বর্তমান", en: "2018–present" },
      },
    ],
    works: [
      {
        id: "b9-w1",
        title: { bn: "প্যাকেটের ভাষা: খাদ্যের উপাদান পড়ার নিয়ম", en: "The Language of the Packet: Reading Food Labels" },
        year: { bn: "২০১৮", en: "2018" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "ই-নম্বর, রং ও জেলাটিন নিয়ে উপাদানভিত্তিক হুকুম।", en: "E numbers, colours and gelatine, ruled on by ingredient." },
      },
      {
        id: "b9-w2",
        title: { bn: "ওষুধ ও রোজা", en: "Medicine and the Fast" },
        year: { bn: "২০২১", en: "2021" },
        kind: { bn: "গবেষণা", en: "Research" },
        note: { bn: "ইনসুলিন, ইনহেলার, চোখের ড্রপ ও টিকার হুকুম নিয়ে ডাক্তারদের সাথে যৌথ কাজ।", en: "Joint work with physicians on insulin, inhalers, eye drops and vaccines." },
      },
      {
        id: "b9-w3",
        title: { bn: "হালাল সনদের পথ: প্রতিষ্ঠানের নির্দেশিকা", en: "The Path to Halal Certification: A Firm's Guide" },
        year: { bn: "২০২৪", en: "2024" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "প্যাকেজিং শিল্পের জন্য প্রক্রিয়া ও উপাদান ব্যবস্থাপনার নির্দেশনা।", en: "Process and ingredient management written for the packaging industry." },
      },
    ],
    students: [
      {
        id: "b9-st1",
        name: { bn: "মুফতি আরিফুল ইসলাম", en: "Mufti Ariful Islam" },
        note: { bn: "খাদ্য ও ওষুধ ইউনিটের সহগবেষক; এখন হালাল সনদ পরামর্শক।", en: "Co-researcher in the food and medicine unit; now a halal certification adviser." },
      },
    ],
    awards: [
      {
        id: "b9-a1",
        title: { bn: "খাদ্য প্রকৌশল গবেষণায় সায়েন্স সোসাইটি স্বীকৃতি", en: "Science society recognition in food science research" },
        year: { bn: "২০২৩", en: "2023" },
      },
    ],
    sources: [
      { bn: "সনদ ও ডিপ্লোমার তথ্য জামিয়া ইসলামিয়া পটিয়া ও ইসলামিক ফাউন্ডেশনের রেকর্ড থেকে।", en: "Certificates and diplomas follow the records of Jamia Islamia Patiya and the Islamic Foundation." },
      { bn: "ওষুধ সংক্রান্ত অংশগুলো চিকিৎসক পরামর্শকদের সাথে যাচাই করা হয়েছে।", en: "The medical sections were checked with the physicians who advise the unit." },
    ],
    updatedAt: "2026-07-30",
  },
  {
    scholarId: "scholar-10",
    born: {
      bn: "১৯৮৭ সালে নারায়ণগঞ্জে এক শিক্ষক পরিবারে জন্ম।",
      en: "Born in 1987 in Narayanganj, into a teaching family.",
    },
    family: {
      bn: "বাবা ছিলেন কলেজের বাংলা শিক্ষক, মা গৃহিণী কিন্তু পরিবারের পাঠচক্র চালাতেন। দুই বোনের মধ্যে তিনি বড়।",
      en: "Her father taught Bangla at a college; her mother kept the household's reading circle going. She is the elder of two sisters.",
    },
    narrative: {
      bn: `তিনি ঢাকা বিশ্ববিদ্যালয় থেকে বাংলা সাহিত্যে স্নাতক (২০১০) শেষ করে মাদ্রাসার পড়া শুরু করেন — মহিলা মাদ্রাসা, ঢাকা থেকে দাওরায়ে হাদীস (২০১২), তারপর আল-জামিয়া আল-ইসলামিয়ায় আত্মশুদ্ধি ও তাযকিয়া কোর্স (২০১৬)। এই দুটি পথ — সাহিত্য ও মাদ্রাসা — তাঁর ক্লাসের ভাষাই তৈরি করেছে।\n\nনারীদের ইফতা ক্লাসে তাঁর শিক্ষক উস্তাদা ড. ফরিদা ইয়াসমিনের কাছে তিনি শেখেন, একই রায় দুই ভাষায় বলা যায় — কিতাবের পরিভাষায় এবং সংসারের কথায়। সেই প্রভাবেই তাঁর ক্লাসগুলো হয়: একটি জিকির, একটি হাদীস, তারপর বাস্তব সমস্যা নিয়ে খোলা আলোচনা।\n\n২০১৪ সাল থেকে তিনি নূরানী মহিলা মাদ্রাসার আখলাক ও আত্মশুদ্ধি বিভাগে পড়ান এবং সপ্তাহে একদিন মেয়েদের দ্বীনি ক্লাস পরিচালনা করেন। তাঁর কাজের কেন্দ্রে আছে অভ্যাস গঠন: নিয়ত ঠিক করা, গীবত থেকে জিভ সামলানো, ঘরের কাজকে ইবাদত হিসেবে দেখা — এই তিনটি বিষয় তিনি বছরের পর বছর ধরে একই ধৈর্যে পড়ান।`,
      en: `She finished a BA in Bangla literature at the University of Dhaka (2010), then began madrasah study — Dawra-e-Hadith at the Women's Madrasah, Dhaka (2012), followed by the tazkiya course at al-Jami'ah al-Islamiyyah (2016). Those two tracks, literature and madrasah, made the language of her classes.\n\nIn the women's fiqh class of her teacher Ustadha Dr. Faridah Yasmin she learned that one ruling can be said two ways — in the vocabulary of the books and in the vocabulary of a household. That is how her own classes run: one dhikr, one hadith, then an open discussion of the problem in front of her students.\n\nSince 2014 she has taught akhlaq and self-purification at Nurani Women's Madrasah, and runs a weekly religious class for girls. Her work centres on habit: setting the intention, holding the tongue back from gossip, and seeing housework as worship — three things she teaches with the same patience year after year.`,
    },
    now: {
      bn: "বর্তমানে তিনি নূরানী মহিলা মাদ্রাসা, ঢাকার আখলাক ও আত্মশুদ্ধি বিভাগের শিক্ষিকা, মেয়েদের দ্বীনি ক্লাসের পরিচালক এবং ইলমে আখলাক ও পারিবারিক সম্পর্কের প্রশ্নে উত্তর দেন।",
      en: "She now teaches akhlaq and self-purification at Nurani Women's Madrasah, Dhaka, convenes the girls' religious class, and answers Ilm's questions on character and family conduct.",
    },
    teachers: [
      {
        id: "b10-t1",
        name: { bn: "উস্তাদা ড. ফরিদা ইয়াসমিন, নারী ফিকহ ও পরিবার", en: "Ustadha Dr. Faridah Yasmin, women's fiqh and family" },
        note: { bn: "নারীর ইফতা ক্লাসে শিক্ষিকা; প্রশ্নকর্তার অবস্থান ধরে উত্তর লেখার পাঠ তাঁর কাছেই।", en: "Her teacher in the women's ifta class, where she learned to write from the questioner's position." },
      },
      {
        id: "b10-t2",
        name: { bn: "উস্তাদা হালিমা সুলতানা, তাযকিয়া, আল-জামিয়া আল-ইসলামিয়া", en: "Ustadha Halima Sultana, tazkiya, al-Jami'ah al-Islamiyyah" },
        note: { bn: "২০১৬ সালের তাযকিয়া কোর্সে আত্মশুদ্ধির মূল পাঠ।", en: "Taught the core texts of self-purification in the 2016 course." },
      },
      {
        id: "b10-t3",
        name: { bn: "অধ্যাপক সুলতানা রাজিয়া, বাংলা বিভাগ, ঢাকা বিশ্ববিদ্যালয়", en: "Prof. Sultana Razia, Bangla department, University of Dhaka" },
        note: { bn: "স্নাতকে বাংলা ভাষার ব্যবহার ও লেখার শৃঙ্খলা।", en: "Her undergraduate training in language and the discipline of writing." },
      },
    ],
    ijazah: [
      {
        id: "b10-i1",
        title: { bn: "দাওরায়ে হাদীস সনদ (মহিলা শাখা)", en: "Dawra-e-Hadith licence (women's section)" },
        grantedBy: { bn: "মহিলা মাদ্রাসা, ঢাকা, ২০১২", en: "Women's Madrasah, Dhaka, 2012" },
      },
      {
        id: "b10-i2",
        title: { bn: "আত্মশুদ্ধি ও তাযকিয়া কোর্স সনদ", en: "Certificate in tazkiya and self-purification" },
        grantedBy: { bn: "আল-জামিয়া আল-ইসলামিয়া, ঢাকা, ২০১৬", en: "al-Jami'ah al-Islamiyyah, Dhaka, 2016" },
      },
    ],
    service: [
      {
        id: "b10-s1",
        title: { bn: "শিক্ষিকা, আখলাক ও আত্মশুদ্ধি বিভাগ", en: "Teacher, akhlaq and self-purification" },
        place: { bn: "নূরানী মহিলা মাদ্রাসা, ঢাকা", en: "Nurani Women's Madrasah, Dhaka" },
        period: { bn: "২০১৪–বর্তমান", en: "2014–present" },
      },
      {
        id: "b10-s2",
        title: { bn: "মেয়েদের দ্বীনি ক্লাসের পরিচালক", en: "Convenor, girls' religious class" },
        place: { bn: "নূরানী মহিলা মাদ্রাসা, ঢাকা", en: "Nurani Women's Madrasah, Dhaka" },
        period: { bn: "২০১৭–বর্তমান", en: "2017–present" },
        note: { bn: "সাপ্তাহিক ক্লাস: জিকির, হাদীস ও বাস্তব সমস্যার আলোচনা।", en: "A weekly class: dhikr, hadith, and the problems students bring in." },
      },
    ],
    works: [
      {
        id: "b10-w1",
        title: { bn: "অভ্যাসের দ্বীন: নিয়ত থেকে ছোট ছোট আমল", en: "The Religion of Habit: From Intention to Small Deeds" },
        year: { bn: "২০১৯", en: "2019" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "আত্মশুদ্ধির ব্যবহারিক পথ, প্রতিদিনের অল্প আমল দিয়ে।", en: "A practical route into self-purification, through small daily deeds." },
      },
      {
        id: "b10-w2",
        title: { bn: "জিভের হিসাব: গীবত ও অনলাইন আচরণ", en: "An Account of the Tongue: Gossip and Online Conduct" },
        year: { bn: "২০২২", en: "2022" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "মেয়েদের ক্লাসের আলোচনা থেকে লেখা, অনলাইন আচরণসহ।", en: "Grew out of her classes, and covers online behaviour too." },
      },
    ],
    students: [
      {
        id: "b10-st1",
        name: { bn: "উস্তাদা রুমানা আফরোজ", en: "Ustadha Rumana Afroz" },
        note: { bn: "মেয়েদের দ্বীনি ক্লাসের শিক্ষার্থী; এখন সহশিক্ষিকা।", en: "Came up through the girls' class; now co-teaches it." },
      },
    ],
    awards: [
      {
        id: "b10-a1",
        title: { bn: "মহিলা দ্বীনি শিক্ষায় অবদানের স্বীকৃতি", en: "Recognition for women's religious education" },
        year: { bn: "২০২৪", en: "2024" },
      },
    ],
    sources: [
      { bn: "ডিগ্রি ও সনদের তথ্য ঢাকা বিশ্ববিদ্যালয়, মহিলা মাদ্রাসা ও আল-জামিয়া আল-ইসলামিয়ার রেকর্ড থেকে।", en: "Degrees and licences follow the records of the University of Dhaka, the Women's Madrasah and al-Jami'ah al-Islamiyyah." },
      { bn: "ক্লাস পরিচালনার বর্ণনা মাদ্রাসার বাৎসরিক কার্যক্রমের তালিকা অনুসারে।", en: "The class programme follows the madrasah's annual activity list." },
    ],
    updatedAt: "2026-07-09",
  },
  {
    scholarId: "scholar-11",
    born: {
      bn: "১৯৭৯ সালে রাজশাহীর চারঘাট উপজেলার এক পরিবারে জন্ম।",
      en: "Born in 1979 in Charghat, Rajshahi.",
    },
    family: {
      bn: "আজান ও মোমবাতির আলোয় পাঠ — সেই শৈশবের ছবি তাঁর ক্লাসে বারবার আসে, বিশেষ করে সীরাতের প্রথম বছরগুলো পড়ানোর সময়।",
      en: "Lessons by the light of a candle: that childhood image returns in his classes, especially in the early years of the seerah.",
    },
    narrative: {
      bn: `রাজশাহী বিশ্ববিদ্যালয় থেকে ইসলামের ইতিহাসে এমএ (২০০৬), তারপর ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া থেকে সীরাত ও ইসলামের ইতিহাসে পিএইচডি (২০১২)। ২০১৪ সালে তিনি ইসলামিক ফাউন্ডেশনের দাওয়াহ প্রশিক্ষণ সনদ করেন, যা তাঁকে বক্তৃতার মঞ্চ থেকে ক্লাসরুমে ফিরিয়ে আনে।\n\n২০০৮ সাল থেকে তিনি রাজশাহী ও বগুড়ার কলেজে ইসলামের ইতিহাস পড়ান। সীরাতের প্রতি তাঁর দৃষ্টিভঙ্গি ইতিহাসবিদের: ঘটনা, সূত্র ও নিরপেক্ষতা — তিনটি আলাদা করে দেখা। তাঁর ক্লাসে ঘটনাগুলো কালানুক্রমে সাজানো হয়, আর প্রতিটি ধাপে তিনি বলে দেন কোন ঘটনা কোন সূত্র থেকে এসেছে এবং কোন অংশে ঐতিহাসিকদের মধ্যে মতভেদ আছে।\n\nসীরাত গবেষণা একাডেমি, রাজশাহীতে তিনি চরিত্র-গঠনের একটি পাঠক্রম চালান, যেখানে ইতিহাসের ঘটনা থেকে নৈতিক শিক্ষা আলাদা করে বের করা হয় — কেবল কাহিনির আবেগ নয়, বরং সিদ্ধান্তের কারণ বোঝা।`,
      en: `He took an MA in Islamic history at the University of Rajshahi (2006), then a doctorate in seerah and Islamic history at Islamic University, Kushtia (2012). In 2014 he completed the Islamic Foundation's da'wah training certificate, which moved him from the lecture stage into the classroom.\n\nHe has taught Islamic history at colleges in Rajshahi and Bogura since 2008. His view of the seerah is a historian's: event, source, and detachment, each kept apart. Every event in his classes carries the reference it comes from beside it, and a note wherever historians differ.\n\nAt the Seerah Research Academy, Rajshahi he runs a character-building syllabus that draws the moral lesson out of the history instead of the emotion out of the story — understanding why a decision was made.`,
    },
    now: {
      bn: "বর্তমানে তিনি সীরাত গবেষণা একাডেমি, রাজশাহীর গবেষণা পরিচালক, চরিত্র-গঠন পাঠক্রমের প্রধান এবং ইলমে সীরাত ও ইসলামের ইতিহাস সংক্রান্ত প্রশ্নের উত্তর দেন।",
      en: "He now directs research at the Seerah Research Academy, Rajshahi, leads the character-building syllabus, and answers Ilm's questions on seerah and Islamic history.",
    },
    teachers: [
      {
        id: "b11-t1",
        name: { bn: "অধ্যাপক ড. আব্দুল কাদের, ইসলামের ইতিহাস, রাজশাহী বিশ্ববিদ্যালয়", en: "Prof. Dr. Abdul Qader, Islamic history, University of Rajshahi" },
        note: { bn: "স্নাতকোত্তর গবেষণার তত্ত্বাবধায়ক; ইতিহাস লিখনের পদ্ধতি তাঁর কাছেই।", en: "Supervised his masters research and taught him how history is written." },
      },
      {
        id: "b11-t2",
        name: { bn: "অধ্যাপক ড. মাহবুবুর রহমান, সীরাত, ইসলামী বিশ্ববিদ্যালয়", en: "Prof. Dr. Mahbubur Rahman, seerah, Islamic University" },
        note: { bn: "ডক্টরেটে সীরাতের সূত্র ও বর্ণনার ক্রম নিয়ে গবেষণার প্রশিক্ষণ।", en: "Trained him in sources and chronology for the doctorate." },
      },
      {
        id: "b11-t3",
        name: { bn: "মুফতি আনোয়ার হুসাইন, দাওয়াহ প্রশিক্ষণ", en: "Mufti Anwar Husein, da'wah training" },
        note: { bn: "২০১৪ সালের প্রশিক্ষণে বক্তৃতার বদলে পাঠদান কেন্দ্রিক পদ্ধতি।", en: "Shifted him from lecturing to teaching in the 2014 programme." },
      },
    ],
    ijazah: [
      {
        id: "b11-i1",
        title: { bn: "দাওয়াহ প্রশিক্ষণ সনদ", en: "Da'wah training certificate" },
        grantedBy: { bn: "ইসলামিক ফাউন্ডেশন বাংলাদেশ, ২০১৪", en: "Islamic Foundation Bangladesh, 2014" },
      },
    ],
    service: [
      {
        id: "b11-s1",
        title: { bn: "প্রভাষক, ইসলামের ইতিহাস", en: "Lecturer, Islamic history" },
        place: { bn: "রাজশাহী ও বগুড়ার কলেজ", en: "Colleges in Rajshahi and Bogura" },
        period: { bn: "২০০৮–২০১৫", en: "2008–2015" },
      },
      {
        id: "b11-s2",
        title: { bn: "গবেষণা পরিচালক", en: "Director of research" },
        place: { bn: "সীরাত গবেষণা একাডেমি, রাজশাহী", en: "Seerah Research Academy, Rajshahi" },
        period: { bn: "২০১৫–বর্তমান", en: "2015–present" },
        note: { bn: "সীরাতের সূত্র-ভিত্তিক পাঠক্রম ও প্রশিক্ষণ মডিউল তৈরি।", en: "Builds the source-based seerah syllabus and training modules." },
      },
      {
        id: "b11-s3",
        title: { bn: "চরিত্র-গঠন পাঠক্রমের প্রধান", en: "Head of the character-building syllabus" },
        place: { bn: "সীরাত গবেষণা একাডেমি, রাজশাহী", en: "Seerah Research Academy, Rajshahi" },
        period: { bn: "২০১৭–বর্তমান", en: "2017–present" },
      },
    ],
    works: [
      {
        id: "b11-w1",
        title: { bn: "সূত্রসহ সীরাত: মক্কী ও মাদানী যুগ", en: "Seerah with Its Sources: Meccan and Medinan Years" },
        year: { bn: "২০১৬", en: "2016" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "প্রতিটি ঘটনার পাশে সূত্র, সাথে ঐতিহাসিকদের মতভেদ।", en: "Each event with its source, and where historians differ." },
      },
      {
        id: "b11-w2",
        title: { bn: "নেতৃত্বের পাঠ: মদীনার সন্ধি ও যুদ্ধ", en: "Lessons in Leadership: The Treaties and Battles of Madinah" },
        year: { bn: "২০১৯", en: "2019" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "সিদ্ধান্তের কারণ ও প্রেক্ষাপট ধরে সীরাতের ঘটনা বিশ্লেষণ।", en: "The Madinan events analysed by decision and circumstance." },
      },
      {
        id: "b11-w3",
        title: { bn: "ইতিহাস ও আবেগের মাঝে", en: "Between History and Sentiment" },
        year: { bn: "২০২৩", en: "2023" },
        kind: { bn: "গবেষণা", en: "Research" },
        note: { bn: "সীরাতভিত্তিক আলোচনায় আবেগ ও তথ্যের ভারসাম্য নিয়ে কাজ।", en: "On balancing sentiment and fact in seerah-based talks." },
      },
    ],
    students: [
      {
        id: "b11-st1",
        name: { bn: "মাহবুব আলম", en: "Mahbub Alam" },
        note: { bn: "পাঠক্রমের শিক্ষার্থী; এখন বগুড়ার কলেজে ইতিহাস পড়ান।", en: "Came through the syllabus; now teaches history at a college in Bogura." },
      },
      {
        id: "b11-st2",
        name: { bn: "সাবরিনা হক", en: "Sabrina Haque" },
        note: { bn: "সীরাতের সূত্র-ভিত্তিক গবেষণায় সহকারী।", en: "Assistant on the source-based seerah research." },
      },
    ],
    awards: [
      {
        id: "b11-a1",
        title: { bn: "ইতিহাস গবেষণায় রাজশাহী একাডেমি সম্মাননা", en: "Rajshahi academy honour in historical research" },
        year: { bn: "২০২২", en: "2022" },
      },
    ],
    sources: [
      { bn: "ডিগ্রি ও গবেষণার তথ্য রাজশাহী বিশ্ববিদ্যালয় ও ইসলামী বিশ্ববিদ্যালয়ের একাডেমিক রেকর্ড থেকে।", en: "Degrees and research details follow the academic records of the University of Rajshahi and Islamic University." },
      { bn: "পাঠক্রমের বর্ণনা একাডেমির প্রকাশিত সিলেবাস অনুসারে।", en: "The syllabus account follows the academy's published outline." },
    ],
    updatedAt: "2026-06-27",
  },
  {
    scholarId: "scholar-12",
    born: {
      bn: "১৯৮৬ সালে ঢাকার ওয়ারী এলাকায় এক ব্যবসায়ী পরিবারে জন্ম।",
      en: "Born in 1986 in Wari, Dhaka, into a business family.",
    },
    family: {
      bn: "বাবার টেলিফোনের দোকানি ছিল; শৈশবেই দোকানের হিসাব ও মোবাইল ফোনের বিল নিয়ে কথা শুনেছেন — প্রযুক্তি ও আর্থিক লেনদেনের সংযোগ সেখান থেকেই চেনা।",
      en: "His father ran a telephone shop, so he heard accounts and phone bills discussed in childhood — the link between technology and money is familiar from there.",
    },
    narrative: {
      bn: `তিনি জামিয়া রাহমানিয়া আরাবিয়া, ঢাকা থেকে দাওরায়ে হাদীস ও ইফতা শেষ করেন ২০১০ সালে। এরপর ইউনাইটেড ইন্টারন্যাশনাল ইউনিভার্সিটি থেকে কম্পিউটার সায়েন্সে স্নাতক (২০১৫) এবং ইসলামিক ইউনিভার্সিটি অব মদীনায় ইসলামি অর্থনীতি ডিপ্লোমা (২০১৮)।\n\n২০২০ সালে ডিজিটাল পেমেন্ট বাড়তে শুরু করলে প্রশ্নের ধরন বদলায়: মোবাইল ব্যাংকিংয়ের ক্যাশ-আউট ফি, গেমের লেনদেন, ক্রিপ্টোকারেন্সি ও ডেটা বিক্রি। তিনি এই প্রশ্নগুলো ফিকহির ভাষায় অনুবাদ করেন — একদা যে কুলির মজুরি ছিল, আজ তা সফটওয়্যারের ফি; দুটোকে একই কাঠামোয় দেখা যায়।\n\n২০২২ সাল থেকে তিনি সেন্টার ফর ইসলামিক টেকনোলজি, ঢাকার গবেষণা ইউনিটের প্রধান, যেখানে প্রকৌশলী, আইনজীবী ও মুফতিরা একসাথে বসেন। তিনি মনে করেন, প্রযুক্তি প্রস্তাব দেয় আর শরীয়াহ সীমানা বলে — দুটোকে একসাথে না পড়লে উত্তর অসম্পূর্ণ থাকে।`,
      en: `He completed Dawra-e-Hadith and ifta at Jamia Rahmania Arabia, Dhaka in 2010, then a BSc in computer science at United International University (2015) and a diploma in Islamic economics at the Islamic University of Madinah (2018).\n\nWhen digital payments grew in 2020 the questions changed shape: cash-out fees, in-game purchases, cryptocurrency, selling data. He translates those products into the vocabulary of fiqh — the porter's wage of one era is a software fee in this one.\n\nSince 2022 he has led the research unit at the Centre for Islamic Technology in Dhaka, where engineers, lawyers and muftis sit together. Technology proposes, he says, and Shariah draws the boundary; a ruling that reads only one of the two is incomplete.`,
    },
    now: {
      bn: "বর্তমানে তিনি সেন্টার ফর ইসলামিক টেকনোলজি, ঢাকার গবেষণা ইউনিটের প্রধান, প্রযুক্তি ও শরীয়াহ পরামর্শের সদস্য এবং ইলমে ডিজিটাল অর্থনীতি ও আধুনিক প্রশ্নের ফতোয়া দেন।",
      en: "He now leads the research unit at the Centre for Islamic Technology, Dhaka, sits on the technology and Shariah advisory panel, and answers Ilm's questions on the digital economy.",
    },
    teachers: [
      {
        id: "b12-t1",
        name: { bn: "মুফতি মানসুর আলী, ইফতা ও লেনদেন, ঢাকা", en: "Mufti Mansur Ali, ifta and muamalat, Dhaka" },
        note: { bn: "দাওরায়ে হাদীস ও ইফতার শিক্ষক; সনদ ২০১০।", en: "His Dawra and ifta teacher; licence in 2010." },
      },
      {
        id: "b12-t2",
        name: { bn: "অধ্যাপক ড. কামরুন নাহার, কম্পিউটার সায়েন্স, UIU", en: "Prof. Dr. Kamrun Nahar, computer science, UIU" },
        note: { bn: "স্নাতকে ডেটা, নেটওয়ার্ক ও সফটওয়্যার অর্থনীতির পাঠ।", en: "Undergraduate training in data, networks and the software economy." },
      },
      {
        id: "b12-t3",
        name: { bn: "শায়খ ইবরাহীম আল-কাহতানী, ইসলামি অর্থনীতি, মদীনা", en: "Shaykh Ibrahim al-Qahtani, Islamic economics, Madinah" },
        note: { bn: "২০১৮ সালের ডিপ্লোমায় ইসলামি বাণিজ্য ও মুদ্রানীতির পাঠ।", en: "Studied Islamic commercial law and monetary policy in the 2018 diploma." },
      },
    ],
    ijazah: [
      {
        id: "b12-i1",
        title: { bn: "ইফতা সনদ", en: "Ijazah in ifta" },
        grantedBy: { bn: "জামিয়া রাহমানিয়া আরাবিয়া, ঢাকা, ২০১০", en: "Jamia Rahmania Arabia, Dhaka, 2010" },
      },
      {
        id: "b12-i2",
        title: { bn: "ইসলামি অর্থনীতি ডিপ্লোমা", en: "Diploma in Islamic economics" },
        grantedBy: { bn: "ইসলামিক ইউনিভার্সিটি অব মদীনা, ২০১৮", en: "Islamic University of Madinah, 2018" },
      },
    ],
    service: [
      {
        id: "b12-s1",
        title: { bn: "প্রযুক্তি পরামর্শক", en: "Technology adviser" },
        place: { bn: "কয়েকটি ইসলামি প্রতিষ্ঠান ও ফিনটেক দল", en: "Several Islamic institutions and fintech teams" },
        period: { bn: "২০১৬–২০২০", en: "2016–2020" },
        note: { bn: "ডিজিটাল পেমেন্ট ও ডেটা ব্যবস্থাপনায় শরীয়াহ-সম্মত কাঠামো।", en: "Shariah-compliant structure for digital payments and data handling." },
      },
      {
        id: "b12-s2",
        title: { bn: "গবেষণা ইউনিটের প্রধান", en: "Head of the research unit" },
        place: { bn: "সেন্টার ফর ইসলামিক টেকনোলজি, ঢাকা", en: "Centre for Islamic Technology, Dhaka" },
        period: { bn: "২০২২–বর্তমান", en: "2022–present" },
        note: { bn: "প্রকৌশলী, আইনজীবী ও মুফতিদের যৌথ গবেষণা।", en: "Joint research by engineers, lawyers and muftis." },
      },
    ],
    works: [
      {
        id: "b12-w1",
        title: { bn: "ডিজিটাল আয়ের হুকুম: ফ্রিল্যান্স থেকে ক্রিপ্টো", en: "Rulings on Digital Income: Freelancing to Crypto" },
        year: { bn: "২০২১", en: "2021" },
        kind: { bn: "বই", en: "Book" },
        note: { bn: "পেমেন্ট গেটওয়ে, ডেটা বিক্রি ও টোকেন নিয়ে বিশ্লেষণ।", en: "Payment gateways, selling data, and tokens, analysed one by one." },
      },
      {
        id: "b12-w2",
        title: { bn: "কৃত্রিম বুদ্ধিমত্তা ও ফতোয়ার সীমা", en: "Artificial Intelligence and the Limits of Ifta" },
        year: { bn: "২০২৪", en: "2024" },
        kind: { bn: "গবেষণা", en: "Research" },
        note: { bn: "স্বয়ংক্রিয় সিদ্ধান্তে ফিকহি দায় কার — এর বিশ্লেষণ।", en: "Who carries the legal responsibility when a decision is automated." },
      },
    ],
    students: [
      {
        id: "b12-st1",
        name: { bn: "ইঞ্জিনিয়ার তানভীর ইসলাম", en: "Engineer Tanvir Islam" },
        note: { bn: "ফিনটেক দলের প্রকৌশলী; এখন শরীয়াহ-সম্মত পেমেন্ট ব্যবস্থায় কাজ করেন।", en: "An engineer from the fintech team; now works on Shariah-compliant payment systems." },
      },
    ],
    awards: [
      {
        id: "b12-a1",
        title: { bn: "ফিনটেক নৈতিকতা গবেষণায় স্বীকৃতি", en: "Recognition for research in fintech ethics" },
        year: { bn: "২০২৪", en: "2024" },
      },
    ],
    sources: [
      { bn: "ডিগ্রি ও সনদের তথ্য জামিয়া রাহমানিয়া আরাবিয়া, UIU ও ইসলামিক ইউনিভার্সিটি অব মদীনার রেকর্ড থেকে।", en: "Degrees and licences follow the records of Jamia Rahmania Arabia, UIU and the Islamic University of Madinah." },
      { bn: "প্রযুক্তি সংক্রান্ত অংশগুলো সেন্টারের প্রকৌশলী দলের সাথে যাচাই করা।", en: "The technical sections were checked with the centre's engineering team." },
    ],
    updatedAt: "2026-08-06",
  },
];

/** The biography of a scholar, or `undefined` where the archive has none yet. */
export function getScholarBiography(scholarId: string): ScholarBiography | undefined {
  return SCHOLAR_BIOGRAPHIES.find((entry) => entry.scholarId === scholarId);
}

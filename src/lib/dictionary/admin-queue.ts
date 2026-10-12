/**
 * Admin console copy — the moderation queues: question monitoring, review
 * (evidence checks) and the report board.
 *
 * Keys are namespaced `admin.queue.*`. One area's copy lives in one file so that
 * several areas can be translated at once without two writers on the same file.
 * Every entry is `{ bn, en }`: `bn` is the wording the screen already shows,
 * `en` is its English twin. `{name}` placeholders are filled in by
 * `translate()`, and a **number** passed as a var is printed in the reader's own
 * digits (৩ or 3), so counts belong in a var rather than typed into the string.
 *
 * Where a string is shared with a key that already exists (`status.*`, `label.*`,
 * `action.*`), the existing key is used instead of a copy here.
 */
import type { Dict } from "./types";

export const ADMIN_QUEUE: Dict = {
  /* -------- question monitoring -------- */
  "admin.queue.crumbAdmin": { bn: "অ্যাডমিন", en: "Admin" },
  "admin.queue.crumbQuestions": { bn: "প্রশ্ন", en: "Questions" },
  "admin.queue.questionsTitle": { bn: "প্রশ্ন মনিটরিং", en: "Question monitoring" },
  "admin.queue.questionsIntro": {
    bn: "প্রতিটি প্রশ্ন সঠিক বিভাগের আলেমের কাছে পৌঁছাচ্ছে কি না তা এখানেই বোঝা যায়। প্রশ্ন অনাদায়ী থাকলে সমস্যাটি সাধারণত দুইটি — ওই বিভাগে আলেম নেই, বা আলেমের উপর প্রশ্নভার অতিরিক্ত।",
    en: "This is where you can tell whether every question is reaching a scholar in the right department. When questions go unanswered there are usually two causes: the department has no scholar, or its scholars carry too many questions.",
  },
  "admin.queue.unanswered": { bn: "উত্তরহীন", en: "Unanswered" },
  "admin.queue.staleHint": { bn: "{count}টি ২৪ ঘণ্টার বেশি পুরনো", en: "{count} older than 24 hours" },
  "admin.queue.totalQuestions": { bn: "মোট {count}টি প্রশ্ন", en: "{count} questions in total" },
  "admin.queue.notRouted": { bn: "রাউট হয়নি", en: "Not routed" },
  "admin.queue.noDepartmentScholar": {
    bn: "সংশ্লিষ্ট বিভাগে আলেম নেই",
    en: "No scholar in the relevant department",
  },
  "admin.queue.allRouted": { bn: "সব প্রশ্ন রাউট হয়েছে", en: "Every question was routed" },
  "admin.queue.urgentFlagged": { bn: "{count}টি জরুরি চিহ্নিত", en: "{count} marked urgent" },
  "admin.queue.routingFailedTitle": { bn: "রাউটিং ব্যর্থ হয়েছে", en: "Routing failed" },
  "admin.queue.routingFailedBody": {
    bn: "{count}টি প্রশ্নের জন্য কোনো আলেম খুঁজে পাওয়া যায়নি। এর অর্থ হলো প্রশ্নটির বিভাগে কোনো আলেম দায়িত্বে নেই, অথবা সব আলেম অনুপলব্ধ। সংশ্লিষ্ট বিভাগে আলেম যোগ না করলে এই প্রশ্ন চিরকাল অনাদায়ী থাকবে।",
    en: "No scholar could be found for {count} questions. That means the question's department has no scholar on duty, or every scholar there is unavailable. Until a scholar is added to that department, these questions stay unanswered.",
  },
  "admin.queue.whereScholarsNeeded": { bn: "কোথায় আলেম দরকার", en: "Where scholars are needed" },
  "admin.queue.whereScholarsNeededHelp": {
    bn: "উত্তরহীন প্রশ্ন ও আলেমপ্রতি প্রশ্নভার অনুসারে",
    en: "By unanswered questions and questions per scholar",
  },
  "admin.queue.scholarCountSuffix": { bn: "{count} জন", en: "{count} scholars" },
  "admin.queue.questionsCount": { bn: "{count}টি প্রশ্ন", en: "{count} questions" },
  "admin.queue.unansweredCount": { bn: "{count}টি উত্তরহীন", en: "{count} unanswered" },
  "admin.queue.allAnswered": { bn: "সব উত্তর দেওয়া", en: "All answered" },
  "admin.queue.perScholar": { bn: "আলেমপ্রতি ~{count}", en: "~{count} per scholar" },
  "admin.queue.noScholars": { bn: "আলেম নেই", en: "No scholars" },
  "admin.queue.answerFlow": { bn: "উত্তরপ্রবাহ", en: "Answer flow" },
  "admin.queue.totalAnswers": { bn: "মোট উত্তর", en: "Total answers" },
  "admin.queue.acceptedAnswers": { bn: "গৃহীত উত্তর", en: "Accepted answers" },
  "admin.queue.answerRate": { bn: "উত্তর হার", en: "Answer rate" },
  "admin.queue.closedQuestions": { bn: "বন্ধ প্রশ্ন", en: "Closed questions" },
  "admin.queue.backlogHeading": { bn: "ব্যাকলগ কমানোর উপায়", en: "How to shrink the backlog" },
  "admin.queue.backlogHeadingHelp": {
    bn: "প্রশ্ন অনাদায়ী রাখা প্ল্যাটফর্মের সবচেয়ে বড় ক্ষতি",
    en: "Leaving questions unanswered is the platform's biggest loss",
  },
  "admin.queue.backlogTip1": {
    bn: "যে বিভাগে আলেম নেই, সেখানে দ্রুত নিয়োগ দিন — এটিই একমাত্র স্থায়ী সমাধান।",
    en: "Get a scholar into the departments that have none — that is the only lasting fix.",
  },
  "admin.queue.backlogTip2": {
    bn: "আলেমপ্রতি প্রশ্নভার বেশি হলে (৮০-এর বেশি) নতুন আলেম যোগ করা যুক্তিযুক্ত।",
    en: "When questions per scholar runs high (above 80), adding a scholar is the sensible move.",
  },
  "admin.queue.backlogTip3": {
    bn: "অনুপলব্ধ আলেমকে সাময়িকভাবে বাদ দিয়ে দিন যাতে রাউটিং কার্যকর প্রার্থী খুঁজে পায়।",
    en: "Mark unavailable scholars as away so routing can find a candidate who can actually answer.",
  },
  "admin.queue.backlogTip4": {
    bn: "২৪ ঘণ্টার বেশি অপেক্ষা করা প্রশ্নে আলেমদের তাগাদা পাঠানো যাবে।",
    en: "Send scholars a nudge on questions that have waited more than 24 hours.",
  },

  /* -------- question monitor -------- */
  "admin.queue.filterAll": { bn: "সব প্রশ্ন", en: "All questions" },
  "admin.queue.filterUrgent": { bn: "জরুরি", en: "Urgent" },
  "admin.queue.filterFatwa": { bn: "ফতোয়া চাওয়া", en: "Fatwa requested" },
  "admin.queue.staleTitle": {
    bn: "২৪ ঘণ্টার বেশি উত্তরহীন প্রশ্ন",
    en: "Questions unanswered for over 24 hours",
  },
  "admin.queue.staleBody": {
    bn: "{count}টি প্রশ্ন একদিনের বেশি সময় ধরে উত্তরহীন। নিচের তালিকায় এই প্রশ্নগুলোর বিভাগ দেখে নিন — যে বিভাগে আলেম সংকট, সেখানে নতুন আলেম যোগ করতে হবে।",
    en: "{count} questions have been unanswered for more than a day. Check their departments in the list below — wherever scholars are short, that is where to add one.",
  },
  "admin.queue.backlogCard": { bn: "উত্তরহীন ব্যাকলগ", en: "Unanswered backlog" },
  "admin.queue.backlogCardHelp": {
    bn: "সর্বোচ্চ অপেক্ষার প্রশ্নগুলো আগে — কোন বিভাগে আলেম দরকার তা এখানেই বোঝা যায়",
    en: "Longest waits first — this is where you see which department needs a scholar",
  },
  "admin.queue.waitingHours": { bn: "অপেক্ষা {count} ঘণ্টা", en: "Waiting {count} hours" },
  "admin.queue.departmentHasNoScholars": {
    bn: "বিভাগে আলেম নেই",
    en: "No scholars in this department",
  },
  "admin.queue.nudgeSent": { bn: "তাগাদা পাঠানো হয়েছে", en: "Nudge sent" },
  "admin.queue.nudgeScholars": { bn: "আলেমদের তাগাদা দিন", en: "Nudge the scholars" },
  "admin.queue.emptyTitle": { bn: "এই ফিল্টারে কোনো প্রশ্ন নেই", en: "No questions match this filter" },
  "admin.queue.emptyBody": {
    bn: "রাউটিং স্বাভাবিক আছে — অন্য ফিল্টার দেখুন।",
    en: "Routing looks normal — try another filter.",
  },
  "admin.queue.waitingHoursBadge": { bn: "{count} ঘণ্টা অপেক্ষা", en: "{count} hours waiting" },
  "admin.queue.viewedBy": { bn: "{count} জন দেখেছেন", en: "{count} people viewed" },
  "admin.queue.answersCount": { bn: "{count}টি উত্তর", en: "{count} answers" },
  "admin.queue.noScholarsSuffix": { bn: " · আলেম নেই", en: " · no scholars" },
  "admin.queue.routing": { bn: "রাউটিং", en: "Routing" },
  "admin.queue.routingNone": {
    bn: "কোনো আলেম খুঁজে পাওয়া যায়নি — সংশ্লিষ্ট বিভাগে আলেম যোগ করা প্রয়োজন।",
    en: "No scholar could be found — a scholar needs to be added to the relevant department.",
  },
  "admin.queue.sentToScholars": {
    bn: "{count} জন আলেমের কাছে পাঠানো হয়েছে",
    en: "Sent to {count} scholars",
  },
  "admin.queue.matchScore": {
    bn: "মিল {score}% · অগ্রাধিকার {priority}",
    en: "Match {score}% · priority {priority}",
  },
  "admin.queue.departmentCoverage": { bn: "বিভাগ কভারেজ", en: "Department coverage" },
  "admin.queue.coverageHint": {
    bn: "{covered}/{total} বিভাগে আলেম আছেন",
    en: "{covered} of {total} departments have scholars",
  },
  "admin.queue.viewQuestion": { bn: "প্রশ্নটি দেখুন", en: "View the question" },

  /* -------- review queue -------- */
  "admin.queue.crumbReview": { bn: "পর্যালোচনা", en: "Review" },
  "admin.queue.reviewIntro": {
    bn: "প্রকাশের আগে প্রতিটি প্রবন্ধ ও ফতোয়ার দলিল যাচাই করা হয়। প্রশ্ন রাউটিং যেমন আলেমের যোগ্যতার উপর নির্ভর করে, তেমনি প্ল্যাটফর্মের বিশ্বাসযোগ্যতা নির্ভর করে এই যাচাইয়ের উপর।",
    en: "Every article and fatwa has its evidence checked before publication. Just as question routing rests on a scholar's competence, the platform's credibility rests on this check.",
  },
  "admin.queue.flaggedRefsTitle": {
    bn: "যাচাই প্রয়োজন এমন রেফারেন্স",
    en: "References that need checking",
  },
  "admin.queue.flaggedRefsBody": {
    bn: "{count}টি জমায় সন্দেহজনক সন্বর্ধনা বা দুর্বল সূত্র চিহ্নিত হয়েছে। অনুমোদনের আগে অবশ্যই আয়াত ও হাদীসের সূত্র মিলিয়ে দেখুন — একটি ভুল সূত্র পুরো প্ল্যাটফর্মের উপর সন্দেহ তৈরি করে।",
    en: "{count} submissions carry a suspect attribution or a weak source. Check the verse and hadith citations before approving — one wrong citation casts doubt on the whole platform.",
  },
  "admin.queue.reviewSteps": { bn: "পর্যালোচনার ধাপ", en: "The review steps" },
  "admin.queue.reviewStepsHelp": {
    bn: "বর্তমানে {pending}টি জমা আছে, মোট {words} শব্দ",
    en: "{pending} submissions in the queue, {words} words in total",
  },
  "admin.queue.step1Title": { bn: "১. দলিল যাচাই", en: "1. Check the evidence" },
  "admin.queue.step1Body": {
    bn: "প্রতিটি আয়াত ও হাদীসের সূত্র মিলিয়ে দেখুন। ভুল সূরার নাম, ভুল হাদীস নম্বর বা দুর্বল হাদীস প্রকাশ করা যাবে না।",
    en: "Match every verse and hadith to its source. A wrong surah name, a wrong hadith number or a weak hadith must not be published.",
  },
  "admin.queue.step2Title": { bn: "২. ভাষা ও আদব", en: "2. Language and adab" },
  "admin.queue.step2Body": {
    bn: "আক্রমণাত্মক বা দলাদলিমূলক ভাষা থাকলে পরিবর্তন চেয়ে ফেরত পাঠান। মতভেদ থাকতে পারে, আদব হারানো যাবে না।",
    en: "If the language attacks someone or takes a sectarian side, send it back for changes. Disagreement is allowed; losing adab is not.",
  },
  "admin.queue.step3Title": { bn: "৩. বিভাগ নির্ধারণ", en: "3. Sort it into a department" },
  "admin.queue.step3Body": {
    bn: "প্রকাশিত কনটেন্ট সঠিক বিভাগে পড়ছে কি না দেখুন — ভুল বিভাগে গেলে সঠিক পাঠক সেটি খুঁজে পাবেন না।",
    en: "Check that the content lands in the right department — in the wrong one, the reader who needs it will never find it.",
  },
  "admin.queue.step4Title": { bn: "৪. প্রকাশ বা ফেরত", en: "4. Publish or return" },
  "admin.queue.step4Body": {
    bn: "সব ঠিক থাকলে অনুমোদন করুন। ছোট সংশোধন লাগলে পরিবর্তন চান — লেখক নিজের খসড়ায় ফিরে সম্পাদনা করবেন।",
    en: "Approve when everything is right. For a small correction, ask for changes — the author goes back into their own draft to edit.",
  },

  /* -------- review board -------- */
  "admin.queue.flaggedRefs": { bn: "সতর্ক রেফারেন্স", en: "Flagged references" },
  "admin.queue.resolvedThisSession": { bn: "এই সেশনে নিষ্পত্তি", en: "Resolved this session" },
  "admin.queue.filterToReview": { bn: "পর্যালোচনার অপেক্ষায়", en: "Awaiting review" },
  "admin.queue.filterAllSubmissions": { bn: "সব জমা", en: "All submissions" },
  "admin.queue.listEmpty": { bn: "এই তালিকা খালি", en: "This list is empty" },
  "admin.queue.emptyReviewBody": {
    bn: "নির্বাচিত ফিল্টারে কোনো কনটেন্ট নেই। সব জমা দেখতে ফিল্টার বদলান।",
    en: "No content matches the selected filter. Switch filters to see every submission.",
  },
  "admin.queue.weakRefs": { bn: "{count}টি দুর্বল রেফারেন্স", en: "{count} weak references" },
  "admin.queue.submittedSuffix": { bn: "জমা {time}", en: "submitted {time}" },
  "admin.queue.words": { bn: "শব্দ", en: "Words" },
  "admin.queue.wordsCount": { bn: "{count} শব্দ", en: "{count} words" },
  "admin.queue.refsCount": { bn: "{count} রেফারেন্স", en: "{count} references" },
  "admin.queue.requestChanges": { bn: "পরিবর্তন চান", en: "Request changes" },
  "admin.queue.revert": { bn: "আগের অবস্থায় ফেরান", en: "Revert" },
  "admin.queue.reviewPanel": { bn: "পর্যালোচনা প্যানেল", en: "Review panel" },
  "admin.queue.refsToVerify": {
    bn: "{count}টি রেফারেন্স যাচাই প্রয়োজন",
    en: "{count} references to verify",
  },
  "admin.queue.noRefWarnings": { bn: "রেফারেন্স সতর্কতা নেই", en: "No reference warnings" },
  "admin.queue.toVerify": { bn: "যাচাই বাকি", en: "To verify" },
  "admin.queue.originalText": { bn: "মূল লেখা", en: "Original text" },
  "admin.queue.citedInText": { bn: "লেখায় উদ্ধৃত দলিল", en: "Evidence cited in the text" },
  "admin.queue.noCitations": {
    bn: "লেখাটিতে স্পষ্টভাবে চিহ্নিত কোনো দলিল পাওয়া যায়নি — অনুমোদনের আগে রেফারেন্স যুক্ত করতে বলুন।",
    en: "No clearly attributed evidence was found in this text — ask the author to add references before you approve.",
  },
  "admin.queue.notInCorpus": {
    bn: "এই আইটেমের মূল লেখা এখনো প্রকাশিত সংকলনে নেই, তাই শুধু মেটাডেটা দেখা যাচ্ছে।",
    en: "This item's full text is not in the published collection yet, so only its metadata is shown.",
  },
  "admin.queue.verifyProgress": {
    bn: "রেফারেন্স যাচাইয়ের অগ্রগতি",
    en: "Reference verification progress",
  },
  "admin.queue.approveAndPublish": { bn: "অনুমোদন করে প্রকাশ করুন", en: "Approve and publish" },
  "admin.queue.requestChangesAndReturn": {
    bn: "পরিবর্তন চেয়ে ফেরত",
    en: "Return for changes",
  },
  "admin.queue.reviewCriteria": { bn: "পর্যালোচনার মানদণ্ড", en: "Review criteria" },
  "admin.queue.criterion1": {
    bn: "প্রতিটি আয়াত ও হাদীসের রেফারেন্স যাচাই করুন — ভুল সন্বর্ধনা বা ভুল সূত্র সবচেয়ে বড় ক্ষতি।",
    en: "Verify every verse and hadith reference — a wrong attribution or a wrong source does the most damage.",
  },
  "admin.queue.criterion2": {
    bn: "দলাদলিমূলক বা কোনো দলকে আক্রমণ করে এমন ভাষা থাকলে প্রকাশ করা যাবে না।",
    en: "Language that takes sectarian sides or attacks a group must not be published.",
  },
  "admin.queue.criterion3": {
    bn: "শর্তহীন বা অতি-কঠোর রায় হলে কারণ ও ব্যতিক্রম স্পষ্ট করা লাগবে।",
    en: "An unconditional or unusually harsh ruling needs its reasoning and its exceptions spelled out.",
  },
  "admin.queue.criterion4": {
    bn: "বিভাগ ঠিক আছে কি না দেখুন — ভুল বিভাগে প্রকাশিত ফতোয়া ভুল পাঠকের কাছে পৌঁছায়।",
    en: "Check the department — a fatwa published in the wrong one reaches the wrong reader.",
  },

  /* -------- report queue -------- */
  "admin.queue.crumbReports": { bn: "রিপোর্ট", en: "Reports" },
  "admin.queue.reportsIntro": {
    bn: "প্ল্যাটফর্মের আলোচনা যেন জ্ঞানভিত্তিক ও আদবসম্মত থাকে, তা রক্ষা করাই মডারেশনের কাজ। ভুল তথ্য, দলাদলি ও অপমান — এই তিনটি বিষয়ে দ্রুত সিদ্ধান্ত নেওয়া প্রয়োজন।",
    en: "Moderation exists to keep the platform's discussions knowledgeable and courteous. Misinformation, sectarianism and abuse — those three need a decision quickly.",
  },
  "admin.queue.unassignedTitle": { bn: "দায়িত্বহীন রিপোর্ট", en: "Unassigned reports" },
  "admin.queue.unassignedBody": {
    bn: "{count}টি অপেক্ষমাণ রিপোর্টে এখনো কোনো মডারেটর দায়িত্ব পাননি। উচ্চ গুরুত্বের রিপোর্টে আগে দায়িত্ব দিন।",
    en: "{count} pending reports have no moderator on them yet. Put someone on the high-severity ones first.",
  },
  "admin.queue.byReason": { bn: "রিপোর্টের কারণ অনুসারে বণ্টন", en: "Reports by reason" },
  "admin.queue.byReasonHelp": {
    bn: "কোন ধরনের সমস্যা বেশি ঘটছে",
    en: "Which kind of problem is most common",
  },
  "admin.queue.reasonMisinformation": { bn: "ভুল তথ্য", en: "Misinformation" },
  "admin.queue.reasonSectarian": { bn: "দলাদলি", en: "Sectarianism" },
  "admin.queue.reasonAbuse": { bn: "অপমান", en: "Abuse" },
  "admin.queue.reasonSpam": { bn: "স্প্যাম", en: "Spam" },
  "admin.queue.reasonOffTopic": { bn: "বিষয়ের বাইরে", en: "Off-topic" },
  "admin.queue.reasonCopyright": { bn: "কপিরাইট", en: "Copyright" },
  "admin.queue.reportTotals": {
    bn: "মোট {total}টি রিপোর্ট · {pending}টি অপেক্ষমাণ · {high}টি উচ্চ গুরুত্ব",
    en: "{total} reports · {pending} pending · {high} high severity",
  },
  "admin.queue.policy": { bn: "মডারেশন নীতিমালা", en: "Moderation policy" },
  "admin.queue.policyHelp": { bn: "মডারেটরের ক্ষমতা ও সীমা", en: "What a moderator can and cannot do" },
  "admin.queue.policy3Title": { bn: "অপমান ও হয়রানি", en: "Abuse and harassment" },
  "admin.queue.policy4Title": { bn: "উপযুক্ত আদব", en: "Proper adab" },
  "admin.queue.policy1Body": {
    bn: "দলিলবিহীন বা ভুল সূত্রে দেওয়া ফতোয়া ও উত্তর। সংশ্লিষ্ট আলেমের সাথে যাচাই করে কনটেন্ট লুকানো হয়।",
    en: "Fatwas and answers given without evidence or with a wrong source. The content is hidden after checking with the scholar responsible.",
  },
  "admin.queue.policy2Body": {
    bn: "কোনো দল, মসজিদ বা ব্যক্তিকে লক্ষ্যবস্তু করে লেখা। প্ল্যাটফর্মে ফিকহি মতভেদ থাকবে, দলাদলি নয়।",
    en: "Writing that targets a group, a mosque or a person. This platform allows fiqhi disagreement, not sectarianism.",
  },
  "admin.queue.policy3Body": {
    bn: "ব্যক্তিগত আক্রমণ, গালি বা কাউকে ছোট করা। সরাসরি অ্যাকাউন্ট স্থগিত করা হয়।",
    en: "Personal attacks, insults or belittling someone. The account is suspended outright.",
  },
  "admin.queue.policy4Body": {
    bn: "মতভেদে দলিল পেশ করুন, ব্যক্তিকে আক্রমণ করবেন না। আলেমদের মতের ভিন্নতায় ব্যবহারকারী যেন বিভ্রান্ত না হন।",
    en: "Argue with evidence, never against people. A reader should not be left confused by the disagreement between scholars.",
  },
  "admin.queue.moderatorTools": { bn: "মডারেটরের হাতে থাকা ব্যবস্থা", en: "Tools a moderator has" },
  "admin.queue.moderatorToolsHelp": {
    bn: "প্রতিটি সিদ্ধান্ত অডিট লগে সংরক্ষিত হয়",
    en: "Every decision is written to the audit log",
  },
  "admin.queue.toolHideTitle": { bn: "কনটেন্ট লুকানো", en: "Hide content" },
  "admin.queue.toolHideBody": {
    bn: "কনটেন্ট পাবলিক তালিকা থেকে সরে যায়, তবে লেখকের কাছে থাকে।",
    en: "The content leaves the public lists but stays with its author.",
  },
  "admin.queue.toolLockTitle": { bn: "থ্রেড বন্ধ", en: "Lock thread" },
  "admin.queue.toolLockBody": {
    bn: "আলোচনা পড়া যায়, কিন্তু নতুন উত্তর যোগ করা যায় না।",
    en: "The discussion stays readable, but no new replies can be added.",
  },
  "admin.queue.toolChangesTitle": { bn: "পরিবর্তনের অনুরোধ", en: "Request changes" },
  "admin.queue.toolChangesBody": {
    bn: "লেখককে দলিল সংশোধনের নির্দেশ দেওয়া হয়।",
    en: "The author is asked to correct the evidence.",
  },
  "admin.queue.toolSuspendTitle": { bn: "অ্যাকাউন্ট স্থগিত", en: "Suspend account" },
  "admin.queue.toolSuspendBody": {
    bn: "গুরুতর বা পুনরাবৃত্তি অপরাধে অ্যাকাউন্ট স্থগিত করা হয়।",
    en: "Used for serious or repeated offences.",
  },

  /* -------- report board -------- */
  "admin.queue.severityHigh": { bn: "উচ্চ", en: "High" },
  "admin.queue.severityMedium": { bn: "মধ্যম", en: "Medium" },
  "admin.queue.severityLow": { bn: "নিম্ন", en: "Low" },
  "admin.queue.severityLabel": { bn: "{level} গুরুত্ব", en: "{level} severity" },
  "admin.queue.typeComment": { bn: "মন্তব্য", en: "Comment" },
  "admin.queue.statHighSeverity": { bn: "উচ্চ গুরুত্ব", en: "High severity" },
  "admin.queue.resolved": { bn: "নিষ্পত্তি", en: "Resolved" },
  "admin.queue.dismissed": { bn: "খারিজ", en: "Dismissed" },
  "admin.queue.filterPendingReports": { bn: "অপেক্ষমাণ রিপোর্ট", en: "Pending reports" },
  "admin.queue.filterAllReports": { bn: "সব রিপোর্ট", en: "All reports" },
  "admin.queue.emptyReportsBody": {
    bn: "কোনো অপেক্ষমাণ রিপোর্ট নেই। মডারেশন সারি পরিষ্কার।",
    en: "No pending reports. The moderation queue is clear.",
  },
  "admin.queue.contentHidden": { bn: "কনটেন্ট লুকানো", en: "Content hidden" },
  "admin.queue.threadLocked": { bn: "থ্রেড বন্ধ", en: "Thread locked" },
  "admin.queue.reportedBy": { bn: "রিপোর্ট করেছেন {name}", en: "Reported by {name}" },
  "admin.queue.assignedTo": { bn: "দায়িত্বে {name}", en: "Assigned to {name}" },
  "admin.queue.noAssignee": { bn: "কেউ দায়িত্বে নেই", en: "No one assigned" },
  "admin.queue.viewContent": { bn: "কনটেন্ট দেখুন", en: "View the content" },
  "admin.queue.resolveReport": { bn: "নিষ্পত্তি করুন", en: "Resolve" },
  "admin.queue.unhideContent": { bn: "আবার দেখান", en: "Show again" },
  "admin.queue.hideContent": { bn: "কনটেন্ট লুকান", en: "Hide content" },
  "admin.queue.unlockThread": { bn: "থ্রেড খুলুন", en: "Unlock thread" },
  "admin.queue.lockThread": { bn: "থ্রেড বন্ধ করুন", en: "Lock thread" },
  "admin.queue.dismissReport": { bn: "খারিজ করুন", en: "Dismiss" },
  "admin.queue.flaggedThreads": { bn: "পর্যালোচনাধীন আলোচনা থ্রেড", en: "Threads under review" },
  "admin.queue.flaggedThreadsHelp": {
    bn: "যেসব থ্রেডে মডারেটরের হস্তক্ষেপ প্রয়োজন",
    en: "Threads that need a moderator",
  },
  "admin.queue.flaggedThreadsNote": {
    bn: "পর্যালোচনাধীন থ্রেড লেখকের কাছে দৃশ্যমান থাকে কিন্তু নতুন উত্তর যোগ করা যায় না, যতক্ষণ না মডারেটর সিদ্ধান্ত দেন।",
    en: "A thread under review stays visible to its author but takes no new replies until a moderator decides.",
  },
};

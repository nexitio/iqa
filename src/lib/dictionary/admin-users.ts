/**
 * Admin console copy — accounts and taxonomy: the user list and its controls,
 * department management, and the admin console's own landing page.
 *
 * Keys are namespaced `admin.users.*`, `admin.departments.*` and `admin.home.*`
 * (the landing page and the shared breadcrumb root). One area's copy lives in
 * one file so that several areas can be translated at once without two writers
 * on the same file. Every entry is `{ bn, en }`: `bn` is the wording the screen
 * already shows, `en` is its English twin. `{name}` placeholders are filled in
 * by `translate()`, and a **number** passed as a var is printed in the reader's
 * own digits (৩ or 3), so counts belong in a var rather than typed into the
 * string.
 */
import type { Dict } from "./types";

export const ADMIN_USERS: Dict = {
  /* ------------------------------------------------- admin landing / shell */
  "admin.home.breadcrumbRoot": { bn: "অ্যাডমিন", en: "Admin" },
  "admin.home.description": {
    bn: "প্ল্যাটফর্মের ব্যবহার, প্রশ্নপ্রবাহ, বিভাগভিত্তিক চাহিদা ও মডারেশন অবস্থা এক জায়গায়। এই সংখ্যাগুলোই ঠিক করে কোথায় নতুন আলেম দরকার।",
    en: "Platform usage, question flow, demand by department and moderation state in one place. These are the numbers that say where a new scholar is needed.",
  },
  "admin.home.todaysWork": { bn: "আজকের কাজ", en: "Today's work" },
  "admin.home.todaysWorkHelp": {
    bn: "যেসব বিষয়ে অ্যাডমিনের সিদ্ধান্ত প্রয়োজন",
    en: "The things waiting on an admin decision",
  },
  "admin.home.queueScholars": { bn: "আলেম আবেদন", en: "Scholar applications" },
  "admin.home.queueScholarsHelp": {
    bn: "যোগ্যতা যাচাই করে প্রোফাইল অনুমোদন করুন — বিভাগ নির্ধারণ প্রশ্ন রাউটিং ঠিক করে।",
    en: "Verify credentials and approve the profile — the department you set is what fixes question routing.",
  },
  "admin.home.queueReviewHelp": {
    bn: "প্রকাশের আগে প্রবন্ধ ও ফতোয়ার দলিল যাচাই করুন।",
    en: "Check the evidence behind articles and fatwas before they publish.",
  },
  "admin.home.queueReports": { bn: "মডারেশন রিপোর্ট", en: "Moderation reports" },
  "admin.home.queueReportsHelp": {
    bn: "ভুল তথ্য, দলাদলি ও আদববিরোধী আচরণের অভিযোগ নিষ্পত্তি করুন।",
    en: "Settle complaints about wrong information, partisanship and bad adab.",
  },
  "admin.home.morePending": { bn: "আরও {count}টি অপেক্ষমাণ", en: "{count} more pending" },
  "admin.home.reviewAndDecide": { bn: "দেখুন ও সিদ্ধান্ত নিন", en: "Review and decide" },
  "admin.home.oldestSubmission": { bn: "সবচেয়ে পুরনো জমা", en: "Oldest submission" },
  "admin.home.needsAttention": { bn: "দ্রুত মনোযোগ প্রয়োজন", en: "Needs attention soon" },
  "admin.home.unansweredCallout": {
    bn: "{count}টি প্রশ্ন ২৪ ঘণ্টার বেশি উত্তরহীন — সংশ্লিষ্ট বিভাগে হয়তো আলেমের ঘাটতি আছে, রাউটিং পুনর্বিবেচনা করুন।",
    en: "{count} questions have gone more than 24 hours without an answer — the department may be short of scholars; review the routing.",
  },
  "admin.home.flaggedContent": {
    bn: "{count}টি কনটেন্ট মডারেশনের অপেক্ষায় আছে।",
    en: "{count} items of content are waiting for moderation.",
  },
  "admin.home.activeUsersTrend": { bn: "দৈনিক সক্রিয় ব্যবহারকারী", en: "Daily active users" },
  "admin.home.activeUsersTrendHelp": {
    bn: "গত ১৪ দিন — সন্ধ্যার পর সর্বোচ্চ সক্রিয়তা",
    en: "Last 14 days — most active after the evening",
  },
  "admin.home.questionsTrend": { bn: "দৈনিক নতুন প্রশ্ন", en: "New questions per day" },
  "admin.home.questionsTrendHelp": {
    bn: "গত ১৪ দিন — ধীরে ধীরে বাড়ছে চাহিদা",
    en: "Last 14 days — demand is climbing steadily",
  },
  "admin.home.departmentCoverage": { bn: "বিভাগ কভারেজ", en: "Department coverage" },
  "admin.home.departmentCoverageHelp": {
    bn: "প্রতিটি বিভাগে অন্তত একজন আলেম থাকা রাউটিংয়ের জন্য জরুরি",
    en: "Routing needs at least one scholar in every department",
  },
  "admin.home.coveredDepartments": { bn: "কভার করা বিভাগ", en: "Covered departments" },
  "admin.home.totalDepartments": { bn: "মোট বিভাগ", en: "Total departments" },
  "admin.home.coverageNote": {
    bn: "প্রতিটি বিভাগে কমপক্ষে একজন আলেম থাকলে সংশ্লিষ্ট বিভাগের প্রশ্ন কখনো অনাদায়ী থাকে না।",
    en: "With at least one scholar in a department, that department's questions never go unanswered.",
  },
  "admin.home.quickGuide": { bn: "সংক্ষিপ্ত নির্দেশিকা", en: "Quick guide" },
  "admin.home.guideAddScholar": {
    bn: "নতুন আলেম যোগ করলে অবশ্যই বিভাগ নির্ধারণ করুন — এটিই রাউটিংয়ের ভিত্তি।",
    en: "Always set departments when you add a scholar — that is the basis of routing.",
  },
  "admin.home.guideHoldRulings": {
    bn: "দলিলবিহীন বা শর্তহীন রায় পর্যালোচনায় আটকে দিন।",
    en: "Hold rulings without evidence or conditions in review.",
  },
  "admin.home.guideMuftiCredentials": {
    bn: "প্রতিটি ফতোয়ার পেছনে মুফতির যোগ্যতা ও স্বাক্ষর প্রকাশ্য রাখুন।",
    en: "Keep the mufti's credentials and signature visible behind every fatwa.",
  },
  "admin.home.adminOnly": { bn: "শুধুমাত্র অ্যাডমিন", en: "Admins only" },
  "admin.home.auditLogOn": { bn: "অডিট লগ চালু", en: "Audit log on" },

  /* ------------------------------------------------------------ user list */
  "admin.users.title": { bn: "ব্যবহারকারী ব্যবস্থাপনা", en: "User management" },
  "admin.users.description": {
    bn: "ভূমিকা ও অ্যাক্সেস নিয়ন্ত্রণ করুন। সাধারণ ব্যবহারকারীরা নিজেই নিবন্ধন করেন, আর আলেম অ্যাকাউন্ট কেবল অ্যাডমিন তৈরি করেন — কারণ আলেম হওয়া মানে প্রশ্ন পাওয়ার দায়িত্ব নেওয়া।",
    en: "Control roles and access. Ordinary users register themselves, while only an admin creates scholar accounts — being a scholar means taking on the duty of receiving questions.",
  },
  "admin.users.scholarAccounts": { bn: "আলেম অ্যাকাউন্ট", en: "Scholar accounts" },
  "admin.users.scholarAccountsHint": {
    bn: "ডেটাসেটে {count}টি নমুনা প্রোফাইল",
    en: "{count} sample profiles in the dataset",
  },
  "admin.users.admins": { bn: "অ্যাডমিন", en: "Admins" },
  "admin.users.adminsHint": { bn: "কেবল প্রতিষ্ঠাতা পর্যায়ের", en: "Founding-stage accounts only" },
  "admin.users.suspendedAccounts": { bn: "স্থগিত অ্যাকাউন্ট", en: "Suspended accounts" },
  "admin.users.awaitingVerification": {
    bn: "{count}টি যাচাইয়ের অপেক্ষায়",
    en: "{count} awaiting verification",
  },
  "admin.users.nonePending": { bn: "কোনো অপেক্ষমাণ নেই", en: "Nothing pending" },
  "admin.users.suspendedCalloutTitle": {
    bn: "স্থগিত অ্যাকাউন্ট পর্যালোচনা",
    en: "Review suspended accounts",
  },
  "admin.users.suspendedCallout": {
    bn: "{count}টি অ্যাকাউন্ট স্থগিত অবস্থায় আছে। স্থগিতাদেশের কারণ নথিভুক্ত করুন এবং প্রয়োজন হলে ব্যবহারকারীকে জানান — স্বচ্ছতা সম্প্রদায়ের আস্থা ধরে রাখে।",
    en: "{count} accounts are suspended. Record the reason and tell the user when it matters — transparency is what keeps the community's trust.",
  },
  "admin.users.sampleUsers": { bn: "সম্প্রদায়ের নমুনা ব্যবহারকারী", en: "Sample community members" },
  "admin.users.sampleUsersHelp": {
    bn: "প্রশ্ন করা, সংরক্ষণ করা ও আলোচনায় অংশ নেওয়া ব্যবহারকারীরা",
    en: "People who ask, save and take part in discussions",
  },
  "admin.users.interests": { bn: "{count}টি আগ্রহ", en: "{count} interests" },
  "admin.users.sampleFooter": {
    bn: "মোট {count}টি নমুনা প্রোফাইল · ব্যবহারকারী {users} জন",
    en: "{count} sample profiles · {users} users",
  },
  "admin.users.roleFilterLabel": { bn: "ভূমিকা অনুসারে ফিল্টার", en: "Filter by role" },
  "admin.users.filterAll": { bn: "সবাই", en: "Everyone" },
  "admin.users.roleAdmin": { bn: "অ্যাডমিন", en: "Admin" },
  "admin.users.roleScholar": { bn: "আলেম", en: "Scholar" },
  "admin.users.roleUser": { bn: "ব্যবহারকারী", en: "User" },
  "admin.users.searchPlaceholder": { bn: "নাম বা ইমেইল…", en: "Name or email…" },
  "admin.users.searchAria": { bn: "ব্যবহারকারী খুঁজুন", en: "Search users" },
  "admin.users.noUsers": { bn: "কোনো ব্যবহারকারী পাওয়া যায়নি", en: "No users found" },
  "admin.users.noUsersHelp": {
    bn: "ফিল্টার বা খোঁজের শব্দ বদলে দেখুন।",
    en: "Try a different filter or search term.",
  },
  "admin.users.tableShowing": {
    bn: "টেবিলে {shown}জন দেখানো হচ্ছে · মোট {total}জন",
    en: "Showing {shown} of {total} in the table",
  },
  "admin.users.roleAndPermissions": { bn: "ভূমিকা ও অনুমতি", en: "Role and permissions" },
  "admin.users.selectedAccount": {
    bn: "নির্বাচিত ব্যবহারকারীর অ্যাকাউন্ট",
    en: "The selected user's account",
  },
  "admin.users.statusActive": { bn: "সক্রিয়", en: "Active" },
  "admin.users.statusSuspended": { bn: "স্থগিত", en: "Suspended" },
  "admin.users.statusPending": { bn: "অপেক্ষমাণ", en: "Pending" },
  "admin.users.assignRole": { bn: "ভূমিকা নির্ধারণ", en: "Assign role" },
  "admin.users.roleAria": { bn: "ভূমিকা", en: "Role" },
  "admin.users.unsuspend": { bn: "স্থগিতাদেশ প্রত্যাহার", en: "Lift suspension" },
  "admin.users.suspend": { bn: "অ্যাকাউন্ট স্থগিত করুন", en: "Suspend account" },
  "admin.users.discardChanges": { bn: "পরিবর্তন বাতিল", en: "Discard changes" },
  "admin.users.unsavedTitle": { bn: "অসংরক্ষিত পরিবর্তন", en: "Unsaved changes" },
  "admin.users.roleChangePrefix": {
    bn: "ভূমিকা বদলে {role} করা হচ্ছে — ",
    en: "Changing the role to {role} — ",
  },
  "admin.users.unsavedBody": {
    bn: "এই পরিবর্তন সংরক্ষণ করতে ডেটাবেস লাগবে, তাই এটি এখন শুধু প্রিভিউ।",
    en: "Saving this needs the database, so for now it is only a preview.",
  },
  "admin.users.contributions": { bn: "অবদান", en: "Contributions" },
  "admin.users.escalationTitle": {
    bn: "অনুমতি বাড়ানোর সতর্কতা",
    en: "Before you widen access",
  },
  "admin.users.escalationHelp": {
    bn: "আলেম ভূমিকা দেওয়া মানে প্রকাশের ক্ষমতা দেওয়া",
    en: "A scholar role is publishing power",
  },
  "admin.users.escalationScholar": {
    bn: "আলেম ভূমিকা পেলে ব্যবহারকারী প্রবন্ধ ও ফতোয়া প্রকাশ করতে পারবেন — তাই যোগ্যতা ছাড়া দেবেন না।",
    en: "A scholar role lets the user publish articles and fatwas — do not grant it without the credentials.",
  },
  "admin.users.escalationAdmin": {
    bn: "অ্যাডমিন ভূমিকা কেবল প্রতিষ্ঠাতা পর্যায়ের অ্যাকাউন্টে সীমাবদ্ধ রাখুন।",
    en: "Keep the admin role limited to founding-stage accounts.",
  },
  "admin.users.escalationSuspend": {
    bn: "স্থগিত করা অ্যাকাউন্টের প্রকাশিত কনটেন্ট মুছে যায় না, কেবল অ্যাক্সেস বন্ধ হয়।",
    en: "Suspending an account does not delete what it published; it only closes access.",
  },
  "admin.users.escalationAudit": {
    bn: "প্রতিটি ভূমিকা পরিবর্তন অডিট লগে সংরক্ষিত হওয়া উচিত।",
    en: "Every role change should be recorded in the audit log.",
  },
  "admin.users.createTitle": { bn: "অ্যাকাউন্ট তৈরি", en: "Creating accounts" },
  "admin.users.createBody": {
    bn: "সাধারণ ব্যবহারকারীরা নিজেরাই নিবন্ধন করেন। আলেম অ্যাকাউন্ট কেবল অ্যাডমিন তৈরি করেন, কারণ এর সাথে প্রশ্ন পাওয়ার দায়িত্ব যুক্ত।",
    en: "Ordinary users register themselves. Only an admin creates a scholar account, because that account carries the duty of receiving questions.",
  },
  "admin.users.newScholarAccount": { bn: "নতুন আলেম অ্যাকাউন্ট", en: "New scholar account" },
  "admin.users.previewNote": {
    bn: "ভূমিকা বা অবস্থার পরিবর্তন ডান দিকের প্যানেলে সাথে সাথেই প্রতিফলিত হয়, তবে সংরক্ষণ করতে ডেটাবেস লাগবে — ততক্ষণ এটি প্রিভিউ।",
    en: "Role and status changes show in the panel on the right at once, but saving needs the database — until then this is a preview.",
  },

  /* ------------------------------------------------------- departments */
  "admin.departments.description": {
    bn: "বিভাগ হলো প্ল্যাটফর্মের বিষয়-কাঠামো। প্রতিটি প্রশ্ন একটি বিভাগে পড়ে, আর সেই বিভাগের আলেমরাই সেটি সবার আগে পান — তাই বিভাগে আলেম না থাকলে প্রশ্ন অনাদায়ী থেকে যায়।",
    en: "Departments are the platform's subject structure. Every question falls into one, and that department's scholars see it first — so a department with no scholar leaves questions unanswered.",
  },
  "admin.departments.total": { bn: "মোট বিভাগ", en: "Total departments" },
  "admin.departments.trendingHint": { bn: "{count}টি আলোচিত", en: "{count} trending" },
  "admin.departments.assignedScholars": { bn: "দায়িত্বে থাকা আলেম", en: "Scholars on duty" },
  "admin.departments.assignedScholarsHint": {
    bn: "একজন আলেম একাধিক বিভাগে থাকতে পারেন",
    en: "A scholar can serve in more than one department",
  },
  "admin.departments.totalQuestions": { bn: "মোট প্রশ্ন", en: "Total questions" },
  "admin.departments.answerRate": { bn: "উত্তর হার {percent}%", en: "{percent}% answered" },
  "admin.departments.unanswered": { bn: "উত্তরহীন", en: "Unanswered" },
  "admin.departments.emptyHint": {
    bn: "{count}টি বিভাগে আলেম নেই",
    en: "{count} departments have no scholar",
  },
  "admin.departments.emptyTitle": { bn: "আলেমবিহীন বিভাগ", en: "Departments without scholars" },
  "admin.departments.emptyCallout": {
    bn: "{count}টি বিভাগে কোনো আলেম দায়িত্বে নেই। এসব বিভাগে প্রশ্ন এলে রাউটিং কোনো প্রার্থী খুঁজে পায় না, ফলে উত্তর দেরি হয় বা প্রশ্ন অনাদায়ী থেকে যায়।",
    en: "{count} departments have no scholar on duty. When a question reaches them, routing finds no candidate, so the answer is late or never comes.",
  },
  "admin.departments.topByDemand": {
    bn: "চাহিদা অনুসারে শীর্ষ বিভাগ",
    en: "Top departments by demand",
  },
  "admin.departments.topByDemandHelp": {
    bn: "যেখানে প্রশ্ন বেশি, সেখানে আলেম বেশি দরকার",
    en: "Where the questions are, more scholars are needed",
  },
  "admin.departments.scholarCount": { bn: "{count} জন আলেম", en: "{count} scholars" },
  "admin.departments.howRoutingUses": {
    bn: "রাউটিং কীভাবে বিভাগ ব্যবহার করে",
    en: "How routing uses departments",
  },
  "admin.departments.stepsHelp": {
    bn: "একটি প্রশ্ন আলেমের কাছে পৌঁছানোর ধাপ",
    en: "The steps a question takes to reach a scholar",
  },
  "admin.departments.stepOne": {
    bn: "ব্যবহারকারী প্রশ্ন করার সময় এক বা একাধিক বিভাগ বেছে নেন।",
    en: "The user picks one or more departments while asking.",
  },
  "admin.departments.stepTwo": {
    bn: "সিস্টেম সেই বিভাগগুলোর আলেমদের খুঁজে বের করে।",
    en: "The system finds the scholars in those departments.",
  },
  "admin.departments.stepThree": {
    bn: "অভিজ্ঞতা, সাড়া দেওয়ার গতি এবং বর্তমান প্রশ্নভার বিবেচনা করে অগ্রাধিকার তালিকা তৈরি হয়।",
    en: "Experience, response speed and current question load build the priority list.",
  },
  "admin.departments.stepFour": {
    bn: "প্রধান বিভাগের আলেমরা সবার আগে প্রশ্নটি পান; অন্যরা পরে দেখতে পারেন।",
    en: "Scholars in the primary department get the question first; the others can see it later.",
  },
  "admin.departments.stepFive": {
    bn: "কোনো বিভাগে আলেম না থাকলে প্রশ্নটি অনাদায়ী থেকে যায় — এটাই সবচেয়ে বড় ঝুঁকি।",
    en: "If a department has no scholar, the question stays unanswered — that is the biggest risk.",
  },
  "admin.departments.bothConsoles": {
    bn: "আলেম প্যানেল ও ব্যবহারকারী সাইট",
    en: "The scholar console and the public site",
  },
  "admin.departments.bothConsolesHelp": {
    bn: "একই বিভাগ কাঠামো দুই জায়গাতেই ব্যবহৃত হয়",
    en: "One department structure is used in both",
  },
  "admin.departments.usedEverywhere": {
    bn: "এই বিভাগগুলোই ব্যবহারকারীর সাইটে বিষয় অনুযায়ী পড়ার পথ তৈরি করে — কুরআন, হাদীস, প্রবন্ধ, ফতোয়া ও আলোচনা সবই বিভাগভিত্তিক খুঁজে পাওয়া যায়। তাই এখানে নাম বা বিবরণ বদলালে ব্যবহারকারীর দেখাও বদলে যাবে।",
    en: "These departments are what give the public site a way to read by subject — Quran, Hadith, articles, fatwas and discussions are all found by department. So renaming or rewriting one here changes what the reader sees.",
  },
  "admin.departments.managerHelp": {
    bn: "বিভাগের নাম, বিবরণ ও চিহ্ন সম্পাদনা করুন এবং কোন আলেম কোন বিভাগে দায়িত্বে আছেন তা দেখুন।",
    en: "Edit a department's name, description and icon, and see which scholars serve in it.",
  },
  "admin.departments.onlyEmpty": { bn: "শুধু আলেমবিহীন বিভাগ", en: "Only departments without scholars" },
  "admin.departments.emptyCalloutManagerTitle": {
    bn: "আলেমবিহীন বিভাগ আছে",
    en: "Some departments have no scholar",
  },
  "admin.departments.emptyCalloutManager": {
    bn: "{count}টি বিভাগে এখনো কোনো আলেম নেই। এসব বিভাগের প্রশ্ন রাউট হবে না, ফলে ব্যবহারকারীর প্রশ্ন উত্তরহীন থেকে যেতে পারে — দ্রুত আলেম যোগ করুন।",
    en: "{count} departments still have no scholar. Questions there will not be routed, so a user's question can be left unanswered — add scholars soon.",
  },
  "admin.departments.editAndAssign": {
    bn: "বিভাগ সম্পাদনা ও আলেম বণ্টন",
    en: "Edit departments and assign scholars",
  },
  "admin.departments.noScholarBadge": { bn: "আলেম নেই", en: "No scholar" },
  "admin.departments.questionsCount": { bn: "{count}টি প্রশ্ন", en: "{count} questions" },
  "admin.departments.unansweredCount": { bn: "{count}টি উত্তরহীন", en: "{count} unanswered" },
  "admin.departments.nameField": { bn: "নাম (বাংলা)", en: "Name (Bangla)" },
  "admin.departments.descriptionField": { bn: "বিবরণ", en: "Description" },
  "admin.departments.iconField": { bn: "চিহ্ন", en: "Icon" },
  "admin.departments.toneField": { bn: "রঙ", en: "Colour" },
  "admin.departments.trendingSwitch": { bn: "আলোচিত হিসেবে চিহ্নিত করুন", en: "Mark as trending" },
  "admin.departments.trendingSwitchHelp": {
    bn: "আলোচিত বিভাগগুলো হোমপেজ ও বিষয় তালিকায় সামনে দেখানো হয়।",
    en: "Trending departments are surfaced on the home page and the topic list.",
  },
  "admin.departments.saveChanges": { bn: "পরিবর্তন সংরক্ষণ", en: "Save changes" },
  "admin.departments.discardChanges": { bn: "পরিবর্তন বাতিল", en: "Discard changes" },
  "admin.departments.saved": { bn: "সংরক্ষিত", en: "Saved" },
  "admin.departments.noScholarWarning": {
    bn: "এই বিভাগে কোনো আলেম নেই — প্রশ্ন রাউট হবে না।",
    en: "No scholar serves this department — questions will not be routed.",
  },
  "admin.departments.statsQuestions": { bn: "প্রশ্ন", en: "Questions" },
  "admin.departments.statsAnswers": { bn: "উত্তর", en: "Answers" },
  "admin.departments.statsFatwas": { bn: "ফতোয়া", en: "Fatwas" },
  "admin.departments.newTitle": { bn: "নতুন বিভাগ", en: "New department" },
  "admin.departments.newHelp": {
    bn: "কোন বিভাগ যুক্ত করা হবে তা প্ল্যাটফর্মের বিষয়-কাঠামো নির্ধারণ করে",
    en: "Which departments exist decides the platform's subject structure",
  },
  "admin.departments.newBody": {
    bn: "নতুন বিভাগ তৈরি করা ডেটাবেস পরিবর্তন ছাড়া সম্ভব নয়, তাই এই কাজটি অ্যাডমিন API যুক্ত হওয়ার পরেই চালু হবে। আপাতত বিদ্যমান {count}টি বিভাগ সম্পাদনা করা যাবে।",
    en: "Creating a department needs a database change, so this opens once the admin API lands. For now the existing {count} departments can be edited.",
  },
};

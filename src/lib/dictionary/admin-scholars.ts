/**
 * Admin console copy — the scholar queue: applications, the directory, and the
 * add-a-scholar form.
 *
 * Keys are namespaced `admin.scholars.*`. One area's copy lives in one file so
 * that several areas can be translated at once without two writers on the same
 * file. Every entry is `{ bn, en }`: `bn` is the wording the screen already
 * shows, `en` is its English twin. `{name}` placeholders are filled in by
 * `translate()`, and a **number** passed as a var is printed in the reader's own
 * digits (৩ or 3), so counts belong in a var rather than typed into the string.
 */
import type { Dict } from "./types";

export const ADMIN_SCHOLARS: Dict = {
  /* -------- the queue page (/admin/scholars) -------- */
  "admin.scholars.breadcrumb": { bn: "আলেম", en: "Scholars" },
  "admin.scholars.intro": {
    bn: "আলেম যোগ করা, যোগ্যতা যাচাই করা এবং বিভাগ নির্ধারণ করা — এই তিনটিই প্রশ্ন রাউটিংয়ের ভিত্তি। কোনো বিভাগে আলেম না থাকলে সেই বিভাগের প্রশ্ন উত্তরহীন থেকে যায়।",
    en: "Adding scholars, verifying credentials and fixing departments — these three are the basis of question routing. A department with no scholar leaves its questions unanswered.",
  },
  "admin.scholars.totalAnswersHint": {
    bn: "{count}টি উত্তর মোট",
    en: "{count} answers in total",
  },
  "admin.scholars.unverifiedHint": {
    bn: "{count}টি প্রোফাইল এখনো যাচাই হয়নি",
    en: "{count} profiles still unverified",
  },
  "admin.scholars.allVerified": { bn: "সবাই যাচাইকৃত", en: "All verified" },
  "admin.scholars.awaitingVerification": { bn: "যাচাই বাকি", en: "Awaiting verification" },
  "admin.scholars.deptCoverage": { bn: "বিভাগ কভারেজ", en: "Department coverage" },
  "admin.scholars.allDeptsCovered": {
    bn: "প্রতিটি বিভাগে আলেম আছে",
    en: "Every department has a scholar",
  },
  "admin.scholars.someDeptsUncovered": {
    bn: "কিছু বিভাগে আলেম নেই",
    en: "Some departments have no scholar",
  },
  "admin.scholars.pendingProfiles": {
    bn: "যাচাই বাকি প্রোফাইল",
    en: "Profiles awaiting verification",
  },
  "admin.scholars.pendingProfilesBody": {
    bn: "{count}জন আলেমের প্রোফাইল এখনো যাচাই করা হয়নি। যাচাইকৃত আলেমরা প্রশ্ন রাউটিংয়ে অগ্রাধিকার পান, তাই যোগ্যতা দেখে যাচাই সম্পন্ন করুন।",
    en: "{count} scholar profiles are still unverified. Verified scholars get priority in question routing, so check the credentials and complete the verification.",
  },
  "admin.scholars.byDepartment": {
    bn: "বিভাগ অনুসারে আলেম বণ্টন",
    en: "Scholars by department",
  },
  "admin.scholars.byDepartmentHelp": {
    bn: "প্রতিটি বিভাগে কতজন আলেম দায়িত্বে আছেন, এবং কতটি প্রশ্ন এসেছে",
    en: "How many scholars each department carries, and how many questions have arrived",
  },
  "admin.scholars.deptScholarCount": { bn: "{count} জন", en: "{count}" },
  "admin.scholars.deptStats": {
    bn: "{questions}টি প্রশ্ন · {answers}টি উত্তর",
    en: "{questions} questions · {answers} answers",
  },
  "admin.scholars.noScholars": {
    bn: "এখনো কোনো আলেম দায়িত্বে নেই",
    en: "No scholar assigned yet",
  },
  "admin.scholars.policyTitle": {
    bn: "প্রোফাইল যাচাইয়ের নীতি",
    en: "Profile verification policy",
  },
  "admin.scholars.policyIntro": {
    bn: "যাচাই ছাড়া আলেম প্রশ্ন পাবেন না",
    en: "An unverified scholar receives no questions",
  },
  "admin.scholars.policy1": {
    bn: "দাওরা-এ-হাদীস, ইফতা কোর্স বা সমমানের যোগ্যতা ছাড়া প্রোফাইল অনুমোদন করা হয় না।",
    en: "No profile is approved without a Dawra-e-Hadith, an Ifta course or an equivalent qualification.",
  },
  "admin.scholars.policy2": {
    bn: "প্রতিটি আলেমকে তাঁর প্রকৃত বিশেষজ্ঞতার বিভাগে রাখুন — অতিরিক্ত বিভাগ দিলে ভুল প্রশ্ন চলে যায়।",
    en: "Place each scholar in his actual field of expertise — extra departments send him the wrong questions.",
  },
  "admin.scholars.policy3": {
    bn: "একাধিক বিভাগে থাকা আলেমের জন্য প্রধান বিভাগ নির্ধারণ করা বাধ্যতামূলক, কারণ রাউটিং প্রথমে সেখানেই যায়।",
    en: "For a scholar in several departments a primary department is required, because routing goes there first.",
  },
  "admin.scholars.policy4": {
    bn: "যাচাই প্রত্যাহার করলে প্রোফাইল পাবলিক থাকে কিন্তু প্রশ্ন পাওয়া বন্ধ হয় — এবং সেটি অডিট লগে লেখা থাকে।",
    en: "Withdrawing verification keeps the profile public but stops the questions — and it is written to the audit log.",
  },

  /* -------- add a scholar (/admin/scholars/new) -------- */
  "admin.breadcrumb": { bn: "অ্যাডমিন", en: "Admin" },
  "admin.scholars.verifyFirstTitle": {
    bn: "যোগ্যতা যাচাই সবার আগে",
    en: "Verify the credentials first",
  },
  "admin.scholars.verifyFirstBody": {
    bn: "আলেমের প্রোফাইল পাবলিক হওয়ার সাথে সাথে তাঁর নামে জ্ঞানের দায় অন্তর্ভুক্ত হয়। তাই দাওরা-এ-হাদীস, ইফতা কোর্স বা সমমানের যোগ্যতা যাচাই করা এই ফর্মের সবচেয়ে গুরুত্বপূর্ণ অংশ।",
    en: "The moment a scholar's profile goes public, the responsibility for knowledge is attached to his name. Checking a Dawra-e-Hadith, an Ifta course or an equivalent is therefore the most important part of this form.",
  },
  "admin.scholars.routingImpactTitle": {
    bn: "প্রশ্ন রাউটিং কীভাবে প্রভাবিত হয়",
    en: "How this affects question routing",
  },
  "admin.scholars.routingImpactBody": {
    bn: "আলেমকে যে বিভাগে রাখা হবে, সেই বিভাগের প্রশ্নেই তিনি অগ্রাধিকার পান। একজন আলেম একাধিক বিভাগে থাকতে পারেন, এবং প্রধান বিভাগটি ঠিক করে দেওয়া হয় কারণ রাউটিং প্রথমে সেখানেই প্রশ্ন পাঠায়। বিভাগগুলো সঠিকভাবে নির্ধারণ করলে প্রশ্ন দ্রুত সঠিক আলেমের কাছে পৌঁছে।",
    en: "A scholar gets priority on the questions of the departments he is placed in. He may hold several, and a primary department is fixed because routing sends questions there first. Set the departments correctly and questions reach the right scholar faster.",
  },

  /* -------- applications board -------- */
  "admin.scholars.board.title": {
    bn: "আলেম আবেদন যাচাই",
    en: "Review scholar applications",
  },
  "admin.scholars.board.intro": {
    bn: "যোগ্যতা যাচাই করে অনুমোদন দিন — অনুমোদনের আগে বিভাগ ঠিক করে নিন, কারণ এটিই প্রশ্ন রাউটিং নির্ধারণ করে।",
    en: "Verify the credentials, then approve — settle the departments before approving, because they are what decide question routing.",
  },
  "admin.scholars.board.pendingBadge": { bn: "অপেক্ষমাণ {count}", en: "Pending {count}" },
  "admin.scholars.board.approvedBadge": { bn: "অনুমোদিত {count}", en: "Approved {count}" },
  "admin.scholars.board.rejectedBadge": { bn: "প্রত্যাখ্যাত {count}", en: "Rejected {count}" },
  "admin.scholars.board.verifyPublish": {
    bn: "প্রোফাইল যাচাই করে প্রকাশ করুন",
    en: "Publish as a verified profile",
  },
  "admin.scholars.board.verifyPublishHelp": {
    bn: "যাচাইকৃত প্রোফাইলে যাচাইকৃত আলেম চিহ্ন দেখা যাবে এবং প্রশ্ন রাউটিংয়ে অগ্রাধিকার পাবেন।",
    en: "A verified profile shows the verified mark and gets priority in question routing.",
  },
  "admin.scholars.board.notifyDecision": {
    bn: "সিদ্ধান্তের বিজ্ঞপ্তি পাঠান",
    en: "Notify the applicant",
  },
  "admin.scholars.board.notifyDecisionHelp": {
    bn: "অনুমোদন বা প্রত্যাখ্যানের তথ্য আবেদনকারীর ইমেইলে পাঠানো হবে।",
    en: "The approval or rejection is emailed to the applicant.",
  },
  "admin.scholars.board.emptyTitle": {
    bn: "সব আবেদন নিষ্পত্তি হয়েছে",
    en: "Every application is settled",
  },
  "admin.scholars.board.emptyBody": {
    bn: "এই মুহূর্তে কোনো অপেক্ষমাণ আলেম আবেদন নেই। নতুন আবেদন এলে এখানেই যাচাই করা যাবে।",
    en: "No scholar application is pending right now. New ones are reviewed here.",
  },
  "admin.scholars.board.experience": {
    bn: "{count} বছরের অভিজ্ঞতা",
    en: "{count} years of experience",
  },
  "admin.scholars.credentials": { bn: "যোগ্যতা", en: "Credentials" },
  "admin.scholars.board.proposedDepartments": {
    bn: "প্রস্তাবিত বিভাগ",
    en: "Proposed departments",
  },
  "admin.scholars.board.fewDepartments": {
    bn: "বিভাগ মাত্র {count}টি — যোগ্যতা অনুযায়ী আরও বিভাগ যোগ করার কথা ভাবুন।",
    en: "Only {count} departments — consider adding more that fit the credentials.",
  },
  "admin.scholars.board.submitted": { bn: "জমা দিয়েছেন {time}", en: "Submitted {time}" },
  "admin.scholars.board.approveVerified": {
    bn: "যাচাই করে অনুমোদন",
    en: "Verify and approve",
  },
  "admin.scholars.board.backToReview": { bn: "পর্যালোচনায়", en: "Back to review" },
  "admin.scholars.board.hideDecided": { bn: "নিষ্পত্তিকৃত লুকান", en: "Hide decided" },
  "admin.scholars.board.showDecided": {
    bn: "নিষ্পত্তিকৃত দেখুন ({count})",
    en: "Show decided ({count})",
  },
  "admin.scholars.board.undo": { bn: "ফিরিয়ে নিন", en: "Undo" },
  "admin.scholars.board.note": {
    bn: "অনুমোদনের আগে দেখে নিন আবেদনকারীর যোগ্যতা যাচাই করা হয়েছে কি না। অনুমোদনের সাথে সাথে তিনি সংশ্লিষ্ট বিভাগের প্রশ্ন পেতে শুরু করবেন, তাই ভুল বিভাগে যোগ দিলে রাউটিং অকার্যকর হয়ে পড়বে।",
    en: "Before approving, check that the applicant's credentials were really verified. Approval starts sending him that department's questions at once, so joining the wrong department makes routing ineffective.",
  },

  /* -------- directory -------- */
  "admin.scholars.dir.intro": {
    bn: "বিভাগ, জেলা ও যাচাই অবস্থা অনুযায়ী খুঁজুন — কার কোন বিভাগে দায়িত্ব আছে তা এখানেই নির্ধারিত হয়।",
    en: "Search by department, district and verification — this is where each scholar's departments are decided.",
  },
  "admin.scholars.dir.searchPlaceholder": {
    bn: "নাম, মাদরাসা বা বিশেষজ্ঞতা দিয়ে খুঁজুন…",
    en: "Search by name, madrasah or expertise…",
  },
  "admin.scholars.dir.searchLabel": { bn: "আলেম খুঁজুন", en: "Search scholars" },
  "admin.scholars.dir.districtFilter": { bn: "জেলা নির্বাচন", en: "Select districts" },
  "admin.scholars.dir.allDistricts": { bn: "সব জেলা", en: "All districts" },
  "admin.scholars.dir.sortBy": { bn: "সাজানোর ধরন", en: "Sort by" },
  "admin.scholars.dir.sortName": { bn: "নাম অনুসারে", en: "By name" },
  "admin.scholars.dir.verifiedOnly": { bn: "শুধু যাচাইকৃত", en: "Verified only" },
  "admin.scholars.dir.clearFilters": { bn: "ফিল্টার মুছুন", en: "Clear filters" },
  "admin.scholars.dir.departmentFilter": { bn: "বিভাগ ফিল্টার", en: "Department filter" },
  "admin.scholars.dir.byDepartment": { bn: "বিভাগ অনুসারে", en: "By department" },
  "admin.scholars.dir.showing": { bn: "{count} জন দেখানো হচ্ছে", en: "Showing {count}" },
  "admin.scholars.dir.ofTotal": { bn: "মোট {count} জনের মধ্যে", en: "of {count} total" },
  "admin.scholars.dir.noResults": { bn: "কোনো আলেম পাওয়া যায়নি", en: "No scholar found" },
  "admin.scholars.dir.noResultsHelp": {
    bn: "ফিল্টার বদলে আবার চেষ্টা করুন বা নতুন আলেম যোগ করুন।",
    en: "Change the filters and try again, or add a new scholar.",
  },

  /* -------- add-scholar form -------- */
  "admin.scholars.form.blockerName": {
    bn: "বাংলায় আলেমের পুরো নাম লিখুন",
    en: "Write the scholar's full name in Bangla",
  },
  "admin.scholars.form.blockerDepartment": {
    bn: "অন্তত একটি বিভাগ নির্বাচন করুন",
    en: "Select at least one department",
  },
  "admin.scholars.form.blockerPrimary": {
    bn: "প্রধান বিভাগ নির্ধারণ করুন",
    en: "Choose the primary department",
  },
  "admin.scholars.form.submitIncomplete": { bn: "তথ্য সম্পূর্ণ করুন", en: "Complete the details" },
  "admin.scholars.form.submitVerified": { bn: "যাচাই করে যোগ করুন", en: "Verify and add" },
  "admin.scholars.form.submitAdd": { bn: "আলেম যোগ করুন", en: "Add scholar" },
  "admin.scholars.form.basicInfoHelp": {
    bn: "নাম, পরিচয় ও অবস্থান — প্রকাশ্য প্রোফাইলে এগুলোই দেখানো হবে",
    en: "Name, identity and location — these are what the public profile shows",
  },
  "admin.scholars.form.honorific": { bn: "উপাধি", en: "Honorific" },
  "admin.scholars.form.nameBn": { bn: "পুরো নাম (বাংলা)", en: "Full name (Bangla)" },
  "admin.scholars.form.nameBnHelp": {
    bn: "উপাধি ছাড়া নাম — উপাধিটি পাশের ঘরে বেছে নিন, প্রোফাইলে দুটি একসাথে দেখা যাবে",
    en: "The name without the title — pick the title in the field beside it and the profile shows both",
  },
  "admin.scholars.form.nameBnPlaceholder": {
    bn: "আব্দুল্লাহ আল-মামুন",
    en: "Abdullah Al Mamun",
  },
  "admin.scholars.form.nameEn": { bn: "নাম (ইংরেজি)", en: "Name (English)" },
  // Latin either way: this is the English-name field, and the title lives in the
  // honourific select — putting it in the placeholder is how the dataset ended
  // up with "Mufti Mufti …" in the first place.
  "admin.scholars.form.nameEnPlaceholder": {
    bn: "Abdullah Al Mamun",
    en: "Abdullah Al Mamun",
  },
  "admin.scholars.form.nameEnHelp": { bn: "ইংরেজি মোডের জন্য", en: "For English mode" },
  "admin.scholars.form.madrasah": {
    bn: "মাদরাসা বা প্রতিষ্ঠান",
    en: "Madrasah or institution",
  },
  "admin.scholars.form.madrasahPlaceholder": {
    bn: "জামিয়া আহলিয়া দারুল উলূম মুঈনুল ইসলাম, হাটহাজারী",
    en: "Jamia Ahlia Darul Ulum Moinul Islam, Hathazari",
  },
  "admin.scholars.form.emailHelp": {
    bn: "এই ঠিকানায় যাচাইয়ের অনুরোধ ও আমন্ত্রণ পাঠানো হবে",
    en: "Verification requests and the invitation go to this address",
  },
  "admin.scholars.form.bio": { bn: "সংক্ষিপ্ত পরিচয়", en: "Short biography" },
  "admin.scholars.form.bioPlaceholder": {
    bn: "শিক্ষা, বিশেষজ্ঞতা ও দীর্ঘ অভিজ্ঞতার সংক্ষিপ্ত বিবরণ…",
    en: "Education, expertise and years of experience, briefly…",
  },
  "admin.scholars.form.departmentsHelp": {
    bn: "একজন আলেম একাধিক বিভাগে থাকতে পারেন — প্রশ্ন এসব বিভাগ থেকেই আসবে",
    en: "A scholar may hold several departments — questions arrive from all of them",
  },
  "admin.scholars.form.selectDepartments": { bn: "বিভাগ নির্বাচন", en: "Select departments" },
  "admin.scholars.form.primaryDepartmentHelp": {
    bn: "রাউটিং প্রথমে এই বিভাগের প্রশ্ন পাঠায়, তাই আলেমের মূল বিশেষজ্ঞতাই বেছে নিন",
    en: "Routing sends this department's questions first, so pick his core expertise",
  },
  "admin.scholars.form.selectPlaceholder": { bn: "— নির্বাচন করুন —", en: "— Select —" },
  "admin.scholars.form.pickDepartmentFirst": {
    bn: "আগে উপরের তালিকা থেকে বিভাগ নির্বাচন করুন।",
    en: "Select a department from the list above first.",
  },
  "admin.scholars.form.selectedLabel": { bn: "নির্বাচিত:", en: "Selected:" },
  "admin.scholars.form.primarySuffix": { bn: " · প্রধান", en: " · Primary" },
  "admin.scholars.form.credentialsHelp": {
    bn: "দাওরা-এ-হাদীস, ইফতা কোর্স বা সমমানের যোগ্যতা যাচাইয়ের জন্য জরুরি",
    en: "A Dawra-e-Hadith, an Ifta course or an equivalent is needed to verify",
  },
  "admin.scholars.form.credentialPlaceholder": { bn: "যোগ্যতা", en: "Qualification" },
  "admin.scholars.form.credentialFirstPlaceholder": {
    bn: "দাওরা-এ-হাদীস",
    en: "Dawra-e-Hadith",
  },
  "admin.scholars.form.institutionPlaceholder": { bn: "প্রতিষ্ঠান", en: "Institution" },
  "admin.scholars.form.yearPlaceholder": { bn: "সন", en: "Year" },
  "admin.scholars.form.credentialAria": { bn: "যোগ্যতা {count}", en: "Qualification {count}" },
  "admin.scholars.form.institutionAria": { bn: "প্রতিষ্ঠান {count}", en: "Institution {count}" },
  "admin.scholars.form.yearAria": { bn: "সন {count}", en: "Year {count}" },
  "admin.scholars.form.removeCredential": {
    bn: "যোগ্যতা মুছুন",
    en: "Remove qualification",
  },
  "admin.scholars.form.addCredential": {
    bn: "আরেকটি যোগ্যতা যোগ করুন",
    en: "Add another qualification",
  },
  "admin.scholars.form.accountPermissions": {
    bn: "অ্যাকাউন্ট ও অনুমতি",
    en: "Account & permissions",
  },
  "admin.scholars.form.accountPermissionsHelp": {
    bn: "যাচাই ও প্রাপ্যতা নিয়ন্ত্রণ করে কে প্রশ্ন পাবেন তা নির্ধারিত হয়",
    en: "Verification and availability decide who receives questions",
  },
  "admin.scholars.form.verifyPublishHelp": {
    bn: "যাচাইকৃত আলেম রাউটিংয়ে অগ্রাধিকার পান ও প্রোফাইলে যাচাই চিহ্ন পায়।",
    en: "A verified scholar gets routing priority and a verified mark on the profile.",
  },
  "admin.scholars.form.availableHelp": {
    bn: "বন্ধ রাখলে নতুন প্রশ্ন রাউট হবে না, তবে পুরনো উত্তর অপরিবর্তিত থাকবে।",
    en: "Turned off, no new questions are routed, while existing answers stay as they are.",
  },
  "admin.scholars.form.invite": {
    bn: "আমন্ত্রণ ইমেইল পাঠান",
    en: "Send an invitation email",
  },
  "admin.scholars.form.inviteHelp": {
    bn: "লগইন করার আমন্ত্রণ ও পাসওয়ার্ড নির্ধারণের লিংক পাঠানো হবে।",
    en: "An invitation to sign in, with a link to set a password, is sent.",
  },
  "admin.scholars.form.langBn": { bn: "বাংলা", en: "Bangla" },
  "admin.scholars.form.langAr": { bn: "আরবি", en: "Arabic" },
  "admin.scholars.form.langEn": { bn: "ইংরেজি", en: "English" },
  "admin.scholars.form.langUr": { bn: "উর্দু", en: "Urdu" },
  "admin.scholars.form.langFa": { bn: "ফারসি", en: "Persian" },
  "admin.scholars.form.fiqhFocus": { bn: "ফিকহি দৃষ্টিভঙ্গি", en: "Fiqh focus" },
  "admin.scholars.form.fiqhHanafi": {
    bn: "হানাফী (বাংলাদেশে প্রচলিত)",
    en: "Hanafi (the practice in Bangladesh)",
  },
  "admin.scholars.form.fiqhGeneral": { bn: "সাধারণ", en: "General" },
  "admin.scholars.form.fiqhUsul": { bn: "উসূলুল ফিকহ", en: "Usul al-Fiqh" },
  "admin.scholars.form.fiqhComparative": { bn: "তুলনামূলক ফিকহ", en: "Comparative fiqh" },
  "admin.scholars.form.summary": { bn: "সারসংক্ষেপ", en: "Summary" },
  "admin.scholars.form.summaryHelp": {
    bn: "সাবমিটের আগে নিশ্চিত হয়ে নিন — অনুমোদনের সাথে সাথেই প্রশ্ন রাউট শুরু হবে",
    en: "Check this before submitting — routing starts the moment you approve",
  },
  "admin.scholars.form.scholarLabel": { bn: "আলেম", en: "Scholar" },
  "admin.scholars.form.location": { bn: "অবস্থান", en: "Location" },
  "admin.scholars.form.noName": { bn: "— নাম দেওয়া হয়নি —", en: "— no name yet —" },
  "admin.scholars.form.noSelection": {
    bn: "— নির্বাচন করা হয়নি —",
    en: "— none selected —",
  },
  "admin.scholars.form.credentialsAttached": { bn: "{count}টি যুক্ত", en: "{count} added" },
  "admin.scholars.form.unverifiedBadge": { bn: "যাচাই ছাড়া", en: "Unverified" },
  "admin.scholars.form.availableBadge": { bn: "উপলব্ধ", en: "Available" },
  "admin.scholars.form.completeRequired": { bn: "সম্পূর্ণ করতে হবে", en: "Must be completed" },
  "admin.scholars.form.profileReady": { bn: "প্রোফাইল প্রস্তুত", en: "Profile ready" },
  "admin.scholars.form.profileReadyBody": {
    bn: "{name} এর প্রোফাইল তৈরি হয়েছে। সংরক্ষণ করে ডেটাবেসে লেখা হবে — বর্তমানে এটি ফ্রন্টএন্ড প্রিভিউ।",
    en: "{name}'s profile has been created. Saving will write it to the database — for now this is a front-end preview.",
  },
  "admin.scholars.form.routingEmpty": {
    bn: "বিভাগ নির্বাচন করুন — তখনই দেখানো হবে এই নতুন আলেম কতটা প্রশ্নভার নেবেন এবং কোন আলেমদের সাথে রাউটিং ভাগ করবেন।",
    en: "Select departments and this will show how much question load the new scholar takes on, and which scholars he shares routing with.",
  },
  "admin.scholars.form.inheritedVolume": {
    bn: "সম্ভাব্য প্রশ্নভার",
    en: "Inherited question load",
  },
  "admin.scholars.form.unansweredNow": { bn: "উত্তরহীন এখন", en: "Unanswered now" },
  "admin.scholars.form.currentCoverage": {
    bn: "যাঁরা এখন এই বিভাগগুলো সামলাচ্ছেন",
    en: "Who covers these departments today",
  },
  "admin.scholars.form.scholarStats": {
    bn: "{answers}টি উত্তর · সাধারণত {hours} ঘণ্টায় সাড়া",
    en: "{answers} answers · usually replies in {hours} hours",
  },
  "admin.scholars.form.volumeNote": {
    bn: "নতুন আলেম যোগ হলে এই বিভাগের প্রশ্নভার ভাগ হয়ে যাবে, ফলে উত্তর পাওয়ার সময় কমবে।",
    en: "Adding a scholar splits this department's question load, so answers come sooner.",
  },
  "admin.scholars.form.reminders": { bn: "স্মরণ রাখুন", en: "Keep in mind" },
  "admin.scholars.form.reminder1": {
    bn: "একজন আলেম একাধিক বিভাগে থাকতে পারেন, তবে প্রধান বিভাগটি তাঁর মূল বিশেষজ্ঞতা হওয়া উচিত।",
    en: "A scholar may hold several departments, but the primary one should be his core expertise.",
  },
  "admin.scholars.form.reminder2": {
    bn: "ফতোয়া দেওয়ার অনুমতি যোগ্যতার সাথে সম্পর্কিত — সব আলেমকে ফতোয়ায় রাখবেন না।",
    en: "Permission to issue fatwa follows credentials — do not put every scholar on fatwa duty.",
  },
  "admin.scholars.form.reminder3": {
    bn: "যোগ্যতা যাচাই না করে অনুমোদন দিলে প্ল্যাটফর্মের বিশ্বাসযোগ্যতা ক্ষতিগ্রস্ত হয়।",
    en: "Approving without verifying credentials damages the platform's credibility.",
  },
  "admin.scholars.form.datasetNote": {
    bn: "বর্তমানে ডেটাসেটে {count}জন আলেম আছেন।",
    en: "The dataset currently holds {count} scholars.",
  },
};

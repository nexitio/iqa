/**
 * Admin console copy — social sign-in providers (Google, Facebook and the
 * console's own form).
 *
 * Keys are namespaced `admin.social.*`. One area's copy lives in one file so
 * that several areas can be translated at once without two writers on the same
 * file. Every entry is `{ bn, en }`: `bn` is the wording the screen already
 * shows, `en` is its English twin. `{name}` placeholders are filled in by
 * `translate()`, and a **number** passed as a var is printed in the reader's own
 * digits (৩ or 3), so counts belong in a var rather than typed into the string.
 */
import type { Dict } from "./types";

export const ADMIN_SOCIAL: Dict = {
  /* -------- page shell -------- */
  "admin.social.eyebrow": { bn: "অ্যাডমিন", en: "Admin" },
  "admin.social.title": { bn: "সোশ্যাল সাইন-ইন", en: "Social sign-in" },
  "admin.social.description": {
    bn: "প্রোভাইডার এখানে ডেটাবেসে বসে, ডিপ্লয়মেন্টে নয় — শুধু ক্লায়েন্ট আইডি ও সিক্রেট বসিয়ে চালু করলেই সাইন-ইন পাতায় বোতামটি দেখা যায়। বাকি সব (endpoints, scopes, claim ম্যাপিং) সারিতে সিড করা থাকে।",
    en: "A provider lives in the database here, not in a deployment — filling in the client ID and secret and switching it on is what puts its button on the sign-in page. Everything else (endpoints, scopes, claim mapping) is seeded on the row.",
  },
  "admin.social.adminOnly": { bn: "শুধুমাত্র অ্যাডমিন", en: "Admins only" },
  "admin.social.seededTitle": {
    bn: "ফেসবুক ও গুগল আগে থেকেই আছে",
    en: "Facebook and Google are already here",
  },
  "admin.social.seededBody": {
    bn: "দুইটি সারি সিড করা আছে, বন্ধ অবস্থায় এবং প্লেসহোল্ডার ক্রেডেনশিয়াল নিয়ে। প্রোভাইডারের ড্যাশবোর্ড থেকে ক্লায়েন্ট আইডি ও সিক্রেট বসান, “যাচাই” চেপে redirect URIটি হুবহু রেজিস্টার করুন, তারপর চালু করুন — এখানে এর বাইরে আর কিছু লিখতে হয় না।",
    en: "Both rows are seeded, switched off and holding placeholder credentials. Paste the client ID and secret from the provider's dashboard, press “Verify” and register that redirect URI exactly, then switch it on — there is nothing else to fill in here.",
  },

  /* -------- notices -------- */
  "admin.social.loadFailed": {
    bn: "প্রোভাইডার তালিকা আনা যায়নি",
    en: "Could not load the provider list",
  },
  "admin.social.saveFailed": { bn: "সংরক্ষণ করা যায়নি", en: "Could not save" },
  "admin.social.toggleFailed": { bn: "অবস্থা বদলানো যায়নি", en: "Could not change the state" },
  "admin.social.inspectFailed": { bn: "যাচাই করা যায়নি", en: "Could not verify" },
  "admin.social.deleteFailed": { bn: "মুছে ফেলা যায়নি", en: "Could not delete" },
  "admin.social.done": { bn: "সম্পন্ন", en: "Done" },
  "admin.social.saved": { bn: "{name} সংরক্ষিত হয়েছে।", en: "{name} saved." },
  "admin.social.deleted": { bn: "{name} মুছে ফেলা হয়েছে।", en: "{name} deleted." },
  "admin.social.enabledNotice": {
    bn: "{name} চালু করা হয়েছে — এখন সাইন-ইন পাতায় এর বোতাম দেখাবে।",
    en: "{name} is on — its button now shows on the sign-in page.",
  },
  "admin.social.disabledNotice": {
    bn: "{name} বন্ধ করা হয়েছে — সাইন-ইন পাতায় আর দেখাবে না।",
    en: "{name} is off — it no longer shows on the sign-in page.",
  },

  /* -------- the list -------- */
  "admin.social.providersTitle": { bn: "প্রোভাইডারসমূহ", en: "Providers" },
  "admin.social.providersSubtitle": {
    bn: "সাইন-ইন পাতায় ঠিক যেসব বোতাম এই তালিকায় চালু আছে সেগুলোই দেখা যায় — বাকিগুলো অদৃশ্য থাকে।",
    en: "The sign-in page shows exactly the buttons switched on in this list — the rest stay invisible.",
  },
  "admin.social.refresh": { bn: "রিফ্রেশ", en: "Refresh" },
  "admin.social.noneTitle": { bn: "কোনো প্রোভাইডার নেই", en: "No providers" },
  "admin.social.noneBody": {
    bn: "সিড করা গুগল ও ফেসবুক সারি পাওয়া যায়নি। সারিগুলো ফিরিয়ে আনতে server/scripts/seed.ts চালান — এখানে যোগ করা যায় না, কারণ নতুন প্রোভাইডারের endpoints ও claim ম্যাপিং কোডের অংশ।",
    en: "The seeded Google and Facebook rows are missing. Run server/scripts/seed.ts to bring them back — they cannot be added here, because a new provider's endpoints and claim mapping are part of the code.",
  },
  "admin.social.updatedAt": { bn: "সর্বশেষ পরিবর্তন {at}", en: "Last changed {at}" },
  "admin.social.secretStored": { bn: "সিক্রেট সংরক্ষিত আছে", en: "a secret is stored" },
  "admin.social.secretMissing": {
    bn: "কোনো সিক্রেট সংরক্ষিত নেই",
    en: "no secret stored",
  },
  "admin.social.placeholder": { bn: "প্লেসহোল্ডার", en: "Placeholder" },
  "admin.social.on": { bn: "চালু", en: "On" },
  "admin.social.off": { bn: "বন্ধ", en: "Off" },
  "admin.social.hide": { bn: "গোপন করুন", en: "Hide" },
  "admin.social.configure": { bn: "কনফিগার", en: "Configure" },
  "admin.social.placeholderTitle": {
    bn: "আসল ক্রেডেনশিয়াল বসানো হয়নি",
    en: "Real credentials are not in place",
  },
  "admin.social.placeholderBody": {
    bn: "এই সারিতে এখনও প্রোভাইডারের ড্যাশবোর্ড থেকে পাওয়া ক্লায়েন্ট আইডি ও সিক্রেট বসানো হয়নি। বসিয়ে চালু করার আগে বোতামটি ক্লিক করলে প্রোভাইডার নিজেই ত্রুটি দেখাবে।",
    en: "This row still holds no client ID or secret from the provider's dashboard. Clicking its button before you fill them in and switch it on makes the provider itself show an error.",
  },
  "admin.social.fixNow": { bn: "এখনই ঠিক করতে হবে", en: "Fix this first" },

  /* -------- verify panel -------- */
  "admin.social.dashboardTitle": {
    bn: "প্রোভাইডারের ড্যাশবোর্ডে বসানোর তথ্য",
    en: "What to put in the provider's dashboard",
  },
  "admin.social.redirectLabel": {
    bn: "Redirect URI — হুবহু একই অক্ষরে",
    en: "Redirect URI — exactly these characters",
  },
  "admin.social.copyRedirect": {
    bn: "Redirect URI কপি করুন",
    en: "Copy the redirect URI",
  },
  "admin.social.secretVerified": {
    bn: "সিক্রেটটি পাঠানো ও ডিক্রিপ্ট করা গেছে — অর্থাৎ এই ডিপ্লয়মেন্টের",
    en: "The secret was sent and decrypted — so this deployment's",
  },
  "admin.social.secretVerifiedTail": {
    bn: "অপরিবর্তিত আছে এবং কনফিগারেশনটি পাঠানোর মতো অবস্থায় আছে। scopes:",
    en: "is unchanged and the configuration can be sent. scopes:",
  },
  "admin.social.openAuth": {
    bn: "প্রোভাইডারের অনুমোদন স্ক্রিন খুলে দেখুন",
    en: "Open the provider's authorisation screen",
  },

  /* -------- actions -------- */
  "admin.social.save": { bn: "সংরক্ষণ করুন", en: "Save" },
  "admin.social.verify": { bn: "যাচাই", en: "Verify" },
  "admin.social.enableSignIn": { bn: "সাইন-ইন চালু", en: "Sign-in on" },
  "admin.social.remove": { bn: "মুছুন", en: "Remove" },
  "admin.social.confirmTitle": { bn: "মুছে ফেললে কী হবে", en: "What deleting does" },
  "admin.social.confirmBody": {
    bn: "রেকর্ডটি যায়, এবং এই প্রোভাইডার দিয়ে তৈরি অ্যাকাউন্ট-সংযোগগুলোও (linked identities) মুছে যায়। যেসব ব্যবহারকারীর পাসওয়ার্ড নেই, তারা অন্য কোনো উপায় ছাড়া অ্যাকাউন্টে ঢুকতে পারবেন না — তাই আগে চালু বন্ধ করে দেখা যায় কি না, তা বিবেচনা করুন।",
    en: "The record goes, and so do the linked identities created through this provider. Anyone without a password can no longer reach their account any other way — so consider switching it off first to see how that looks.",
  },

  /* -------- the form -------- */
  "admin.social.clientIdHint": {
    bn: "প্রোভাইডারের ড্যাশবোর্ড থেকে পাওয়া অ্যাপ আইডি",
    en: "The app ID from the provider's dashboard",
  },
  "admin.social.clientSecretHint": {
    bn: "শুধু সংরক্ষিত হয় — পরে আর পড়া যায় না। খালি রাখলে আগেরটি অপরিবর্তিত থাকবে।",
    en: "It is only stored — never readable again. Leave it blank to keep the one already stored.",
  },
  "admin.social.clientIdRequired": {
    bn: "Client ID ছাড়া এই প্রোভাইডার দিয়ে সাইন-ইন শুরু করা যায় না।",
    en: "Sign-in cannot start with this provider without a client ID.",
  },
};

import type { Metadata } from "next";
import { KeyRound } from "@/components/icons";
import { Badge, Callout, PageHeader } from "@/components/ui";
import { ProviderConsole } from "./provider-console";

export const metadata: Metadata = {
  title: "সোশ্যাল সাইন-ইন",
  description:
    "গুগল ও ফেসবুক সাইন-ইনের প্রোভাইডার কনফিগারেশন — ক্লায়েন্ট আইডি, সিক্রেট, endpoints ও claim ম্যাপিং, সবই ডেটাবেস থেকে পরিচালিত।",
};

/**
 * The provider console.
 *
 * The role check is the admin layout's, not this page's: it runs for every route
 * under `/admin`. The API checks again on each call this page makes, so nothing
 * here is a control — it is the form that writes a row, and the row is the
 * feature's configuration.
 */
export default function AdminSocialPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="অ্যাডমিন"
        title="সোশ্যাল সাইন-ইন"
        description="প্রোভাইডার এখানে ডেটাবেসে বসে, ডিপ্লয়মেন্টে নয় — শুধু ক্লায়েন্ট আইডি ও সিক্রেট বসিয়ে চালু করলেই সাইন-ইন পাতায় বোতামটি দেখা যায়। বাকি সব (endpoints, scopes, claim ম্যাপিং) সারিতে সিড করা থাকে।"
        icon={KeyRound}
        tone="admin"
        patterned
        actions={
          <Badge tone="admin" size="md" dot>
            শুধুমাত্র অ্যাডমিন
          </Badge>
        }
      >
        <Callout tone="info" title="ফেসবুক ও গুগল আগে থেকেই আছে">
          দুইটি সারি সিড করা আছে, বন্ধ অবস্থায় এবং প্লেসহোল্ডার ক্রেডেনশিয়াল নিয়ে। প্রোভাইডারের ড্যাশবোর্ড থেকে
          ক্লায়েন্ট আইডি ও সিক্রেট বসান, “যাচাই” চেপে redirect URIটি হুবহু রেজিস্টার করুন, তারপর চালু করুন —
          এখানে এর বাইরে আর কিছু লিখতে হয় না।
        </Callout>
      </PageHeader>

      <ProviderConsole />
    </div>
  );
}

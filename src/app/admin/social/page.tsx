import type { Metadata } from "next";
import { KeyRound } from "@/components/icons";
import { Badge, Callout, PageHeader } from "@/components/ui";
import { T } from "@/components/i18n-text";
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
        eyebrow={<T k="admin.social.eyebrow" />}
        title={<T k="admin.social.title" />}
        description={<T k="admin.social.description" />}
        icon={KeyRound}
        tone="admin"
        patterned
        actions={
          <Badge tone="admin" size="md" dot>
            <T k="admin.social.adminOnly" />
          </Badge>
        }
      >
        <Callout tone="info" title={<T k="admin.social.seededTitle" />}>
          <T k="admin.social.seededBody" />
        </Callout>
      </PageHeader>

      <ProviderConsole />
    </div>
  );
}

import type { Metadata } from "next";
import { BadgeCheck, Info, UserPlus } from "@/components/icons";
import { T } from "@/components/i18n-text";
import { Callout, PageHeader } from "@/components/ui";
import { AddScholarForm } from "./add-scholar-form";

export const metadata: Metadata = { title: "নতুন আলেম যোগ করুন" };

export default function AddScholarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="admin.title" />}
        title={<T k="admin.addScholar" />}
        description={<T k="admin.addScholarIntro" />}
        icon={UserPlus}
        tone="admin"
        patterned
        breadcrumbs={[
          { label: <T k="admin.breadcrumb" />, href: "/admin" },
          { label: <T k="admin.scholars.breadcrumb" />, href: "/admin/scholars" },
          { label: <T k="label.new" /> },
        ]}
      />

      {/* `Callout.title` is typed `string`, so these two headings stay Bangla until
          the shared prop is widened to ReactNode; their bodies are translated. */}
      <Callout tone="info" icon={Info} title={<T k="admin.scholars.verifyFirstTitle" />}>
        <T k="admin.scholars.verifyFirstBody" />
      </Callout>

      <AddScholarForm />

      <Callout
        tone="success"
        icon={BadgeCheck}
        title={<T k="admin.scholars.routingImpactTitle" />}
      >
        <T k="admin.scholars.routingImpactBody" />
      </Callout>
    </div>
  );
}

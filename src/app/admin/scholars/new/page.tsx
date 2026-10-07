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
        breadcrumbs={[{ label: "অ্যাডমিন", href: "/admin" }, { label: "আলেম", href: "/admin/scholars" }, { label: "নতুন" }]}
      />

      <Callout tone="info" icon={Info} title="যোগ্যতা যাচাই সবার আগে">
        আলেমের প্রোফাইল পাবলিক হওয়ার সাথে সাথে তাঁর নামে জ্ঞানের দায় অন্তর্ভুক্ত হয়। তাই দাওরা-এ-হাদীস, ইফতা কোর্স বা
        সমমানের যোগ্যতা যাচাই করা এই ফর্মের সবচেয়ে গুরুত্বপূর্ণ অংশ।
      </Callout>

      <AddScholarForm />

      <Callout tone="success" icon={BadgeCheck} title="প্রশ্ন রাউটিং কীভাবে প্রভাবিত হয়">
        আলেমকে যে বিভাগে রাখা হবে, সেই বিভাগের প্রশ্নেই তিনি অগ্রাধিকার পান। একজন আলেম একাধিক বিভাগে থাকতে পারেন, এবং
        প্রধান বিভাগটি ঠিক করে দেওয়া হয় কারণ রাউটিং প্রথমে সেখানেই প্রশ্ন পাঠায়। বিভাগগুলো সঠিকভাবে নির্ধারণ করলে
        প্রশ্ন দ্রুত সঠিক আলেমের কাছে পৌঁছে।
      </Callout>
    </div>
  );
}

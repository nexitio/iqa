import type { Metadata } from "next";
import { BadgeCheck, Building2, GraduationCap, UserPlus, Users } from "@/components/icons";
import { SCHOLAR_APPLICATIONS } from "@/lib/data/admin";
import { DEPARTMENTS } from "@/lib/data/departments";
import { SCHOLARS } from "@/lib/data/scholars";
import { T } from "@/components/i18n-text";
import {
  Button,
  Callout,
  Card,
  CardHeader,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { toBnDigits } from "@/lib/bn";
import { ApplicationBoard } from "./application-board";
import { ScholarDirectory } from "./scholar-directory";

export const metadata: Metadata = { title: "আলেম ব্যবস্থাপনা" };

export default function AdminScholarsPage() {
  const verified = SCHOLARS.filter((s) => s.verified).length;
  const pending = SCHOLAR_APPLICATIONS.filter((a) => a.status === "pending").length;
  const covered = DEPARTMENTS.filter((d) => d.scholarIds.length > 0).length;
  const totalAnswers = SCHOLARS.reduce((sum, s) => sum + s.stats.answers, 0);
  const unverified = SCHOLARS.length - verified;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="admin.title" />}
        title={<T k="admin.scholarsTable" />}
        description="আলেম যোগ করা, যোগ্যতা যাচাই করা এবং বিভাগ নির্ধারণ করা — এই তিনটিই প্রশ্ন রাউটিংয়ের ভিত্তি। কোনো বিভাগে আলেম না থাকলে সেই বিভাগের প্রশ্ন উত্তরহীন থেকে যায়।"
        icon={Users}
        tone="admin"
        actions={
          <>
            <Button href="/admin/scholars/new" icon={UserPlus}>
              <T k="admin.addScholar" />
            </Button>
            <Button href="/admin/departments" variant="outline" icon={Building2}>
              বিভাগ ব্যবস্থাপনা
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={<T k="admin.totalScholars" />}
          value={toBnDigits(SCHOLARS.length)}
          icon={GraduationCap}
          tone="scholar"
          hint={`${toBnDigits(totalAnswers)}টি উত্তর মোট`}
        />
        <StatTile
          label={<T k="label.verifiedScholar" />}
          value={toBnDigits(verified)}
          icon={BadgeCheck}
          tone="success"
          hint={
            unverified > 0
              ? `${toBnDigits(unverified)}টি প্রোফাইল এখনো যাচাই হয়নি`
              : "সবাই যাচাইকৃত"
          }
        />
        <StatTile
          label={<T k="admin.pendingApplications" />}
          value={toBnDigits(pending)}
          icon={UserPlus}
          tone={pending > 0 ? "warning" : "success"}
          hint="যাচাই বাকি"
        />
        <StatTile
          label="বিভাগ কভারেজ"
          value={`${toBnDigits(covered)}/${toBnDigits(DEPARTMENTS.length)}`}
          icon={Building2}
          tone={covered === DEPARTMENTS.length ? "success" : "warning"}
          hint={covered === DEPARTMENTS.length ? "প্রতিটি বিভাগে আলেম আছে" : "কিছু বিভাগে আলেম নেই"}
        />
      </div>

      {unverified > 0 ? (
        <Callout tone="warning" icon={BadgeCheck} title="যাচাই বাকি প্রোফাইল">
          {toBnDigits(unverified)}জন আলেমের প্রোফাইল এখনো যাচাই করা হয়নি। যাচাইকৃত আলেমরা প্রশ্ন রাউটিংয়ে অগ্রাধিকার পান,
          তাই যোগ্যতা দেখে যাচাই সম্পন্ন করুন।
        </Callout>
      ) : null}

      <ApplicationBoard applications={SCHOLAR_APPLICATIONS} />

      <ScholarDirectory scholars={SCHOLARS} />

      <Card>
        <CardHeader
          icon={Building2}
          tone="info"
          title="বিভাগ অনুসারে আলেম বণ্টন"
          subtitle="প্রতিটি বিভাগে কতজন আলেম দায়িত্বে আছেন, এবং কতটি প্রশ্ন এসেছে"
        />
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {DEPARTMENTS.map((department) => {
            const names = department.scholarIds
              .map((id) => SCHOLARS.find((s) => s.id === id)?.name.bn)
              .filter((n): n is string => Boolean(n));
            return (
              <li
                key={department.slug}
                className="rounded-card border border-border bg-surface-2 p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[0.8125rem] font-semibold leading-snug text-foreground">
                    {department.name.bn}
                  </p>
                  <span className="shrink-0 rounded-md bg-surface px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular text-muted-foreground">
                    {toBnDigits(department.scholarIds.length)} জন
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[0.6875rem] leading-relaxed text-subtle-foreground">
                  {names.length > 0 ? names.join("، ") : "এখনো কোনো আলেম দায়িত্বে নেই"}
                </p>
                <p className="mt-2 text-[0.6875rem] tabular text-muted-foreground">
                  {toBnDigits(department.stats.questions)}টি প্রশ্ন · {toBnDigits(department.stats.answered)}টি উত্তর
                </p>
              </li>
            );
          })}
        </ul>
      </Card>

      <SectionHeader
        size="sm"
        icon={Users}
        title="প্রোফাইল যাচাইয়ের নীতি"
        description="যাচাই ছাড়া আলেম প্রশ্ন পাবেন না"
      />
      <Card>
        <ul className="space-y-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            দাওরা-এ-হাদীস, ইফতা কোর্স বা সমমানের যোগ্যতা ছাড়া প্রোফাইল অনুমোদন করা হয় না।
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            প্রতিটি আলেমকে তাঁর প্রকৃত বিশেষজ্ঞতার বিভাগে রাখুন — অতিরিক্ত বিভাগ দিলে ভুল প্রশ্ন চলে যায়।
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            একাধিক বিভাগে থাকা আলেমের জন্য প্রধান বিভাগ নির্ধারণ করা বাধ্যতামূলক, কারণ রাউটিং প্রথমে সেখানেই যায়।
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            যাচাই প্রত্যাহার করলে প্রোফাইল পাবলিক থাকে কিন্তু প্রশ্ন পাওয়া বন্ধ হয় — এবং সেটি অডিট লগে লেখা থাকে।
          </li>
        </ul>
      </Card>
    </div>
  );
}

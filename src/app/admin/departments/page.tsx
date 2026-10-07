import type { Metadata } from "next";
import { AlertTriangle, Building2, Layers, MessageCircleQuestion, Users } from "@/components/icons";
import { DEPARTMENTS } from "@/lib/data/departments";
// Direct module import: the layout barrel re-exports client components, so a
// server page should reach for the plain-data module instead.
import { SIDEBAR_GROUPS } from "@/components/layout/nav-config";
import { T } from "@/components/i18n-text";
import {
  Callout,
  Card,
  CardHeader,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { toBnDigits } from "@/lib/bn";
import { DepartmentManager } from "./department-manager";

export const metadata: Metadata = { title: "বিভাগ ব্যবস্থাপনা" };

export default function AdminDepartmentsPage() {
  const assignedScholars = new Set(DEPARTMENTS.flatMap((d) => d.scholarIds)).size;
  const totalQuestions = DEPARTMENTS.reduce((sum, d) => sum + d.stats.questions, 0);
  const totalAnswered = DEPARTMENTS.reduce((sum, d) => sum + d.stats.answered, 0);
  const unanswered = Math.max(0, totalQuestions - totalAnswered);
  const emptyDepartments = DEPARTMENTS.filter((d) => d.scholarIds.length === 0).length;
  const answerRate = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  /* Routing is only as good as the department taxonomy underneath it. */
  const topByDemand = [...DEPARTMENTS]
    .sort((a, b) => b.stats.questions - a.stats.questions)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="admin.title" />}
        title={<T k="admin.departmentManagement" />}
        description="বিভাগ হলো প্ল্যাটফর্মের বিষয়-কাঠামো। প্রতিটি প্রশ্ন একটি বিভাগে পড়ে, আর সেই বিভাগের আলেমরাই সেটি সবার আগে পান — তাই বিভাগে আলেম না থাকলে প্রশ্ন অনাদায়ী থেকে যায়।"
        icon={Building2}
        tone="admin"
        patterned
        breadcrumbs={[{ label: "অ্যাডমিন", href: "/admin" }, { label: "বিভাগসমূহ" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="মোট বিভাগ"
          value={toBnDigits(DEPARTMENTS.length)}
          icon={Layers}
          tone="primary"
          hint={`${toBnDigits(DEPARTMENTS.filter((d) => d.trending).length)}টি আলোচিত`}
        />
        <StatTile
          label="দায়িত্বে থাকা আলেম"
          value={toBnDigits(assignedScholars)}
          icon={Users}
          tone="scholar"
          hint="একজন আলেম একাধিক বিভাগে থাকতে পারেন"
        />
        <StatTile
          label="মোট প্রশ্ন"
          value={toBnDigits(totalQuestions)}
          icon={MessageCircleQuestion}
          tone="info"
          hint={`উত্তর হার ${toBnDigits(answerRate)}%`}
        />
        <StatTile
          label="উত্তরহীন"
          value={toBnDigits(unanswered)}
          icon={AlertTriangle}
          tone={unanswered > 0 ? "warning" : "success"}
          hint={`${toBnDigits(emptyDepartments)}টি বিভাগে আলেম নেই`}
        />
      </div>

      {emptyDepartments > 0 ? (
        <Callout tone="warning" icon={AlertTriangle} title="আলেমবিহীন বিভাগ">
          {toBnDigits(emptyDepartments)}টি বিভাগে কোনো আলেম দায়িত্বে নেই। এসব বিভাগে প্রশ্ন এলে রাউটিং কোনো প্রার্থী খুঁজে
          পায় না, ফলে উত্তর দেরি হয় বা প্রশ্ন অনাদায়ী থেকে যায়।
        </Callout>
      ) : null}

      <DepartmentManager departments={DEPARTMENTS} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader
            size="sm"
            icon={MessageCircleQuestion}
            title="চাহিদা অনুসারে শীর্ষ বিভাগ"
            description="যেখানে প্রশ্ন বেশি, সেখানে আলেম বেশি দরকার"
          />
          <ul className="space-y-2.5">
            {topByDemand.map((department, index) => (
              <li key={department.slug} className="flex items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-3 text-[0.75rem] font-semibold tabular text-muted-foreground">
                  {toBnDigits(index + 1)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium text-foreground">
                  {department.name.bn}
                </span>
                <span className="shrink-0 text-[0.75rem] tabular text-muted-foreground">
                  {toBnDigits(department.stats.questions)}
                </span>
                <span className="w-16 shrink-0 text-right text-[0.6875rem] tabular text-subtle-foreground">
                  {toBnDigits(department.scholarIds.length)} জন আলেম
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            icon={Layers}
            tone="info"
            title="রাউটিং কীভাবে বিভাগ ব্যবহার করে"
            subtitle="একটি প্রশ্ন আলেমের কাছে পৌঁছানোর ধাপ"
          />
          <ol className="mt-4 space-y-3">
            {[
              "ব্যবহারকারী প্রশ্ন করার সময় এক বা একাধিক বিভাগ বেছে নেন।",
              "সিস্টেম সেই বিভাগগুলোর আলেমদের খুঁজে বের করে।",
              "অভিজ্ঞতা, সাড়া দেওয়ার গতি এবং বর্তমান প্রশ্নভার বিবেচনা করে অগ্রাধিকার তালিকা তৈরি হয়।",
              "প্রধান বিভাগের আলেমরা সবার আগে প্রশ্নটি পান; অন্যরা পরে দেখতে পারেন।",
              "কোনো বিভাগে আলেম না থাকলে প্রশ্নটি অনাদায়ী থেকে যায় — এটাই সবচেয়ে বড় ঝুঁকি।",
            ].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[0.6875rem] font-semibold text-primary">
                  {toBnDigits(index + 1)}
                </span>
                <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <SectionHeader
        size="sm"
        icon={Building2}
        title="আলেম প্যানেল ও ব্যবহারকারী সাইট"
        description="একই বিভাগ কাঠামো দুই জায়গাতেই ব্যবহৃত হয়"
      />
      <Card>
        <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
          এই বিভাগগুলোই ব্যবহারকারীর সাইটে বিষয় অনুযায়ী পড়ার পথ তৈরি করে — কুরআন, হাদীস, প্রবন্ধ, ফতোয়া ও আলোচনা সবই
          বিভাগভিত্তিক খুঁজে পাওয়া যায়। তাই এখানে নাম বা বিবরণ বদলালে ব্যবহারকারীর দেখাও বদলে যাবে।
        </p>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {SIDEBAR_GROUPS.flatMap((group) => group.links)
            .slice(0, 6)
            .map((link) => (
              <span
                key={`${link.href}-${link.label.en}`}
                className="rounded-full bg-surface-3 px-2.5 py-1 text-[0.6875rem] text-muted-foreground"
              >
                {link.label.bn}
              </span>
            ))}
        </div>
      </Card>
    </div>
  );
}

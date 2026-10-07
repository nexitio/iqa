import type { Metadata } from "next";
import { Flag, ShieldAlert } from "@/components/icons";
import { REPORTS } from "@/lib/data/admin";
import { T } from "@/components/i18n-text";
import { Callout, Card, CardHeader, PageHeader, SectionHeader } from "@/components/ui";
import { toBnDigits } from "@/lib/bn";
import { ReportBoard } from "./report-board";

export const metadata: Metadata = { title: "মডারেশন রিপোর্ট" };

const POLICY = [
  {
    title: "ভুল তথ্য",
    body: "দলিলবিহীন বা ভুল সূত্রে দেওয়া ফতোয়া ও উত্তর। সংশ্লিষ্ট আলেমের সাথে যাচাই করে কনটেন্ট লুকানো হয়।",
  },
  {
    title: "দলাদলি",
    body: "কোনো দল, মসজিদ বা ব্যক্তিকে লক্ষ্যবস্তু করে লেখা। প্ল্যাটফর্মে ফিকহি মতভেদ থাকবে, দলাদলি নয়।",
  },
  {
    title: "অপমান ও হয়রানি",
    body: "ব্যক্তিগত আক্রমণ, গালি বা কাউকে ছোট করা। সরাসরি অ্যাকাউন্ট স্থগিত করা হয়।",
  },
  {
    title: "উপযুক্ত আদব",
    body: "মতভেদে দলিল পেশ করুন, ব্যক্তিকে আক্রমণ করবেন না। আলেমদের মতের ভিন্নতায় ব্যবহারকারী যেন বিভ্রান্ত না হন।",
  },
];

export default function AdminReportsPage() {
  const pending = REPORTS.filter((r) => r.status === "pending").length;
  const high = REPORTS.filter((r) => r.severity === "high").length;
  const unassigned = REPORTS.filter((r) => r.status === "pending" && !r.assignedToBn).length;
  const byReason = REPORTS.reduce<Record<string, number>>((acc, report) => {
    acc[report.reason] = (acc[report.reason] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="admin.title" />}
        title={<T k="admin.reportsQueue" />}
        description="প্ল্যাটফর্মের আলোচনা যেন জ্ঞানভিত্তিক ও আদবসম্মত থাকে, তা রক্ষা করাই মডারেশনের কাজ। ভুল তথ্য, দলাদলি ও অপমান — এই তিনটি বিষয়ে দ্রুত সিদ্ধান্ত নেওয়া প্রয়োজন।"
        icon={Flag}
        tone="admin"
        patterned
        breadcrumbs={[{ label: "অ্যাডমিন", href: "/admin" }, { label: "রিপোর্ট" }]}
      />

      {unassigned > 0 ? (
        <Callout tone="warning" icon={ShieldAlert} title="দায়িত্বহীন রিপোর্ট">
          {toBnDigits(unassigned)}টি অপেক্ষমাণ রিপোর্টে এখনো কোনো মডারেটর দায়িত্ব পাননি। উচ্চ গুরুত্বের রিপোর্টে আগে দায়িত্ব
          দিন।
        </Callout>
      ) : null}

      <ReportBoard reports={REPORTS} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            icon={Flag}
            tone="info"
            title="রিপোর্টের কারণ অনুসারে বণ্টন"
            subtitle="কোন ধরনের সমস্যা বেশি ঘটছে"
          />
          <ul className="mt-4 space-y-2.5">
            {Object.entries(byReason).map(([reason, count]) => (
              <li key={reason} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-foreground">
                  {
                    {
                      misinformation: "ভুল তথ্য",
                      sectarian: "দলাদলি",
                      abuse: "অপমান",
                      spam: "স্প্যাম",
                      "off-topic": "বিষয়ের বাইরে",
                      copyright: "কপিরাইট",
                    }[reason] ?? reason
                  }
                </span>
                <span className="shrink-0 text-[0.75rem] font-semibold tabular text-muted-foreground">
                  {toBnDigits(count)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-3 text-[0.6875rem] text-subtle-foreground">
            মোট {toBnDigits(REPORTS.length)}টি রিপোর্ট · {toBnDigits(pending)}টি অপেক্ষমাণ ·{" "}
            {toBnDigits(high)}টি উচ্চ গুরুত্ব
          </p>
        </Card>

        <Card>
          <CardHeader
            icon={ShieldAlert}
            tone="warning"
            title="মডারেশন নীতিমালা"
            subtitle="মডারেটরের ক্ষমতা ও সীমা"
          />
          <ul className="mt-4 space-y-3">
            {POLICY.map((item) => (
              <li key={item.title}>
                <p className="text-[0.8125rem] font-semibold text-foreground">{item.title}</p>
                <p className="mt-0.5 text-[0.75rem] leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <SectionHeader
        size="sm"
        icon={ShieldAlert}
        title="মডারেটরের হাতে থাকা ব্যবস্থা"
        description="প্রতিটি সিদ্ধান্ত অডিট লগে সংরক্ষিত হয়"
      />
      <Card>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "কনটেন্ট লুকানো", body: "কনটেন্ট পাবলিক তালিকা থেকে সরে যায়, তবে লেখকের কাছে থাকে।" },
            { title: "থ্রেড বন্ধ", body: "আলোচনা পড়া যায়, কিন্তু নতুন উত্তর যোগ করা যায় না।" },
            { title: "পরিবর্তনের অনুরোধ", body: "লেখককে দলিল সংশোধনের নির্দেশ দেওয়া হয়।" },
            { title: "অ্যাকাউন্ট স্থগিত", body: "গুরুতর বা পুনরাবৃত্তি অপরাধে অ্যাকাউন্ট স্থগিত করা হয়।" },
          ].map((item) => (
            <div key={item.title} className="rounded-card border border-border bg-surface-2 p-4">
              <p className="text-[0.875rem] font-semibold text-foreground">{item.title}</p>
              <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

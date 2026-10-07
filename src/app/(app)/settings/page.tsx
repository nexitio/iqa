import type { Metadata } from "next";
import { Settings as SettingsIcon } from "@/components/icons";
import { CURRENT_USER } from "@/lib/data/personal";
import { T } from "@/components/i18n-text";
import { Badge, Callout, PageHeader, SectionHeader } from "@/components/ui";
import { SettingsPanels } from "./settings-panels";

export const metadata: Metadata = {
  title: "সেটিংস",
  description:
    "ভাষা, থিম, জেলা অনুযায়ী নামাজের সময়, কুরআনের ফন্ট সাইজ, বিজ্ঞপ্তি, আগ্রহের বিষয় ও গোপনীয়তা — সব নিয়ন্ত্রণ এক জায়গায়।",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={CURRENT_USER.name}
        title={<T k="settings.title" />}
        description="আপনার পড়ার অভিজ্ঞতা নিজের মতো সাজিয়ে নিন — ভাষা, নামাজের সময়সূচির জেলা, কুরআনের ফন্ট সাইজ, বিজ্ঞপ্তি ও আপনার আগ্রহের বিভাগ।"
        icon={SettingsIcon}
        patterned
        actions={
          <Badge tone="success" size="md" dot>
            এই ব্রাউজারে সংরক্ষিত
          </Badge>
        }
      >
        <Callout tone="info" title="সেটিংস কোথায় রাখা হয়">
          এখন এই পছন্দগুলো আপনার ব্রাউজারে সংরক্ষিত হয়, ফলে নতুন কোনো অ্যাকাউন্ট ছাড়াই এগুলো কাজ করে। ব্যাকএন্ড
          যুক্ত হলে একই পছন্দ আপনার অ্যাকাউন্টের সাথে যুক্ত হবে এবং সব ডিভাইসে এক থাকবে।
        </Callout>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <SettingsPanels />
        </div>

        <aside className="min-w-0 space-y-4">
          <div className="rounded-panel border border-border bg-surface p-5 shadow-card">
            <SectionHeader title="সেটিংসের সারসংক্ষেপ" icon={SettingsIcon} size="sm" />
            <ul className="space-y-3 text-[0.8125rem]">
              {[
                { label: "ভাষা", value: "বাংলা / English" },
                { label: "থিম", value: "উজ্জ্বল, অন্ধকার বা সিস্টেম" },
                { label: "নামাজের সময়", value: "আপনার জেলা অনুযায়ী" },
                { label: "মাযহাব", value: "হানাফী ডিফল্ট" },
                { label: "কুরআনের ফন্ট", value: "৪টি আকার" },
                { label: "আগ্রহের বিভাগ", value: "ফিড সাজানোর জন্য" },
              ].map((row) => (
                <li key={row.label} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="shrink-0 text-right font-medium text-foreground">{row.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <Callout tone="accent" title="নামাজের সময় বদলেছে?">
            জেলা পরিবর্তন করলে সাইডবারের সময়সূচি সাথে সাথে হালনাগাদ হবে, কারণ সময়সূচি প্রতিবার আপনার বাছাই করা
            জেলার ভিত্তিতে হিসাব করা হয়।
          </Callout>

          <Callout tone="primary" title="গোপনীয়তার প্রতিশ্রুতি">
            আপনার প্রশ্ন, সংরক্ষিত তালিকা ও পড়ার অভ্যাস কারও সাথে শেয়ার করা হয় না। নাম প্রকাশে অনিচ্ছুক প্রশ্নে আপনার
            পরিচয় মডারেটর ছাড়া কারও কাছে প্রকাশ পায় না।
          </Callout>
        </aside>
      </div>
    </div>
  );
}

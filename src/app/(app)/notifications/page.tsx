import type { Metadata } from "next";
import Link from "next/link";
import { BellRing, Settings as SettingsIcon, Sparkles } from "@/components/icons";
import { NOTIFICATIONS } from "@/lib/data/personal";
import { Num, T } from "@/components/i18n-text";
import { Badge, Callout, Card, PageHeader, SectionHeader, StatTile } from "@/components/ui";
import { NotificationsList } from "./notifications-list";

export const metadata: Metadata = {
  title: "বিজ্ঞপ্তি",
  description: "আপনার প্রশ্নের উত্তর, ফলো করা আলেমদের নতুন লেখা, দৈনিক আয়াত ও শেখার যাত্রার অনুস্মারক।",
};

export default function NotificationsPage() {
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;
  const answers = NOTIFICATIONS.filter((n) => n.kind === "answer").length;
  const daily = NOTIFICATIONS.filter((n) => n.kind === "daily" || n.kind === "journey").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="আপনার জন্য"
        title={<T k="nav.notifications" />}
        description="আপনার প্রশ্নের উত্তর এলে, ফলো করা আলেম নতুন কিছু প্রকাশ করলে কিংবা আজকের আয়াত প্রস্তুত হলে এখানে জানানো হবে।"
        icon={BellRing}
        patterned
        actions={
          <>
            <Badge tone={unread > 0 ? "danger" : "success"} size="md" dot>
              {unread > 0 ? `${unread}টি অপঠিত` : "সব পড়া হয়েছে"}
            </Badge>
            <Link
              href="/settings"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border-strong bg-surface px-4 text-[0.875rem] font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary"
            >
              <SettingsIcon className="size-4" aria-hidden />
              <T k="settings.notifications" />
            </Link>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile
            label="অপঠিত"
            value={<Num value={unread} />}
            hint="এখনো দেখা হয়নি"
            icon={BellRing}
            tone={unread > 0 ? "danger" : "success"}
          />
          <StatTile
            label="উত্তর সংক্রান্ত"
            value={<Num value={answers} />}
            hint="আপনার প্রশ্নের উত্তর থেকে"
            icon={Sparkles}
            tone="success"
          />
          <StatTile
            label="দৈনিক ও যাত্রা"
            value={<Num value={daily} />}
            hint="নিয়মিত অভ্যাসের অনুস্মারক"
            icon={Sparkles}
            tone="accent"
          />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <NotificationsList notifications={NOTIFICATIONS} />
        </div>

        <aside className="min-w-0 space-y-4">
          <Card>
            <SectionHeader
              title="কী নিয়ে জানতে চান?"
              description="বিজ্ঞপ্তির ধরন নিজেই নির্ধারণ করুন"
              icon={SettingsIcon}
              size="sm"
            />
            <ul className="space-y-2.5 text-[0.8125rem]">
              {[
                { label: "দৈনিক আয়াত ও হাদীসের অনুস্মারক", href: "/settings" },
                { label: "আমার প্রশ্নের উত্তর এলে", href: "/settings" },
                { label: "ফলো করা আলেমদের নতুন লেখা", href: "/settings" },
                { label: "সাপ্তাহিক শিক্ষা যাত্রা", href: "/settings" },
              ].map((row) => (
                <li key={row.label}>
                  <Link
                    href={row.href}
                    className="flex items-center justify-between gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-3"
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="shrink-0 text-[0.75rem] font-medium text-primary">বদলান</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Callout tone="primary" title="বিজ্ঞপ্তির উদ্দেশ্য">
            এখানে লক্ষ্য বেশি সময় কাটানো নয় — বরং প্রতিদিন অন্তত একটি নতুন ইলম যেন আপনার হাতছাড়া না হয়। তাই
            অনুস্মারকগুলো অল্প এবং স্পষ্ট রাখা হয়েছে।
          </Callout>

          <Card>
            <SectionHeader title="পুরনো কিছু দেখতে চান?" icon={Sparkles} size="sm" />
            <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
              আপনার কার্যক্রমের পূর্ণ ইতিহাস এবং শেখার ধারাবাহিকতা প্রোফাইল পাতায় দেখা যায়।
            </p>
            <Link
              href="/profile"
              className="mt-3 block border-t border-border pt-3 text-[0.8125rem] font-medium text-primary transition-colors hover:text-primary-hover"
            >
              প্রোফাইলে যান
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}

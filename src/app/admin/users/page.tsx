import type { Metadata } from "next";
import { ShieldCheck, UserRound, Users } from "@/components/icons";
import { ADMIN_OVERVIEW, ADMIN_USERS } from "@/lib/data/admin";
import { USER_PROFILES } from "@/lib/data/personal";
import { T } from "@/components/i18n-text";
import { DistrictBreakdown } from "@/components/console";
import { Callout, Card, CardHeader, PageHeader, StatTile } from "@/components/ui";
import { toBnDigits } from "@/lib/bn";
import { UserControls } from "./user-controls";

export const metadata: Metadata = { title: "ব্যবহারকারী ব্যবস্থাপনা" };

export default function AdminUsersPage() {
  const admins = ADMIN_USERS.filter((u) => u.role === "admin").length;
  const scholars = ADMIN_USERS.filter((u) => u.role === "scholar").length;
  const users = ADMIN_USERS.filter((u) => u.role === "user").length;
  const suspended = ADMIN_USERS.filter((u) => u.status === "suspended").length;
  const pending = ADMIN_USERS.filter((u) => u.status === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="admin.title" />}
        title="ব্যবহারকারী ব্যবস্থাপনা"
        description="ভূমিকা ও অ্যাক্সেস নিয়ন্ত্রণ করুন। সাধারণ ব্যবহারকারীরা নিজেই নিবন্ধন করেন, আর আলেম অ্যাকাউন্ট কেবল অ্যাডমিন তৈরি করেন — কারণ আলেম হওয়া মানে প্রশ্ন পাওয়ার দায়িত্ব নেওয়া।"
        icon={Users}
        tone="admin"
        patterned
        breadcrumbs={[{ label: "অ্যাডমিন", href: "/admin" }, { label: "ব্যবহারকারী" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={<T k="admin.totalUsers" />}
          value={toBnDigits(ADMIN_OVERVIEW.totalUsers)}
          icon={Users}
          tone="user"
          delta={12.4}
          hint={`আজ সক্রিয় ${toBnDigits(ADMIN_OVERVIEW.activeToday)}`}
        />
        <StatTile
          label="আলেম অ্যাকাউন্ট"
          value={toBnDigits(ADMIN_OVERVIEW.totalScholars)}
          icon={ShieldCheck}
          tone="scholar"
          hint={`ডেটাসেটে ${toBnDigits(scholars)}টি নমুনা প্রোফাইল`}
        />
        <StatTile
          label="অ্যাডমিন"
          value={toBnDigits(admins)}
          icon={ShieldCheck}
          tone="admin"
          hint="কেবল প্রতিষ্ঠাতা পর্যায়ের"
        />
        <StatTile
          label="স্থগিত অ্যাকাউন্ট"
          value={toBnDigits(suspended)}
          icon={UserRound}
          tone={suspended > 0 ? "danger" : "success"}
          hint={pending > 0 ? `${toBnDigits(pending)}টি যাচাইয়ের অপেক্ষায়` : "কোনো অপেক্ষমাণ নেই"}
        />
      </div>

      {suspended > 0 ? (
        <Callout tone="warning" icon={UserRound} title="স্থগিত অ্যাকাউন্ট পর্যালোচনা">
          {toBnDigits(suspended)}টি অ্যাকাউন্ট স্থগিত অবস্থায় আছে। স্থগিতাদেশের কারণ নথিভুক্ত করুন এবং প্রয়োজন হলে
          ব্যবহারকারীকে জানান — স্বচ্ছতা সম্প্রদায়ের আস্থা ধরে রাখে।
        </Callout>
      ) : null}

      <UserControls users={ADMIN_USERS} />

      <div className="grid gap-4 lg:grid-cols-2">
        <DistrictBreakdown points={ADMIN_OVERVIEW.districtBreakdown} topCount={6} />

        <Card>
          <CardHeader
            icon={Users}
            tone="info"
            title="সম্প্রদায়ের নমুনা ব্যবহারকারী"
            subtitle="প্রশ্ন করা, সংরক্ষণ করা ও আলোচনায় অংশ নেওয়া ব্যবহারকারীরা"
          />
          <ul className="mt-4 space-y-2.5">
            {USER_PROFILES.slice(0, 8).map((profile) => (
              <li
                key={profile.id}
                className="flex items-center gap-3 rounded-card border border-border bg-surface-2 p-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8125rem] font-medium text-foreground">
                    {profile.name}
                  </span>
                  <span className="block truncate text-[0.6875rem] text-subtle-foreground">
                    {profile.email}
                  </span>
                </span>
                <span className="shrink-0 text-[0.6875rem] text-subtle-foreground">
                  {toBnDigits(profile.interests.length)}টি আগ্রহ
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-border pt-3 text-[0.6875rem] text-subtle-foreground">
            মোট {toBnDigits(USER_PROFILES.length)}টি নমুনা প্রোফাইল · ব্যবহারকারী {toBnDigits(users)} জন
          </p>
        </Card>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { ShieldCheck, UserRound, Users } from "@/components/icons";
import { ADMIN_OVERVIEW, ADMIN_USERS } from "@/lib/data/admin";
import { USER_PROFILES } from "@/lib/data/personal";
import { Digits, T } from "@/components/i18n-text";
import { DistrictBreakdown } from "@/components/console";
import { Callout, Card, CardHeader, PageHeader, StatTile } from "@/components/ui";
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
        title={<T k="admin.users.title" />}
        description={<T k="admin.users.description" />}
        icon={Users}
        tone="admin"
        patterned
        breadcrumbs={[
          { label: <T k="admin.home.breadcrumbRoot" />, href: "/admin" },
          { label: <T k="nav.users" /> },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={<T k="admin.totalUsers" />}
          value={<Digits value={ADMIN_OVERVIEW.totalUsers} />}
          icon={Users}
          tone="user"
          delta={12.4}
          hint={
            <>
              <T k="admin.activeToday" /> <Digits value={ADMIN_OVERVIEW.activeToday} />
            </>
          }
        />
        <StatTile
          label={<T k="admin.users.scholarAccounts" />}
          value={<Digits value={ADMIN_OVERVIEW.totalScholars} />}
          icon={ShieldCheck}
          tone="scholar"
          hint={<T k="admin.users.scholarAccountsHint" vars={{ count: scholars }} />}
        />
        <StatTile
          label={<T k="admin.users.admins" />}
          value={<Digits value={admins} />}
          icon={ShieldCheck}
          tone="admin"
          hint={<T k="admin.users.adminsHint" />}
        />
        <StatTile
          label={<T k="admin.users.suspendedAccounts" />}
          value={<Digits value={suspended} />}
          icon={UserRound}
          tone={suspended > 0 ? "danger" : "success"}
          hint={
            pending > 0 ? (
              <T k="admin.users.awaitingVerification" vars={{ count: pending }} />
            ) : (
              <T k="admin.users.nonePending" />
            )
          }
        />
      </div>

      {suspended > 0 ? (
        <Callout
          tone="warning"
          icon={UserRound}
          title={<T k="admin.users.suspendedCalloutTitle" />}
        >
          <T k="admin.users.suspendedCallout" vars={{ count: suspended }} />
        </Callout>
      ) : null}

      <UserControls users={ADMIN_USERS} />

      <div className="grid gap-4 lg:grid-cols-2">
        <DistrictBreakdown points={ADMIN_OVERVIEW.districtBreakdown} topCount={6} />

        <Card>
          <CardHeader
            icon={Users}
            tone="info"
            title={<T k="admin.users.sampleUsers" />}
            subtitle={<T k="admin.users.sampleUsersHelp" />}
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
                  <T k="admin.users.interests" vars={{ count: profile.interests.length }} />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-border pt-3 text-[0.6875rem] text-subtle-foreground">
            <T k="admin.users.sampleFooter" vars={{ count: USER_PROFILES.length, users }} />
          </p>
        </Card>
      </div>
    </div>
  );
}

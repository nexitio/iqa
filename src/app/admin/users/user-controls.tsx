"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import type { AdminUserRow } from "@/lib/data/admin";
import { findDistrict, formatNumber, toBnDigits } from "@/lib/bn";
import { useI18n } from "@/lib/i18n";
import { relativeTime } from "@/lib/utils";
import { UserTable } from "@/components/console";
import {
  Avatar,
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  Chip,
  ChipList,
  Select,
  StatusBadge,
} from "@/components/ui";

type RoleFilter = "all" | "admin" | "scholar" | "user";

const ROLE_LABEL: Record<AdminUserRow["role"], string> = {
  admin: "অ্যাডমিন",
  scholar: "আলেম",
  user: "ব্যবহারকারী",
};

/**
 * User administration.
 *
 * Role changes and suspensions are held in local state so the administrator
 * sees the consequence of a decision immediately — promoting somebody to
 * scholar really does move them between groups in this view. Applying the
 * change to the database is a backend concern.
 */
export function UserControls({ users }: { users: AdminUserRow[] }) {
  const { locale } = useI18n();
  const [roles, setRoles] = useState<Record<string, AdminUserRow["role"]>>({});
  const [statuses, setStatuses] = useState<Record<string, AdminUserRow["status"]>>({});
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(users[0]?.id ?? "");

  const roleOf = (user: AdminUserRow) => roles[user.id] ?? user.role;
  const statusOf = (user: AdminUserRow) => statuses[user.id] ?? user.status;

  const counts = useMemo(
    () => ({
      all: users.length,
      admin: users.filter((u) => roleOf(u) === "admin").length,
      scholar: users.filter((u) => roleOf(u) === "scholar").length,
      user: users.filter((u) => roleOf(u) === "user").length,
      suspended: users.filter((u) => statusOf(u) === "suspended").length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, roles, statuses],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== "all" && roleOf(user) !== roleFilter) return false;
      if (!q) return true;
      return (
        user.nameBn.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        findDistrict(user.district).name.bn.includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, roleFilter, query, roles, statuses]);

  const selected = users.find((u) => u.id === selectedId) ?? visible[0] ?? users[0];

  const changed = (user: AdminUserRow) =>
    roleOf(user) !== user.role || statusOf(user) !== user.status;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <ChipList label="ভূমিকা অনুসারে ফিল্টার">
          {(
            [
              { id: "all" as const, label: "সবাই", tone: "neutral" as const },
              { id: "admin" as const, label: "অ্যাডমিন", tone: "admin" as const },
              { id: "scholar" as const, label: "আলেম", tone: "scholar" as const },
              { id: "user" as const, label: "ব্যবহারকারী", tone: "user" as const },
            ]
          ).map((option) => (
            <Chip
              key={option.id}
              tone={option.tone}
              active={roleFilter === option.id}
              onClick={() => setRoleFilter(option.id)}
              count={counts[option.id]}
            >
              {option.label}
            </Chip>
          ))}
        </ChipList>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="নাম বা ইমেইল…"
              aria-label="ব্যবহারকারী খুঁজুন"
              className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-[0.875rem] text-foreground placeholder:text-subtle-foreground focus:border-primary focus:outline-none sm:w-56"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          {visible.length === 0 ? (
            <div className="rounded-panel border border-dashed border-border-strong bg-surface-2 p-10 text-center">
              <p className="text-[0.875rem] font-medium text-foreground">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
              <p className="mt-1 text-[0.8125rem] text-muted-foreground">ফিল্টার বা খোঁজের শব্দ বদলে দেখুন।</p>
            </div>
          ) : (
            <UserTable users={visible} selectedId={selectedId} onSelect={setSelectedId} />
          )}

          <p className="mt-2 text-[0.6875rem] text-subtle-foreground">
            টেবিলে {toBnDigits(visible.length)}জন দেখানো হচ্ছে · মোট {toBnDigits(users.length)}জন
          </p>
        </div>

        <aside className="space-y-4">
          {selected ? (
            <Card>
              <CardHeader
                icon={UserCog}
                tone="admin"
                title="ভূমিকা ও অনুমতি"
                subtitle="নির্বাচিত ব্যবহারকারীর অ্যাকাউন্ট"
              />

              <div className="mt-4 flex items-center gap-3">
                <Avatar name={selected.nameBn} color="#a3405f" size="lg" verified={roleOf(selected) === "scholar"} />
                <div className="min-w-0">
                  <p className="truncate font-display text-[0.9375rem] font-semibold text-foreground">
                    {selected.nameBn}
                  </p>
                  <p className="truncate text-[0.75rem] text-muted-foreground">{selected.email}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral" size="xs">
                      {findDistrict(selected.district).name.bn}
                    </Badge>
                    <StatusBadge
                      status={statusOf(selected)}
                      label={
                        statusOf(selected) === "active"
                          ? "সক্রিয়"
                          : statusOf(selected) === "suspended"
                            ? "স্থগিত"
                            : "অপেক্ষমাণ"
                      }
                      size="xs"
                    />
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div>
                  <p className="mb-2 text-[0.75rem] font-semibold text-foreground">ভূমিকা নির্ধারণ</p>
                  <Select
                    value={roleOf(selected)}
                    onChange={(e) =>
                      setRoles((prev) => ({
                        ...prev,
                        [selected.id]: e.target.value as AdminUserRow["role"],
                      }))
                    }
                    aria-label="ভূমিকা"
                  >
                    <option value="user">ব্যবহারকারী</option>
                    <option value="scholar">আলেম</option>
                    <option value="admin">অ্যাডমিন</option>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={statusOf(selected) === "suspended" ? "soft" : "outline"}
                    icon={statusOf(selected) === "suspended" ? CheckCircle2 : Ban}
                    onClick={() =>
                      setStatuses((prev) => ({
                        ...prev,
                        [selected.id]: statusOf(selected) === "suspended" ? "active" : "suspended",
                      }))
                    }
                  >
                    {statusOf(selected) === "suspended" ? "স্থগিতাদেশ প্রত্যাহার" : "অ্যাকাউন্ট স্থগিত করুন"}
                  </Button>
                  {changed(selected) ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setRoles((prev) => {
                          const next = { ...prev };
                          delete next[selected.id];
                          return next;
                        });
                        setStatuses((prev) => {
                          const next = { ...prev };
                          delete next[selected.id];
                          return next;
                        });
                      }}
                    >
                      পরিবর্তন বাতিল
                    </Button>
                  ) : null}
                </div>

                {changed(selected) ? (
                  <Callout tone="warning" icon={AlertTriangle} title="অসংরক্ষিত পরিবর্তন">
                    {roleOf(selected) !== selected.role
                      ? `ভূমিকা বদলে ${ROLE_LABEL[roleOf(selected)]} করা হচ্ছে — `
                      : ""}
                    এই পরিবর্তন সংরক্ষণ করতে ডেটাবেস লাগবে, তাই এটি এখন শুধু প্রিভিউ।
                  </Callout>
                ) : null}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div>
                  <dt className="text-[0.625rem] text-subtle-foreground">অবদান</dt>
                  <dd className="font-display text-base font-bold tabular text-foreground">
                    {formatNumber(selected.contributions, locale)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.625rem] text-subtle-foreground">যুক্ত হয়েছেন</dt>
                  <dd className="text-[0.8125rem] font-medium text-foreground">
                    {relativeTime(selected.joinedAt, locale)}
                  </dd>
                </div>
              </dl>
            </Card>
          ) : null}

          <Card>
            <CardHeader
              icon={ShieldCheck}
              tone="danger"
              title="অনুমতি বাড়ানোর সতর্কতা"
              subtitle="আলেম ভূমিকা দেওয়া মানে প্রকাশের ক্ষমতা দেওয়া"
            />
            <ul className="mt-3 space-y-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" />
                আলেম ভূমিকা পেলে ব্যবহারকারী প্রবন্ধ ও ফতোয়া প্রকাশ করতে পারবেন — তাই যোগ্যতা ছাড়া দেবেন না।
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" />
                অ্যাডমিন ভূমিকা কেবল প্রতিষ্ঠাতা পর্যায়ের অ্যাকাউন্টে সীমাবদ্ধ রাখুন।
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" />
                স্থগিত করা অ্যাকাউন্টের প্রকাশিত কনটেন্ট মুছে যায় না, কেবল অ্যাক্সেস বন্ধ হয়।
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" />
                প্রতিটি ভূমিকা পরিবর্তন অডিট লগে সংরক্ষিত হওয়া উচিত।
              </li>
            </ul>
          </Card>

          <Card>
            <CardHeader icon={Users} tone="user" title="অ্যাকাউন্ট তৈরি" />
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
              সাধারণ ব্যবহারকারীরা নিজেরাই নিবন্ধন করেন। আলেম অ্যাকাউন্ট কেবল অ্যাডমিন তৈরি করেন, কারণ এর সাথে প্রশ্ন
              পাওয়ার দায়িত্ব যুক্ত।
            </p>
            <Button href="/admin/scholars/new" size="sm" variant="outline" className="mt-3">
              নতুন আলেম অ্যাকাউন্ট
            </Button>
          </Card>
        </aside>
      </div>

      <p className="text-[0.6875rem] text-subtle-foreground">
        ভূমিকা বা অবস্থার পরিবর্তন ডান দিকের প্যানেলে সাথে সাথেই প্রতিফলিত হয়, তবে সংরক্ষণ করতে ডেটাবেস লাগবে —
        ততক্ষণ এটি প্রিভিউ।
      </p>
    </div>
  );
}

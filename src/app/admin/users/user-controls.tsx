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
import { findDistrict, formatNumber } from "@/lib/bn";
import { useI18n } from "@/lib/i18n";
import { relativeTime } from "@/lib/utils";
import { Digits } from "@/components/i18n-text";
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

const ROLE_KEY: Record<AdminUserRow["role"], string> = {
  admin: "admin.users.roleAdmin",
  scholar: "admin.users.roleScholar",
  user: "admin.users.roleUser",
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
  const { t, locale } = useI18n();
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
        <ChipList label={t("admin.users.roleFilterLabel")}>
          {(
            [
              { id: "all" as const, label: t("admin.users.filterAll"), tone: "neutral" as const },
              { id: "admin" as const, label: t(ROLE_KEY.admin), tone: "admin" as const },
              { id: "scholar" as const, label: t(ROLE_KEY.scholar), tone: "scholar" as const },
              { id: "user" as const, label: t(ROLE_KEY.user), tone: "user" as const },
            ]
          ).map((option) => (
            <Chip
              key={option.id}
              tone={option.tone}
              active={roleFilter === option.id}
              onClick={() => setRoleFilter(option.id)}
              count={<Digits value={counts[option.id]} />}
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
              placeholder={t("admin.users.searchPlaceholder")}
              aria-label={t("admin.users.searchAria")}
              className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-[0.875rem] text-foreground placeholder:text-subtle-foreground focus:border-primary focus:outline-none sm:w-56"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          {visible.length === 0 ? (
            <div className="rounded-panel border border-dashed border-border-strong bg-surface-2 p-10 text-center">
              <p className="text-[0.875rem] font-medium text-foreground">{t("admin.users.noUsers")}</p>
              <p className="mt-1 text-[0.8125rem] text-muted-foreground">{t("admin.users.noUsersHelp")}</p>
            </div>
          ) : (
            <UserTable users={visible} selectedId={selectedId} onSelect={setSelectedId} />
          )}

          <p className="mt-2 text-[0.6875rem] text-subtle-foreground">
            {t("admin.users.tableShowing", { shown: visible.length, total: users.length })}
          </p>
        </div>

        <aside className="space-y-4">
          {selected ? (
            <Card>
              <CardHeader
                icon={UserCog}
                tone="admin"
                title={t("admin.users.roleAndPermissions")}
                subtitle={t("admin.users.selectedAccount")}
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
                          ? t("admin.users.statusActive")
                          : statusOf(selected) === "suspended"
                            ? t("admin.users.statusSuspended")
                            : t("admin.users.statusPending")
                      }
                      size="xs"
                    />
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div>
                  <p className="mb-2 text-[0.75rem] font-semibold text-foreground">
                    {t("admin.users.assignRole")}
                  </p>
                  <Select
                    value={roleOf(selected)}
                    onChange={(value) =>
                      setRoles((prev) => ({
                        ...prev,
                        [selected.id]: value as AdminUserRow["role"],
                      }))
                    }
                    aria-label={t("admin.users.roleAria")}
                    options={[
                      { value: "user", label: t(ROLE_KEY.user) },
                      { value: "scholar", label: t(ROLE_KEY.scholar) },
                      { value: "admin", label: t(ROLE_KEY.admin) },
                    ]}
                  />
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
                    {statusOf(selected) === "suspended"
                      ? t("admin.users.unsuspend")
                      : t("admin.users.suspend")}
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
                      {t("admin.users.discardChanges")}
                    </Button>
                  ) : null}
                </div>

                {changed(selected) ? (
                  <Callout
                    tone="warning"
                    icon={AlertTriangle}
                    title={t("admin.users.unsavedTitle")}
                  >
                    {roleOf(selected) !== selected.role
                      ? t("admin.users.roleChangePrefix", { role: t(ROLE_KEY[roleOf(selected)]) })
                      : ""}
                    {t("admin.users.unsavedBody")}
                  </Callout>
                ) : null}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div>
                  <dt className="text-[0.625rem] text-subtle-foreground">
                    {t("admin.users.contributions")}
                  </dt>
                  <dd className="font-display text-base font-bold tabular text-foreground">
                    {formatNumber(selected.contributions, locale)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.625rem] text-subtle-foreground">{t("label.joinedOn")}</dt>
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
              title={t("admin.users.escalationTitle")}
              subtitle={t("admin.users.escalationHelp")}
            />
            <ul className="mt-3 space-y-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" />
                {t("admin.users.escalationScholar")}
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" />
                {t("admin.users.escalationAdmin")}
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" />
                {t("admin.users.escalationSuspend")}
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" />
                {t("admin.users.escalationAudit")}
              </li>
            </ul>
          </Card>

          <Card>
            <CardHeader icon={Users} tone="user" title={t("admin.users.createTitle")} />
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
              {t("admin.users.createBody")}
            </p>
            <Button href="/admin/scholars/new" size="sm" variant="outline" className="mt-3">
              {t("admin.users.newScholarAccount")}
            </Button>
          </Card>
        </aside>
      </div>

      <p className="text-[0.6875rem] text-subtle-foreground">
        {t("admin.users.previewNote")}
      </p>
    </div>
  );
}

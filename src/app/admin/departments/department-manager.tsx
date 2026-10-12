"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Flame, Layers, Pencil, Save, Users, X } from "lucide-react";
import type { Department } from "@/lib/types";
import { getScholarsByDepartment } from "@/lib/data/scholars";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/bn";
import { DepartmentTable } from "@/components/console";
import { ScholarMiniCard, departmentIcon } from "@/components/people";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  Chip,
  Field,
  Input,
  Select,
  Switch,
  Textarea,
  softTone,
} from "@/components/ui";

interface DepartmentDraft {
  nameBn: string;
  descriptionBn: string;
  icon: string;
  tone: Department["tone"];
  trending: boolean;
}

const ICON_CHOICES = [
  "BookOpen",
  "Scale",
  "BookMarked",
  "Library",
  "ScrollText",
  "Users",
  "Wallet",
  "GraduationCap",
  "HeartHandshake",
  "Sparkles",
  "Moon",
  "Compass",
  "HeartPulse",
  "UtensilsCrossed",
  "Cpu",
  "Landmark",
  "Baby",
  "ShieldCheck",
  "HandCoins",
  "Building2",
  "Brain",
  "Sprout",
  "MessageCircle",
];

const TONE_CHOICES: Department["tone"][] = [
  "primary",
  "accent",
  "info",
  "success",
  "warning",
  "danger",
  "scholar",
  "user",
  "admin",
];

/**
 * Department management.
 *
 * Each department can be expanded into an editable panel. Edits are held in
 * local state so an admin immediately sees the effect of a rename, a re-tint or
 * a trending toggle; persistence is a backend concern. The scholar list beside
 * each department is the routing mental model — it shows who actually receives
 * that department's questions.
 */
export function DepartmentManager({ departments }: { departments: Department[] }) {
  const { t, locale } = useI18n();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DepartmentDraft>>({});
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [onlyEmpty, setOnlyEmpty] = useState(false);

  const draftFor = (department: Department): DepartmentDraft =>
    drafts[department.slug] ?? {
      nameBn: department.name.bn,
      descriptionBn: department.description.bn,
      icon: department.icon,
      tone: department.tone,
      trending: department.trending,
    };

  const update = (slug: string, department: Department, patch: Partial<DepartmentDraft>) =>
    setDrafts((prev) => ({ ...prev, [slug]: { ...draftFor(department), ...patch } }));

  const visible = useMemo(
    () => (onlyEmpty ? departments.filter((d) => d.scholarIds.length === 0) : departments),
    [departments, onlyEmpty],
  );

  const emptyDepartments = departments.filter((d) => d.scholarIds.length === 0).length;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-info-soft text-info-soft-foreground">
            <Layers className="size-4" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t("admin.departmentManagement")}
            </h2>
            <p className="mt-0.5 text-[0.75rem] text-muted-foreground">
              {t("admin.departments.managerHelp")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Switch
            id="only-empty"
            checked={onlyEmpty}
            onChange={setOnlyEmpty}
            label={t("admin.departments.onlyEmpty")}
          />
        </div>
      </div>

      {emptyDepartments > 0 ? (
        <Callout tone="warning" icon={Users} title={t("admin.departments.emptyCalloutManagerTitle")}>
          {t("admin.departments.emptyCalloutManager", { count: emptyDepartments })}

        </Callout>
      ) : null}

      <DepartmentTable departments={visible} />

      <div className="space-y-3">
        <h3 className="font-display text-[0.9375rem] font-semibold text-foreground">
          {t("admin.departments.editAndAssign")}
        </h3>

        <ul className="space-y-3">
          {visible.map((department) => {
            const draft = draftFor(department);
            const open = openSlug === department.slug;
            const Icon = departmentIcon(draft.icon);
            const scholars = getScholarsByDepartment(department.slug);
            const unanswered = Math.max(0, department.stats.questions - department.stats.answered);
            const answerRate =
              department.stats.questions > 0
                ? Math.round((department.stats.answered / department.stats.questions) * 100)
                : 0;

            return (
              <li key={department.slug}>
                <Card padding="none">
                  <button
                    type="button"
                    onClick={() => setOpenSlug(open ? null : department.slug)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-3.5 p-4 text-left transition-colors hover:bg-surface-2"
                  >
                    <span
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-2xl",
                        softTone[draft.tone],
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-[0.9375rem] font-semibold text-foreground">
                          {draft.nameBn}
                        </span>
                        {draft.trending ? (
                          <Badge tone="danger" size="xs" icon={Flame}>
                            {t("label.trending")}
                          </Badge>
                        ) : null}
                        {scholars.length === 0 ? (
                          <Badge tone="warning" size="xs">
                            {t("admin.departments.noScholarBadge")}
                          </Badge>
                        ) : null}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-subtle-foreground">
                        <span className="tabular">
                          {t("admin.departments.scholarCount", { count: scholars.length })}
                        </span>
                        <span className="tabular">
                          {t("admin.departments.questionsCount", { count: department.stats.questions })}
                        </span>
                        <span className="tabular">
                          {t("admin.departments.answerRate", { percent: answerRate })}
                        </span>
                        {unanswered > 0 ? (
                          <span className="tabular text-warning">
                            {t("admin.departments.unansweredCount", { count: unanswered })}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-subtle-foreground transition-transform ${open ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>

                  {open ? (
                    <div className="grid gap-5 border-t border-border p-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
                      <div className="space-y-4">
                        <Field label={t("admin.departments.nameField")} htmlFor={`name-${department.slug}`}>
                          <Input
                            id={`name-${department.slug}`}
                            value={draft.nameBn}
                            onChange={(e) => update(department.slug, department, { nameBn: e.target.value })}
                          />
                        </Field>
                        <Field label={t("admin.departments.descriptionField")} htmlFor={`desc-${department.slug}`}>
                          <Textarea
                            id={`desc-${department.slug}`}
                            value={draft.descriptionBn}
                            onChange={(e) =>
                              update(department.slug, department, { descriptionBn: e.target.value })
                            }
                            className="min-h-20"
                          />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label={t("admin.departments.iconField")} htmlFor={`icon-${department.slug}`}>
                            <Select
                              id={`icon-${department.slug}`}
                              value={draft.icon}
                              onChange={(value) => update(department.slug, department, { icon: value })}
                              options={ICON_CHOICES.map((name) => ({ value: name, label: name }))}
                            />
                          </Field>
                          <Field label={t("admin.departments.toneField")} htmlFor={`tone-${department.slug}`}>
                            <Select
                              id={`tone-${department.slug}`}
                              value={draft.tone}
                              onChange={(value) =>
                                update(department.slug, department, {
                                  tone: value as Department["tone"],
                                })
                              }
                              options={TONE_CHOICES.map((tone) => ({ value: tone, label: tone }))}
                            />
                          </Field>
                        </div>
                        <Switch
                          id={`trending-${department.slug}`}
                          checked={draft.trending}
                          onChange={(v) => update(department.slug, department, { trending: v })}
                          label={t("admin.departments.trendingSwitch")}
                          description={t("admin.departments.trendingSwitchHelp")}
                        />
                        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
                          <Button
                            size="sm"
                            icon={Save}
                            onClick={() => {
                              setSavedSlug(department.slug);
                              setOpenSlug(null);
                            }}
                          >
                            {t("admin.departments.saveChanges")}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={X}
                            onClick={() =>
                              setDrafts((prev) => {
                                const next = { ...prev };
                                delete next[department.slug];
                                return next;
                              })
                            }
                          >
                            {t("admin.departments.discardChanges")}
                          </Button>
                          {savedSlug === department.slug ? (
                            <Badge tone="success" size="xs">
                              {t("admin.departments.saved")}
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-card border border-border bg-surface-2 p-4">
                        <p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                          <Users className="size-3.5" aria-hidden />
                          {t("admin.departments.scholarsOnDuty")}
                        </p>
                        {scholars.length === 0 ? (
                          <p className="mt-2 text-[0.8125rem] leading-relaxed text-warning">
                            {t("admin.departments.noScholarWarning")}
                          </p>
                        ) : (
                          <ul className="mt-3 space-y-3">
                            {scholars.map((scholar) => (
                              <li key={scholar.id}>
                                <ScholarMiniCard scholar={scholar} />
                                {scholar.primaryDepartmentId === department.slug ? (
                                  <Chip tone={draft.tone} size="sm" className="mt-2">
                                    {t("admin.primaryDepartment")}
                                  </Chip>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        )}
                        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
                          <div>
                            <dt className="text-[0.6875rem] text-subtle-foreground">
                              {t("admin.departments.statsQuestions")}
                            </dt>
                            <dd className="font-display text-base font-bold tabular text-foreground">
                              {formatNumber(department.stats.questions, locale)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[0.6875rem] text-subtle-foreground">
                              {t("admin.departments.statsAnswers")}
                            </dt>
                            <dd className="font-display text-base font-bold tabular text-success">
                              {formatNumber(department.stats.answered, locale)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[0.6875rem] text-subtle-foreground">
                              {t("admin.departments.statsFatwas")}
                            </dt>
                            <dd className="font-display text-base font-bold tabular text-foreground">
                              {formatNumber(department.stats.fatwas, locale)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[0.6875rem] text-subtle-foreground">{t("label.followers")}</dt>
                            <dd className="font-display text-base font-bold tabular text-foreground">
                              {formatNumber(department.stats.followers, locale)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      </div>

      <Card>
        <CardHeader
          icon={Pencil}
          tone="info"
          title={t("admin.departments.newTitle")}
          subtitle={t("admin.departments.newHelp")}
        />
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {t("admin.departments.newBody", { count: departments.length })}
        </p>
      </Card>
    </section>
  );
}

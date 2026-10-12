"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  GraduationCap,
  Info,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { DEPARTMENTS, getDepartment } from "@/lib/data/departments";
import { SCHOLARS, getScholarsByDepartment } from "@/lib/data/scholars";
import { districtOptions, findDistrict, formatNumber } from "@/lib/bn";
import { Digits } from "@/components/i18n-text";
import { useI18n } from "@/lib/i18n";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  Chip,
  ChipList,
  Field,
  Input,
  Select,
  Switch,
  Textarea,
} from "@/components/ui";
import { MatchScoreBar } from "@/components/console";
import { ScholarMiniCard } from "@/components/people";

const HONORIFICS = [
  { value: "mufti", label: "মুফতি", en: "Mufti" },
  { value: "muhaddith", label: "মুহাদ্দিস", en: "Muhaddith" },
  { value: "dr", label: "ড.", en: "Dr." },
  { value: "ustad", label: "উস্তাদ", en: "Ustadh" },
  { value: "ustadha", label: "উস্তাদা", en: "Ustadha" },
  { value: "shaykh", label: "শায়খ", en: "Shaykh" },
];

/**
 * Spoken languages the scholar may be listed with. The state holds the id and
 * the dictionary holds the label, so the same selection reads correctly in both
 * languages.
 */
const LANGUAGES: { id: string; key: string }[] = [
  { id: "bn", key: "admin.scholars.form.langBn" },
  { id: "ar", key: "admin.scholars.form.langAr" },
  { id: "en", key: "admin.scholars.form.langEn" },
  { id: "ur", key: "admin.scholars.form.langUr" },
  { id: "fa", key: "admin.scholars.form.langFa" },
];

interface CredentialRow {
  id: string;
  title: string;
  institution: string;
  year: string;
}

let credentialSeq = 0;
const newCredential = (): CredentialRow => ({
  id: `cred-${++credentialSeq}`,
  title: "",
  institution: "",
  year: "",
});

/**
 * Add-scholar form.
 *
 * The routing preview is the point of this screen: assigning departments is
 * what decides which questions a scholar receives, so the form shows, live, who
 * already covers the chosen departments and how much question volume the new
 * scholar would inherit. Submitting is wired to the backend later; every other
 * control here reflects real state.
 */
export function AddScholarForm() {
  const { t, pick, locale, isBn } = useI18n();

  const [honorific, setHonorific] = useState("mufti");
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [bio, setBio] = useState("");
  const [madrasah, setMadrasah] = useState("");
  const [district, setDistrict] = useState("dhaka");
  const [email, setEmail] = useState("");
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [primaryDepartment, setPrimaryDepartment] = useState("");
  const [credentials, setCredentials] = useState<CredentialRow[]>([newCredential()]);
  const [verifyProfile, setVerifyProfile] = useState(true);
  const [available, setAvailable] = useState(true);
  const [sendInvite, setSendInvite] = useState(true);
  const [fiqhFocus, setFiqhFocus] = useState<string[]>(["hanafi"]);
  const [languages, setLanguages] = useState<string[]>(["bn", "ar"]);
  const [submitted, setSubmitted] = useState(false);

  const toggleDepartment = (slug: string) => {
    setDepartmentIds((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      // The primary department must always be one of the chosen ones.
      if (!next.includes(primaryDepartment)) setPrimaryDepartment(next[0] ?? "");
      return next;
    });
  };

  /* -------------------------------------------------------- routing preview */

  const coveringScholars = useMemo(() => {
    const byDepartment = departmentIds.flatMap((slug) => getScholarsByDepartment(slug));
    const unique = [...new Map(byDepartment.map((s) => [s.id, s])).values()];
    return unique
      .map((scholar) => {
        const overlap = scholar.departmentIds.filter((d) => departmentIds.includes(d)).length;
        const coversPrimary = scholar.departmentIds.includes(primaryDepartment);
        // Overlap dominates; fast responders and specialists break ties.
        const score = Math.min(
          99,
          Math.round(
            (overlap / Math.max(1, departmentIds.length)) * 70 +
              (coversPrimary ? 12 : 0) +
              (scholar.verified ? 6 : 0) +
              Math.max(0, 12 - scholar.responseTimeHours / 2),
          ),
        );
        return { scholar, score, overlap };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [departmentIds, primaryDepartment]);

  const inheritedVolume = useMemo(
    () =>
      departmentIds.reduce((sum, slug) => sum + (getDepartment(slug)?.stats.questions ?? 0), 0),
    [departmentIds],
  );

  const inheritedUnanswered = useMemo(
    () =>
      departmentIds.reduce((sum, slug) => {
        const d = getDepartment(slug);
        return sum + (d ? Math.max(0, d.stats.questions - d.stats.answered) : 0);
      }, 0),
    [departmentIds],
  );

  const valid = nameBn.trim().length > 1 && departmentIds.length > 0;
  const blockers: string[] = [];
  if (nameBn.trim().length <= 1) blockers.push(t("admin.scholars.form.blockerName"));
  if (departmentIds.length === 0) blockers.push(t("admin.scholars.form.blockerDepartment"));
  if (!primaryDepartment) blockers.push(t("admin.scholars.form.blockerPrimary"));

  const honorificEntry = HONORIFICS.find((h) => h.value === honorific);
  const honorificLabel = honorificEntry ? (isBn ? honorificEntry.label : honorificEntry.en) : "";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) setSubmitted(true);
        }}
      >
        {/* ---------------------------------------------------- basic info */}
        <Card>
          <CardHeader
            icon={UserPlus}
            title={t("admin.basicInfo")}
            subtitle={t("admin.scholars.form.basicInfoHelp")}
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={t("admin.scholars.form.honorific")} htmlFor="honorific" required>
              <Select
                id="honorific"
                value={honorific}
                onChange={setHonorific}
                options={HONORIFICS.map((h) => ({
                  value: h.value,
                  label: isBn ? `${h.label} (${h.en})` : h.en,
                  keywords: h.en,
                }))}
              />
            </Field>
            <Field label={t("label.district")} htmlFor="district" required>
              <Select
                id="district"
                value={district}
                onChange={setDistrict}
                options={districtOptions(locale)}
              />
            </Field>
            <Field
              label={t("admin.scholars.form.nameBn")}
              htmlFor="name-bn"
              required
              hint={t("admin.scholars.form.nameBnHelp")}
            >
              <Input
                id="name-bn"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder={t("admin.scholars.form.nameBnPlaceholder")}
              />
            </Field>
            <Field
              label={t("admin.scholars.form.nameEn")}
              htmlFor="name-en"
              hint={t("admin.scholars.form.nameEnHelp")}
            >
              <Input
                id="name-en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder={t("admin.scholars.form.nameEnPlaceholder")}
              />
            </Field>
            <Field
              label={t("admin.scholars.form.madrasah")}
              htmlFor="madrasah"
              className="sm:col-span-2"
            >
              <Input
                id="madrasah"
                value={madrasah}
                onChange={(e) => setMadrasah(e.target.value)}
                placeholder={t("admin.scholars.form.madrasahPlaceholder")}
              />
            </Field>
            <Field
              label={t("label.email")}
              htmlFor="email"
              className="sm:col-span-2"
              hint={t("admin.scholars.form.emailHelp")}
            >
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scholar@example.com"
              />
            </Field>
            <Field label={t("admin.scholars.form.bio")} htmlFor="bio" className="sm:col-span-2">
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t("admin.scholars.form.bioPlaceholder")}
              />
            </Field>
          </div>
        </Card>

        {/* ---------------------------------------------------- departments */}
        <Card>
          <CardHeader
            icon={Users}
            tone="primary"
            title={t("admin.assignDepartments")}
            subtitle={t("admin.scholars.form.departmentsHelp")}
          />
          <div className="mt-5">
            <ChipList label={t("admin.scholars.form.selectDepartments")}>
              {DEPARTMENTS.map((department) => (
                <Chip
                  key={department.slug}
                  tone={department.tone}
                  size="md"
                  active={departmentIds.includes(department.slug)}
                  onClick={() => toggleDepartment(department.slug)}
                  count={<Digits value={department.scholarIds.length} />}
                >
                  {pick(department.name)}
                </Chip>
              ))}
            </ChipList>
          </div>

          <div className="mt-5">
            <Field
              label={t("admin.primaryDepartment")}
              htmlFor="primary-dept"
              required
              hint={t("admin.scholars.form.primaryDepartmentHelp")}
            >
              <Select
                id="primary-dept"
                value={primaryDepartment}
                onChange={setPrimaryDepartment}
                disabled={departmentIds.length === 0}
                placeholder={t("admin.scholars.form.selectPlaceholder")}
                searchable={departmentIds.length > 8}
                options={departmentIds.flatMap((slug) => {
                  const department = getDepartment(slug);
                  return department
                    ? [{ value: slug, label: pick(department.name), keywords: department.name.en }]
                    : [];
                })}
              />
            </Field>
            {departmentIds.length === 0 ? (
              <p className="mt-2 text-[0.75rem] text-warning">
                {t("admin.scholars.form.pickDepartmentFirst")}
              </p>
            ) : null}
          </div>

          {departmentIds.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-4">
              <span className="text-[0.75rem] font-medium text-muted-foreground">
                {t("admin.scholars.form.selectedLabel")}
              </span>
              {departmentIds.map((slug) => {
                const department = getDepartment(slug);
                if (!department) return null;
                const isPrimary = slug === primaryDepartment;
                return (
                  <Chip
                    key={slug}
                    tone={department.tone}
                    active={isPrimary}
                    onRemove={() => toggleDepartment(slug)}
                  >
                    {pick(department.name)}
                    {isPrimary ? t("admin.scholars.form.primarySuffix") : ""}
                  </Chip>
                );
              })}
            </div>
          ) : null}
        </Card>

        {/* ---------------------------------------------------- credentials */}
        <Card>
          <CardHeader
            icon={GraduationCap}
            tone="accent"
            title={t("admin.credentialsSection")}
            subtitle={t("admin.scholars.form.credentialsHelp")}
          />
          <ul className="mt-5 space-y-3">
            {credentials.map((row, index) => (
              <li
                key={row.id}
                className="grid gap-3 rounded-card border border-border bg-surface-2 p-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_5rem_auto]"
              >
                <Input
                  value={row.title}
                  onChange={(e) =>
                    setCredentials((prev) =>
                      prev.map((c) => (c.id === row.id ? { ...c, title: e.target.value } : c)),
                    )
                  }
                  placeholder={
                    index === 0
                      ? t("admin.scholars.form.credentialFirstPlaceholder")
                      : t("admin.scholars.form.credentialPlaceholder")
                  }
                  aria-label={t("admin.scholars.form.credentialAria", { count: index + 1 })}
                />
                <Input
                  value={row.institution}
                  onChange={(e) =>
                    setCredentials((prev) =>
                      prev.map((c) => (c.id === row.id ? { ...c, institution: e.target.value } : c)),
                    )
                  }
                  placeholder={t("admin.scholars.form.institutionPlaceholder")}
                  aria-label={t("admin.scholars.form.institutionAria", { count: index + 1 })}
                />
                <Input
                  value={row.year}
                  onChange={(e) =>
                    setCredentials((prev) =>
                      prev.map((c) => (c.id === row.id ? { ...c, year: e.target.value } : c)),
                    )
                  }
                  placeholder={t("admin.scholars.form.yearPlaceholder")}
                  aria-label={t("admin.scholars.form.yearAria", { count: index + 1 })}
                />
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("admin.scholars.form.removeCredential")}
                    disabled={credentials.length === 1}
                    onClick={() =>
                      setCredentials((prev) => prev.filter((c) => c.id !== row.id))
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Plus}
            className="mt-3"
            onClick={() => setCredentials((prev) => [...prev, newCredential()])}
          >
            {t("admin.scholars.form.addCredential")}
          </Button>
        </Card>

        {/* ---------------------------------------------------- account */}
        <Card>
          <CardHeader
            icon={BadgeCheck}
            tone="success"
            title={t("admin.scholars.form.accountPermissions")}
            subtitle={t("admin.scholars.form.accountPermissionsHelp")}
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Switch
              id="verify"
              checked={verifyProfile}
              onChange={setVerifyProfile}
              label={t("admin.scholars.board.verifyPublish")}
              description={t("admin.scholars.form.verifyPublishHelp")}
            />
            <Switch
              id="available"
              checked={available}
              onChange={setAvailable}
              label={t("label.available")}
              description={t("admin.scholars.form.availableHelp")}
            />
            <Switch
              id="invite"
              checked={sendInvite}
              onChange={setSendInvite}
              label={t("admin.scholars.form.invite")}
              description={t("admin.scholars.form.inviteHelp")}
            />
            <div className="rounded-xl border border-border bg-surface p-3.5">
              <p className="text-[0.875rem] font-medium text-foreground">{t("label.languages")}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {LANGUAGES.map((lang) => (
                  <Chip
                    key={lang.id}
                    size="sm"
                    active={languages.includes(lang.id)}
                    onClick={() =>
                      setLanguages((prev) =>
                        prev.includes(lang.id)
                          ? prev.filter((l) => l !== lang.id)
                          : [...prev, lang.id],
                      )
                    }
                  >
                    {t(lang.key)}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-[0.75rem] font-semibold text-foreground">
              {t("admin.scholars.form.fiqhFocus")}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { id: "hanafi", key: "admin.scholars.form.fiqhHanafi" },
                { id: "general", key: "admin.scholars.form.fiqhGeneral" },
                { id: "usul", key: "admin.scholars.form.fiqhUsul" },
                { id: "comparative", key: "admin.scholars.form.fiqhComparative" },
              ].map((option) => (
                <Chip
                  key={option.id}
                  size="sm"
                  tone="accent"
                  active={fiqhFocus.includes(option.id)}
                  onClick={() =>
                    setFiqhFocus((prev) =>
                      prev.includes(option.id) ? prev.filter((f) => f !== option.id) : [...prev, option.id],
                    )
                  }
                >
                  {t(option.key)}
                </Chip>
              ))}
            </div>
          </div>
        </Card>

        {/* ---------------------------------------------------- summary */}
        <Card>
          <CardHeader
            icon={Save}
            title={t("admin.scholars.form.summary")}
            subtitle={t("admin.scholars.form.summaryHelp")}
          />
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">
                {t("admin.scholars.form.scholarLabel")}
              </dt>
              <dd className="mt-1 text-[0.875rem] font-medium text-foreground">
                {nameBn ? `${honorificLabel} ${nameBn}` : t("admin.scholars.form.noName")}
              </dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">
                {t("admin.scholars.form.location")}
              </dt>
              <dd className="mt-1 text-[0.875rem] font-medium text-foreground">
                {pick(findDistrict(district).name)}
              </dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">
                {t("label.department")}
              </dt>
              <dd className="mt-1 text-[0.875rem] font-medium text-foreground">
                {departmentIds.length > 0
                  ? departmentIds
                      .map((slug) => {
                        const department = getDepartment(slug);
                        return department ? pick(department.name) : null;
                      })
                      .filter(Boolean)
                      .join("، ")
                  : t("admin.scholars.form.noSelection")}
              </dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">
                {t("admin.primaryDepartment")}
              </dt>
              <dd className="mt-1 text-[0.875rem] font-medium text-foreground">
                {primaryDepartment ? pick(getDepartment(primaryDepartment)?.name, "—") : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">
                {t("admin.scholars.credentials")}
              </dt>
              <dd className="mt-1 text-[0.875rem] font-medium text-foreground">
                {t("admin.scholars.form.credentialsAttached", {
                  count: credentials.filter((c) => c.title.trim()).length,
                })}
              </dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">
                {t("label.status")}
              </dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {verifyProfile ? (
                  <Badge tone="success" size="xs">
                    {t("label.verified")}
                  </Badge>
                ) : (
                  <Badge tone="neutral" size="xs">
                    {t("admin.scholars.form.unverifiedBadge")}
                  </Badge>
                )}
                {available ? (
                  <Badge tone="primary" size="xs">
                    {t("admin.scholars.form.availableBadge")}
                  </Badge>
                ) : (
                  <Badge tone="warning" size="xs">
                    {t("label.unavailable")}
                  </Badge>
                )}
              </dd>
            </div>
          </dl>

          {blockers.length > 0 ? (
            <Callout
              tone="warning"
              icon={Info}
              className="mt-5"
              title={t("admin.scholars.form.completeRequired")}
            >
              <ul className="list-inside list-disc space-y-1">
                {blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </Callout>
          ) : null}

          {submitted ? (
            <Callout
              tone="success"
              icon={BadgeCheck}
              className="mt-5"
              title={t("admin.scholars.form.profileReady")}
            >
              {t("admin.scholars.form.profileReadyBody", { name: nameBn })}
            </Callout>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <Button type="submit" icon={UserPlus} disabled={!valid}>
              {sentLabel(t, valid, verifyProfile)}
            </Button>
            <Button type="button" variant="outline" icon={Save} disabled={!valid}>
              {t("action.saveDraft")}
            </Button>
            <Button href="/admin/scholars" variant="ghost">
              {t("action.cancel")}
            </Button>
          </div>
        </Card>
      </form>

      {/* ---------------------------------------------------- routing rail */}
      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader
            icon={Sparkles}
            tone="accent"
            title={t("admin.routingPreview")}
            subtitle={t("admin.routingPreviewHelp")}
          />

          {departmentIds.length === 0 ? (
            <p className="mt-4 rounded-card border border-dashed border-border-strong bg-surface-2 p-4 text-[0.8125rem] leading-relaxed text-muted-foreground">
              {t("admin.scholars.form.routingEmpty")}
            </p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-card border border-border bg-surface-2 p-3.5">
                  <p className="text-[0.6875rem] text-subtle-foreground">
                    {t("admin.scholars.form.inheritedVolume")}
                  </p>
                  <p className="mt-1 font-display text-lg font-bold tabular text-foreground">
                    {formatNumber(inheritedVolume, locale)}
                  </p>
                </div>
                <div className="rounded-card border border-border bg-surface-2 p-3.5">
                  <p className="text-[0.6875rem] text-subtle-foreground">
                    {t("admin.scholars.form.unansweredNow")}
                  </p>
                  <p className="mt-1 font-display text-lg font-bold tabular text-warning">
                    {formatNumber(inheritedUnanswered, locale)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                {t("admin.scholars.form.currentCoverage")}
              </p>
              <ul className="mt-3 space-y-3">
                {coveringScholars.map(({ scholar, score }) => (
                  <li key={scholar.id} className="rounded-card border border-border bg-surface-2 p-3">
                    <ScholarMiniCard scholar={scholar} />
                    <MatchScoreBar score={score} className="mt-2.5" />
                    <p className="mt-2 text-[0.6875rem] leading-relaxed text-muted-foreground">
                      {t("admin.scholars.form.scholarStats", {
                        answers: scholar.stats.answers,
                        hours: scholar.responseTimeHours,
                      })}
                    </p>
                  </li>
                ))}
              </ul>

              <Callout tone="info" className="mt-4">
                {t("admin.scholars.form.volumeNote")}
              </Callout>
            </>
          )}
        </Card>

        <Card>
          <CardHeader icon={Building2} tone="info" title={t("admin.scholars.form.reminders")} />
          <ul className="mt-3 space-y-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {t("admin.scholars.form.reminder1")}
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {t("admin.scholars.form.reminder2")}
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {t("admin.scholars.form.reminder3")}
            </li>
          </ul>
          <p className="mt-3 border-t border-border pt-3 text-[0.6875rem] text-subtle-foreground">
            {t("admin.scholars.form.datasetNote", { count: SCHOLARS.length })}
          </p>
        </Card>
      </aside>
    </div>
  );
}

/** The submit label reflects what will actually happen. */
function sentLabel(t: (key: string) => string, valid: boolean, verify: boolean) {
  if (!valid) return t("admin.scholars.form.submitIncomplete");
  return verify ? t("admin.scholars.form.submitVerified") : t("admin.scholars.form.submitAdd");
}

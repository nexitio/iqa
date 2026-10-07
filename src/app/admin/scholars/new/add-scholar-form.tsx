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
import { DISTRICTS, formatNumber, toBnDigits } from "@/lib/bn";
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
  const { pick, locale } = useI18n();

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
  const [languages, setLanguages] = useState<string[]>(["বাংলা", "আরবি"]);
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
  if (nameBn.trim().length <= 1) blockers.push("বাংলায় আলেমের পুরো নাম লিখুন");
  if (departmentIds.length === 0) blockers.push("অন্তত একটি বিভাগ নির্বাচন করুন");
  if (!primaryDepartment) blockers.push("প্রধান বিভাগ নির্ধারণ করুন");

  const honorificLabel = HONORIFICS.find((h) => h.value === honorific)?.label ?? "";

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
            title="মূল তথ্য"
            subtitle="নাম, পরিচয় ও অবস্থান — প্রকাশ্য প্রোফাইলে এগুলোই দেখানো হবে"
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="উপাধি" htmlFor="honorific" required>
              <Select
                id="honorific"
                value={honorific}
                onChange={(e) => setHonorific(e.target.value)}
              >
                {HONORIFICS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label} ({h.en})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="জেলা" htmlFor="district" required>
              <Select id="district" value={district} onChange={(e) => setDistrict(e.target.value)}>
                {DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name.bn} — {d.division.bn} বিভাগ
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="পুরো নাম (বাংলা)" htmlFor="name-bn" required hint="যেভাবে প্রোফাইলে দেখা যাবে">
              <Input
                id="name-bn"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="মুফতি আব্দুল্লাহ আল-মামুন"
              />
            </Field>
            <Field label="নাম (ইংরেজি)" htmlFor="name-en" hint="ইংরেজি মোডের জন্য">
              <Input
                id="name-en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Mufti Abdullah Al Mamun"
              />
            </Field>
            <Field label="মাদরাসা বা প্রতিষ্ঠান" htmlFor="madrasah" className="sm:col-span-2">
              <Input
                id="madrasah"
                value={madrasah}
                onChange={(e) => setMadrasah(e.target.value)}
                placeholder="জামিয়া আহলিয়া দারুল উলূম মুঈনুল ইসলাম, হাটহাজারী"
              />
            </Field>
            <Field
              label="ইমেইল"
              htmlFor="email"
              className="sm:col-span-2"
              hint="এই ঠিকানায় যাচাইয়ের অনুরোধ ও আমন্ত্রণ পাঠানো হবে"
            >
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scholar@example.com"
              />
            </Field>
            <Field label="সংক্ষিপ্ত পরিচয়" htmlFor="bio" className="sm:col-span-2">
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="শিক্ষা, বিশেষজ্ঞতা ও দীর্ঘ অভিজ্ঞতার সংক্ষিপ্ত বিবরণ…"
              />
            </Field>
          </div>
        </Card>

        {/* ---------------------------------------------------- departments */}
        <Card>
          <CardHeader
            icon={Users}
            tone="primary"
            title="বিভাগ নির্ধারণ"
            subtitle="একজন আলেম একাধিক বিভাগে থাকতে পারেন — প্রশ্ন এসব বিভাগ থেকেই আসবে"
          />
          <div className="mt-5">
            <ChipList label="বিভাগ নির্বাচন">
              {DEPARTMENTS.map((department) => (
                <Chip
                  key={department.slug}
                  tone={department.tone}
                  size="md"
                  active={departmentIds.includes(department.slug)}
                  onClick={() => toggleDepartment(department.slug)}
                  count={department.scholarIds.length}
                >
                  {pick(department.name)}
                </Chip>
              ))}
            </ChipList>
          </div>

          <div className="mt-5">
            <Field
              label="প্রধান বিভাগ"
              htmlFor="primary-dept"
              required
              hint="রাউটিং প্রথমে এই বিভাগের প্রশ্ন পাঠায়, তাই আলেমের মূল বিশেষজ্ঞতাই বেছে নিন"
            >
              <Select
                id="primary-dept"
                value={primaryDepartment}
                onChange={(e) => setPrimaryDepartment(e.target.value)}
                disabled={departmentIds.length === 0}
              >
                <option value="">— নির্বাচন করুন —</option>
                {departmentIds.map((slug) => {
                  const department = getDepartment(slug);
                  if (!department) return null;
                  return (
                    <option key={slug} value={slug}>
                      {department.name.bn}
                    </option>
                  );
                })}
              </Select>
            </Field>
            {departmentIds.length === 0 ? (
              <p className="mt-2 text-[0.75rem] text-warning">
                আগে উপরের তালিকা থেকে বিভাগ নির্বাচন করুন।
              </p>
            ) : null}
          </div>

          {departmentIds.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-4">
              <span className="text-[0.75rem] font-medium text-muted-foreground">নির্বাচিত:</span>
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
                    {isPrimary ? " · প্রধান" : ""}
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
            title="যোগ্যতা ও শিক্ষা"
            subtitle="দাওরা-এ-হাদীস, ইফতা কোর্স বা সমমানের যোগ্যতা যাচাইয়ের জন্য জরুরি"
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
                  placeholder={index === 0 ? "দাওরা-এ-হাদীস" : "যোগ্যতা"}
                  aria-label={`যোগ্যতা ${index + 1}`}
                />
                <Input
                  value={row.institution}
                  onChange={(e) =>
                    setCredentials((prev) =>
                      prev.map((c) => (c.id === row.id ? { ...c, institution: e.target.value } : c)),
                    )
                  }
                  placeholder="প্রতিষ্ঠান"
                  aria-label={`প্রতিষ্ঠান ${index + 1}`}
                />
                <Input
                  value={row.year}
                  onChange={(e) =>
                    setCredentials((prev) =>
                      prev.map((c) => (c.id === row.id ? { ...c, year: e.target.value } : c)),
                    )
                  }
                  placeholder="সন"
                  aria-label={`সন ${index + 1}`}
                />
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="যোগ্যতা মুছুন"
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
            আরেকটি যোগ্যতা যোগ করুন
          </Button>
        </Card>

        {/* ---------------------------------------------------- account */}
        <Card>
          <CardHeader
            icon={BadgeCheck}
            tone="success"
            title="অ্যাকাউন্ট ও অনুমতি"
            subtitle="যাচাই ও প্রাপ্যতা নিয়ন্ত্রণ করে কে প্রশ্ন পাবেন তা নির্ধারিত হয়"
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Switch
              id="verify"
              checked={verifyProfile}
              onChange={setVerifyProfile}
              label="প্রোফাইল যাচাই করে প্রকাশ করুন"
              description="যাচাইকৃত আলেম রাউটিংয়ে অগ্রাধিকার পান ও প্রোফাইলে যাচাই চিহ্ন পায়।"
            />
            <Switch
              id="available"
              checked={available}
              onChange={setAvailable}
              label="প্রশ্নের জন্য উপলব্ধ"
              description="বন্ধ রাখলে নতুন প্রশ্ন রাউট হবে না, তবে পুরনো উত্তর অপরিবর্তিত থাকবে।"
            />
            <Switch
              id="invite"
              checked={sendInvite}
              onChange={setSendInvite}
              label="আমন্ত্রণ ইমেইল পাঠান"
              description="লগইন করার আমন্ত্রণ ও পাসওয়ার্ড নির্ধারণের লিংক পাঠানো হবে।"
            />
            <div className="rounded-xl border border-border bg-surface p-3.5">
              <p className="text-[0.875rem] font-medium text-foreground">ভাষা</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["বাংলা", "আরবি", "ইংরেজি", "উর্দু", "ফারসি"].map((lang) => (
                  <Chip
                    key={lang}
                    size="sm"
                    active={languages.includes(lang)}
                    onClick={() =>
                      setLanguages((prev) =>
                        prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
                      )
                    }
                  >
                    {lang}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-[0.75rem] font-semibold text-foreground">ফিকহি দৃষ্টিভঙ্গি</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { id: "hanafi", label: "হানাফী (বাংলাদেশে প্রচলিত)" },
                { id: "general", label: "সাধারণ" },
                { id: "usul", label: "উসূলুল ফিকহ" },
                { id: "comparative", label: "তুলনামূলক ফিকহ" },
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
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>
        </Card>

        {/* ---------------------------------------------------- summary */}
        <Card>
          <CardHeader
            icon={Save}
            title="সারসংক্ষেপ"
            subtitle="সাবমিটের আগে নিশ্চিত হয়ে নিন — অনুমোদনের সাথে সাথেই প্রশ্ন রাউট শুরু হবে"
          />
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">আলেম</dt>
              <dd className="mt-1 text-[0.875rem] font-medium text-foreground">
                {nameBn ? `${honorificLabel} ${nameBn}` : "— নাম দেওয়া হয়নি —"}
              </dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">অবস্থান</dt>
              <dd className="mt-1 text-[0.875rem] font-medium text-foreground">
                {DISTRICTS.find((d) => d.id === district)?.name.bn}
              </dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">বিভাগ</dt>
              <dd className="mt-1 text-[0.875rem] font-medium text-foreground">
                {departmentIds.length > 0
                  ? departmentIds
                      .map((slug) => getDepartment(slug)?.name.bn)
                      .filter(Boolean)
                      .join("، ")
                  : "— নির্বাচন করা হয়নি —"}
              </dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">প্রধান বিভাগ</dt>
              <dd className="mt-1 text-[0.875rem] font-medium text-foreground">
                {primaryDepartment ? getDepartment(primaryDepartment)?.name.bn : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">যোগ্যতা</dt>
              <dd className="mt-1 text-[0.875rem] font-medium text-foreground">
                {formatNumber(credentials.filter((c) => c.title.trim()).length, locale)}টি যুক্ত
              </dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">অবস্থা</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {verifyProfile ? (
                  <Badge tone="success" size="xs">
                    যাচাইকৃত
                  </Badge>
                ) : (
                  <Badge tone="neutral" size="xs">
                    যাচাই ছাড়া
                  </Badge>
                )}
                {available ? (
                  <Badge tone="primary" size="xs">
                    উপলব্ধ
                  </Badge>
                ) : (
                  <Badge tone="warning" size="xs">
                    অনুপলব্ধ
                  </Badge>
                )}
              </dd>
            </div>
          </dl>

          {blockers.length > 0 ? (
            <Callout tone="warning" icon={Info} className="mt-5" title="সম্পূর্ণ করতে হবে">
              <ul className="list-inside list-disc space-y-1">
                {blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </Callout>
          ) : null}

          {submitted ? (
            <Callout tone="success" icon={BadgeCheck} className="mt-5" title="প্রোফাইল প্রস্তুত">
              {nameBn} এর প্রোফাইল তৈরি হয়েছে। সংরক্ষণ করে ডেটাবেসে লেখা হবে — বর্তমানে এটি ফ্রন্টএন্ড প্রিভিউ।
            </Callout>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <Button type="submit" icon={UserPlus} disabled={!valid}>
              {sentLabel(valid, verifyProfile)}
            </Button>
            <Button type="button" variant="outline" icon={Save} disabled={!valid}>
              খসড়া সংরক্ষণ
            </Button>
            <Button href="/admin/scholars" variant="ghost">
              বাতিল
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
            title="প্রশ্ন রাউটিং প্রিভিউ"
            subtitle="এই বিভাগগুলোর প্রশ্ন প্রথমে যাদের কাছে যাবে"
          />

          {departmentIds.length === 0 ? (
            <p className="mt-4 rounded-card border border-dashed border-border-strong bg-surface-2 p-4 text-[0.8125rem] leading-relaxed text-muted-foreground">
              বিভাগ নির্বাচন করুন — তখনই দেখানো হবে এই নতুন আলেম কতটা প্রশ্নভার নেবেন এবং কোন আলেমদের সাথে রাউটিং ভাগ
              করবেন।
            </p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-card border border-border bg-surface-2 p-3.5">
                  <p className="text-[0.6875rem] text-subtle-foreground">সম্ভাব্য প্রশ্নভার</p>
                  <p className="mt-1 font-display text-lg font-bold tabular text-foreground">
                    {formatNumber(inheritedVolume, locale)}
                  </p>
                </div>
                <div className="rounded-card border border-border bg-surface-2 p-3.5">
                  <p className="text-[0.6875rem] text-subtle-foreground">উত্তরহীন এখন</p>
                  <p className="mt-1 font-display text-lg font-bold tabular text-warning">
                    {formatNumber(inheritedUnanswered, locale)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                যাঁরা এখন এই বিভাগগুলো সামলাচ্ছেন
              </p>
              <ul className="mt-3 space-y-3">
                {coveringScholars.map(({ scholar, score }) => (
                  <li key={scholar.id} className="rounded-card border border-border bg-surface-2 p-3">
                    <ScholarMiniCard scholar={scholar} />
                    <MatchScoreBar score={score} className="mt-2.5" />
                    <p className="mt-2 text-[0.6875rem] leading-relaxed text-muted-foreground">
                      {formatNumber(scholar.stats.answers, locale)}টি উত্তর · সাধারণত{" "}
                      {toBnDigits(scholar.responseTimeHours)} ঘণ্টায় সাড়া
                    </p>
                  </li>
                ))}
              </ul>

              <Callout tone="info" className="mt-4">
                নতুন আলেম যোগ হলে এই বিভাগের প্রশ্নভার ভাগ হয়ে যাবে, ফলে উত্তর পাওয়ার সময় কমবে।
              </Callout>
            </>
          )}
        </Card>

        <Card>
          <CardHeader icon={Building2} tone="info" title="স্মরণ রাখুন" />
          <ul className="mt-3 space-y-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              একজন আলেম একাধিক বিভাগে থাকতে পারেন, তবে প্রধান বিভাগটি তাঁর মূল বিশেষজ্ঞতা হওয়া উচিত।
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              ফতোয়া দেওয়ার অনুমতি যোগ্যতার সাথে সম্পর্কিত — সব আলেমকে ফতোয়ায় রাখবেন না।
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              যোগ্যতা যাচাই না করে অনুমোদন দিলে প্ল্যাটফর্মের বিশ্বাসযোগ্যতা ক্ষতিগ্রস্ত হয়।
            </li>
          </ul>
          <p className="mt-3 border-t border-border pt-3 text-[0.6875rem] text-subtle-foreground">
            বর্তমানে ডেটাসেটে {toBnDigits(SCHOLARS.length)}জন আলেম আছেন।
          </p>
        </Card>
      </aside>
    </div>
  );
}

/** The submit label reflects what will actually happen. */
function sentLabel(valid: boolean, verify: boolean) {
  if (!valid) return "তথ্য সম্পূর্ণ করুন";
  return verify ? "যাচাই করে যোগ করুন" : "আলেম যোগ করুন";
}

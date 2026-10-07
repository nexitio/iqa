"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  Lock,
  MessageCircleQuestion,
  Scale,
  Send,
  Shield,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import type { Scholar } from "@/lib/types";
import { DEPARTMENTS, getDepartment } from "@/lib/data/departments";
import { SCHOLARS } from "@/lib/data/scholars";
import { useI18n } from "@/lib/i18n";
import { toBnDigits } from "@/lib/bn";
import {
  Button,
  Callout,
  Card,
  CardHeader,
  Checkbox,
  Chip,
  ChipList,
  Field,
  Input,
  RadioCard,
  Textarea,
} from "@/components/ui";
import { MatchScoreBar } from "@/components/console";
import { ScholarMiniCard } from "@/components/people";
import { ASKING_TIPS } from "./asking-guidance";

/**
 * The ask form — the product's front door.
 *
 * Two things make it more than a text box. First, the department choice is
 * explained: it is the routing key, not a category label. Second, the routing
 * preview recomputes live as departments are picked, so the asker can see
 * exactly which scholars will receive their question and why. Transparency is
 * the feature here — a queue nobody understands is a queue nobody trusts.
 */

interface RankedScholar {
  scholar: Scholar;
  score: number;
  reasons: string[];
}

/** Score a scholar against the chosen departments, 0–99. */
function rankScholar(scholar: Scholar, chosen: string[]): RankedScholar | null {
  const chosenDepartments = chosen
    .map((slug) => getDepartment(slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const matched = chosenDepartments.filter(
    (d) => scholar.departmentIds.includes(d.id) || scholar.departmentIds.includes(d.slug),
  );
  if (matched.length === 0) return null;

  const isPrimary = matched.some(
    (d) => d.id === scholar.primaryDepartmentId || d.slug === scholar.primaryDepartmentId,
  );

  let score = 52 + matched.length * 14;
  if (isPrimary) score += 10;
  if (scholar.availableForQuestions) score += 8;
  if (scholar.verified) score += 4;
  // Faster responders float up; slower ones still qualify, just lower.
  score += Math.max(0, 12 - scholar.responseTimeHours / 2);
  // Experience within the department.
  score += Math.min(7, scholar.stats.answers / 350);

  const reasons: string[] = [];
  if (isPrimary) {
    reasons.push(`${matched[0].name.bn} বিভাগ তাঁর প্রধান বিশেষজ্ঞতার ক্ষেত্র`);
  } else if (matched.length > 1) {
    reasons.push(
      `${matched
        .slice(0, 2)
        .map((d) => d.name.bn)
        .join(" ও ")} — এই ${toBnDigits(matched.length)}টি বিভাগেই তাঁর বিশেষজ্ঞতা রয়েছে`,
    );
  } else {
    reasons.push(`${matched[0].name.bn} বিভাগে তিনি বিশেষজ্ঞ হিসেবে তালিকাভুক্ত`);
  }
  reasons.push(`এই বিভাগে তাঁর ${toBnDigits(scholar.stats.answers)}টি উত্তর ও ${toBnDigits(scholar.stats.fatwas)}টি ফতোয়া`);
  reasons.push(
    scholar.availableForQuestions
      ? `প্রশ্নের জন্য সক্রিয় · সাধারণত ${toBnDigits(scholar.responseTimeHours)} ঘণ্টায় উত্তর দেন`
      : `বর্তমানে ব্যস্ত · সাধারণত ${toBnDigits(scholar.responseTimeHours)} ঘণ্টায় উত্তর দেন`,
  );
  if (scholar.verified) reasons.push("যোগ্যতা যাচাইকৃত প্রোফাইল");

  return { scholar, score: Math.min(99, Math.round(score)), reasons };
}

export function AskForm() {
  const { t, pick, isBn } = useI18n();

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [primary, setPrimary] = useState<string | null>(null);
  const [fatwaRequested, setFatwaRequested] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ranked = useMemo<RankedScholar[]>(() => {
    if (departments.length === 0) return [];
    return SCHOLARS.map((scholar) => rankScholar(scholar, departments))
      .filter((r): r is RankedScholar => r !== null)
      .sort((a, b) => b.score - a.score || a.scholar.responseTimeHours - b.scholar.responseTimeHours)
      .slice(0, 6);
  }, [departments]);

  const titleError = touched && title.trim().length < 12;
  const departmentsError = touched && departments.length === 0;

  /** Rough guidance only — derived from the routed scholars' own medians. */
  const waitEstimate = useMemo(() => {
    if (ranked.length === 0) return null;
    const fastest = [...ranked].sort(
      (a, b) => a.scholar.responseTimeHours - b.scholar.responseTimeHours,
    )[0];
    const slowest = ranked[ranked.length - 1];
    return { fastest: fastest.scholar.responseTimeHours, slowest: slowest.scholar.responseTimeHours };
  }, [ranked]);

  const toggleDepartment = (slug: string) => {
    setDepartments((current) => {
      if (current.includes(slug)) {
        const next = current.filter((s) => s !== slug);
        if (primary === slug) setPrimary(next[0] ?? null);
        return next;
      }
      const next = [...current, slug];
      if (!primary) setPrimary(slug);
      return next;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      {/* ------------------------------------------------------------ form */}
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
          if (title.trim().length < 12 || departments.length === 0) return;
          setSubmitted(true);
        }}
        noValidate
      >
        {/* 1 — the question */}
        <Card>
          <CardHeader
            icon={MessageCircleQuestion}
            title={t("qa.askTitle")}
            subtitle={t("qa.askIntro")}
          />
          <div className="mt-5 space-y-4">
            <Field
              label={t("qa.questionField")}
              htmlFor="ask-title"
              required
              error={titleError ? "প্রশ্নটি অন্তত একটি বাক্যে স্পষ্টভাবে লিখুন (১২ অক্ষরের বেশি)।" : undefined}
              hint={
                titleError
                  ? undefined
                  : "এক লাইনে আপনার মূল প্রশ্নটি লিখুন — যেমন \"ব্যাংকের সুদ থেকে বাঁচতে কী করব?\""
              }
            >
              <Input
                id="ask-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="আপনার প্রশ্নটি এক লাইনে লিখুন…"
                maxLength={160}
                aria-invalid={titleError || undefined}
              />
            </Field>

            <Field
              label={t("qa.detailsField")}
              htmlFor="ask-details"
              hint={t("qa.detailsHelp")}
            >
              <Textarea
                id="ask-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="পরিস্থিতি, স্থান বা প্রেক্ষাপট লিখুন — এতে উত্তর আরও নির্ভুল হবে…"
                rows={7}
              />
            </Field>

            <div className="rounded-card border border-border bg-surface-2 p-4">
              <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-foreground">
                <Sparkles className="size-4 text-accent" aria-hidden />
                {t("label.askingTips")}
              </p>
              <ul className="mt-3 space-y-2">
                {ASKING_TIPS.map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
                    <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* 2 — departments (the routing key) */}
        <Card>
          <CardHeader
            icon={Building2}
            title={t("qa.chooseDepartment")}
            subtitle={
              isBn
                ? "সংশ্লিষ্ট বিভাগ বেছে নিলে সেই বিভাগের আলেমরা অগ্রাধিকার পাবেন — এটিই প্রশ্ন পাঠানোর মূল ভিত্তি"
                : "Choosing the right departments routes your question to the relevant scholars first"
            }
          />
          <div className="mt-5 space-y-4">
            {departmentsError ? (
              <p className="flex items-center gap-2 rounded-xl bg-danger-soft px-3 py-2 text-[0.8125rem] font-medium text-danger-soft-foreground">
                <AlertCircle className="size-4 shrink-0" aria-hidden />
                অন্তত একটি বিভাগ নির্বাচন করুন।
              </p>
            ) : null}

            <ChipList label={t("label.departments")} className="flex-wrap">
              {DEPARTMENTS.map((department) => {
                const selected = departments.includes(department.slug);
                return (
                  <Chip
                    key={department.slug}
                    size="md"
                    tone={department.tone}
                    active={selected}
                    onClick={() => toggleDepartment(department.slug)}
                  >
                    {pick(department.name)}
                    {selected ? <CheckCircle2 className="size-3.5" aria-hidden /> : null}
                  </Chip>
                );
              })}
            </ChipList>

            {departments.length > 1 ? (
              <div className="rounded-xl border border-border bg-surface-2 p-3.5">
                <p className="text-[0.75rem] font-semibold text-foreground">
                  প্রধান বিভাগ কোনটি?
                </p>
                <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-muted-foreground">
                  প্রধান বিভাগের আলেমদের অগ্রাধিকার একটু বেশি দেওয়া হয়।
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {departments.map((slug) => {
                    const department = getDepartment(slug);
                    if (!department) return null;
                    return (
                      <Chip
                        key={slug}
                        size="sm"
                        tone={department.tone}
                        active={primary === slug}
                        onClick={() => setPrimary(slug)}
                      >
                        {pick(department.shortName)}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        {/* 3 — visibility */}
        <Card>
          <CardHeader
            icon={Shield}
            title={t("label.visibility")}
            subtitle={t("qa.visibilityHelp")}
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <RadioCard
              name="visibility"
              value="public"
              label={t("label.public")}
              description={
                isBn
                  ? "আপনার নাম ও জেলা প্রকাশিত হবে — অন্যরা উপকৃত হতে পারবেন"
                  : "Your name and district are shown"
              }
              icon={UserRound}
              defaultChecked
            />
            <RadioCard
              name="visibility"
              value="anonymous"
              label={t("label.anonymous")}
              description={
                isBn
                  ? "আপনার পরিচয় গোপন থাকবে, প্রশ্নটি প্রকাশ্য থাকবে"
                  : "Your identity stays hidden"
              }
              icon={Eye}
            />
            <RadioCard
              name="visibility"
              value="private"
              label={t("label.private")}
              description={
                isBn
                  ? "শুধু উত্তরদাতা আলেম আপনার প্রশ্নটি দেখবেন"
                  : "Only the answering scholar sees it"
              }
              icon={Lock}
            />
          </div>
        </Card>

        {/* 4 — options */}
        <Card>
          <CardHeader icon={Scale} title="অতিরিক্ত অপশন" subtitle="প্রযোজ্য হলে বেছে নিন" />
          <div className="mt-5 space-y-3">
            <Checkbox
              id="ask-fatwa"
              checked={fatwaRequested}
              onChange={(event) => setFatwaRequested(event.target.checked)}
              label={t("qa.requestFatwa")}
              description={
                isBn
                  ? "ব্যক্তিগত আমল বা লেনদেনের বিষয়ে আনুষ্ঠানিক ফিকহি রায় প্রয়োজন হলে এটি বেছে নিন।"
                  : "Choose this when you need a formal fiqhi ruling with evidence."
              }
            />
            <Checkbox
              id="ask-urgent"
              checked={urgent}
              onChange={(event) => setUrgent(event.target.checked)}
              label={t("qa.markUrgent")}
              description={
                isBn
                  ? "শুধু সত্যিই সময়সীমা থাকলে — যেমন আসন্ন বিবাহ, চুক্তি বা চিকিৎসা সিদ্ধান্ত।"
                  : "Only when a real deadline exists — a wedding, contract or treatment decision."
              }
            />
          </div>
        </Card>

        {/* submit */}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" icon={Send}>
            {t("action.submit")}
          </Button>
          <Button variant="outline" size="lg">
            {t("action.saveDraft")}
          </Button>
          <p className="text-[0.75rem] text-subtle-foreground">
            জমা দেওয়ার আগে প্রশ্নটি আরেকবার পড়ে নিন — স্পষ্ট প্রশ্ন মানে নির্ভুল উত্তর।
          </p>
        </div>

        {submitted ? (
          <Callout
            tone="success"
            icon={CheckCircle2}
            title="আপনার প্রশ্নের খসড়া প্রস্তুত"
            action={<Button href="/questions" variant="outline" size="sm">{isBn ? "প্রশ্নে যান" : "Go to Q&A"}</Button>}
          >
            {isBn
              ? `নিচে দেখুন আপনার প্রশ্নটি কোন আলেমদের কাছে পাঠানো হবে (${toBnDigits(ranked.length)} জন)। প্ল্যাটফর্মের ব্যাকএন্ড চালু হলে জমা দেওয়া প্রশ্ন সরাসরি এই তালিকার প্রথম আলেমদের কাছে পৌঁছাবে।`
              : `Below is the scholar priority list your question would be routed to. Once the backend is live, submitting will deliver it to the top-ranked scholars.`}
          </Callout>
        ) : null}
      </form>

      {/* ------------------------------------------------------------ rail */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {/* Live routing preview */}
        <Card variant="parchment">
          <CardHeader
            icon={Sparkles}
            tone="accent"
            title={t("admin.routingPreview")}
            subtitle={t("admin.routingPreviewHelp")}
          />

          {departments.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border-strong bg-surface-2/70 p-3.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
              বিভাগ নির্বাচন করলে এখানে দেখতে পাবেন আপনার প্রশ্নটি সবার আগে কোন আলেমদের কাছে যাবে এবং কেন।
            </p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {departments.map((slug) => {
                  const department = getDepartment(slug);
                  if (!department) return null;
                  return (
                    <Chip key={slug} size="sm" tone={department.tone} active={primary === slug}>
                      {pick(department.name)}
                    </Chip>
                  );
                })}
              </div>

              <ol className="mt-4 space-y-3 border-t border-border pt-4">
                {ranked.map((item, index) => (
                  <li key={item.scholar.id} className="rounded-xl border border-border bg-surface p-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={
                          index === 0
                            ? "grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[0.6875rem] font-bold tabular text-primary-foreground"
                            : "grid size-6 shrink-0 place-items-center rounded-full bg-surface-3 text-[0.6875rem] font-bold tabular text-muted-foreground"
                        }
                      >
                        {toBnDigits(index + 1)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[0.8125rem] font-semibold text-foreground">
                            {pick(item.scholar.honorific)} {pick(item.scholar.name)}
                          </span>
                          {item.scholar.verified ? (
                            <BadgeCheck className="size-3.5 shrink-0 text-primary" aria-hidden />
                          ) : null}
                        </span>
                        <span className="mt-0.5 block truncate text-[0.6875rem] text-subtle-foreground">
                          {pick(item.scholar.madrasah)}
                        </span>
                      </span>
                    </div>
                    <MatchScoreBar score={item.score} className="mt-2.5" />
                    <ul className="mt-2.5 space-y-1">
                      {item.reasons.slice(0, 2).map((reason) => (
                        <li
                          key={reason}
                          className="flex items-start gap-1.5 text-[0.6875rem] leading-relaxed text-muted-foreground"
                        >
                          <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-success" aria-hidden />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>

              {waitEstimate ? (
                <p className="mt-4 flex items-start gap-2 border-t border-border pt-3.5 text-[0.75rem] leading-relaxed text-muted-foreground">
                  <Clock className="mt-0.5 size-3.5 shrink-0 text-info" aria-hidden />
                  <span>
                    <span className="font-semibold text-foreground">{t("qa.waitTime")}: </span>
                    সাধারণত {toBnDigits(waitEstimate.fastest)}–{toBnDigits(waitEstimate.slowest)} ঘণ্টা।
                    এটি কেবল আলেমদের পূর্ববর্তী সাড়ার ভিত্তিতে একটি ধারণা, কোনো প্রতিশ্রুতি নয়।
                  </span>
                </p>
              ) : null}
            </>
          )}
        </Card>

        {/* Under-review note */}
        {urgent ? (
          <Callout tone="danger" icon={Zap} title="জরুরি হিসেবে চিহ্নিত">
            জরুরি প্রশ্ন তালিকার শীর্ষে দেখানো হয়, তবে সব প্রশ্নের উত্তর দেওয়া যায় না —
            আরামদায়ক সময়ে প্রশ্ন করলে উত্তর পাওয়ার সম্ভাবনা বেশি।
          </Callout>
        ) : null}

        {fatwaRequested ? (
          <Callout tone="accent" icon={Scale} title="ফতোয়া চাওয়া হয়েছে">
            ফতোয়ার জন্য মুফতির যোগ্যতা ও সময় প্রয়োজন। ফতোয়া হিসেবে প্রকাশিত হলে তা
            ফতোয়া সংকলনে যুক্ত হবে, যাতে অন্যরাও উপকৃত হন।
          </Callout>
        ) : null}

        {/* Adab of asking */}
        <Card>
          <CardHeader icon={Sparkles} title="প্রশ্ন করার আদব" />
          <ul className="mt-4 space-y-2.5">
            {[
              "ইখলাসের সাথে প্রশ্ন করুন — উদ্দেশ্য যেন সত্য জানা হয়, নিজের মত প্রমাণ নয়।",
              "যে প্রশ্নের উত্তর আপনি নিজে খুঁজে নিতে পারেন, আগে তা করার চেষ্টা করুন।",
              "দলিল চাইলে প্রশ্নেই উল্লেখ করুন — তখন উত্তরটিও দলিলসহ আসবে।",
              "আলেমের উত্তরের ওপর আস্থা রাখুন, তবে ব্যক্তিগত গুরুত্বপূর্ণ বিষয়ে সরাসরি পরামর্শ নিন।",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-3.5 text-[0.6875rem] leading-relaxed text-subtle-foreground">
            {t("misc.footerDisclaimer")}
          </p>
        </Card>

        {ranked.length > 0 ? (
          <div className="space-y-2.5">
            {ranked.slice(0, 2).map((item) => (
              <ScholarMiniCard key={item.scholar.id} scholar={item.scholar} />
            ))}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

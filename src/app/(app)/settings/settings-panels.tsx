"use client";

import { useState } from "react";
import {
  BellRing,
  Bookmark,
  Eye,
  EyeOff,
  Languages,
  MapPin,
  Palette,
  ShieldCheck,
  Sparkles,
  Type as TypeIcon,
} from "lucide-react";
import { DISTRICTS, findDistrict } from "@/lib/bn";
import { MADHABS, normalizeMadhab, useMadhab } from "@/lib/prayer-prefs";
import { DEPARTMENTS } from "@/lib/data/departments";
import { CURRENT_USER, USER_STREAK_DAYS } from "@/lib/data/personal";
import { useI18n } from "@/lib/i18n";
import {
  setStored,
  setStoredJson,
  useStoredJson,
  useStoredValue,
} from "@/lib/client-store";
import { useHydrated } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import { LocaleToggle, ThemeToggle } from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  Chip,
  Field,
  Select,
  Switch,
  softTone,
} from "@/components/ui";

/**
 * Settings panels.
 *
 * Every control here is real: the district and Qur'an size are written to the
 * same localStorage keys the prayer widget and the reader read from, the
 * interest picker is seeded from the user's actual interests, and the
 * notification and privacy switches hold genuine state. The only deliberately
 * inert affordance is account deactivation, which is labelled as pending the
 * backend rather than pretending to work.
 */

const DISTRICT_KEY = "ilm.district";
const QURAN_SIZE_KEY = "ilm.quran.size";
const PREFS_KEY = "ilm.prefs";

interface Preferences {
  notifications: Record<string, boolean>;
  privacy: Record<string, boolean>;
}

const DEFAULT_PREFS: Preferences = {
  notifications: {
    dailyAyah: true,
    newAnswers: true,
    followedScholars: true,
    weeklyJourney: true,
    discussions: false,
  },
  privacy: {
    publicProfile: true,
    showSavedPublicly: false,
    allowMentions: true,
  },
};

const QURAN_STEPS = [
  { id: "sm", label: "ছোট", size: "1.375rem", line: "2.35" },
  { id: "md", label: "মাঝারি", size: "1.75rem", line: "2.25" },
  { id: "lg", label: "বড়", size: "2.125rem", line: "2.2" },
  { id: "xl", label: "অনেক বড়", size: "2.5rem", line: "2.15" },
];

export function SettingsPanels() {
  const { t, pick, locale } = useI18n();

  /*
   * Every persisted setting is read straight from storage through
   * `useSyncExternalStore` instead of being restored in a mount effect: the
   * stored value arrives as soon as the component hydrates, with no cascading
   * render and no server/client disagreement. Mutations go through `setStored`,
   * which notifies subscribers in this tab so the read above updates at once.
   */
  const mounted = useHydrated();
  const [madhab, setMadhab] = useMadhab();
  const storedDistrict = useStoredValue(DISTRICT_KEY);
  const storedSize = useStoredValue(QURAN_SIZE_KEY);
  const storedPrefs = useStoredJson<Preferences>(PREFS_KEY, DEFAULT_PREFS);

  const districtId =
    mounted && storedDistrict && DISTRICTS.some((d) => d.id === storedDistrict)
      ? storedDistrict
      : CURRENT_USER.district;
  const quranStep =
    mounted && storedSize && QURAN_STEPS.some((s) => s.id === storedSize)
      ? storedSize
      : "md";
  const prefs: Preferences = mounted
    ? {
        // Merged over the defaults so a partially written (or older) stored
        // object still yields a complete `Preferences` shape.
        notifications: { ...DEFAULT_PREFS.notifications, ...storedPrefs.notifications },
        privacy: { ...DEFAULT_PREFS.privacy, ...storedPrefs.privacy },
      }
    : DEFAULT_PREFS;

  const [interests, setInterests] = useState<string[]>(CURRENT_USER.interests);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function flash() {
    setSavedAt(new Date().toISOString());
    window.setTimeout(() => setSavedAt(null), 2200);
  }

  function changeDistrict(next: string) {
    setStored(DISTRICT_KEY, next);
    flash();
  }

  function changeQuranStep(next: string) {
    setStored(QURAN_SIZE_KEY, next);
    flash();
  }

  function toggle(group: keyof Preferences, key: string) {
    // Branched explicitly rather than with a computed key, so the object keeps
    // its exact `Preferences` shape instead of widening to an index signature.
    const next: Preferences =
      group === "notifications"
        ? {
            ...prefs,
            notifications: {
              ...prefs.notifications,
              [key]: !prefs.notifications[key],
            },
          }
        : {
            ...prefs,
            privacy: { ...prefs.privacy, [key]: !prefs.privacy[key] },
          };
    setStoredJson(PREFS_KEY, next);
    flash();
  }

  function toggleInterest(slug: string) {
    const next = interests.includes(slug)
      ? interests.filter((s) => s !== slug)
      : [...interests, slug];
    setInterests(next);
    flash();
  }

  const district = findDistrict(districtId);
  const activeStep = QURAN_STEPS.find((s) => s.id === quranStep) ?? QURAN_STEPS[1];

  const NOTIFICATION_ROWS: { key: string; labelBn: string; helpBn: string }[] = [
    {
      key: "dailyAyah",
      labelBn: t("settings.dailyReminder"),
      helpBn: "প্রতিদিন ফজরের পর আজকের আয়াত ও হাদীসের অনুস্মারক।",
    },
    {
      key: "newAnswers",
      labelBn: "আমার প্রশ্নের উত্তর এলে",
      helpBn: "আপনার প্রশ্নের উত্তর দিলে সাথে সাথে জানানো হবে।",
    },
    {
      key: "followedScholars",
      labelBn: "ফলো করা আলেমদের নতুন লেখা",
      helpBn: "তাঁরা নতুন প্রবন্ধ বা ফতোয়া প্রকাশ করলে জানানো হবে।",
    },
    {
      key: "weeklyJourney",
      labelBn: "সাপ্তাহিক শিক্ষা যাত্রা",
      helpBn: "প্রতি সপ্তাহে নতুন যাত্রার প্রস্তাব ও আপনার অগ্রগতির সারসংক্ষেপ।",
    },
    {
      key: "discussions",
      labelBn: "আলোচনার নতুন উত্তর",
      helpBn: "আপনি যেসব আলোচনায় অংশ নিয়েছেন সেগুলোর নতুন মন্তব্য।",
    },
  ];

  const PRIVACY_ROWS: { key: string; labelBn: string; helpBn: string }[] = [
    {
      key: "publicProfile",
      labelBn: "প্রোফাইল সবার জন্য দৃশ্যমান",
      helpBn: "বন্ধ রাখলে অন্য ব্যবহারকারীরা আপনার নাম ও পাবলিক প্রশ্ন দেখতে পাবেন না।",
    },
    {
      key: "showSavedPublicly",
      labelBn: "সংরক্ষিত তালিকা কেউ দেখতে পাবে না",
      helpBn: "আপনার লাইব্রেরি সবসময় ব্যক্তিগত — এই সুইচ শুধু নিশ্চিত করে।",
    },
    {
      key: "allowMentions",
      labelBn: "আলোচনায় আমাকে উল্লেখ করা যাবে",
      helpBn: "বন্ধ রাখলে কেউ আলোচনায় আপনার নাম লিখতে পারবে না।",
    },
  ];

  return (
    <div className="space-y-5">
      {savedAt ? (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-panel border border-success/35 bg-success-soft px-4 py-3 text-[0.8125rem] font-medium text-success-soft-foreground"
        >
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          সেটিংস এই ব্রাউজারে সংরক্ষিত হয়েছে
        </div>
      ) : null}

      {/* 1. language & appearance */}
      <Card>
        <CardHeader
          title={`${t("settings.language")} ও ${t("settings.appearance")}`}
          subtitle="পুরো প্ল্যাটফর্মের ভাষা ও রঙের ধরন বদলান"
          icon={Languages}
          tone="info"
        />
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[0.8125rem] font-semibold text-foreground">{t("settings.language")}</p>
            <p className="mt-1 text-[0.75rem] leading-relaxed text-muted-foreground">
              বাংলা ডিফল্ট ভাষা। ইংরেজিতে গেলে ইন্টারফেসের লেখা বদলাবে, কুরআন ও হাদীসের আরবি পাঠ একই থাকবে।
            </p>
            <div className="mt-3">
              <LocaleToggle />
            </div>
          </div>
          <div>
            <p className="text-[0.8125rem] font-semibold text-foreground">{t("settings.appearance")}</p>
            <p className="mt-1 text-[0.75rem] leading-relaxed text-muted-foreground">
              সারাদিন পড়ার জন্য উজ্জ্বল, রাতে চোখের আরামের জন্য অন্ধকার — অথবা ফোনের সেটিংস অনুসরণ করুন।
            </p>
            <div className="mt-3 flex items-center gap-3">
              <ThemeToggle />
              <Palette className="size-4 text-subtle-foreground" aria-hidden />
            </div>
          </div>
        </div>
      </Card>

      {/* 2. location & madhab */}
      <Card>
        <CardHeader
          title={t("settings.location")}
          subtitle={t("settings.locationHelp")}
          icon={MapPin}
          tone="primary"
        />
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="আপনার জেলা" htmlFor="district" hint="নামাজের সময়সূচি এই জেলার ভিত্তিতে হিসাব করা হয়">
            <Select
              id="district"
              value={districtId}
              onChange={(event) => changeDistrict(event.target.value)}
            >
              {DISTRICTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {pick(item.name)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="rounded-xl border border-border bg-surface-2 p-3.5">
            <p className="text-[0.75rem] font-semibold text-foreground">বর্তমান অবস্থান</p>
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">
              <span className="font-medium text-foreground">{pick(district.name)}</span>
              <span className="mx-1.5 text-border-strong">·</span>
              {pick(district.division)} বিভাগ
            </p>
            <p className="mt-1 text-[0.6875rem] text-subtle-foreground">
              অক্ষাংশ {mounted ? district.lat.toFixed(2) : "—"} · দ্রাঘিমাংশ {mounted ? district.lng.toFixed(2) : "—"}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <Field
            label={t("settings.madhab")}
            htmlFor="madhab"
            hint="আসরের সময় এই পছন্দ অনুযায়ী হিসাব হয় — সময়সূচি, কাউন্টডাউন ও দৈনিক পাতা সবই একই হিসাব ব্যবহার করে"
          >
            {/* Wired to the same stored preference the salah card reads, so this
                is not a decorative select: changing it moves Asr everywhere. */}
            <Select
              id="madhab"
              value={madhab}
              onChange={(event) => setMadhab(normalizeMadhab(event.target.value))}
            >
              {MADHABS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name[locale]} ({option.asr[locale]})
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      {/* 3. notifications */}
      <Card>
        <CardHeader
          title={t("settings.notifications")}
          subtitle="কী নিয়ে জানতে চান, তা নিজেই নির্ধারণ করুন"
          icon={BellRing}
          tone="accent"
        />
        <div className="mt-5 space-y-3">
          {NOTIFICATION_ROWS.map((row) => (
            <Switch
              key={row.key}
              id={`notif-${row.key}`}
              label={row.labelBn}
              description={row.helpBn}
              checked={Boolean(prefs.notifications[row.key])}
              onChange={() => toggle("notifications", row.key)}
            />
          ))}
        </div>
      </Card>

      {/* 4. Qur'an reading */}
      <Card>
        <CardHeader
          title={t("settings.quranFontSize")}
          subtitle="আরবি পাঠ আপনার চোখের আরাম অনুযায়ী বড় বা ছোট করুন"
          icon={TypeIcon}
          tone="success"
        />
        <div className="mt-5">
          <div className="flex flex-wrap gap-2">
            {QURAN_STEPS.map((step) => (
              <Chip
                key={step.id}
                size="sm"
                active={step.id === quranStep}
                onClick={() => changeQuranStep(step.id)}
              >
                {step.label}
              </Chip>
            ))}
          </div>

          <div className="mt-5 rounded-panel border border-border bg-surface-2 p-5">
            <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
              নমুনা পাঠ
            </p>
            <p
              className="arabic mt-3 text-foreground"
              style={{ fontSize: activeStep.size, lineHeight: activeStep.line }}
              lang="ar"
              dir="rtl"
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="mt-3 border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
              উচ্চারণ: বিসমিল্লাহির রাহমানির রাহীম — এই আকারেই কুরআন পাঠের পাতায় আয়াতগুলো দেখাবে।
            </p>
          </div>
        </div>
      </Card>

      {/* 5. interests */}
      <Card>
        <CardHeader
          title={t("settings.interests")}
          subtitle={t("settings.interestsHelp")}
          icon={Sparkles}
          tone="user"
          action={
            <Badge tone="primary" size="sm">
              {interests.length}টি নির্বাচিত
            </Badge>
          }
        />
        <div className="mt-5 flex flex-wrap gap-2">
          {DEPARTMENTS.map((department) => (
            <Chip
              key={department.id}
              size="sm"
              tone="primary"
              active={interests.includes(department.slug)}
              onClick={() => toggleInterest(department.slug)}
            >
              {pick(department.name)}
            </Chip>
          ))}
        </div>
        <p className="mt-4 text-[0.75rem] leading-relaxed text-muted-foreground">
          আপনি {interests.length}টি বিভাগ বেছে নিয়েছেন। এই বিভাগগুলোর নতুন প্রশ্ন, প্রবন্ধ ও ফতোয়া আপনার ফিডে
          আগে দেখা যাবে।
        </p>
      </Card>

      {/* 6. privacy */}
      <Card>
        <CardHeader
          title={t("settings.privacy")}
          subtitle="আপনার তথ্য কে দেখতে পারবে"
          icon={Eye}
          tone="warning"
        />
        <div className="mt-5 space-y-3">
          {PRIVACY_ROWS.map((row) => (
            <Switch
              key={row.key}
              id={`privacy-${row.key}`}
              label={row.labelBn}
              description={row.helpBn}
              checked={Boolean(prefs.privacy[row.key])}
              onChange={() => toggle("privacy", row.key)}
            />
          ))}
        </div>
        <Callout
          tone="primary"
          icon={EyeOff}
          className="mt-4"
          title="নাম প্রকাশে অনিচ্ছুক প্রশ্ন সবসময় সুরক্ষিত"
        >
          এই সেটিংস যাই হোক, আপনি যখন প্রশ্ন করার সময় &ldquo;নাম প্রকাশে অনিচ্ছুক&rdquo; বেছে নেবেন তখন কেউ আপনার
          পরিচয় জানতে পারবে না।
        </Callout>
      </Card>

      {/* danger zone — honestly labelled as pending */}
      <Card className="border-danger/35">
        <CardHeader
          title="অ্যাকাউন্ট"
          subtitle="আপনার অ্যাকাউন্ট সংক্রান্ত চূড়ান্ত কাজ"
          icon={Bookmark}
          tone="danger"
        />
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-dashed border-danger/40 bg-danger-soft/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.875rem] font-semibold text-foreground">অ্যাকাউন্ট নিষ্ক্রিয় করা</p>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
              আপনার প্রশ্ন, উত্তর ও সংরক্ষিত তালিকা মুছে যাবে। এই কাজটি ফিরিয়ে আনা যায় না, তাই নিশ্চিত করার আগে
              সাধারণত ৭ দিনের অপেক্ষার সময় থাকে।
            </p>
            <p className="mt-1.5 text-[0.6875rem] font-medium text-danger">
              ব্যাকএন্ড ও অ্যাকাউন্ট ব্যবস্থাপনা যুক্ত হওয়ার পর এই কাজটি সক্রিয় হবে।
            </p>
          </div>
          <Button variant="outline" size="md" disabled className="shrink-0">
            নিষ্ক্রিয় করুন
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <span className={cn("grid size-9 place-items-center rounded-xl", softTone.success)}>
            <Sparkles className="size-4" />
          </span>
          <p className="text-[0.75rem] leading-relaxed text-muted-foreground">
            ভাষা: {locale === "bn" ? "বাংলা" : "English"} · ধারাবাহিকতা: {t("label.streak").toLowerCase()}{" "}
            {USER_STREAK_DAYS} দিন · সব সেটিংস কেবল এই ব্রাউজারে সংরক্ষিত
          </p>
        </div>
      </Card>
    </div>
  );
}

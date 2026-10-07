"use client";

import { useState } from "react";
import { Check, Globe, Info, Plus, Save, Sparkles } from "lucide-react";
import type { Localized, Scholar } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { toParagraphs } from "@/lib/utils";
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
  Prose,
  SectionHeader,
  Switch,
  Textarea,
} from "@/components/ui";

/**
 * Bilingual bio.
 *
 * The bio is a `Localized` field and this is a client leaf, so the text follows
 * the Bangla/English toggle even though the profile page itself is a server
 * component.
 */
export function BioProse({ bio }: { bio: Localized }) {
  const { pick } = useI18n();
  return <Prose paragraphs={toParagraphs(pick(bio))} />;
}

const FIQH_LABELS: Record<string, Localized> = {
  hanafi: { bn: "হানাফী", en: "Hanafi" },
  general: { bn: "সাধারণ", en: "General" },
  usul: { bn: "উসুলুল ফিকহ", en: "Usul al-Fiqh" },
  comparative: { bn: "তুলনামূলক", en: "Comparative" },
};

/**
 * Profile editing. Every control responds and persists to local state so the
 * interaction is real; the save action is explicitly marked as pending the
 * backend rather than pretending to publish.
 */
export function ProfileEditor({ scholar }: { scholar: Scholar }) {
  const { t, pick } = useI18n();

  const [shortBio, setShortBio] = useState(pick(scholar.shortBio));
  const [available, setAvailable] = useState(scholar.availableForQuestions);
  const [specialisations, setSpecialisations] = useState<string[]>(
    scholar.specialization.map((item) => item.bn),
  );
  const [languages, setLanguages] = useState<string[]>(scholar.languages);
  const [newSpecialisation, setNewSpecialisation] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader
        icon={Sparkles}
        tone="accent"
        title="প্রোফাইল সম্পাদনা"
        subtitle="পাঠকরা যা দেখবেন তা এখান থেকে হালনাগাদ করুন"
        action={
          <Button
            size="sm"
            icon={Save}
            onClick={() => setNotice("পরিবর্তনগুলো সংরক্ষিত হয়েছে (ব্রাউজারে) — ব্যাকএন্ড যুক্ত হলে সার্ভারে যাবে।")}
          >
            সংরক্ষণ
          </Button>
        }
      />

      {notice ? (
        <Callout tone="success" className="mt-4">
          <span className="flex items-center gap-2">
            <Check className="size-3.5" aria-hidden />
            {notice}
          </span>
        </Callout>
      ) : null}

      <div className="mt-5 space-y-5">
        <Field
          label="সংক্ষিপ্ত পরিচয়"
          htmlFor="short-bio"
          hint="এক লাইনে আপনার পরিচয় — প্রোফাইল কার্ডে এটিই দেখানো হয়।"
        >
          <Textarea
            id="short-bio"
            value={shortBio}
            onChange={(event) => setShortBio(event.target.value)}
            className="min-h-20"
          />
        </Field>

        <div>
          <SectionHeader
            size="sm"
            icon={Sparkles}
            title="বিশেষজ্ঞতা"
            description="যে বিষয়ে আপনি নির্ভরযোগ্যভাবে উত্তর দিতে পারেন"
            className="mb-3"
          />
          <ChipList label="বিশেষজ্ঞতা">
            {specialisations.map((item) => (
              <Chip key={item} tone="primary" onRemove={() => setSpecialisations((prev) => prev.filter((x) => x !== item))}>
                {item}
              </Chip>
            ))}
          </ChipList>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <Field label="নতুন বিশেষজ্ঞতা" htmlFor="new-spec" className="min-w-52 flex-1">
              <Input
                id="new-spec"
                value={newSpecialisation}
                onChange={(event) => setNewSpecialisation(event.target.value)}
                placeholder="যেমন: উত্তরাধিকার ও ফারায়েজ"
              />
            </Field>
            <Button
              variant="outline"
              size="md"
              icon={Plus}
              disabled={newSpecialisation.trim().length < 2}
              onClick={() => {
                const value = newSpecialisation.trim();
                if (value.length < 2) return;
                setSpecialisations((prev) => (prev.includes(value) ? prev : [...prev, value]));
                setNewSpecialisation("");
              }}
            >
              যোগ করুন
            </Button>
          </div>
        </div>

        <div>
          <SectionHeader
            size="sm"
            icon={Globe}
            title={t("label.languages")}
            description="যে ভাষায় আপনি উত্তর দিতে স্বচ্ছন্দ"
            className="mb-3"
          />
          <ChipList label={t("label.languages")}>
            {languages.map((language) => (
              <Chip key={language} onRemove={() => setLanguages((prev) => prev.filter((x) => x !== language))}>
                {language}
              </Chip>
            ))}
          </ChipList>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <Field label="নতুন ভাষা" htmlFor="new-language" className="min-w-40 flex-1">
              <Input
                id="new-language"
                value={newLanguage}
                onChange={(event) => setNewLanguage(event.target.value)}
                placeholder="যেমন: ফারসি"
              />
            </Field>
            <Button
              variant="outline"
              size="md"
              icon={Plus}
              disabled={newLanguage.trim().length < 2}
              onClick={() => {
                const value = newLanguage.trim();
                if (value.length < 2) return;
                setLanguages((prev) => (prev.includes(value) ? prev : [...prev, value]));
                setNewLanguage("");
              }}
            >
              যোগ করুন
            </Button>
          </div>
        </div>

        <div>
          <SectionHeader size="sm" icon={Info} title="ফিকহি পদ্ধতি" className="mb-3" />
          <div className="flex flex-wrap gap-1.5">
            {scholar.fiqhFocus.map((focus) => (
              <Badge key={focus} tone="info" size="sm">
                {FIQH_LABELS[focus] ? pick(FIQH_LABELS[focus]) : focus}
              </Badge>
            ))}
          </div>
        </div>

        <Switch
          id="available-toggle"
          label={t("label.available")}
          description="বন্ধ রাখলে নতুন প্রশ্ন আপনার কাছে রাউট হবে না, তবে বিদ্যমান প্রশ্ন দেখা যাবে।"
          checked={available}
          onChange={(next) => {
            setAvailable(next);
            setNotice(
              next
                ? "এখন নতুন প্রশ্ন গ্রহণ করছেন।"
                : "প্রশ্ন গ্রহণ বন্ধ করা হয়েছে — বিদ্যমান প্রশ্ন আগের মতোই থাকবে।",
            );
          }}
        />

        <Callout tone="info">
          <p className="text-[0.8125rem] leading-relaxed">
            নাম, মাদরাসা ও শিক্ষাগত যোগ্যতা পরিবর্তন করতে অ্যাডমিনের অনুমোদন প্রয়োজন,
            কারণ সেগুলো যাচাইকৃত তথ্য। বিভাগ পরিবর্তনের আবেদনও অ্যাডমিন প্যানেল থেকে
            নিশ্চিত করা হয়।
          </p>
        </Callout>
      </div>
    </Card>
  );
}

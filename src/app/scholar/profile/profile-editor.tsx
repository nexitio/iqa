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
        title={t("scholar.tools.profile.editTitle")}
        subtitle={t("scholar.tools.profile.editSubtitle")}
        action={
          <Button
            size="sm"
            icon={Save}
            onClick={() => setNotice(t("scholar.tools.profile.savedNotice"))}
          >
            {t("action.save")}
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
          label={t("scholar.tools.profile.shortBioLabel")}
          htmlFor="short-bio"
          hint={t("scholar.tools.profile.shortBioHint")}
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
            title={t("scholar.tools.profile.specializationTitle")}
            description={t("scholar.tools.profile.specializationDescription")}
            className="mb-3"
          />
          <ChipList label={t("scholar.tools.profile.specializationTitle")}>
            {specialisations.map((item) => (
              <Chip key={item} tone="primary" onRemove={() => setSpecialisations((prev) => prev.filter((x) => x !== item))}>
                {item}
              </Chip>
            ))}
          </ChipList>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <Field
              label={t("scholar.tools.profile.newSpecializationLabel")}
              htmlFor="new-spec"
              className="min-w-52 flex-1"
            >
              <Input
                id="new-spec"
                value={newSpecialisation}
                onChange={(event) => setNewSpecialisation(event.target.value)}
                placeholder={t("scholar.tools.profile.newSpecializationPlaceholder")}
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
              {t("action.add")}
            </Button>
          </div>
        </div>

        <div>
          <SectionHeader
            size="sm"
            icon={Globe}
            title={t("label.languages")}
            description={t("scholar.tools.profile.languagesDescription")}
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
            <Field
              label={t("scholar.tools.profile.newLanguageLabel")}
              htmlFor="new-language"
              className="min-w-40 flex-1"
            >
              <Input
                id="new-language"
                value={newLanguage}
                onChange={(event) => setNewLanguage(event.target.value)}
                placeholder={t("scholar.tools.profile.newLanguagePlaceholder")}
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
              {t("action.add")}
            </Button>
          </div>
        </div>

        <div>
          <SectionHeader
            size="sm"
            icon={Info}
            title={t("scholar.tools.profile.fiqhTitle")}
            className="mb-3"
          />
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
          description={t("scholar.tools.profile.availabilityDescription")}
          checked={available}
          onChange={(next) => {
            setAvailable(next);
            setNotice(
              next
                ? t("scholar.tools.profile.availabilityOn")
                : t("scholar.tools.profile.availabilityOff"),
            );
          }}
        />

        <Callout tone="info">
          <p className="text-[0.8125rem] leading-relaxed">
            {t("scholar.tools.profile.adminApprovalNote")}
          </p>
        </Callout>
      </div>
    </Card>
  );
}

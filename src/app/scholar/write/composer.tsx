"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Eye,
  FileText,
  Loader2,
  MessageCircleQuestion,
  PenLine,
  Save,
  Scale,
  Send,
  Sparkles,
} from "lucide-react";
import type { ContentReference, Localized, ReferenceSuggestion } from "@/lib/types";
import { getSuggestionsForKeywords } from "@/lib/data/questions";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/bn";
import { cn, readingMinutes, relativeTime, toParagraphs } from "@/lib/utils";
import {
  AttachedReferenceList,
  ReferenceSuggester,
  RichTextEditor,
  SmartReferenceCounter,
  type RichTextEditorHandle,
} from "@/components/console";
import { ReferenceList } from "@/components/knowledge";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  Field,
  Input,
  Prose,
  RadioCard,
  SectionHeader,
  Textarea,
} from "@/components/ui";

/**
 * The composer.
 *
 * This is where the platform earns its claim to be a *writing* tool and not
 * just a reading one: as the scholar drafts, the reference panel recomputes from
 * the live text, so writing about interest or dowry immediately surfaces the
 * relevant verses and hadith with the reasoning behind each suggestion. A
 * citation is then attached in one click and appears in the attached list, and
 * the draft can be previewed exactly as a reader will see it.
 */

type DraftKind = "article" | "fatwa" | "answer";

/**
 * A suggestion carries the human-readable citation rather than a machine
 * reference, so `refBn` doubles as the attached reference's handle. Once the
 * backend owns references, this becomes a real foreign key.
 */
function toReference(suggestion: ReferenceSuggestion): ContentReference {
  return {
    id: suggestion.id,
    kind: suggestion.kind,
    ref: suggestion.refBn,
    arabic: suggestion.arabic,
    translationBn: suggestion.translationBn,
    refBn: suggestion.refBn,
    note: suggestion.reasonBn,
  };
}

export function Composer({
  scholarName,
  departmentNames,
  defaultKind = "article",
}: {
  /** The author's name, bilingual: the reader's language decides which half. */
  scholarName?: Localized;
  departmentNames: Localized[];
  /** The draft type the compose menu asked for, if it asked for one. */
  defaultKind?: DraftKind;
}) {
  const { t, tList, pick, locale } = useI18n();

  const editorRef = useRef<RichTextEditorHandle>(null);

  const [kind, setKind] = useState<DraftKind>(defaultKind);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [ruling, setRuling] = useState("");
  const [attached, setAttached] = useState<ContentReference[]>([]);
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "warning" | "info"; text: string } | null>(null);

  /* ------------------------------------------------------------- autosave */

  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!dirty) return;
    const id = window.setTimeout(() => {
      setSavedAt(new Date());
      setDirty(false);
    }, 900);
    return () => window.clearTimeout(id);
  }, [dirty, title, body, questionText, ruling]);

  /* --------------------------------------------------------- draft metrics */

  const draftText = `${title} ${body} ${ruling}`.trim();
  const suggestionCount = useMemo(
    () => (draftText.length < 3 ? 0 : getSuggestionsForKeywords(draftText).length),
    [draftText],
  );
  const wordCount = useMemo(
    () => body.trim().split(/\s+/).filter(Boolean).length,
    [body],
  );
  const minutes = readingMinutes(body);

  /**
   * Where every citation lands: the panel keeps the full verse beside the draft
   * so it can be verified — and removed — independently of the sentence it was
   * written into.
   */
  function attach(reference: ContentReference) {
    setAttached((prev) =>
      prev.some((existing) => existing.id === reference.id) ? prev : [...prev, reference],
    );
    setNotice({
      tone: "success",
      text: t("scholar.tools.composer.attachNotice", { ref: reference.refBn }),
    });
  }

  /**
   * The rail's suggestions do exactly what the editor's `#` picker does: the
   * citation goes into the sentence at the caret — with its Bangla meaning, so a
   * reader meets the evidence rather than a bare reference — *and* stays beside
   * the draft, because the editor reports it back through `attach`. Both roads end
   * in the same place. The card's quotation button asks for the same writer's
   * other form, the Arabic and translation as a block. When the editor is not
   * mounted (the preview is showing), there is nowhere to write, so the reference
   * is only attached.
   */
  function handleInsert(suggestion: ReferenceSuggestion, asQuote = false) {
    const reference = toReference(suggestion);
    if (editorRef.current) editorRef.current.insert(reference, asQuote);
    else attach(reference);
  }

  const canSubmit = title.trim().length > 3 && body.trim().length > 20;

  return (
    <div className="space-y-5">
      {/* Draft status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[0.75rem] text-subtle-foreground">
            {t("scholar.tools.composer.writingAs", {
              name: scholarName ? pick(scholarName) : t("scholar.core.scholarFallback"),
            })}
          </span>
          <Badge tone={kind === "fatwa" ? "accent" : kind === "answer" ? "info" : "primary"} icon={PenLine}>
            {kind === "fatwa" ? t("console.fatwaType") : kind === "answer" ? t("console.answerType") : t("console.articleType")}
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
            {dirty ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                {t("scholar.tools.composer.saving")}
              </>
            ) : savedAt ? (
              <>
                <Check className="size-3.5 text-success" aria-hidden />
                {t("console.savedAt")} · {relativeTime(savedAt.toISOString(), locale)}
              </>
            ) : (
              <>
                <Save className="size-3.5" aria-hidden />
                {t("scholar.tools.composer.autosaveHint")}
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[0.75rem] text-muted-foreground">
          <span className="tabular">
            {t("scholar.tools.composer.wordCount", { count: wordCount })}
          </span>
          <span aria-hidden>·</span>
          <span>
            {formatNumber(minutes, locale)} {t("label.minutes")}
          </span>
          <span aria-hidden>·</span>
          <span>
            {formatNumber(attached.length, locale)} {t("label.references")}
          </span>
        </div>
      </div>

      {notice ? (
        <Callout tone={notice.tone}>
          <span className="flex items-center gap-2">
            <Check className="size-3.5" aria-hidden />
            {notice.text}
          </span>
        </Callout>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
        {/* ------------------------------------------------------- editor */}
        <div className="min-w-0 space-y-5">
          <Card>
            <SectionHeader size="sm" icon={Sparkles} title={t("console.chooseType")} className="mb-3" />
            <div className="grid gap-3 sm:grid-cols-3">
              <RadioCard
                name="draft-kind"
                value="article"
                checked={kind === "article"}
                onChange={(value) => setKind(value as DraftKind)}
                icon={FileText}
                label={t("console.articleType")}
                description={t("scholar.tools.composer.articleTypeDescription")}
              />
              <RadioCard
                name="draft-kind"
                value="fatwa"
                checked={kind === "fatwa"}
                onChange={(value) => setKind(value as DraftKind)}
                icon={Scale}
                label={t("console.fatwaType")}
                description={t("scholar.tools.composer.fatwaTypeDescription")}
              />
              <RadioCard
                name="draft-kind"
                value="answer"
                checked={kind === "answer"}
                onChange={(value) => setKind(value as DraftKind)}
                icon={MessageCircleQuestion}
                label={t("console.answerType")}
                description={t("scholar.tools.composer.answerTypeDescription")}
              />
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              {kind === "fatwa" ? (
                <Field
                  label={t("scholar.tools.composer.questionField")}
                  htmlFor="draft-question"
                  hint={t("scholar.tools.composer.questionHint")}
                >
                  <Textarea
                    id="draft-question"
                    value={questionText}
                    onChange={(event) => {
                      setQuestionText(event.target.value);
                      setDirty(true);
                    }}
                    placeholder={t("scholar.tools.composer.questionPlaceholder")}
                    className="min-h-24"
                  />
                </Field>
              ) : null}

              <Field label={t("console.titleField")} htmlFor="draft-title" required>
                <Input
                  id="draft-title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setDirty(true);
                  }}
                  placeholder={
                    kind === "answer"
                      ? t("scholar.tools.composer.titlePlaceholderAnswer")
                      : t("scholar.tools.composer.titlePlaceholderDefault")
                  }
                />
              </Field>

              {kind === "fatwa" ? (
                <Field
                  label={t("scholar.tools.composer.rulingField")}
                  htmlFor="draft-ruling"
                  hint={t("scholar.tools.composer.rulingHint")}
                >
                  <Textarea
                    id="draft-ruling"
                    value={ruling}
                    onChange={(event) => {
                      setRuling(event.target.value);
                      setDirty(true);
                    }}
                    placeholder={t("scholar.tools.composer.rulingPlaceholder")}
                    className="min-h-24"
                  />
                </Field>
              ) : null}

              <Field
                label={t("console.bodyField")}
                htmlFor="draft-body"
                action={
                  <button
                    type="button"
                    onClick={() => setPreview((value) => !value)}
                    className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-primary transition-colors hover:text-primary-hover"
                  >
                    <Eye className="size-3.5" aria-hidden />
                    {preview ? t("scholar.tools.composer.backToEditing") : t("console.preview")}
                  </button>
                }
              >
                {preview ? (
                  <div className="rounded-xl border border-border bg-surface-2 p-5">
                    {body.trim().length > 0 ? (
                      <Prose paragraphs={toParagraphs(body)} />
                    ) : (
                      <p className="text-[0.8125rem] text-muted-foreground">
                        {t("scholar.tools.composer.previewEmpty")}
                      </p>
                    )}
                    {/* The evidence as a reader meets it — the same block the
                        published piece ends with, not a draft-only summary. */}
                    {attached.length > 0 ? (
                      <ReferenceList references={attached} className="mt-5" />
                    ) : null}
                  </div>
                ) : (
                  <RichTextEditor
                    ref={editorRef}
                    id="draft-body"
                    value={body}
                    onChange={(next) => {
                      setBody(next);
                      setDirty(true);
                    }}
                    onReference={attach}
                    placeholder={t("console.bodyPlaceholder")}
                  />
                )}
              </Field>
            </div>
          </Card>

          <Card>
            <SectionHeader
              size="sm"
              icon={BookOpen}
              title={t("scholar.tools.composer.departmentsTitle")}
              className="mb-3"
            />
            <div className="flex flex-wrap gap-1.5">
              {departmentNames.map((name) => (
                <Badge key={name.bn} tone="primary" size="xs">
                  {pick(name)}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground">
              {t("scholar.tools.composer.departmentsNote")}
            </p>
          </Card>
        </div>

        {/* --------------------------------------------------- reference rail */}
        <aside className="min-w-0 space-y-4">
          <SmartReferenceCounter
            attached={attached.length}
            suggested={suggestionCount}
          />

          <ReferenceSuggester draftText={draftText} onInsert={handleInsert} />

          <AttachedReferenceList
            references={attached}
            onRemove={(id) => {
              setAttached((prev) => prev.filter((reference) => reference.id !== id));
              setNotice({ tone: "info", text: t("scholar.tools.composer.removedNotice") });
            }}
          />

          <Card>
            <CardHeader
              icon={Sparkles}
              tone="accent"
              title={t("scholar.tools.composer.rulesTitle")}
              subtitle={t("scholar.tools.composer.rulesSubtitle")}
            />
            <ul className="mt-3 space-y-2.5">
              {tList("scholar.tools.composer.rules").map((rule) => (
                <li key={rule} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-success-soft text-success-soft-foreground">
                    <Check className="size-2.5" strokeWidth={3.4} aria-hidden />
                  </span>
                  <span className="text-[0.75rem] leading-relaxed text-muted-foreground">{rule}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-border pt-3">
              <Link
                href="/scholar/questions"
                className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-primary transition-colors hover:text-primary-hover"
              >
                <MessageCircleQuestion className="size-3.5" aria-hidden />
                {t("scholar.tools.composer.answerInstead")}
              </Link>
            </div>
          </Card>
        </aside>
      </div>

      {/* ------------------------------------------------------- action bar */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-panel border border-border bg-surface/95 px-4 py-3.5 shadow-raised backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[0.75rem] text-muted-foreground">
          <span className={cn("size-2 rounded-full", canSubmit ? "bg-success" : "bg-warning")} aria-hidden />
          {canSubmit
            ? t("scholar.tools.composer.readyToPublish")
            : t("scholar.tools.composer.notReady")}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Save}
            onClick={() => setNotice({ tone: "info", text: t("scholar.tools.composer.draftSavedNotice") })}
          >
            {t("action.saveDraft")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Send}
            disabled={!canSubmit}
            onClick={() =>
              setNotice({ tone: "warning", text: t("scholar.tools.composer.reviewSentNotice") })
            }
          >
            {t("action.requestReview")}
          </Button>
          <Button
            size="sm"
            icon={Send}
            disabled={!canSubmit}
            onClick={() =>
              setNotice({ tone: "success", text: t("scholar.tools.composer.publishNotice") })
            }
          >
            {t("console.publishNow")}
          </Button>
        </div>
      </div>
    </div>
  );
}

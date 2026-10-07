"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { ContentReference, ReferenceSuggestion } from "@/lib/types";
import { getSuggestionsForKeywords } from "@/lib/data/questions";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/bn";
import { cn, readingMinutes, relativeTime, toParagraphs } from "@/lib/utils";
import {
  AttachedReferenceList,
  ReferenceSuggester,
  SmartReferenceCounter,
} from "@/components/console";
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
}: {
  scholarName: string;
  departmentNames: string[];
}) {
  const { t, locale } = useI18n();

  const [kind, setKind] = useState<DraftKind>("article");
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

  function handleInsert(suggestion: ReferenceSuggestion) {
    setAttached((prev) =>
      prev.some((reference) => reference.id === suggestion.id)
        ? prev
        : [...prev, toReference(suggestion)],
    );
    setNotice({ tone: "success", text: `“${suggestion.refBn}” খসড়ায় যুক্ত করা হয়েছে।` });
  }

  const canSubmit = title.trim().length > 3 && body.trim().length > 20;

  return (
    <div className="space-y-5">
      {/* Draft status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[0.75rem] text-subtle-foreground">
            {scholarName} হিসেবে লিখছেন
          </span>
          <Badge tone={kind === "fatwa" ? "accent" : kind === "answer" ? "info" : "primary"} icon={PenLine}>
            {kind === "fatwa" ? t("console.fatwaType") : kind === "answer" ? t("console.answerType") : t("console.articleType")}
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
            {dirty ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                সংরক্ষণ হচ্ছে…
              </>
            ) : savedAt ? (
              <>
                <Check className="size-3.5 text-success" aria-hidden />
                {t("console.savedAt")} · {relativeTime(savedAt.toISOString(), locale)}
              </>
            ) : (
              <>
                <Save className="size-3.5" aria-hidden />
                স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[0.75rem] text-muted-foreground">
          <span className="tabular">{formatNumber(wordCount, locale)} শব্দ</span>
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
                description="বিস্তারিত জ্ঞানভিত্তিক লেখা"
              />
              <RadioCard
                name="draft-kind"
                value="fatwa"
                checked={kind === "fatwa"}
                onChange={(value) => setKind(value as DraftKind)}
                icon={Scale}
                label={t("console.fatwaType")}
                description="দলিলসহ আনুষ্ঠানিক রায়"
              />
              <RadioCard
                name="draft-kind"
                value="answer"
                checked={kind === "answer"}
                onChange={(value) => setKind(value as DraftKind)}
                icon={MessageCircleQuestion}
                label={t("console.answerType")}
                description="ব্যবহারকারীর প্রশ্নের উত্তর"
              />
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              {kind === "fatwa" ? (
                <Field
                  label="প্রশ্নকারীর প্রশ্ন"
                  htmlFor="draft-question"
                  hint="ব্যবহারকারী ঠিক যা লিখেছেন তা লিখুন — রায়ের প্রেক্ষাপট স্পষ্ট থাকবে।"
                >
                  <Textarea
                    id="draft-question"
                    value={questionText}
                    onChange={(event) => {
                      setQuestionText(event.target.value);
                      setDirty(true);
                    }}
                    placeholder="যেমন: ব্যাংকের সুদ থেকে পাওয়া টাকা দিয়ে কি কুরবানি করা যাবে?"
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
                      ? "যেমন: সুদ ও হালাল উপার্জনের পার্থক্য"
                      : "লেখার বিষয় অনুযায়ী একটি স্পষ্ট শিরোনাম লিখুন"
                  }
                />
              </Field>

              {kind === "fatwa" ? (
                <Field
                  label="সংক্ষিপ্ত জবাব (রায়)"
                  htmlFor="draft-ruling"
                  hint="দুই-তিন বাক্যে মূল রায় — পাঠক প্রথমেই এটি পড়বেন।"
                >
                  <Textarea
                    id="draft-ruling"
                    value={ruling}
                    onChange={(event) => {
                      setRuling(event.target.value);
                      setDirty(true);
                    }}
                    placeholder="সংক্ষেপে হুকুম লিখুন, তারপর নিচে দলিলসহ বিস্তারিত লিখুন।"
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
                    {preview ? "সম্পাদনায় ফিরুন" : t("console.preview")}
                  </button>
                }
                hint={preview ? undefined : t("console.bodyPlaceholder")}
              >
                {preview ? (
                  <div className="rounded-xl border border-border bg-surface-2 p-5">
                    {body.trim().length > 0 ? (
                      <Prose paragraphs={toParagraphs(body)} />
                    ) : (
                      <p className="text-[0.8125rem] text-muted-foreground">
                        প্রিভিউ দেখতে কিছু লিখুন।
                      </p>
                    )}
                    {attached.length > 0 ? (
                      <div className="mt-5 border-t border-border pt-4">
                        <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                          {t("console.attachedRefs")}
                        </p>
                        <ul className="space-y-2">
                          {attached.map((reference) => (
                            <li key={reference.id} className="text-[0.75rem] text-muted-foreground">
                              <span className="font-medium text-foreground">{reference.refBn}</span>
                              {" — "}
                              {reference.translationBn}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Textarea
                    id="draft-body"
                    value={body}
                    onChange={(event) => {
                      setBody(event.target.value);
                      setDirty(true);
                    }}
                    placeholder={t("console.bodyPlaceholder")}
                    className="min-h-80"
                  />
                )}
              </Field>
            </div>
          </Card>

          <Card>
            <SectionHeader
              size="sm"
              icon={BookOpen}
              title="আপনার বিভাগ ও প্রকাশের প্রভাব"
              className="mb-3"
            />
            <div className="flex flex-wrap gap-1.5">
              {departmentNames.map((name) => (
                <Badge key={name} tone="primary" size="xs">
                  {name}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground">
              এই বিভাগে প্রকাশ করলে ভবিষ্যতে একই বিষয়ের প্রশ্নগুলো প্রথমে আপনার কাছে
              রাউট হবে, এবং লেখাটি বিভাগের পাতায় পাঠকদের কাছে দেখানো হবে।
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
              setNotice({ tone: "info", text: "রেফারেন্সটি সরানো হয়েছে।" });
            }}
          />

          <Card>
            <CardHeader
              icon={Sparkles}
              tone="accent"
              title="রেফারেন্স যোগ করার নিয়ম"
              subtitle="দলিল ছাড়া রায় নয়"
            />
            <ul className="mt-3 space-y-2.5">
              {[
                "প্রতিটি রায়ের পাশে অন্তত একটি আয়াত বা হাদীস যুক্ত করুন।",
                "আয়াতের নম্বর ও সূরার নাম স্পষ্টভাবে উল্লেখ করুন।",
                "হাদীস হলে সংকলন ও হাদীস নম্বর দিন, যাতে পাঠক যাচাই করতে পারেন।",
                "মাযহাবভেদ থাকলে সেটি স্পষ্টভাবে উল্লেখ করুন এবং সূত্র দিন।",
              ].map((rule) => (
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
                প্রশ্নের উত্তর হিসেবে লিখতে চান?
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
            ? "প্রকাশের জন্য প্রস্তুত — রেফারেন্সসহ যাচাই করে নিন"
            : "শিরোনাম ও অন্তত কয়েক প্যারাগ্রাফ লেখা প্রয়োজন"}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Save}
            onClick={() => setNotice({ tone: "info", text: "খসড়া সংরক্ষিত হয়েছে (ব্রাউজারে)।" })}
          >
            {t("action.saveDraft")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Send}
            disabled={!canSubmit}
            onClick={() =>
              setNotice({ tone: "warning", text: "পর্যালোচনার জন্য পাঠানো হয়েছে — পর্যালোচক দেখবেন।" })
            }
          >
            {t("action.requestReview")}
          </Button>
          <Button
            size="sm"
            icon={Send}
            disabled={!canSubmit}
            onClick={() =>
              setNotice({ tone: "success", text: "প্রকাশের জন্য প্রস্তুত — ব্যাকএন্ড যুক্ত হলে এখান থেকেই প্রকাশ হবে।" })
            }
          >
            {t("console.publishNow")}
          </Button>
        </div>
      </div>
    </div>
  );
}

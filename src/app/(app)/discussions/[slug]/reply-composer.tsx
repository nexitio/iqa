"use client";

import { useState } from "react";
import { CheckCircle2, Lock, Send, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  Button,
  Callout,
  Card,
  CardHeader,
  Field,
  Textarea,
} from "@/components/ui";

const ADAB = [
  "দলিল দিন — কুরআন বা হাদীসের রেফারেন্স থাকলে উল্লেখ করুন।",
  "ব্যক্তি নয়, মতের সমালোচনা করুন।",
  "প্রশ্ন করলে স্পষ্ট ও সংক্ষেপে করুন।",
];

/**
 * Reply composer.
 *
 * A locked thread shows a closed notice instead of the box — offering a form
 * that cannot submit would be worse than no form at all.
 */
export function ReplyComposer({ locked }: { locked: boolean }) {
  const { t, isBn } = useI18n();
  const [body, setBody] = useState("");
  const [posted, setPosted] = useState(false);
  const [touched, setTouched] = useState(false);

  if (locked) {
    return (
      <Callout tone="neutral" icon={Lock} title="থ্রেডটি বন্ধ করা হয়েছে">
        মডারেটররা এই আলোচনার উত্তর বন্ধ করেছেন। কারণ জানতে থ্রেডের পর্যালোচনা নোট দেখুন।
        নতুন আলোচনা শুরু করে বিষয়টি চালিয়ে যেতে পারেন।
      </Callout>
    );
  }

  const error = touched && body.trim().length < 15;

  return (
    <Card>
      <CardHeader
        icon={Sparkles}
        title={t("action.reply")}
        subtitle={
          isBn
            ? "শালীন ভাষায় ও দলিলসহ লিখুন — এখানে আলোচনা জ্ঞানকেন্দ্রিক থাকবে"
            : "Write respectfully and with evidence"
        }
      />

      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
          if (body.trim().length < 15) return;
          setPosted(true);
        }}
        noValidate
      >
        <Field
          label={isBn ? "আপনার উত্তর" : "Your reply"}
          htmlFor="reply-body"
          error={error ? "অন্তত ১৫ অক্ষরের একটি অংশ লিখুন।" : undefined}
          hint={error ? undefined : "উদাহরণ, অভিজ্ঞতা বা রেফারেন্স দিলে আলোচনা আরও উপকারী হয়।"}
        >
          <Textarea
            id="reply-body"
            rows={4}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="আপনার মত বা অভিজ্ঞতা লিখুন…"
            aria-invalid={error || undefined}
          />
        </Field>

        <ul className="space-y-2 rounded-card border border-border bg-surface-2 p-3.5">
          {ADAB.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
              <span className="text-[0.75rem] leading-relaxed text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" icon={Send} disabled={posted}>
            {posted ? (isBn ? "সংরক্ষিত" : "Saved") : t("action.reply")}
          </Button>
          <span className="text-[0.75rem] text-subtle-foreground">
            {isBn
              ? "প্ল্যাটফর্মের ব্যাকএন্ড চালু হলে উত্তরটি সরাসরি এই আলোচনায় যুক্ত হবে।"
              : "Once the backend is live, your reply posts directly to this thread."}
          </span>
        </div>

        {posted ? (
          <Callout tone="success" icon={CheckCircle2} title="আপনার উত্তর প্রস্তুত">
            {isBn
              ? "মডারেটর পর্যালোচনার পর উত্তরটি প্রকাশিত হবে — এতে আলোচনার মান রক্ষা হয়।"
              : "A moderator will review it before publishing."}
          </Callout>
        ) : null}
      </form>
    </Card>
  );
}

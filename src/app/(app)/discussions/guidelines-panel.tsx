"use client";

import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toBnDigits } from "@/lib/bn";
import { Card, CardHeader } from "@/components/ui";

/**
 * The community rules.
 *
 * Rendered on the client because the rules live in the dictionary as a list and
 * a server component cannot read the translated array — this keeps the panel
 * correct in both Bangla and English rather than showing Bangla inside an
 * English interface.
 */
export function GuidelinesPanel() {
  const { t, tList, isBn } = useI18n();
  const rules = tList("discussions.rules");

  return (
    <Card variant="parchment">
      <CardHeader
        icon={ShieldCheck}
        tone="accent"
        title={t("discussions.guidelines")}
        subtitle={
          isBn
            ? "আলোচনায় যোগ দেওয়ার আগে এই নীতিগুলো পড়ে নিন"
            : "Read these before joining a discussion"
        }
      />
      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        {rules.map((rule, index) => (
          <li key={rule} className="flex gap-3 rounded-card border border-border bg-surface p-3.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-[0.6875rem] font-bold tabular text-accent-soft-foreground">
              {toBnDigits(index + 1)}
            </span>
            <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">{rule}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 border-t border-border pt-3.5 text-[0.6875rem] leading-relaxed text-subtle-foreground">
        {isBn
          ? "নীতিমালা লঙ্ঘন দেখলে রিপোর্ট করুন — মডারেটররা পর্যালোচনা করবেন।"
          : "Report a breach and a moderator will review it."}
      </p>
    </Card>
  );
}

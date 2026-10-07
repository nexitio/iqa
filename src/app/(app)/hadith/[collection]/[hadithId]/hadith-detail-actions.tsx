"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, Check, Copy, Printer, Share2 } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { Hadith } from "@/lib/types";

type Flash = "copied" | "shared" | "saved" | null;

/**
 * Permalink actions for a single hadith.
 *
 * Every action reports its outcome visibly — a scholar copying evidence needs to
 * know the copy actually happened. A single flash value plus one timer keeps the
 * confirmations from stepping on each other.
 */
export function HadithDetailActions({ hadith }: { hadith: Hadith }) {
  const { t, pick, locale } = useI18n();
  const [saved, setSaved] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const show = (which: Exclude<Flash, null>) => {
    setFlash(which);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFlash(null), 1800);
  };

  const copy = async () => {
    const translation = locale === "bn" ? hadith.translationBn : hadith.translationEn;
    const ref = locale === "bn" ? hadith.refBn : hadith.refEn;
    const text = `${hadith.arabic}\n\n${translation}\n\n— ${ref} | ${t("label.narrator")}: ${pick(hadith.narrator)}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch {
        /* no further fallback available */
      }
      document.body.removeChild(area);
    }
    show("copied");
  };

  const share = async () => {
    const url = window.location.href;
    const ref = locale === "bn" ? hadith.refBn : hadith.refEn;
    try {
      if (navigator.share) {
        await navigator.share({
          title: ref,
          text: locale === "bn" ? hadith.translationBn : hadith.translationEn,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* the share sheet was dismissed */
    }
    show("shared");
  };

  const message =
    flash === "copied"
      ? t("action.copied")
      : flash === "shared"
        ? t("action.copied")
        : flash === "saved"
          ? locale === "bn"
            ? "আপনার লাইব্রেরিতে সংরক্ষিত"
            : "Saved to your library"
          : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={saved ? "primary" : "outline"}
        size="sm"
        icon={saved ? Check : Bookmark}
        onClick={() => {
          const next = !saved;
          setSaved(next);
          if (next) show("saved");
        }}
        aria-pressed={saved}
      >
        {saved ? t("action.saved") : t("action.save")}
      </Button>
      <Button variant="outline" size="sm" icon={flash === "copied" ? Check : Copy} onClick={copy}>
        {t("action.copyLink")}
      </Button>
      <Button variant="outline" size="sm" icon={flash === "shared" ? Check : Share2} onClick={share}>
        {t("action.share")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={Printer}
        onClick={() => window.print()}
        className="no-print"
      >
        {locale === "bn" ? "প্রিন্ট" : "Print"}
      </Button>

      {message ? (
        <Badge tone="success" size="sm" className="animate-fade-in">
          {message}
        </Badge>
      ) : null}
    </div>
  );
}

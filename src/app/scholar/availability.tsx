"use client";

import { BadgeCheck, Ban, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/bn";
import { Badge } from "@/components/ui";

/**
 * Whether the scholar is currently accepting questions, plus the median time
 * they take to reply.
 *
 * Client-side so the label follows the Bangla/English toggle — a server page
 * could not resolve it.
 */
export function AvailableInline({
  available,
  responseTimeHours,
  className,
}: {
  available: boolean;
  responseTimeHours: number;
  className?: string;
}) {
  const { t, locale } = useI18n();

  if (!available) {
    return (
      <Badge tone="neutral" size="sm" icon={Ban} className={className}>
        {t("label.unavailable")}
      </Badge>
    );
  }

  return (
    <span className={className ? `inline-flex flex-wrap items-center gap-2 ${className}` : "inline-flex flex-wrap items-center gap-2"}>
      <Badge tone="success" size="sm" icon={BadgeCheck}>
        {t("label.available")}
      </Badge>
      <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
        <Clock className="size-3.5" aria-hidden />
        {t("label.responseTime")} {formatNumber(responseTimeHours, locale)} {t("console.hours")}
      </span>
    </span>
  );
}

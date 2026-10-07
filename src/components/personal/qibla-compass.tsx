"use client";

import { useMemo } from "react";
import { Compass, Info, Navigation } from "lucide-react";
import { distanceToMakkah, findDistrict, formatNumber, qiblaDirection, toBnDigits } from "@/lib/bn";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Badge, Callout, Card } from "@/components/ui";

/**
 * Qibla direction for the selected district.
 *
 * The bearing is real (great-circle computation from the district coordinates),
 * but a browser cannot know which way the device is physically pointing without
 * a motion sensor, so the ring is deliberately labelled as north-up rather than
 * pretending to be a live compass.
 */
export function QiblaCompass({
  districtId = "dhaka",
  className,
}: {
  districtId?: string;
  className?: string;
}) {
  const { t, pick, locale } = useI18n();
  const district = useMemo(() => findDistrict(districtId), [districtId]);
  const bearing = useMemo(() => qiblaDirection(district), [district]);
  const distance = useMemo(() => distanceToMakkah(district), [district]);

  const size = 200;
  const radius = size / 2 - 14;
  const radians = ((bearing - 90) * Math.PI) / 180;
  const needleX = size / 2 + Math.cos(radians) * radius;
  const needleY = size / 2 + Math.sin(radians) * radius;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
            <Compass className="size-3" aria-hidden />
            {t("label.qibla")}
          </p>
          <p className="mt-1 font-display text-base font-bold text-foreground">
            {pick(district.name)}
          </p>
        </div>
        <Badge tone="primary" size="sm" icon={Navigation}>
          {toBnDigits(bearing.toFixed(1))}°
        </Badge>
      </div>

      <div className="mt-4 flex justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${t("label.qibla")} ${bearing.toFixed(1)}°`}
        >
          {/* compass rose */}
          <circle cx={size / 2} cy={size / 2} r={radius} className="fill-surface-2 stroke-border" strokeWidth="1" />
          <circle cx={size / 2} cy={size / 2} r={radius - 22} className="fill-none stroke-border" strokeWidth="0.5" />

          {Array.from({ length: 72 }, (_, i) => {
            const angle = (i * 5 * Math.PI) / 180;
            const major = i % 18 === 0;
            const minor = i % 9 === 0;
            const r1 = radius - (major ? 12 : minor ? 8 : 4);
            return (
              <line
                key={i}
                x1={size / 2 + Math.cos(angle) * radius}
                y1={size / 2 + Math.sin(angle) * radius}
                x2={size / 2 + Math.cos(angle) * r1}
                y2={size / 2 + Math.sin(angle) * r1}
                className={major ? "stroke-foreground" : "stroke-border-strong"}
                strokeWidth={major ? 1.6 : 0.8}
              />
            );
          })}

          {/* cardinal points */}
          <text x={size / 2} y={16} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
            N
          </text>
          <text x={size - 8} y={size / 2 + 4} textAnchor="middle" className="fill-subtle-foreground text-[10px]">
            E
          </text>
          <text x={size / 2} y={size - 6} textAnchor="middle" className="fill-subtle-foreground text-[10px]">
            S
          </text>
          <text x={8} y={size / 2 + 4} textAnchor="middle" className="fill-subtle-foreground text-[10px]">
            W
          </text>

          {/* qibla bearing */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={needleX}
            y2={needleY}
            className="stroke-primary"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={needleX} cy={needleY} r="7" className="fill-primary" />
          <text
            x={size / 2 + Math.cos(radians) * (radius - 42)}
            y={size / 2 + Math.sin(radians) * (radius - 42)}
            textAnchor="middle"
            className="fill-primary text-[13px]"
          >
            ﷽
          </text>
          <circle cx={size / 2} cy={size / 2} r="4" className="fill-foreground" />
        </svg>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
        <div>
          <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">
            {t("label.qibla")}
          </dt>
          <dd className="mt-0.5 font-display text-[0.9375rem] font-bold tabular text-foreground">
            {toBnDigits(bearing.toFixed(1))}°
          </dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">
            মক্কা থেকে দূরত্ব
          </dt>
          <dd className="mt-0.5 font-display text-[0.9375rem] font-bold tabular text-foreground">
            {formatNumber(distance, locale)} কিমি
          </dd>
        </div>
      </dl>

      <Callout tone="info" icon={Info} className="mt-4">
        এই কম্পাসটি উত্তর-ভিত্তিক। ফোনের সেন্সর দিয়ে লাইভ দিক নির্ণয় করতে ডিভাইসের কম্পাস অ্যাপ ব্যবহার করুন।
      </Callout>
    </Card>
  );
}

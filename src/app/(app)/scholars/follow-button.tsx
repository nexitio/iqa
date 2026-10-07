"use client";

import { useState } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { CURRENT_USER } from "@/lib/data/personal";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui";

/**
 * Follow toggle.
 *
 * Seeded from the signed-in user's real follow list so the button reflects
 * existing state instead of always starting at "Follow".
 */
export function FollowButton({
  scholarId,
  size = "md",
  full = false,
  className,
}: {
  scholarId: string;
  size?: "sm" | "md" | "lg";
  full?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const [following, setFollowing] = useState(
    CURRENT_USER.followingScholarIds.includes(scholarId),
  );

  return (
    <Button
      variant={following ? "soft" : "primary"}
      size={size}
      full={full}
      icon={following ? UserCheck : UserPlus}
      onClick={() => setFollowing((v) => !v)}
      aria-pressed={following}
      className={className}
    >
      {following ? t("action.following") : t("action.follow")}
    </Button>
  );
}

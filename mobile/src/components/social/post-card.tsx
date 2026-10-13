import { useState } from "react";
import { Pressable, View } from "react-native";
import { Link2, Bookmark, Check, Eye, Heart, MessageCircle, Quote } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { formatNumber } from "../../lib/bn";
import { clampLines, relativeTime } from "../../lib/utils";
import type { ResolvedPost } from "../../data/feed";
import { Avatar, Badge, Skeleton, Text, VerifiedMark } from "../ui";

/** The social feed unit: an author header, the post body, and a reaction bar. */
export function PostCard({ post }: { post: ResolvedPost }) {
  const theme = useTheme();
  const router = useRouter();
  const { t, pick, locale } = useI18n();
  const badge = locale === "bn" ? post.badge.labelBn : post.badge.labelEn;

  const text = (bn: string, en?: string) => pick({ bn, en: en ?? "" });
  const authorName = post.author
    ? `${text(post.author.honorificBn ?? "", post.author.honorificEn)} ${text(post.author.nameBn, post.author.nameEn)}`.trim()
    : "ইলম";

  const open = () => router.push(post.href as never);

  return (
    <View style={{ backgroundColor: theme.colors.surface, paddingVertical: 14 }}>
      {/* header: author, provenance, and why this is in the feed */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        {post.author ? (
          <Avatar
            name={text(post.author.nameBn, post.author.nameEn)}
            color={post.author.color}
            size="md"
            verified={post.author.verified}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.primarySoft,
            }}
          >
            <Quote size={16} color={theme.colors.primary} />
          </View>
        )}

        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <Text weight="semibold" style={{ fontSize: 14 }} numberOfLines={1}>
              {authorName}
            </Text>
            {post.author?.verified ? <VerifiedMark /> : null}
            <Badge tone={post.badge.tone} size="xs">
              {badge}
            </Badge>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
            <Text variant="small" numberOfLines={1} style={{ flex: 1, fontSize: 12 }}>
              {post.author?.metaBn ? `${text(post.author.metaBn, post.author.metaEn)} · ` : ""}
              {relativeTime(post.createdAt, locale)}
              {post.referenceCount ? ` · ${formatNumber(post.referenceCount, locale)} ${t("label.references")}` : ""}
            </Text>
            {post.stats.views > 0 ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <Eye size={12} color={theme.colors.fgSubtle} />
                <Text variant="small" style={{ fontSize: 12 }}>
                  {formatNumber(post.stats.views, locale)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* body */}
      <Pressable onPress={open} style={{ marginTop: 10 }}>
        <Text weight="semibold" style={{ fontSize: 16, lineHeight: 23 }} numberOfLines={2}>
          {text(post.titleBn, post.titleEn)}
        </Text>

        {post.arabic ? (
          <View
            style={{
              marginTop: 10,
              borderLeftWidth: 3,
              borderLeftColor: theme.colors.primary,
              backgroundColor: theme.colors.surface3,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
          >
            <Text variant="arabic" style={{ fontSize: 21, lineHeight: 42, textAlign: "right" }}>
              {post.arabic}
            </Text>
            {post.translationBn ? (
              <Text style={{ marginTop: 10, fontSize: 13.5, lineHeight: 21, color: theme.colors.fgMuted }}>
                {post.translationBn}
              </Text>
            ) : null}
            {post.refBn ? (
              <Text weight="medium" style={{ marginTop: 8, fontSize: 11, color: theme.colors.primary }}>
                {text(post.refBn, post.refEn)}
              </Text>
            ) : null}
          </View>
        ) : null}

        {post.rulingBn ? (
          <View
            style={{
              marginTop: 10,
              borderLeftWidth: 2,
              borderLeftColor: theme.colors.primary,
              backgroundColor: theme.colors.primarySoft,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <Text variant="label" color={theme.colors.primarySoftFg} style={{ marginBottom: 4 }}>
              {t("label.ruing")}
            </Text>
            <Text weight="medium" style={{ fontSize: 13.5, lineHeight: 21, color: theme.colors.primarySoftFg }}>
              {post.rulingBn}
            </Text>
          </View>
        ) : null}

        {post.bodyBn && !post.rulingBn ? (
          <Text style={{ marginTop: 8, fontSize: 13.5, lineHeight: 21, color: theme.colors.fgMuted }} numberOfLines={3}>
            {clampLines(post.bodyBn, 3, 60)}
          </Text>
        ) : null}

        {post.contextBn ? (
          <View style={{ marginTop: 10, flexDirection: "row" }}>
            <Badge tone="neutral" size="xs">
              {text(post.contextBn, post.contextEn)}
            </Badge>
          </View>
        ) : null}
      </Pressable>

      <View style={{ marginTop: 10 }}>
        <ReactionBar stats={post.stats} />
      </View>
    </View>
  );
}

function ReactionBar({ stats }: { stats: ResolvedPost["stats"] }) {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const item = (
    active: boolean,
    Icon: typeof Heart,
    label: string,
    count: number,
    onPress?: () => void,
    activeColor = theme.colors.danger,
  ) => (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 7 }}
    >
      <Icon
        size={17}
        color={active ? activeColor : theme.colors.fgMuted}
        strokeWidth={active ? 2.4 : 2}
        fill={active ? activeColor : "none"}
      />
      {count > 0 ? (
        <Text style={{ fontSize: 12.5, color: active ? activeColor : theme.colors.fgMuted }}>
          {formatNumber(count, locale)}
        </Text>
      ) : null}
    </Pressable>
  );

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {item(liked, Heart, t("label.helpful"), stats.likes + (liked ? 1 : 0), () => setLiked((v) => !v))}
      {item(false, MessageCircle, t("label.answers"), stats.comments, undefined, theme.colors.primary)}
      {item(saved, Bookmark, t("action.save"), stats.saves + (saved ? 1 : 0), () => setSaved((v) => !v), theme.colors.primary)}
      {item(copied, copied ? Check : Link2, copied ? t("action.copied") : t("action.share"), 0, () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }, theme.colors.success)}
    </View>
  );
}

/** Skeleton matching the post card's rhythm. */
export function PostCardSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ backgroundColor: theme.colors.surface, paddingVertical: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Skeleton width={40} height={40} radius={20} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="40%" height={13} />
          <Skeleton width="28%" height={11} />
        </View>
      </View>
      <Skeleton width="80%" height={15} />
      <Skeleton width="100%" height={13} />
      <Skeleton width="65%" height={13} />
    </View>
  );
}

import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Bookmark, CheckCircle2, Clock3, Eye, MessageCircle, Scale, ThumbsUp } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { formatNumber } from "../../lib/bn";
import { relativeTime } from "../../lib/utils";
import type { Article, Discussion, Dua, Fatwa, Question } from "../../lib/types";
import { statusTone } from "../../theme/tone";
import { Badge, Chip, Text } from "../ui";

/** A one-panel article row used on the articles index and by search. */
export function ArticleCard({ article }: { article: Article }) {
  const theme = useTheme();
  const router = useRouter();
  const { pick, locale } = useI18n();

  return (
    <Pressable
      onPress={() => router.push(`/articles/${article.slug}` as never)}
      style={({ pressed }) => [
        {
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: 16,
          gap: 8,
          opacity: pressed ? 0.96 : 1,
        },
        theme.elevation.card,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Badge tone="info" size="xs">
          প্রবন্ধ
        </Badge>
        <Text variant="small" style={{ fontSize: 11.5 }}>
          {article.readingMinutes} মিনিট · {relativeTime(article.publishedAt, locale)}
        </Text>
      </View>
      <Text weight="semibold" style={{ fontSize: 16, lineHeight: 23 }} numberOfLines={2}>
        {pick(article.title)}
      </Text>
      <Text style={{ fontSize: 13, lineHeight: 20, color: theme.colors.fgMuted }} numberOfLines={2}>
        {pick(article.excerpt)}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Eye size={13} color={theme.colors.fgSubtle} />
          <Text variant="small" style={{ fontSize: 11.5 }}>
            {formatNumber(article.viewCount, locale)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Bookmark size={13} color={theme.colors.fgSubtle} />
          <Text variant="small" style={{ fontSize: 11.5 }}>
            {formatNumber(article.bookmarkCount, locale)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <MessageCircle size={13} color={theme.colors.fgSubtle} />
          <Text variant="small" style={{ fontSize: 11.5 }}>
            {formatNumber(article.commentCount, locale)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/** A fatwa row, leading with the ruling line the reader scans first. */
export function FatwaCard({ fatwa }: { fatwa: Fatwa }) {
  const theme = useTheme();
  const router = useRouter();
  const { pick, locale } = useI18n();

  return (
    <Pressable
      onPress={() => router.push(`/fatwas/${fatwa.slug}` as never)}
      style={({ pressed }) => [
        {
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: 16,
          gap: 10,
          opacity: pressed ? 0.96 : 1,
        },
        theme.elevation.card,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Badge tone="warning" size="xs" icon={Scale}>
            ফতোয়া
          </Badge>
          {fatwa.pinned ? (
            <Badge tone="danger" size="xs">
              গুরুত্বপূর্ণ
            </Badge>
          ) : null}
        </View>
        <Text variant="small" style={{ fontSize: 11.5 }}>
          {relativeTime(fatwa.publishedAt, locale)}
        </Text>
      </View>

      <Text weight="semibold" style={{ fontSize: 15, lineHeight: 22 }} numberOfLines={2}>
        {fatwa.questionBn}
      </Text>

      <View
        style={{
          borderLeftWidth: 3,
          borderLeftColor: theme.colors.primary,
          backgroundColor: theme.colors.primarySoft,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <Text variant="label" color={theme.colors.primarySoftFg} style={{ marginBottom: 3 }}>
          অভিমত
        </Text>
        <Text weight="medium" style={{ fontSize: 13, lineHeight: 20, color: theme.colors.primarySoftFg }} numberOfLines={4}>
          {fatwa.rulingBn}
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Eye size={13} color={theme.colors.fgSubtle} />
          <Text variant="small" style={{ fontSize: 11.5 }}>
            {formatNumber(fatwa.viewCount, locale)}
          </Text>
        </View>
        <Text variant="small" style={{ fontSize: 11.5 }}>
          {fatwa.referenceCount} রেফারেন্স
        </Text>
        <Text variant="small" style={{ fontSize: 11.5 }}>
          {pick({ bn: "হানাফী", en: "Hanafi" })}
        </Text>
      </View>
    </Pressable>
  );
}

export function QuestionCard({ question }: { question: Question }) {
  const theme = useTheme();
  const router = useRouter();
  const { locale } = useI18n();

  return (
    <Pressable
      onPress={() => router.push(`/questions/${question.slug}` as never)}
      style={({ pressed }) => [
        {
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: 16,
          gap: 8,
          opacity: pressed ? 0.96 : 1,
        },
        theme.elevation.card,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Badge tone={statusTone(question.status)} size="xs" dot>
          {question.status === "answered" ? "উত্তর দেওয়া হয়েছে" : question.status === "open" ? "খোলা" : question.status}
        </Badge>
        {question.fatwaRequested ? (
          <Badge tone="warning" size="xs">
            ফতোয়া চেয়েছেন
          </Badge>
        ) : null}
        {question.visibility === "anonymous" ? (
          <Badge tone="neutral" size="xs">
            নাম প্রকাশে অনিচ্ছুক
          </Badge>
        ) : null}
      </View>
      <Text weight="semibold" style={{ fontSize: 15, lineHeight: 22 }} numberOfLines={3}>
        {question.titleBn}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <CheckCircle2 size={13} color={theme.colors.success} />
          <Text variant="small" style={{ fontSize: 11.5 }}>
            {formatNumber(question.answerCount, locale)} উত্তর
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Eye size={13} color={theme.colors.fgSubtle} />
          <Text variant="small" style={{ fontSize: 11.5 }}>
            {formatNumber(question.views, locale)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Clock3 size={13} color={theme.colors.fgSubtle} />
          <Text variant="small" style={{ fontSize: 11.5 }}>
            {relativeTime(question.createdAt, locale)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function DiscussionCard({ discussion }: { discussion: Discussion }) {
  const theme = useTheme();
  const router = useRouter();
  const { locale } = useI18n();

  return (
    <Pressable
      onPress={() => router.push(`/discussions/${discussion.slug}` as never)}
      style={({ pressed }) => [
        {
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: 16,
          gap: 8,
          opacity: pressed ? 0.96 : 1,
        },
        theme.elevation.card,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {discussion.pinned ? (
          <Badge tone="primary" size="xs">
            পিন করা
          </Badge>
        ) : null}
        <Text variant="small" style={{ fontSize: 11.5 }}>
          {relativeTime(discussion.createdAt, locale)}
        </Text>
      </View>
      <Text weight="semibold" style={{ fontSize: 15, lineHeight: 22 }} numberOfLines={2}>
        {discussion.titleBn}
      </Text>
      <Text style={{ fontSize: 13, lineHeight: 20, color: theme.colors.fgMuted }} numberOfLines={2}>
        {discussion.bodyBn}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {discussion.tags.slice(0, 3).map((tag) => (
          <Chip key={tag} size="sm" tone="neutral">
            {tag}
          </Chip>
        ))}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <MessageCircle size={13} color={theme.colors.fgSubtle} />
          <Text variant="small" style={{ fontSize: 11.5 }}>
            {formatNumber(discussion.replyCount, locale)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <ThumbsUp size={13} color={theme.colors.fgSubtle} />
          <Text variant="small" style={{ fontSize: 11.5 }}>
            {formatNumber(discussion.upvotes, locale)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/** A dua card: occasion tag, Arabic, transliteration, meaning and source. */
export function DuaCard({ dua }: { dua: Dua }) {
  const theme = useTheme();
  const { pick, locale } = useI18n();

  return (
    <View
      style={[
        {
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: 16,
          gap: 10,
        },
        theme.elevation.card,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Text weight="semibold" style={{ flex: 1, fontSize: 15 }}>
          {pick(dua.title)}
        </Text>
        <Badge tone="accent" size="xs">
          {pick(dua.occasion)}
        </Badge>
      </View>

      <Text variant="arabic" style={{ fontSize: 23, lineHeight: 46, textAlign: "right" }}>
        {dua.arabic}
      </Text>

      <Text style={{ fontSize: 13, lineHeight: 20, color: theme.colors.primary }}>
        {dua.transliterationBn}
      </Text>
      <Text style={{ fontSize: 13.5, lineHeight: 21, color: theme.colors.fgMuted }}>{pick(dua.meaning)}</Text>

      {dua.repeat ? (
        <Text variant="small" style={{ fontSize: 11.5 }}>
          পড়ার সংখ্যা: {pick(dua.repeat)}
        </Text>
      ) : null}

      <Text weight="medium" style={{ fontSize: 11, color: theme.colors.primary }}>
        {locale === "bn" ? dua.reference.bn : dua.reference.en}
      </Text>
    </View>
  );
}

/** Compact "continue" row used at the top of reader surfaces. */
export function MiniStat({ icon: Icon, value, label }: { icon: typeof Eye; value: string; label: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <Icon size={13} color={theme.colors.fgSubtle} />
      <Text variant="small" style={{ fontSize: 11.5 }}>
        {value} {label}
      </Text>
    </View>
  );
}

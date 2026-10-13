import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Flame, PenLine, Plus, Sparkles } from "lucide-react-native";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { useNow } from "../../hooks/use-now";
import { bdDateParts, toBnDigits } from "../../lib/bn";
import { CURRENT_USER, USER_STREAK_DAYS } from "../../data/personal";
import { FEED, resolveFeedItems } from "../../data/feed";
import { Avatar, Badge, Button, Text } from "../../components/ui";
import { DailyStories } from "../../components/social/daily-stories";
import { KnowledgeStories } from "../../components/social/knowledge-stories";
import { PostCard } from "../../components/social/post-card";
import { PrayerWidget } from "../../components/personal/prayer-widget";

const POSTS = resolveFeedItems(FEED);

function greetingKey(hour: number) {
  if (hour < 5) return "home.greetingNight";
  if (hour < 12) return "home.greetingMorning";
  if (hour < 16) return "home.greetingAfternoon";
  if (hour < 19) return "home.greetingEvening";
  return "home.greetingNight";
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, locale } = useI18n();
  const now = useNow(60_000);
  const greeting = t(greetingKey(bdDateParts(now).hour));
  const firstName = CURRENT_USER.name.split(/\s+/)[0];

  return (
    <Screen bottomExtra={8}>
      {/* greeting row: who you are, what today is, and the two actions */}
      <View
        style={[
          {
            borderRadius: theme.radius.panel,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            padding: 14,
            gap: 12,
          },
          theme.elevation.card,
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Avatar name={CURRENT_USER.name} color={CURRENT_USER.avatarColor} size="md" verified ring />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: theme.font.display, fontSize: 18, lineHeight: 24 }}>
              {greeting}, <Text color={theme.colors.primary} style={{ fontFamily: theme.font.display, fontSize: 18 }}>{firstName}</Text>
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
              <Text variant="small" style={{ fontSize: 12 }}>
                {locale === "bn" ? toBnDigits(USER_STREAK_DAYS) : USER_STREAK_DAYS}
              </Text>
              <Flame size={13} color={theme.colors.warning} />
              <Text variant="small" style={{ fontSize: 12 }}>
                {t("profile.streak")}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button icon={Plus} size="sm" onPress={() => router.push("/questions/ask" as never)}>
            {t("action.askScholar")}
          </Button>
          <Button variant="outline" icon={PenLine} size="sm" onPress={() => router.push("/discussions" as never)}>
            {t("nav.discussions")}
          </Button>
        </View>
      </View>

      <DailyStories />
      <KnowledgeStories />
      <PrayerWidget />

      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <Sparkles size={16} color={theme.colors.primary} />
            <Text variant="title" style={{ fontSize: 15 }}>
              {t("label.yourFeed")}
            </Text>
          </View>
          <Badge tone="primary" size="xs">
            {locale === "bn" ? `${toBnDigits(POSTS.length)} টি নতুন` : `${POSTS.length} new`}
          </Badge>
        </View>

        {/* The feed is a ruled list, not a stack of cards: rows touch and a rule
            between them is the only separation the ordering needs. */}
        <View
          style={{
            marginTop: 6,
            borderRadius: theme.radius.panel,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            overflow: "hidden",
          }}
        >
          {POSTS.map((post, index) => (
            <View
              key={post.id}
              style={{
                paddingHorizontal: 14,
                borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth * 2,
                borderTopColor: theme.colors.border,
              }}
            >
              <PostCard post={post} />
            </View>
          ))}
        </View>

        <Text variant="small" align="center" style={{ marginTop: 8 }}>
          {t("home.feedEnd")}
        </Text>
      </View>
    </Screen>
  );
}

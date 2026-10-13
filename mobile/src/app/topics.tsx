import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Compass, TrendingUp } from "lucide-react-native";
import { AppFrame } from "../components/layout/app-frame";
import { Screen } from "../components/layout/screen";
import { useTheme } from "../theme/ThemeProvider";
import { useI18n } from "../i18n";
import { formatNumber } from "../lib/bn";
import { DEPARTMENTS, TOPICS } from "../data/departments";
import { Badge, Chip, ChipList, PageHeader, SectionHeader, Text } from "../components/ui";
import { resolveIcon } from "../components/icons";

export default function TopicsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, pick, locale } = useI18n();

  return (
    <AppFrame back>
      <Screen>
        <PageHeader icon={Compass} eyebrow="বিষয়" title={t("topics.title")} description={t("topics.subtitle")} patterned />

        <SectionHeader icon={Compass} title="বিভাগসমূহ" size="sm" />
        <View style={{ gap: 12 }}>
          {DEPARTMENTS.map((dept) => {
            const Icon = resolveIcon(dept.icon);
            return (
              <Pressable
                key={dept.id}
                onPress={() => router.push(`/questions` as never)}
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
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: theme.colors.surface3,
                    }}
                  >
                    <Icon size={19} color={theme.colors.primary} strokeWidth={1.9} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text weight="semibold" style={{ fontSize: 15.5 }}>
                        {pick(dept.name)}
                      </Text>
                      {dept.trending ? (
                        <Badge tone="danger" size="xs" icon={TrendingUp}>
                          আলোচিত
                        </Badge>
                      ) : null}
                    </View>
                    <Text variant="small" numberOfLines={2} style={{ marginTop: 2, lineHeight: 18 }}>
                      {pick(dept.description)}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 16 }}>
                  <Text variant="small" style={{ fontSize: 11.5 }}>
                    {formatNumber(dept.stats.questions, locale)} প্রশ্ন
                  </Text>
                  <Text variant="small" style={{ fontSize: 11.5 }}>
                    {formatNumber(dept.stats.articles, locale)} প্রবন্ধ
                  </Text>
                  <Text variant="small" style={{ fontSize: 11.5 }}>
                    {formatNumber(dept.stats.followers, locale)} অনুসারী
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader icon={Compass} title="বিষয়সমূহ" size="sm" />
        <ChipList contentStyle={{ paddingHorizontal: 2, flexWrap: "wrap" }}>
          {TOPICS.map((topic) => (
            <Chip key={topic.slug} tone={topic.trending ? "accent" : "neutral"} count={topic.contentCount}>
              {pick(topic.name)}
            </Chip>
          ))}
        </ChipList>
      </Screen>
    </AppFrame>
  );
}

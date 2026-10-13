import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Route, Users } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { formatNumber } from "../../lib/bn";
import { JOURNEYS } from "../../data/personal";
import { Badge, PageHeader, ProgressBar, Text } from "../../components/ui";
import type { Tone } from "../../theme/tone";

export default function JourneysScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, locale } = useI18n();

  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={Route}
          eyebrow="শিক্ষা যাত্রা"
          title={t("nav.journey")}
          description="ছোট ছোট দৈনিক ধাপে দ্বীন শেখার গঠনমূলক যাত্রা — প্রতিদিন ১০–২০ মিনিট।"
          patterned
        />

        <View style={{ gap: 12 }}>
          {JOURNEYS.map((journey) => (
            <Pressable
              key={journey.id}
              onPress={() => router.push(`/journey/${journey.slug}` as never)}
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
                <Badge tone={journey.tone as Tone} size="xs">
                  {journey.categoryBn}
                </Badge>
                <Text variant="small" style={{ fontSize: 11.5 }}>
                  {journey.durationLabelBn}
                </Text>
              </View>
              <Text weight="semibold" style={{ fontSize: 16, lineHeight: 23 }}>
                {journey.titleBn}
              </Text>
              <Text style={{ fontSize: 13, lineHeight: 20, color: theme.colors.fgMuted }} numberOfLines={2}>
                {journey.descriptionBn}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Users size={13} color={theme.colors.fgSubtle} />
                  <Text variant="small" style={{ fontSize: 11.5 }}>
                    {formatNumber(journey.enrolled, locale)} জন যুক্ত
                  </Text>
                </View>
                <Text weight="medium" style={{ fontSize: 11.5, color: theme.colors.primary }}>
                  {journey.completedDays}/{journey.totalDays} দিন
                </Text>
              </View>
              <ProgressBar value={(journey.completedDays / journey.totalDays) * 100} tone={journey.tone as Tone} />
            </Pressable>
          ))}
        </View>
      </Screen>
    </AppFrame>
  );
}

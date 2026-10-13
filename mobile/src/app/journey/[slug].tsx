import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BookOpen, CheckCircle2, Circle, Route } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { formatNumber } from "../../lib/bn";
import { JOURNEYS } from "../../data/personal";
import { Badge, EmptyState, PageHeader, ProgressBar, SectionHeader, Text } from "../../components/ui";
import type { Tone } from "../../theme/tone";

export default function JourneyScreen() {
  const theme = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { locale } = useI18n();
  const journey = JOURNEYS.find((j) => j.slug === slug);

  if (!journey) {
    return (
      <AppFrame back>
        <Screen>
          <EmptyState icon={Route} title="যাত্রাটি পাওয়া যায়নি" />
        </Screen>
      </AppFrame>
    );
  }

  return (
    <AppFrame back>
      <Screen>
        <PageHeader icon={Route} eyebrow={journey.categoryBn} title={journey.titleBn} description={journey.descriptionBn} patterned>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text variant="small" style={{ fontSize: 12 }}>
                {journey.durationLabelBn} · {formatNumber(journey.enrolled, locale)} জন যুক্ত
              </Text>
              <Text weight="semibold" style={{ fontSize: 12.5, color: theme.colors.primary }}>
                {journey.completedDays}/{journey.totalDays}
              </Text>
            </View>
            <ProgressBar value={(journey.completedDays / journey.totalDays) * 100} tone={journey.tone as Tone} height={8} />
          </View>
        </PageHeader>

        <SectionHeader icon={BookOpen} title="দিনের পরিকল্পনা" size="sm" />

        <View style={{ gap: 10 }}>
          {journey.days.map((day) => (
            <View
              key={day.day}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderRadius: theme.radius.panel,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderColor: day.completed ? theme.colors.success : theme.colors.border,
                backgroundColor: day.completed ? theme.colors.successSoft : theme.colors.surface,
                padding: 14,
              }}
            >
              {day.completed ? (
                <CheckCircle2 size={20} color={theme.colors.success} />
              ) : (
                <Circle size={20} color={theme.colors.fgSubtle} />
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text weight="semibold" style={{ fontSize: 14 }}>
                  {day.day}তম দিন · {day.titleBn}
                </Text>
                <Text variant="small" numberOfLines={1} style={{ fontSize: 12 }}>
                  {day.subtitleBn} · {day.minutes} মিনিট
                </Text>
              </View>
              <Badge tone={day.completed ? "success" : "neutral"} size="xs">
                {day.kind === "quran" ? "আয়াত" : day.kind === "hadith" ? "হাদীস" : day.kind === "quiz" ? "প্রশ্নোত্তর" : "চিন্তা"}
              </Badge>
            </View>
          ))}
        </View>
      </Screen>
    </AppFrame>
  );
}

import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, Heart, ScrollText, Sparkles } from "lucide-react-native";
import { AppFrame } from "../components/layout/app-frame";
import { Screen } from "../components/layout/screen";
import { useTheme } from "../theme/ThemeProvider";
import { useI18n } from "../i18n";
import { toBnDigits } from "../lib/bn";
import { AYAH_OF_THE_DAY, getSurah } from "../data/quran";
import { HADITH_OF_THE_DAY } from "../data/hadith";
import { duaOfToday } from "../data/duas";
import { Badge, PageHeader, SectionHeader, Text } from "../components/ui";
import { PrayerWidget } from "../components/personal/prayer-widget";

export default function DailyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, pick, locale } = useI18n();

  const ayah = AYAH_OF_THE_DAY;
  const surah = getSurah(ayah.surah);
  const hadith = HADITH_OF_THE_DAY;
  const dua = duaOfToday();

  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={Sparkles}
          eyebrow="প্রতিদিন"
          title={t("daily.title")}
          description={t("daily.subtitle")}
          patterned
        />

        <PrayerWidget />

        {/* today's ayah */}
        <SectionHeader icon={BookOpen} title="আজকের আয়াত" size="sm" actionLabel={t("action.open")} onAction={() => router.push(`/quran/${ayah.surah}` as never)} />
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
          <Badge tone="primary" size="xs">
            {surah ? `${pick(surah.name)} · ${locale === "bn" ? toBnDigits(ayah.ref) : ayah.ref}` : ayah.ref}
          </Badge>
          <Text variant="quran" style={{ textAlign: "right" }}>
            {ayah.arabic}
          </Text>
          <Text style={{ fontSize: 14.5, lineHeight: 24 }}>{ayah.translationBn}</Text>
        </View>

        {/* today's hadith */}
        <SectionHeader icon={ScrollText} title="আজকের হাদীস" size="sm" />
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
          <Badge tone="accent" size="xs">
            {locale === "bn" ? hadith.refBn : hadith.refEn}
          </Badge>
          <Text variant="arabic" style={{ fontSize: 22, lineHeight: 44, textAlign: "right" }}>
            {hadith.arabic}
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 23 }}>{hadith.translationBn}</Text>
          <Text variant="small" style={{ fontSize: 11.5 }}>
            বর্ণনাকারী: {pick(hadith.narrator)}
          </Text>
        </View>

        {/* today's dua */}
        <SectionHeader icon={Heart} title="আজকের দুআ" size="sm" />
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
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text weight="semibold" style={{ fontSize: 14.5 }}>
              {pick(dua.title)}
            </Text>
            <Badge tone="warning" size="xs">
              {pick(dua.occasion)}
            </Badge>
          </View>
          <Text variant="arabic" style={{ fontSize: 23, lineHeight: 46, textAlign: "right" }}>
            {dua.arabic}
          </Text>
          <Text style={{ fontSize: 13, lineHeight: 21, color: theme.colors.primary }}>{dua.transliterationBn}</Text>
          <Text style={{ fontSize: 14, lineHeight: 23 }}>{pick(dua.meaning)}</Text>
          <Text weight="medium" style={{ fontSize: 11, color: theme.colors.primary }}>
            {locale === "bn" ? dua.reference.bn : dua.reference.en}
          </Text>
        </View>
      </Screen>
    </AppFrame>
  );
}

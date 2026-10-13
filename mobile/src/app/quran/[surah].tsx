import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BookOpen, ChevronDown } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { digits } from "../../lib/bn";
import { getAyahsForSurah, getSurah } from "../../data/quran";
import { Badge, EmptyState, PageHeader, Text } from "../../components/ui";

export default function SurahScreen() {
  const theme = useTheme();
  const { surah: surahParam } = useLocalSearchParams<{ surah: string }>();
  const { t, pick, locale } = useI18n();
  const surah = getSurah(surahParam ?? "");
  const ayahs = getAyahsForSurah(surahParam ?? "");

  if (!surah) {
    return (
      <AppFrame back>
        <Screen>
          <EmptyState icon={BookOpen} title={t("frame.noResults")} />
        </Screen>
      </AppFrame>
    );
  }

  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={BookOpen}
          eyebrow={`${digits(surah.number, locale)} · ${
            surah.revelation === "meccan" ? t("label.meccan") : t("label.medinan")
          }`}
          title={pick(surah.name)}
          description={surah.about ? pick(surah.about) : pick(surah.meaning)}
          patterned
        >
          <Text variant="arabic" style={{ fontSize: 27, lineHeight: 52, textAlign: "right" }}>
            {surah.nameArabic}
          </Text>
        </PageHeader>

        {!surah.hasText ? (
          <EmptyState icon={BookOpen} title={t("quran.notAdded")} description={`${surah.ayahCount} আয়াত`} />
        ) : (
          <View style={{ gap: 12 }}>
            {ayahs.map((ayah) => (
              <AyahBlock
                key={ayah.ref}
                number={ayah.number}
                arabic={ayah.arabic}
                pron={ayah.transliterationBn}
                translation={locale === "bn" ? ayah.translationBn : ayah.translationEn}
                tafsir={ayah.tafsirBn}
              />
            ))}
          </View>
        )}
      </Screen>
    </AppFrame>
  );
}

function AyahBlock({
  number,
  arabic,
  pron,
  translation,
  tafsir,
}: {
  number: number;
  arabic: string;
  pron: string;
  translation: string;
  tafsir?: string;
}) {
  const theme = useTheme();
  const { locale } = useI18n();
  const [showTafsir, setShowTafsir] = useState(false);

  return (
    <View
      style={[
        {
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: 16,
          gap: 12,
        },
        theme.elevation.card,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primarySoft,
          }}
        >
          <Text weight="bold" style={{ fontSize: 11.5, color: theme.colors.primarySoftFg }}>
            {digits(number, locale)}
          </Text>
        </View>
        <Badge tone="neutral" size="xs">
          {`আয়াত ${digits(number, locale)}`}
        </Badge>
      </View>

      <Text variant="quran" style={{ textAlign: "right" }}>
        {arabic}
      </Text>

      <View
        style={{
          borderTopWidth: StyleSheet.hairlineWidth * 2,
          borderTopColor: theme.colors.border,
          paddingTop: 12,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Badge tone="accent" size="xs">
            উচ্চারণ
          </Badge>
        </View>
        <Text style={{ fontSize: 14, lineHeight: 23, color: theme.colors.primary }}>{pron}</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
          <Badge tone="primary" size="xs">
            অর্থ
          </Badge>
        </View>
        <Text style={{ fontSize: 15, lineHeight: 25 }}>{translation}</Text>
      </View>

      {tafsir ? (
        <>
          <Pressable
            onPress={() => setShowTafsir((v) => !v)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Text weight="medium" style={{ fontSize: 12.5, color: theme.colors.info }}>
              তাফসির
            </Text>
            <ChevronDown
              size={15}
              color={theme.colors.info}
              style={{ transform: [{ rotate: showTafsir ? "180deg" : "0deg" }] }}
            />
          </Pressable>
          {showTafsir ? (
            <View
              style={{
                borderLeftWidth: 2,
                borderLeftColor: theme.colors.info,
                backgroundColor: theme.colors.infoSoft,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <Text style={{ fontSize: 13, lineHeight: 21, color: theme.colors.infoSoftFg }}>{tafsir}</Text>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

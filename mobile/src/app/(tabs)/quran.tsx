import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, Search } from "lucide-react-native";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { toBnDigits } from "../../lib/bn";
import { QURAN_SURAHS } from "../../data/quran";
import { PageHeader, Text } from "../../components/ui";

export default function QuranScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, pick, locale } = useI18n();
  const [query, setQuery] = useState("");

  const surahs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return QURAN_SURAHS;
    return QURAN_SURAHS.filter(
      (s) =>
        s.name.bn.includes(q) ||
        s.name.en.toLowerCase().includes(q) ||
        s.slug.includes(q) ||
        String(s.number) === q,
    );
  }, [query]);

  return (
    <Screen>
      <PageHeader
        icon={BookOpen}
        eyebrow={locale === "bn" ? "কুরআন" : "Quran"}
        title={t("quran.title")}
        description={t("quran.subtitle")}
        patterned
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          height: 44,
          paddingHorizontal: 12,
          borderRadius: 12,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Search size={17} color={theme.colors.fgSubtle} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("quran.searchSurah")}
          placeholderTextColor={theme.colors.fgSubtle}
          style={{ flex: 1, color: theme.colors.fg, fontFamily: theme.font.sans, fontSize: 14 }}
        />
      </View>

      <View
        style={{
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          overflow: "hidden",
        }}
      >
        {surahs.map((surah, index) => (
          <Pressable
            key={surah.number}
            onPress={() => router.push(`/quran/${surah.number}` as never)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth * 2,
              borderTopColor: theme.colors.border,
              backgroundColor: pressed ? theme.colors.surface2 : "transparent",
            })}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.primarySoft,
              }}
            >
              <Text weight="bold" style={{ fontSize: 13, color: theme.colors.primarySoftFg }}>
                {locale === "bn" ? toBnDigits(surah.number) : surah.number}
              </Text>
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text weight="semibold" style={{ fontSize: 15 }}>
                {pick(surah.name)}
              </Text>
              <Text variant="small" numberOfLines={1}>
                {pick(surah.meaning)} · {surah.ayahCount} আয়াত ·{" "}
                {surah.revelation === "meccan" ? t("label.meccan") : t("label.medinan")}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontFamily: theme.font.display, fontSize: 17, color: theme.colors.fg }}>
                {surah.nameArabic}
              </Text>
              {!surah.hasText ? (
                <Text style={{ fontSize: 10, color: theme.colors.fgSubtle }}>শীঘ্রই</Text>
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

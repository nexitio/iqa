import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ScrollText } from "lucide-react-native";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { formatNumber } from "../../lib/bn";
import { HADITH_COLLECTIONS, HADITH_OF_THE_DAY, getHadithsForCollection } from "../../data/hadith";
import { Badge, PageHeader, SectionHeader, Text } from "../../components/ui";
import type { Tone } from "../../theme/tone";

export default function HadithScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, pick, locale } = useI18n();
  const today = HADITH_OF_THE_DAY;

  return (
    <Screen>
      <PageHeader
        icon={ScrollText}
        eyebrow={locale === "bn" ? "হাদীস" : "Hadith"}
        title={t("hadith.title")}
        description={t("hadith.subtitle")}
        patterned
      />

      {/* hadith of the day */}
      <Pressable
        onPress={() => router.push(`/hadith/${today.collectionSlug}/${today.id}` as never)}
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
          <Badge tone="accent" size="xs">
            আজকের হাদীস
          </Badge>
          <Badge tone={today.grade === "sahih" ? "success" : "info"} size="xs" dot>
            {today.grade === "muttafaqun-alaih" ? "মুত্তাফাকুন আলাইহি" : today.grade}
          </Badge>
        </View>
        <Text variant="arabic" style={{ fontSize: 21, lineHeight: 42, textAlign: "right" }}>
          {today.arabic}
        </Text>
        <Text style={{ fontSize: 13.5, lineHeight: 21, color: theme.colors.fgMuted }}>{today.translationBn}</Text>
        <Text weight="medium" style={{ fontSize: 11.5, color: theme.colors.primary }}>
          {pick(today.collectionName)} · {locale === "bn" ? today.refBn : today.refEn}
        </Text>
      </Pressable>

      <SectionHeader icon={ScrollText} title={t("hadith.title")} description="বিশুদ্ধ সংকলন" />

      <View style={{ gap: 12 }}>
        {HADITH_COLLECTIONS.map((collection) => (
          <Pressable
            key={collection.slug}
            onPress={() => router.push(`/hadith/${collection.slug}` as never)}
            style={({ pressed }) => [
              {
                borderRadius: theme.radius.panel,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                padding: 16,
                opacity: pressed ? 0.95 : 1,
                gap: 8,
              },
              theme.elevation.card,
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text weight="semibold" style={{ fontSize: 16 }}>
                  {pick(collection.name)}
                </Text>
                <Text variant="small" numberOfLines={2} style={{ marginTop: 2 }}>
                  {pick(collection.description)}
                </Text>
              </View>
              <Text style={{ fontFamily: theme.font.display, fontSize: 18, color: theme.colors.fgSubtle }}>
                {collection.nameArabic}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text variant="small" style={{ fontSize: 11.5 }}>
                {pick(collection.author)}
              </Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <Badge tone={collection.tone as Tone} size="xs">
                  {formatNumber(collection.hadithCount, locale)} হাদীস
                </Badge>
                <Badge tone="neutral" size="xs">
                  {formatNumber(getHadithsForCollection(collection.slug).length || collection.bookCount, locale)}{" "}
                  {getHadithsForCollection(collection.slug).length ? "এখানে" : "অধ্যায়"}
                </Badge>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

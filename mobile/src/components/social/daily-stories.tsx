import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { BookOpen, Heart, ScrollText } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { toBnDigits } from "../../lib/bn";
import { AYAH_OF_THE_DAY, getSurah } from "../../data/quran";
import { HADITH_OF_THE_DAY } from "../../data/hadith";
import { duaOfToday } from "../../data/duas";
import { Text } from "../ui";

/**
 * Daily content strip.
 *
 * Three cards — Today's Ayah, Hadith, and Dua — each showing actual Arabic +
 * Bengali text so the reader can engage without navigating away. On a phone the
 * cards slide horizontally so each gets a full readable column.
 */
export function DailyStories() {
  const theme = useTheme();
  const router = useRouter();
  const { pick, isBn } = useI18n();
  const { width } = useWindowDimensions();

  const ayah = AYAH_OF_THE_DAY;
  const surah = getSurah(ayah.surah);
  const hadith = HADITH_OF_THE_DAY;
  const dua = duaOfToday();

  const cards = [
    {
      id: "ayah",
      tag: "আজকের আয়াত",
      icon: BookOpen,
      href: `/quran/${ayah.surah}?ayah=${ayah.number}`,
      meta: surah ? `${pick(surah.name)} · ${isBn ? toBnDigits(ayah.ref) : ayah.ref}` : ayah.ref,
      arabic: ayah.arabic,
      text: ayah.translationBn,
      accent: theme.colors.primary,
      tagBg: theme.colors.primarySoft,
      tagFg: theme.colors.primarySoftFg,
    },
    {
      id: "hadith",
      tag: "আজকের হাদীস",
      icon: ScrollText,
      href: "/daily",
      meta: isBn ? hadith.refBn : hadith.refEn,
      arabic: hadith.arabic,
      text: hadith.translationBn,
      accent: theme.colors.success,
      tagBg: theme.colors.successSoft,
      tagFg: theme.colors.successSoftFg,
    },
    {
      id: "dua",
      tag: "আজকের দুআ",
      icon: Heart,
      href: "/duas",
      meta: pick(dua.occasion),
      arabic: dua.arabic,
      text: pick(dua.meaning),
      accent: theme.colors.accent,
      tagBg: theme.colors.accentSoft,
      tagFg: theme.colors.accentSoftFg,
    },
  ];

  const cardWidth = Math.min(width - 32, 360);

  return (
    <View
      style={[
        {
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          overflow: "hidden",
        },
        theme.elevation.card,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: StyleSheet.hairlineWidth * 2,
          borderBottomColor: theme.colors.border,
        }}
      >
        <Text variant="title">আজকের জন্য</Text>
        <Pressable onPress={() => router.push("/daily" as never)} hitSlop={6}>
          <Text weight="medium" style={{ fontSize: 13, color: theme.colors.primary }}>
            সব দেখুন
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Pressable
              key={card.id}
              onPress={() => router.push(card.href as never)}
              style={{ width: cardWidth, gap: 8 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    borderRadius: 999,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    backgroundColor: card.tagBg,
                  }}
                >
                  <Icon size={12} color={card.tagFg} />
                  <Text weight="semibold" style={{ fontSize: 11, color: card.tagFg }}>
                    {card.tag}
                  </Text>
                </View>
              </View>

              {card.arabic ? (
                <Text variant="arabic" style={{ fontSize: 19, lineHeight: 36, textAlign: "right" }} numberOfLines={3}>
                  {card.arabic}
                </Text>
              ) : null}

              <Text style={{ fontSize: 12.5, lineHeight: 19, color: theme.colors.fgMuted }} numberOfLines={3}>
                {card.text}
              </Text>

              <Text weight="medium" style={{ fontSize: 11.5, color: card.accent }} numberOfLines={1}>
                {card.meta}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import type { Hadith } from "../../lib/types";
import { statusTone } from "../../theme/tone";
import { Badge, Text } from "../ui";

const GRADE_LABEL: Record<Hadith["grade"], string> = {
  sahih: "সহীহ",
  hasan: "হাসান",
  daif: "যঈফ",
  "muttafaqun-alaih": "মুত্তাফাকুন আলাইহি",
};

/** One narration, cited with its collection and graded honestly. */
export function HadithCard({ hadith, compact = false }: { hadith: Hadith; compact?: boolean }) {
  const theme = useTheme();
  const router = useRouter();
  const { pick, locale } = useI18n();

  const body = (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Text weight="semibold" style={{ fontSize: 13, color: theme.colors.primary }} numberOfLines={1}>
          {locale === "bn" ? hadith.refBn : hadith.refEn}
        </Text>
        <Badge tone={statusTone(hadith.grade)} size="xs" dot>
          {GRADE_LABEL[hadith.grade]}
        </Badge>
      </View>

      <Text variant="arabic" style={{ fontSize: compact ? 20 : 22, lineHeight: compact ? 40 : 44, textAlign: "right" }}>
        {hadith.arabic}
      </Text>

      <Text style={{ fontSize: 13.5, lineHeight: 21, color: theme.colors.fg }}>{hadith.translationBn}</Text>

      <Text variant="small" style={{ fontSize: 11.5 }}>
        বর্ণনাকারী: {pick(hadith.narrator)} · {pick(hadith.bookName)}
      </Text>

      {hadith.lessonBn ? (
        <View
          style={{
            borderLeftWidth: 2,
            borderLeftColor: theme.colors.accent,
            backgroundColor: theme.colors.accentSoft,
            paddingHorizontal: 12,
            paddingVertical: 9,
          }}
        >
          <Text variant="label" color={theme.colors.accentSoftFg} style={{ marginBottom: 3 }}>
            শিক্ষা
          </Text>
          <Text style={{ fontSize: 12.5, lineHeight: 19, color: theme.colors.accentSoftFg }}>{hadith.lessonBn}</Text>
        </View>
      ) : null}
    </View>
  );

  if (compact) return body;

  return (
    <Pressable
      onPress={() => router.push(`/hadith/${hadith.collectionSlug}/${hadith.id}` as never)}
      style={({ pressed }) => [
        {
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: 16,
          opacity: pressed ? 0.96 : 1,
        },
        theme.elevation.card,
      ]}
    >
      {body}
    </Pressable>
  );
}

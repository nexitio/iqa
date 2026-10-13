import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Quote, Scale } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { FATWAS } from "../../data/content";
import { getScholar, scholarDisplayName } from "../../data/scholars";
import { digits } from "../../lib/bn";
import { Avatar, Badge, EmptyState, FactList, PageHeader, Prose, Text } from "../../components/ui";

export default function FatwaScreen() {
  const theme = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { pick, locale } = useI18n();
  const fatwa = FATWAS.find((f) => f.slug === slug);
  const mufti = fatwa ? getScholar(fatwa.muftiId) : undefined;
  const coSigners = fatwa ? fatwa.coSignerIds.map((id) => getScholar(id)).filter(Boolean) : [];

  if (!fatwa) {
    return (
      <AppFrame back>
        <Screen>
          <EmptyState icon={Scale} title="ফতোয়াটি পাওয়া যায়নি" />
        </Screen>
      </AppFrame>
    );
  }

  return (
    <AppFrame back>
      <Screen>
        <PageHeader icon={Scale} eyebrow="ফতোয়া · হানাফী" title="প্রশ্ন ও রায়" patterned />

        {/* the question */}
        <View
          style={[
            {
              borderRadius: theme.radius.panel,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 16,
              gap: 8,
            },
            theme.elevation.card,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Quote size={14} color={theme.colors.fgSubtle} />
            <Text variant="label">প্রশ্ন</Text>
          </View>
          <Text style={{ fontSize: 14, lineHeight: 23, color: theme.colors.fg }}>{fatwa.questionBn}</Text>
        </View>

        {/* the ruling */}
        <View
          style={{
            borderRadius: theme.radius.panel,
            borderLeftWidth: 3,
            borderLeftColor: theme.colors.primary,
            backgroundColor: theme.colors.primarySoft,
            padding: 16,
            gap: 6,
          }}
        >
          <Text variant="label" color={theme.colors.primarySoftFg}>
            সংক্ষিপ্ত অভিমত
          </Text>
          <Text weight="medium" style={{ fontSize: 15, lineHeight: 24, color: theme.colors.primarySoftFg }}>
            {fatwa.rulingBn}
          </Text>
        </View>

        <View
          style={[
            {
              borderRadius: theme.radius.panel,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 18,
            },
            theme.elevation.card,
          ]}
        >
          <Prose paragraphs={fatwa.bodyBn} />
        </View>

        {mufti ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderRadius: theme.radius.panel,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 14,
            }}
          >
            <Avatar name={mufti.name.bn} color={mufti.avatarColor} size="md" verified={mufti.verified} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text weight="semibold" style={{ fontSize: 14.5 }}>
                {scholarDisplayName(mufti, locale)}
              </Text>
              <Text variant="small" numberOfLines={1}>
                {pick(mufti.madrasah)}
              </Text>
            </View>
            {coSigners.length ? (
              <Badge tone="neutral" size="xs">
                {coSigners.length} সহ-স্বাক্ষরকারী
              </Badge>
            ) : null}
          </View>
        ) : null}

        <View
          style={[
            {
              borderRadius: theme.radius.panel,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 16,
            },
            theme.elevation.card,
          ]}
        >
          <FactList
            columns={2}
            items={[
              { label: "ফিকহ", value: fatwa.fiqh === "hanafi" ? "হানাফী" : "তুলনামূলক" },
              { label: "প্রশ্নকারীর জেলা", value: pick({ bn: "কুমিল্লা", en: "Cumilla" }) },
              { label: "রেফারেন্স", value: digits(fatwa.referenceCount, locale) },
              { label: "প্রকাশ", value: fatwa.publishedAt.slice(0, 10) },
            ]}
          />
        </View>
      </Screen>
    </AppFrame>
  );
}

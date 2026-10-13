import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BadgeCheck, Clock3 } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { formatNumber } from "../../lib/bn";
import type { Scholar } from "../../lib/types";
import { Avatar, Badge, Text } from "../ui";

/** A verified scholar in the directory, with the signals a reader scans for. */
export function ScholarCard({ scholar }: { scholar: Scholar }) {
  const theme = useTheme();
  const router = useRouter();
  const { pick, locale } = useI18n();

  return (
    <Pressable
      onPress={() => router.push(`/scholars/${scholar.slug}` as never)}
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
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <Avatar name={scholar.name.bn} color={scholar.avatarColor} size="lg" verified={scholar.verified} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text weight="semibold" style={{ fontSize: 15.5 }} numberOfLines={1}>
              {pick(scholar.honorific)} {pick(scholar.name)}
            </Text>
            {scholar.verified ? <BadgeCheck size={15} color={theme.colors.primary} strokeWidth={2.4} /> : null}
          </View>
          <Text variant="small" numberOfLines={2} style={{ marginTop: 2, lineHeight: 18 }}>
            {pick(scholar.shortBio)}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {scholar.availableForQuestions ? (
          <Badge tone="success" size="xs" dot>
            প্রশ্নের জন্য উপলব্ধ
          </Badge>
        ) : (
          <Badge tone="neutral" size="xs" dot>
            ব্যস্ত
          </Badge>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Clock3 size={12} color={theme.colors.fgSubtle} />
          <Text variant="small" style={{ fontSize: 11 }}>
            সাধারণত {scholar.responseTimeHours} ঘন্টায় উত্তর
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text variant="small" style={{ fontSize: 11.5 }}>
          {pick(scholar.madrasah)}
        </Text>
        <Text weight="semibold" style={{ fontSize: 11.5, color: theme.colors.primary }}>
          ★ {scholar.rating}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 16 }}>
        <Metric value={formatNumber(scholar.stats.answers, locale)} label="উত্তর" />
        <Metric value={formatNumber(scholar.stats.articles, locale)} label="প্রবন্ধ" />
        <Metric value={formatNumber(scholar.stats.followers, locale)} label="অনুসারী" />
      </View>
    </Pressable>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  const theme = useTheme();
  return (
    <View>
      <Text weight="bold" style={{ fontSize: 14 }}>
        {value}
      </Text>
      <Text variant="small" style={{ fontSize: 10.5 }}>
        {label}
      </Text>
    </View>
  );
}

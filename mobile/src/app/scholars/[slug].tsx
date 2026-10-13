import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Award, BookOpen, GraduationCap, MapPin, Users } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { getScholar, scholarDisplayName } from "../../data/scholars";
import { getDepartment } from "../../data/departments";
import { digits, findDistrict } from "../../lib/bn";
import { Avatar, Badge, Chip, EmptyState, FactList, PageHeader, SectionHeader, StatTile, Text } from "../../components/ui";

export default function ScholarScreen() {
  const theme = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { pick, locale } = useI18n();
  const scholar = getScholar(slug ?? "");

  if (!scholar) {
    return (
      <AppFrame back>
        <Screen>
          <EmptyState icon={Users} title="আলেমের প্রোফাইল পাওয়া যায়নি" />
        </Screen>
      </AppFrame>
    );
  }

  const departments = scholar.departmentIds.map((id) => getDepartment(id)).filter(Boolean);

  return (
    <AppFrame back>
      <Screen>
        <View
          style={[
            {
              borderRadius: theme.radius.panel,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 18,
              gap: 12,
              alignItems: "center",
            },
            theme.elevation.card,
          ]}
        >
          <Avatar name={scholar.name.bn} color={scholar.avatarColor} size="2xl" verified={scholar.verified} />
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text variant="display" style={{ fontSize: 20, textAlign: "center" }}>
              {scholarDisplayName(scholar, locale)}
            </Text>
            <Text variant="small" align="center" style={{ lineHeight: 19 }}>
              {pick(scholar.shortBio)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {scholar.availableForQuestions ? (
              <Badge tone="success" size="sm" dot>
                প্রশ্নের জন্য উপলব্ধ
              </Badge>
            ) : null}
            <Badge tone="accent" size="sm">
              ★ {scholar.rating}
            </Badge>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatTile label="উত্তর" value={digits(scholar.stats.answers, locale)} icon={BookOpen} tone="success" />
          <StatTile label="প্রবন্ধ" value={digits(scholar.stats.articles, locale)} icon={Award} tone="info" />
          <StatTile label="অনুসারী" value={digits(scholar.stats.followers, locale)} icon={Users} tone="accent" />
        </View>

        <SectionHeader icon={Users} title="পরিচিতি" size="sm" />
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
          <Text style={{ fontSize: 14, lineHeight: 24 }}>{pick(scholar.bio)}</Text>
        </View>

        <SectionHeader icon={GraduationCap} title="শিক্ষা ও সনদ" size="sm" />
        <View style={{ gap: 10 }}>
          {scholar.credentials.map((credential) => (
            <View
              key={credential.id}
              style={{
                borderRadius: theme.radius.panel,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                padding: 14,
                gap: 4,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <Text weight="semibold" style={{ flex: 1, fontSize: 14 }}>
                  {pick(credential.title)}
                </Text>
                <Badge tone="neutral" size="xs">
                  {credential.year}
                </Badge>
              </View>
              <Text variant="small">{pick(credential.institution)}</Text>
            </View>
          ))}
        </View>

        <SectionHeader icon={MapPin} title="তথ্য" size="sm" />
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
              { label: "মাদরাসা / প্রতিষ্ঠান", value: pick(scholar.madrasah) },
              { label: "জেলা", value: pick(findDistrict(scholar.district).name) },
              { label: "ভাষা", value: scholar.languages.join(", ") },
              { label: "উত্তরের সময়", value: `~${scholar.responseTimeHours} ঘন্টা` },
            ]}
          />
        </View>

        <SectionHeader icon={BookOpen} title="বিশেষত্ব" size="sm" />
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {scholar.specialization.map((item, index) => (
            <Chip key={index} tone="primary">
              {pick(item)}
            </Chip>
          ))}
          {departments.map((department) =>
            department ? (
              <Chip key={department.id} tone={department.tone}>
                {pick(department.name)}
              </Chip>
            ) : null,
          )}
        </View>
      </Screen>
    </AppFrame>
  );
}

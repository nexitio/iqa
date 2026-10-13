import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Bell, Flame, Settings, ShieldCheck, UserRound } from "lucide-react-native";
import { AppFrame } from "../components/layout/app-frame";
import { Screen } from "../components/layout/screen";
import { useTheme } from "../theme/ThemeProvider";
import { useI18n } from "../i18n";
import { digits, findDistrict, hijriDate } from "../lib/bn";
import { relativeTime } from "../lib/utils";
import { BOOKMARKS, CURRENT_USER, READING_PROGRESS, USER_STREAK_DAYS } from "../data/personal";
import { getDepartment } from "../data/departments";
import { Avatar, Badge, Button, Chip, FactList, ProgressBar, SectionHeader, StatTile, Text } from "../components/ui";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, pick, locale } = useI18n();

  const interests = CURRENT_USER.interests
    .map((id) => getDepartment(id))
    .filter((d): d is NonNullable<ReturnType<typeof getDepartment>> => Boolean(d));

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
          <Avatar name={CURRENT_USER.name} color={CURRENT_USER.avatarColor} size="2xl" verified={CURRENT_USER.isVerified} />
          <View style={{ alignItems: "center", gap: 3 }}>
            <Text variant="display" style={{ fontSize: 20 }}>
              {CURRENT_USER.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <UserRound size={12} color={theme.colors.fgSubtle} />
              <Text variant="small">{CURRENT_USER.email}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <Badge tone="success" size="sm" icon={ShieldCheck}>
              যাচাইকৃত অ্যাকাউন্ট
            </Badge>
            <Badge tone="warning" size="sm" icon={Flame}>
              {digits(USER_STREAK_DAYS, locale)} দিনের ধারা
            </Badge>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button variant="outline" icon={Settings} size="sm" onPress={() => router.push("/settings" as never)}>
              {t("nav.settings")}
            </Button>
            <Button variant="ghost" icon={Bell} size="sm" onPress={() => router.push("/notifications" as never)}>
              {t("nav.notifications")}
            </Button>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatTile label="সংরক্ষিত" value={digits(BOOKMARKS.length, locale)} tone="primary" />
          <StatTile label="পড়া চলছে" value={digits(READING_PROGRESS.length, locale)} tone="info" />
          <StatTile
            label="অনুসরণ"
            value={digits(CURRENT_USER.followingScholarIds.length, locale)}
            tone="accent"
          />
        </View>

        <SectionHeader icon={Flame} title={t("profile.progress")} size="sm" />
        <View
          style={{
            borderRadius: theme.radius.panel,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            overflow: "hidden",
          }}
        >
          {READING_PROGRESS.map((item, index) => (
            <View
              key={item.id}
              style={{
                padding: 14,
                gap: 8,
                borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth * 2,
                borderTopColor: theme.colors.border,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <Text weight="semibold" style={{ flex: 1, fontSize: 13.5 }} numberOfLines={1}>
                  {item.titleBn}
                </Text>
                <Text variant="small" style={{ fontSize: 11.5 }}>
                  {item.progress}%
                </Text>
              </View>
              <ProgressBar value={item.progress} />
            </View>
          ))}
        </View>

        <SectionHeader icon={UserRound} title={t("profile.interests")} size="sm" />
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {interests.map((dept) => (
            <Chip key={dept.id} tone={dept.tone} active>
              {pick(dept.name)}
            </Chip>
          ))}
        </View>

        <SectionHeader icon={UserRound} title="তথ্য" size="sm" />
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
              { label: "জেলা", value: pick(findDistrict(CURRENT_USER.district).name) },
              { label: "যোগদান", value: relativeTime(CURRENT_USER.joinedAt, locale) },
              { label: "আজকের তারিখ", value: hijriDate(new Date(), locale) },
              { label: "ভূমিকা", value: "সাধারণ সদস্য" },
            ]}
          />
        </View>
      </Screen>
    </AppFrame>
  );
}

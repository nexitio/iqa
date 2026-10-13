import { useState } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { useRouter } from "expo-router";
import { Bell, Bookmark, Globe, Info, Languages, MapPin, Moon, ShieldCheck, Trash2, UserRound } from "lucide-react-native";
import { AppFrame } from "../components/layout/app-frame";
import { Screen } from "../components/layout/screen";
import { useTheme } from "../theme/ThemeProvider";
import { useI18n } from "../i18n";
import { DISTRICTS, digits, findDistrict } from "../lib/bn";
import { BOOKMARKS, CURRENT_USER } from "../data/personal";
import { Badge, Button, Chip, ListRow, PageHeader, SectionHeader, Text } from "../components/ui";

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, pick, locale, setLocale } = useI18n();


  const [districtId, setDistrictId] = useState(CURRENT_USER.district);
  const [madhab, setMadhab] = useState<"hanafi" | "shafi">("hanafi");
  const [notifications, setNotifications] = useState({
    prayer: true,
    daily: true,
    mentions: true,
    answers: true,
    marketing: false,
  });

  return (
    <AppFrame back>
      <Screen>
        <PageHeader icon={Moon} eyebrow="অ্যাকাউন্ট" title="সেটিংস" description="অ্যাপের পছন্দ ও ব্যক্তিগতকরণ নিয়ন্ত্রণ করুন" patterned />

        <SectionHeader icon={UserRound} title="অ্যাকাউন্ট" size="sm" />
        <View
          style={[
            {
              borderRadius: theme.radius.panel,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              paddingHorizontal: 16,
            },
            theme.elevation.card,
          ]}
        >
          <ListRow
            icon={UserRound}
            title={CURRENT_USER.name}
            description={CURRENT_USER.email}
            onPress={() => router.push("/profile" as never)}
          />
          <ListRow
            icon={ShieldCheck}
            title="যাচাইকৃত"
            description="ইমেইল যাচাই সম্পন্ন"
            badge={<Badge tone="success" size="sm">সক্রিয়</Badge>}
            divider={false}
          />
        </View>

        <SectionHeader icon={Languages} title="ভাষা" size="sm" />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Chip tone="primary" active={locale === "bn"} onPress={() => setLocale("bn")}>
            বাংলা
          </Chip>
          <Chip tone="primary" active={locale === "en"} onPress={() => setLocale("en")}>
            English
          </Chip>
        </View>

        <SectionHeader icon={MapPin} title="নামাজের এলাকা" size="sm" />
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {DISTRICTS.slice(0, 8).map((district) => (
            <Chip key={district.id} tone="info" active={districtId === district.id} onPress={() => setDistrictId(district.id)}>
              {pick(district.name)}
            </Chip>
          ))}
        </View>
        <Text variant="small">নির্বাচিত: {pick(findDistrict(districtId).name)}</Text>

        <SectionHeader icon={Moon} title="মাযহাব অনুযায়ী সময়" size="sm" />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Chip tone="accent" active={madhab === "hanafi"} onPress={() => setMadhab("hanafi")}>
            হানাফী
          </Chip>
          <Chip tone="accent" active={madhab === "shafi"} onPress={() => setMadhab("shafi")}>
            শাফেঈ
          </Chip>
        </View>

        <SectionHeader icon={Bell} title={t("settings.notifications")} size="sm" />
        <View
          style={[
            {
              borderRadius: theme.radius.panel,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              paddingHorizontal: 16,
            },
            theme.elevation.card,
          ]}
        >
          {(
            [
              ["prayer", "নামাজের সময়"],
              ["daily", "দৈনিক আয়াত ও হাদিস"],
              ["mentions", "উল্লেখ ও উত্তর"],
              ["answers", "প্রশ্নের উত্তর"],
              ["marketing", "প্রচারমূলক বার্তা"],
            ] as const
          ).map(([key, label]) => (
            <ListRow
              key={key}
              title={label}
              right={
                <Switch
                  value={notifications[key]}
                  onValueChange={(value) => setNotifications((prev) => ({ ...prev, [key]: value }))}
                  trackColor={{ false: theme.colors.surface3, true: theme.colors.primary }}
                  thumbColor="#ffffff"
                />
              }
            />
          ))}
        </View>

        <SectionHeader icon={Info} title="অ্যাপ" size="sm" />
        <View
          style={[
            {
              borderRadius: theme.radius.panel,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              paddingHorizontal: 16,
            },
            theme.elevation.card,
          ]}
        >
          <ListRow icon={Globe} title="সংস্করণ" description="১.০.০" />
          <ListRow
            icon={Bookmark}
            title="সংরক্ষিত আইটেম"
            description={`${digits(BOOKMARKS.length, locale)} টি সংরক্ষিত`}
            onPress={() => router.push("/notifications" as never)}
          />
        </View>

        <Button variant="danger" icon={Trash2} fullWidth>
          অ্যাকাউন্ট মুছে ফেলার অনুরোধ
        </Button>
        <Text variant="small" style={{ textAlign: "center" }}>
          ডেটা স্থানীয়ভাবে সংরক্ষিত। কোনো তথ্য সার্ভারে পাঠানো হয় না।
        </Text>
      </Screen>
    </AppFrame>
  );
}

import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Bell, BellRing, CheckCheck, Flame, GraduationCap, MessageSquare, ShieldAlert, Sparkles, UserRound } from "lucide-react-native";
import { AppFrame } from "../components/layout/app-frame";
import { Screen } from "../components/layout/screen";
import { useTheme } from "../theme/ThemeProvider";
import { useI18n } from "../i18n";
import { relativeTime } from "../lib/utils";
import { digits } from "../lib/bn";
import { NOTIFICATIONS } from "../data/personal";
import type { NotificationKind } from "../lib/types";
import { softTone } from "../theme/tone";
import { Button, EmptyState, PageHeader, Text } from "../components/ui";

const KIND_META: Record<NotificationKind, { icon: typeof Bell; color: "success" | "info" | "primary" | "accent" | "warning" }> = {
  answer: { icon: MessageSquare, color: "success" },
  mention: { icon: MessageSquare, color: "info" },
  follow: { icon: UserRound, color: "primary" },
  reshare: { icon: Flame, color: "accent" },
  moderation: { icon: ShieldAlert, color: "warning" },
  daily: { icon: Sparkles, color: "primary" },
  journey: { icon: GraduationCap, color: "accent" },
  system: { icon: BellRing, color: "info" },
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const [read, setRead] = useState<Record<string, boolean>>(
    () => Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.read])),
  );

  const unreadCount = NOTIFICATIONS.filter((n) => !read[n.id]).length;

  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={Bell}
          eyebrow="বিজ্ঞপ্তি"
          title={t("notifications.title")}
          description={`${digits(unreadCount, locale)} টি অপঠিত`}
          patterned
          actions={
            <Button
              variant="outline"
              size="sm"
              icon={CheckCheck}
              onPress={() => setRead(Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, true])))}
            >
              {t("notifications.markAll")}
            </Button>
          }
        />

        {NOTIFICATIONS.length === 0 ? (
          <EmptyState icon={Bell} title={t("notifications.empty")} />
        ) : (
          <View
            style={{
              borderRadius: theme.radius.panel,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              overflow: "hidden",
            }}
          >
            {NOTIFICATIONS.map((notification, index) => {
              const meta = KIND_META[notification.kind];
              const Icon = meta.icon;
              const isUnread = !read[notification.id];
              return (
                <View
                  key={notification.id}
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    padding: 14,
                    borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth * 2,
                    borderTopColor: theme.colors.border,
                    backgroundColor: isUnread ? theme.colors.primarySoft : "transparent",
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: theme.colors.surface3,
                    }}
                  >
                    <Icon size={17} color={softTone(theme.colors)[meta.color].foreground} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text weight="semibold" style={{ flex: 1, fontSize: 14 }} numberOfLines={2}>
                        {notification.titleBn}
                      </Text>
                      {isUnread ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary }} /> : null}
                    </View>
                    <Text variant="small" style={{ lineHeight: 19 }}>
                      {notification.bodyBn}
                    </Text>
                    <Text style={{ fontSize: 10.5, color: theme.colors.fgSubtle }}>
                      {relativeTime(notification.createdAt, locale)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Screen>
    </AppFrame>
  );
}

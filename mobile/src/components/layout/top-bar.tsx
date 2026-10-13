import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";
import { Bell, ChevronLeft, Menu, Plus, Search, X } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { NOTIFICATIONS } from "../../data/personal";
import { digits } from "../../lib/bn";
import { Avatar, CountPill, IconButton, Text } from "../ui";
import { ACCOUNT_NAV, SIDEBAR_GROUPS, SIDEBAR_TOP, type NavLink } from "./nav-config";

/** Brand lockup: an Arabic letterform tile plus the bilingual wordmark. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.primary,
        }}
      >
        <Text style={{ fontFamily: theme.font.display, fontSize: 17, lineHeight: 22, color: theme.colors.primaryFg }}>
          ع
        </Text>
      </View>
      {!compact ? (
        <View>
          <Text style={{ fontFamily: theme.font.display, fontSize: 17, lineHeight: 21, color: theme.colors.fg }}>
            ইলম
          </Text>
          <Text style={{ fontSize: 9.5, lineHeight: 13, letterSpacing: 1.4, color: theme.colors.fgSubtle }}>
            ILM · জ্ঞান
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/**
 * The bar is chrome: a menu control, the wordmark, and the three things a
 * reader checks (search, language, notifications). Composing has exactly one
 * home — the raised disc in the tab bar — so the header deliberately omits it.
 */
export function TopBar({ back = false }: { back?: boolean }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { toggleLocale, isBn, pick, locale } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const go = (href: string) => {
    setDrawerOpen(false);
    router.push(href as never);
  };

  const row = (link: NavLink, key: string) => {
    const active = isActive(link.href);
    return (
      <Pressable
        key={key}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        onPress={() => go(link.href)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 12,
          paddingVertical: 11,
          borderRadius: 12,
          backgroundColor: active ? theme.colors.primarySoft : pressed ? theme.colors.surface3 : "transparent",
        })}
      >
        <link.icon
          size={17}
          color={active ? theme.colors.primary : theme.colors.fgSubtle}
          strokeWidth={2}
        />
        <Text
          weight="medium"
          style={{ fontSize: 14.5, color: active ? theme.colors.primarySoftFg : theme.colors.fg }}
        >
          {pick(link.label)}
        </Text>
        {link.badge ? <CountPill value={digits(link.badge, locale)} tone="primary" /> : null}
      </Pressable>
    );
  };

  return (
    <>
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: StyleSheet.hairlineWidth * 2,
          borderBottomColor: theme.colors.border,
        }}
      >
        <View
          style={{
            height: 56,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          {back ? (
            <IconButton
              icon={ChevronLeft}
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/" as never))}
              accessibilityLabel="back"
            />
          ) : (
            <IconButton icon={Menu} onPress={() => setDrawerOpen(true)} accessibilityLabel="menu" />
          )}
          <BrandMark compact={back} />

          <View style={{ flex: 1 }} />

          <IconButton icon={Search} onPress={() => router.push("/search" as never)} accessibilityLabel="search" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="language"
            onPress={toggleLocale}
            style={{
              height: 30,
              paddingHorizontal: 9,
              borderRadius: 999,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text weight="semibold" style={{ fontSize: 11.5, color: theme.colors.fgMuted }}>
              {isBn ? "বাং" : "EN"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="notifications"
            onPress={() => router.push("/notifications" as never)}
            style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
          >
            <Bell size={19} color={theme.colors.fgMuted} strokeWidth={2} />
            {unread > 0 ? (
              <View style={{ position: "absolute", top: 4, right: 3 }}>
                <CountPill value={digits(unread, locale)} tone="danger" />
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      {/* Mobile navigation drawer */}
      <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={() => setDrawerOpen(false)}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View
            style={{
              width: "86%",
              maxWidth: 320,
              backgroundColor: theme.colors.surface,
              paddingTop: insets.top,
            }}
          >
            <View
              style={{
                height: 56,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottomWidth: StyleSheet.hairlineWidth * 2,
                borderBottomColor: theme.colors.border,
              }}
            >
              <BrandMark />
              <IconButton icon={X} onPress={() => setDrawerOpen(false)} accessibilityLabel="close" />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              <Pressable
                onPress={() => go("/questions/ask")}
                style={{
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <Plus size={17} color={theme.colors.primaryFg} strokeWidth={2.5} />
                <Text weight="semibold" style={{ fontSize: 14, color: theme.colors.primaryFg }}>
                  প্রশ্ন করুন
                </Text>
              </Pressable>

              <View style={{ gap: 2 }}>{SIDEBAR_TOP.map((link) => row(link, link.href))}</View>

              {SIDEBAR_GROUPS.map((group) => (
                <View key={group.title.en} style={{ marginTop: 20 }}>
                  <Text variant="label" style={{ paddingHorizontal: 12, marginBottom: 6 }}>
                    {pick(group.title)}
                  </Text>
                  <View style={{ gap: 2 }}>
                    {group.links.filter((l) => !l.secondary).map((link) => row(link, `${group.title.en}-${link.href}`))}
                  </View>
                </View>
              ))}

              <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth * 2, borderTopColor: theme.colors.border }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, marginBottom: 12 }}>
                  <Avatar name="আব্দুল্লাহ আল-মামুন" color={theme.colors.primary} size="md" verified />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text weight="semibold" style={{ fontSize: 14 }}>
                      আব্দুল্লাহ আল-মামুন
                    </Text>
                    <Text variant="small">abdullah.almamun@gmail.com</Text>
                  </View>
                </View>
                <View style={{ gap: 2 }}>
                  {ACCOUNT_NAV.map((link) => row(link, `account-${link.href}`))}
                </View>
              </View>
            </ScrollView>
          </View>

          <Pressable
            accessibilityLabel="close menu"
            style={{ flex: 1, backgroundColor: theme.colors.overlay }}
            onPress={() => setDrawerOpen(false)}
          />
        </View>
      </Modal>
    </>
  );
}

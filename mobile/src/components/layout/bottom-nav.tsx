import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { BOTTOM_NAV } from "./nav-config";
import { Text } from "../ui";

/**
 * Mobile tab bar. Five slots with the centre reserved for the primary action —
 * the same habit the web's bottom bar encourages.
 *
 * Four route tabs flank a raised disc that opens the compose menu, so the tab
 * list and the action are one control surface rather than two.
 */
/**
 * The bits of the tab bar's props this bar actually uses.
 *
 * Declared structurally rather than imported: Expo Router vendors its own
 * navigation package, so `@react-navigation/bottom-tabs` has no top-level types
 * to import. Only `state.index`, the routes and the two navigation calls are
 * needed, and those are stable across versions.
 */
interface TabBarState {
  index: number;
  routes: { key: string; name: string }[];
}

interface TabBarNavigation {
  emit: (event: { type: "tabPress"; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
  navigate: (name: string) => void;
}

export function BottomNav({ state, navigation }: { state: TabBarState; navigation: TabBarNavigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { pick } = useI18n();

  const activeRouteName = state.routes[state.index]?.name;

  const item = (link: (typeof BOTTOM_NAV)[number], routeName: string, index: number) => {
    const active = activeRouteName === routeName;
    return (
      <Pressable
        key={link.href}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        onPress={() => {
          const event = navigation.emit({ type: "tabPress", target: state.routes[index].key, canPreventDefault: true });
          if (!active && !event.defaultPrevented) navigation.navigate(state.routes[index].name);
        }}
        style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 8 }}
      >
        <link.icon size={21} color={active ? theme.colors.primary : theme.colors.fgSubtle} strokeWidth={active ? 2.4 : 1.9} />
        <Text
          weight="medium"
          style={{ fontSize: 10, lineHeight: 13, color: active ? theme.colors.primary : theme.colors.fgSubtle }}
        >
          {pick(link.label)}
        </Text>
      </Pressable>
    );
  };

  const left = BOTTOM_NAV.slice(0, 2);
  const right = BOTTOM_NAV.slice(2);

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderTopWidth: StyleSheet.hairlineWidth * 2,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingBottom: insets.bottom,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "stretch", maxWidth: 480, width: "100%", alignSelf: "center" }}>
        {left.map((link, i) => item(link, routeNameFor(link.href), i))}

        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 4 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="compose"
            onPress={() => router.push("/compose" as never)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.primary,
              marginTop: -16,
              ...theme.elevation.raised,
            }}
          >
            <Plus size={24} color={theme.colors.primaryFg} strokeWidth={2.4} />
          </Pressable>
        </View>

        {right.map((link, i) => item(link, routeNameFor(link.href), i + 2))}
      </View>
    </View>
  );
}

/** Route file name for a nav href, matching the `(tabs)` group's files. */
function routeNameFor(href: string) {
  if (href === "/") return "index";
  return href.replace(/^\//, "");
}

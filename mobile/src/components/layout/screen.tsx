import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeProvider";

/**
 * The page frame every route sits in.
 *
 * Mirrors the web shell: a warm app background, a soft emerald wash bleeding
 * down from the header, a 16px gutter, and enough bottom room for the tab bar
 * plus the home indicator.
 */
export function Screen({
  children,
  scroll = true,
  gutter = 16,
  contentStyle,
  /** Extra bottom padding on top of the safe-area + tab-bar clearance. */
  bottomExtra = 0,
}: {
  children: ReactNode;
  scroll?: boolean;
  gutter?: number;
  contentStyle?: ViewStyle;
  bottomExtra?: number;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Ambient wash: gives the flat app background a little depth. */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 220,
          backgroundColor: theme.colors.primarySoft,
          opacity: theme.isDark ? 0.25 : 0.5,
        }}
      />
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            { paddingHorizontal: gutter, paddingTop: 16, paddingBottom: insets.bottom + 96 + bottomExtra, gap: 16 },
            contentStyle,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingHorizontal: gutter, paddingTop: 16 }, contentStyle]}>{children}</View>
      )}
    </View>
  );
}

/** A titled group of content inside a `Screen`. */
export function Section({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ gap: 12 }, style]}>{children}</View>;
}

/** Hairline rule, matching the web's `border-border`. */
export function Rule({ style }: { style?: ViewStyle }) {
  const theme = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth * 2, backgroundColor: theme.colors.border }, style]} />;
}

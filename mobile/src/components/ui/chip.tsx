import { isValidElement, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { outlineTone, softTone, type Tone } from "../../theme/tone";
import { Text } from "./text";

type ChipSize = "sm" | "md";

const SIZES: Record<ChipSize, { height: number; paddingHorizontal: number; fontSize: number; icon: number }> = {
  sm: { height: 28, paddingHorizontal: 10, fontSize: 12, icon: 14 },
  md: { height: 36, paddingHorizontal: 14, fontSize: 13, icon: 16 },
};

/** A pill for a navigable subject (topic, department, tag). */
export function Chip({
  children,
  tone = "neutral",
  size = "sm",
  icon: Icon,
  variant = "soft",
  active = false,
  count,
  onPress,
  style,
}: {
  children: ReactNode;
  tone?: Tone;
  size?: ChipSize;
  icon?: LucideIcon;
  variant?: "soft" | "outline";
  active?: boolean;
  count?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const dims = SIZES[size];
  const soft = softTone(theme.colors)[tone];
  const outline = outlineTone(theme.colors)[tone];

  const bg = active ? theme.colors.primary : variant === "outline" ? outline.background : soft.background;
  const fg = active ? theme.colors.primaryFg : variant === "outline" ? outline.foreground : soft.foreground;
  const border = active ? theme.colors.primary : variant === "outline" ? outline.border : "transparent";

  const inner = (
    <View
      style={[
        {
          height: dims.height,
          paddingHorizontal: dims.paddingHorizontal,
          borderRadius: 999,
          backgroundColor: bg,
          borderWidth: variant === "outline" && !active ? StyleSheet.hairlineWidth * 2 : 0,
          borderColor: border,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        },
        style,
      ]}
    >
      {Icon ? <Icon size={dims.icon} color={fg} strokeWidth={2} /> : null}
      {/* Mixed children (`label {count}`) must land inside a `<Text>`, not in the `View`. */}
      {isValidElement(children) ? (
        children
      ) : (
        <Text weight="medium" style={{ fontSize: dims.fontSize, color: fg }}>
          {children}
        </Text>
      )}
      {count !== undefined ? (
        <Text style={{ fontSize: dims.fontSize - 1, color: fg, opacity: 0.7 }}>{count}</Text>
      ) : null}
    </View>
  );

  if (!onPress) return inner;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {inner}
    </Pressable>
  );
}

/** Horizontally scrollable row of chips — the standard subject filter rail. */
export function ChipList({ children, contentStyle }: { children: ReactNode; contentStyle?: ViewStyle }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 }, contentStyle]}
    >
      {children}
    </ScrollView>
  );
}

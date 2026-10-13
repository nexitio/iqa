import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { Text } from "./text";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "soft"
  | "outline"
  | "ghost"
  | "subtle"
  | "danger";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

const SIZES: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; radius: number }> = {
  xs: { height: 28, paddingHorizontal: 10, fontSize: 12, radius: 999 },
  sm: { height: 34, paddingHorizontal: 12, fontSize: 13, radius: 999 },
  md: { height: 42, paddingHorizontal: 16, fontSize: 14, radius: 999 },
  lg: { height: 50, paddingHorizontal: 22, fontSize: 15, radius: 999 },
};

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  /** Square corners for toolbars and inline form actions. */
  squared?: boolean;
  onPress?: PressableProps["onPress"];
  style?: ViewStyle;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  squared = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const { colors } = theme;
  const dims = SIZES[size];

  const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: colors.primary, fg: colors.primaryFg, border: "transparent" },
    accent: { bg: colors.accent, fg: colors.accentFg, border: "transparent" },
    soft: { bg: colors.primarySoft, fg: colors.primarySoftFg, border: "transparent" },
    outline: { bg: colors.surface, fg: colors.fg, border: colors.borderStrong },
    ghost: { bg: "transparent", fg: colors.fgMuted, border: "transparent" },
    subtle: { bg: colors.surface3, fg: colors.fg, border: "transparent" },
    danger: { bg: colors.danger, fg: colors.onDanger, border: "transparent" },
  };
  const tone = palette[variant];
  const iconSize = size === "lg" ? 20 : size === "xs" ? 14 : 16;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: loading }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          height: dims.height,
          paddingHorizontal: dims.paddingHorizontal,
          borderRadius: squared ? 10 : dims.radius,
          backgroundColor: tone.bg,
          borderWidth: variant === "outline" ? StyleSheet.hairlineWidth * 2 : 0,
          borderColor: tone.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          opacity: disabled ? 0.55 : pressed ? 0.9 : 1,
          ...theme.elevation.card,
        },
        variant === "ghost" || variant === "subtle" ? { shadowOpacity: 0, elevation: 0 } : null,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.fg} />
      ) : Icon ? (
        <Icon size={iconSize} color={tone.fg} strokeWidth={2.1} />
      ) : null}
      {children !== undefined && children !== null ? (
        typeof children === "string" ? (
          <Text weight="semibold" style={{ color: tone.fg, fontSize: dims.fontSize }}>
            {children}
          </Text>
        ) : (
          children
        )
      ) : null}
      {IconRight && !loading ? <IconRight size={iconSize} color={tone.fg} strokeWidth={2.1} /> : null}
    </Pressable>
  );
}

/** A square, quiet icon control — the shared shape of the header's buttons. */
export function IconButton({
  icon: Icon,
  size = 18,
  color,
  style,
  ...rest
}: Omit<PressableProps, "style"> & { icon: LucideIcon; size?: number; color?: string; style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: pressed ? theme.colors.surface3 : "transparent",
        },
        style,
      ]}
      {...rest}
    >
      <Icon size={size} color={color ?? theme.colors.fgMuted} strokeWidth={2} />
    </Pressable>
  );
}

/** A single option inside a segmented control. */
export function SegmentButton({
  active = false,
  icon: Icon,
  children,
  onPress,
}: {
  active?: boolean;
  icon?: LucideIcon;
  children: ReactNode;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{
        height: 32,
        paddingHorizontal: 12,
        borderRadius: 999,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: active ? theme.colors.primary : "transparent",
      }}
    >
      {Icon ? <Icon size={14} color={active ? theme.colors.primaryFg : theme.colors.fgMuted} strokeWidth={2.1} /> : null}
      <Text
        weight="medium"
        style={{ fontSize: 13, color: active ? theme.colors.primaryFg : theme.colors.fgMuted }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

/** Segmented control row used for filters and view switchers. */
export function ButtonGroup({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface2,
        padding: 4,
        alignSelf: "flex-start",
      }}
    >
      {children}
    </View>
  );
}

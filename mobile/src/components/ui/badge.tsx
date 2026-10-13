import { isValidElement, type ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { BadgeCheck } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { outlineTone, softTone, solidTone, statusTone, type Tone } from "../../theme/tone";
import { Text } from "./text";

type BadgeSize = "xs" | "sm" | "md";

const SIZES: Record<BadgeSize, { height: number; paddingHorizontal: number; fontSize: number; radius: number; icon: number }> = {
  xs: { height: 20, paddingHorizontal: 6, fontSize: 11, radius: 6, icon: 12 },
  sm: { height: 24, paddingHorizontal: 8, fontSize: 12, radius: 8, icon: 13 },
  md: { height: 28, paddingHorizontal: 10, fontSize: 13, radius: 8, icon: 15 },
};

export function Badge({
  children,
  tone = "neutral",
  size = "sm",
  icon: Icon,
  variant = "soft",
  dot = false,
  style,
}: {
  children: ReactNode;
  tone?: Tone;
  size?: BadgeSize;
  icon?: LucideIcon;
  variant?: "soft" | "solid" | "outline";
  dot?: boolean;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const dims = SIZES[size];
  const soft = softTone(theme.colors)[tone];
  const solid = solidTone(theme.colors)[tone];
  const outline = outlineTone(theme.colors)[tone];

  const bg = variant === "solid" ? solid : soft.background;
  const fg = variant === "solid" ? theme.colors.fgInverted : outline.foreground;
  const border = variant === "outline" ? soft.background : "transparent";

  return (
    <View
      style={[
        {
          height: dims.height,
          paddingHorizontal: dims.paddingHorizontal,
          borderRadius: dims.radius,
          backgroundColor: bg,
          borderWidth: variant === "outline" ? StyleSheet.hairlineWidth * 2 : 0,
          borderColor: border,
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      {dot ? (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: variant === "solid" ? theme.colors.fgInverted : solid,
          }}
        />
      ) : null}
      {Icon ? <Icon size={dims.icon} color={fg} strokeWidth={2.2} /> : null}
      {/*
       * Anything that is not already an element gets a host `<Text>` — a bare
       * string, a number or a mixed array (`আয়াত {n}`) would otherwise be a text
       * node directly inside a `View`, which React Native rejects.
       */}
      {isValidElement(children) ? (
        children
      ) : (
        <Text weight="medium" style={{ fontSize: dims.fontSize, lineHeight: dims.fontSize + 4, color: fg }}>
          {children}
        </Text>
      )}
    </View>
  );
}

/** Lifecycle badge driven by a snake/kebab status string from the data layer. */
export function StatusBadge({ status, label, size = "sm" }: { status: string; label: string; size?: BadgeSize }) {
  return (
    <Badge tone={statusTone(status)} size={size} dot>
      {label}
    </Badge>
  );
}

/** Small verified tick used beside scholar names. */
export function VerifiedMark({ size = 15, label = "verified" }: { size?: number; label?: string }) {
  const theme = useTheme();
  return <BadgeCheck size={size} color={theme.colors.primary} strokeWidth={2.4} accessibilityLabel={label} />;
}

/** Tiny count pill for nav rails and tab labels. */
export function CountPill({ value, tone = "neutral" }: { value: ReactNode; tone?: Tone }) {
  const theme = useTheme();
  const soft = softTone(theme.colors)[tone];
  return (
    <View
      style={{
        minWidth: 20,
        height: 20,
        paddingHorizontal: 6,
        borderRadius: 999,
        backgroundColor: soft.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isValidElement(value) ? (
        value
      ) : (
        <Text weight="semibold" style={{ fontSize: 11, lineHeight: 15, color: soft.foreground }}>
          {value}
        </Text>
      )}
    </View>
  );
}

/** Numeric "trust" chip, e.g. "৯৬% সহায়ক". */
export function ScoreBadge({ value, label, tone = "primary" }: { value: string; label?: string; tone?: Tone }) {
  const theme = useTheme();
  const soft = softTone(theme.colors)[tone];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: 8,
        backgroundColor: soft.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: "flex-start",
      }}
    >
      {label ? (
        <Text style={{ fontSize: 12, color: soft.foreground, opacity: 0.8 }}>{label}</Text>
      ) : null}
      <Text weight="semibold" style={{ fontSize: 12, color: soft.foreground }}>
        {value}
      </Text>
    </View>
  );
}

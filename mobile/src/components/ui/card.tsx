import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { softTone, type Tone } from "../../theme/tone";
import { Text } from "./text";

type CardVariant = "default" | "raised" | "flat" | "outline" | "parchment";
type CardPadding = "none" | "sm" | "md" | "lg";

const PADDING: Record<CardPadding, number> = { none: 0, sm: 14, md: 16, lg: 20 };

export function Card({
  children,
  variant = "default",
  padding = "md",
  interactive = false,
  onPress,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const { colors } = theme;

  const surface: Record<CardVariant, { bg: string; border: string; elevated: boolean }> = {
    default: { bg: colors.surface, border: colors.border, elevated: true },
    raised: { bg: colors.surface, border: colors.border, elevated: true },
    flat: { bg: colors.surface2, border: "transparent", elevated: false },
    outline: { bg: "transparent", border: colors.border, elevated: false },
    parchment: { bg: colors.surface, border: colors.border, elevated: true },
  };
  const tone = surface[variant];

  const content = (
    <View
      style={[
        {
          borderRadius: theme.radius.panel,
          backgroundColor: tone.bg,
          borderWidth: tone.border === "transparent" ? 0 : StyleSheet.hairlineWidth * 2,
          borderColor: tone.border,
          padding: PADDING[padding],
        },
        tone.elevated ? (variant === "raised" ? theme.elevation.raised : theme.elevation.card) : null,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.94 : 1, transform: [{ scale: pressed ? 0.995 : 1 }] })}
    >
      {content}
    </Pressable>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  tone = "primary",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  tone?: Tone;
}) {
  const theme = useTheme();
  const palette = softTone(theme.colors)[tone];
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
        {Icon ? (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.background,
              marginTop: 2,
            }}
          >
            <Icon size={16} color={palette.foreground} strokeWidth={2} />
          </View>
        ) : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          {typeof title === "string" ? <Text variant="title">{title}</Text> : title}
          {subtitle ? (
            typeof subtitle === "string" ? (
              <Text variant="small" style={{ marginTop: 2 }}>
                {subtitle}
              </Text>
            ) : (
              subtitle
            )
          ) : null}
        </View>
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

export function CardBody({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ marginTop: 14 }, style]}>{children}</View>;
}

export function CardFooter({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          marginTop: 14,
          paddingTop: 14,
          borderTopWidth: StyleSheet.hairlineWidth * 2,
          borderTopColor: theme.colors.border,
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

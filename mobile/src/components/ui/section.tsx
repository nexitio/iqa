import { isValidElement, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { ArrowRight, ChevronRight, TrendingDown, TrendingUp } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { softTone, textTone, type Tone } from "../../theme/tone";
import { Text } from "./text";

/** The standard top-of-page block. Every route uses this. */
export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  tone = "primary",
  children,
  patterned = false,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
  tone?: Tone;
  children?: ReactNode;
  patterned?: boolean;
}) {
  const theme = useTheme();
  const palette = softTone(theme.colors)[tone];
  return (
    <View
      style={[
        {
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: 16,
          overflow: "hidden",
        },
        theme.elevation.card,
      ]}
    >
      {patterned ? (
        <View pointerEvents="none" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        {Icon ? (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.background,
            }}
          >
            <Icon size={19} color={palette.foreground} strokeWidth={1.9} />
          </View>
        ) : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          {eyebrow ? (
            isValidElement(eyebrow) ? (
              eyebrow
            ) : (
              <Text variant="label" color={textTone(theme.colors)[tone]}>
                {eyebrow}
              </Text>
            )
          ) : null}
          {isValidElement(title) ? (
            title
          ) : (
            <Text variant="display" style={{ marginTop: eyebrow ? 2 : 0 }}>
              {title}
            </Text>
          )}
          {description ? (
            isValidElement(description) ? (
              <View style={{ marginTop: 6 }}>{description}</View>
            ) : (
              <Text variant="small" style={{ marginTop: 6, lineHeight: 20 }}>
                {description}
              </Text>
            )
          ) : null}
        </View>
      </View>
      {actions ? <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{actions}</View> : null}
      {children ? <View style={{ marginTop: 14 }}>{children}</View> : null}
    </View>
  );
}

export function SectionHeader({
  title,
  description,
  icon: Icon,
  action,
  onAction,
  actionLabel,
  tone = "primary",
  size = "md",
  style,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  onAction?: () => void;
  actionLabel?: ReactNode;
  tone?: Tone;
  size?: "sm" | "md";
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const palette = softTone(theme.colors)[tone];
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
        {Icon ? (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.background,
            }}
          >
            <Icon size={size === "sm" ? 14 : 16} color={palette.foreground} strokeWidth={2} />
          </View>
        ) : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          {isValidElement(title) ? (
            title
          ) : (
            <Text variant="title" style={size === "sm" ? { fontSize: 14 } : undefined}>
              {title}
            </Text>
          )}
          {description ? (
            isValidElement(description) ? (
              description
            ) : (
              <Text variant="small" style={{ fontSize: 12 }}>
                {description}
              </Text>
            )
          ) : null}
        </View>
      </View>
      {action ??
        (onAction ? (
          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            hitSlop={6}
          >
            <Text weight="medium" style={{ fontSize: 13, color: theme.colors.primary }}>
              {actionLabel}
            </Text>
            <ArrowRight size={14} color={theme.colors.primary} />
          </Pressable>
        ) : null)}
    </View>
  );
}

export function Delta({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const theme = useTheme();
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  const bg = up ? theme.colors.successSoft : theme.colors.dangerSoft;
  const fg = up ? theme.colors.successSoftFg : theme.colors.dangerSoftFg;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: bg,
      }}
    >
      <Icon size={12} color={fg} strokeWidth={2.6} />
      <Text weight="semibold" style={{ fontSize: 11, color: fg }}>
        {up ? "+" : ""}
        {value}
        {suffix}
      </Text>
    </View>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  delta,
  onPress,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  delta?: number;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const palette = softTone(theme.colors)[tone];
  const body = (
    <View
      style={[
        {
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: 14,
          flex: 1,
        },
        theme.elevation.card,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        {isValidElement(label) ? (
          label
        ) : (
          <Text weight="medium" style={{ fontSize: 12, color: theme.colors.fgMuted, flex: 1 }}>
            {label}
          </Text>
        )}
        {Icon ? (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.background,
            }}
          >
            <Icon size={16} color={palette.foreground} strokeWidth={2} />
          </View>
        ) : null}
      </View>
      <View style={{ marginTop: 6, flexDirection: "row", alignItems: "baseline", gap: 8 }}>
        {isValidElement(value) ? (
          value
        ) : (
          <Text variant="display" style={{ fontSize: 24 }}>
            {value}
          </Text>
        )}
        {delta !== undefined ? <Delta value={delta} /> : null}
      </View>
      {hint ? (
        isValidElement(hint) ? (
          hint
        ) : (
          <Text style={{ marginTop: 6, fontSize: 11, color: theme.colors.fgSubtle }}>{hint}</Text>
        )
      ) : null}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.94 : 1 })}>
      {body}
    </Pressable>
  );
}

/**
 * A settings/navigation row: leading icon well, title + description, and a
 * trailing slot (chevron, switch, badge). Mirrors the web's quiet list rows.
 */
export function ListRow({
  icon: Icon,
  title,
  description,
  badge,
  right,
  onPress,
  tone = "primary",
  divider = true,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  tone?: Tone;
  divider?: boolean;
}) {
  const theme = useTheme();
  const palette = softTone(theme.colors)[tone];

  const body = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 13,
        borderBottomWidth: divider ? StyleSheet.hairlineWidth * 2 : 0,
        borderBottomColor: theme.colors.border,
      }}
    >
      {Icon ? (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: palette.background,
          }}
        >
          <Icon size={17} color={palette.foreground} strokeWidth={1.9} />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        {isValidElement(title) ? (
          title
        ) : (
          <Text weight="medium" style={{ fontSize: 14.5 }}>
            {title}
          </Text>
        )}
        {description ? (
          isValidElement(description) ? (
            description
          ) : (
            <Text variant="small" style={{ marginTop: 2 }} numberOfLines={2}>
              {description}
            </Text>
          )
        ) : null}
      </View>
      {badge ? <View>{badge}</View> : null}
      {right ?? (onPress ? <ChevronRight size={17} color={theme.colors.fgSubtle} /> : null)}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {body}
    </Pressable>
  );
}

/** Labelled value used inside profile and fatwa metadata grids. */
export function FactList({
  items,
  columns = 2,
}: {
  items: { label: string; value: ReactNode; icon?: LucideIcon }[];
  columns?: 1 | 2 | 3;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 16, columnGap: 20 }}>
      {items.map((item, index) => (
        <View key={index} style={{ width: columns === 1 ? "100%" : columns === 2 ? "46%" : "30%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            {item.icon ? <item.icon size={13} color={theme.colors.fgSubtle} /> : null}
            <Text variant="label" style={{ fontSize: 10.5 }}>
              {item.label}
            </Text>
          </View>
          {typeof item.value === "string" ? (
            <Text weight="medium" style={{ marginTop: 3, fontSize: 14 }}>
              {item.value}
            </Text>
          ) : (
            <View style={{ marginTop: 3 }}>{item.value}</View>
          )}
        </View>
      ))}
    </View>
  );
}

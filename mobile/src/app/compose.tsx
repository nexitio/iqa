import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { HelpCircle, MessageSquare, PenLine, Sparkles } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { AppFrame } from "../components/layout/app-frame";
import { Screen } from "../components/layout/screen";
import { useTheme } from "../theme/ThemeProvider";
import { useI18n } from "../i18n";
import { softTone, type Tone } from "../theme/tone";
import { PageHeader, SectionHeader, Text } from "../components/ui";

export default function ComposeScreen() {
  const { t } = useI18n();

  const options: { icon: LucideIcon; tone: Tone; title: string; hint: string; href: string }[] = [
    {
      icon: HelpCircle,
      tone: "primary",
      title: t("compose.askQuestion"),
      hint: t("compose.askQuestionHint"),
      href: "/questions/ask",
    },
    {
      icon: PenLine,
      tone: "accent",
      title: t("compose.writeArticle"),
      hint: t("compose.writeArticleHint"),
      href: "/articles",
    },
    {
      icon: MessageSquare,
      tone: "info",
      title: t("compose.newDiscussion"),
      hint: t("compose.newDiscussionHint"),
      href: "/discussions",
    },
  ];

  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={Sparkles}
          eyebrow="অবদান"
          title={t("compose.title")}
          description="সম্প্রদায়ের সাথে জ্ঞান ভাগ করে নিন — প্রশ্ন, প্রবন্ধ কিংবা আলোচনা।"
          patterned
        />

        <SectionHeader icon={Sparkles} title="কী তৈরি করবেন" size="sm" />

        <View style={{ gap: 12 }}>
          {options.map((option) => (
            <ComposeOption key={option.href} {...option} />
          ))}
        </View>

        <View
          style={{
            borderRadius: 12,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderStyle: "dashed",
            padding: 16,
            gap: 6,
          }}
        >
          <Text weight="semibold" style={{ fontSize: 13.5 }}>
            সম্পাদকীয় নির্দেশিকা
          </Text>
          <Text variant="small" style={{ lineHeight: 20 }}>
            লেখার আগে তথ্যসূত্র যাচাই করুন। কুরআনের আয়াত ও হাদীসের রেফারেন্স উল্লেখ করুন এবং সম্মানজনক ভাষা ব্যবহার করুন।
          </Text>
        </View>
      </Screen>
    </AppFrame>
  );
}

function ComposeOption({
  icon: Icon,
  tone,
  title,
  hint,
  href,
}: {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  hint: string;
  href: string;
}): ReactNode {
  const theme = useTheme();
  const router = useRouter();
  const palette = softTone(theme.colors)[tone];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.replace(href as never)}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: 16,
          opacity: pressed ? 0.92 : 1,
        },
        theme.elevation.card,
      ]}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.background,
        }}
      >
        <Icon size={20} color={palette.foreground} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text weight="semibold" style={{ fontSize: 15 }}>
          {title}
        </Text>
        <Text variant="small">{hint}</Text>
      </View>
    </Pressable>
  );
}

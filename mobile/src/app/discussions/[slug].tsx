import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MessagesSquare, Send } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { relativeTime } from "../../lib/utils";
import { getDiscussion } from "../../data/content";
import { getDepartment } from "../../data/departments";
import { Avatar, Badge, Button, Chip, EmptyState, PageHeader, Text } from "../../components/ui";

export default function DiscussionScreen() {
  const theme = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { pick, locale } = useI18n();
  const discussion = getDiscussion(slug ?? "");
  const [reply, setReply] = useState("");
  const [posted, setPosted] = useState(false);

  if (!discussion) {
    return (
      <AppFrame back>
        <Screen>
          <EmptyState icon={MessagesSquare} title="আলোচনাটি পাওয়া যায়নি" />
        </Screen>
      </AppFrame>
    );
  }

  const departments = discussion.departmentIds.map((id) => getDepartment(id)).filter(Boolean);

  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={MessagesSquare}
          eyebrow={`${relativeTime(discussion.createdAt, locale)} · ${discussion.replyCount} উত্তর`}
          title={discussion.titleBn}
          patterned
        >
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {discussion.tags.map((tag) => (
              <Chip key={tag} tone="neutral">
                {tag}
              </Chip>
            ))}
          </View>
        </PageHeader>

        <View
          style={[
            {
              borderRadius: theme.radius.panel,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 16,
              gap: 12,
            },
            theme.elevation.card,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Avatar name="সদস্য" color={theme.colors.roleUser} size="sm" />
            <View style={{ flex: 1 }}>
              <Text weight="semibold" style={{ fontSize: 13 }}>
                আলোচনা শুরু করেছেন একজন সদস্য
              </Text>
              <Text variant="small" style={{ fontSize: 11.5 }}>
                যাচাইকৃত আলেমদের উত্তর আলাদা ব্যাজ দিয়ে চিহ্নিত
              </Text>
            </View>
            {discussion.pinned ? (
              <Badge tone="primary" size="xs">
                পিন করা
              </Badge>
            ) : null}
          </View>

          {discussion.bodyBn.split(/\n\n+/).map((paragraph, index) => (
            <Text key={index} style={{ fontSize: 14.5, lineHeight: 24 }}>
              {paragraph}
            </Text>
          ))}
        </View>

        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {departments.map((department) =>
            department ? (
              <Chip key={department.id} tone={department.tone}>
                {pick(department.name)}
              </Chip>
            ) : null,
          )}
        </View>

        {posted ? (
          <View
            style={{
              borderRadius: theme.radius.panel,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.success,
              backgroundColor: theme.colors.successSoft,
              padding: 14,
            }}
          >
            <Text variant="small" color={theme.colors.successSoftFg}>
              আপনার উত্তর জমা হয়েছে। সম্প্রদায়ের আদব রক্ষার জন্য মডারেশনে রেখে প্রকাশ করা হবে।
            </Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Text variant="label">আপনার উত্তর</Text>
            <TextInput
              value={reply}
              onChangeText={setReply}
              multiline
              placeholder="আদবের সাথে আপনার মত বা অভিজ্ঞতা লিখুন…"
              placeholderTextColor={theme.colors.fgSubtle}
              style={{
                minHeight: 110,
                padding: 12,
                borderRadius: 12,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderColor: theme.colors.borderStrong,
                backgroundColor: theme.colors.surface,
                color: theme.colors.fg,
                fontFamily: theme.font.sans,
                fontSize: 14,
                textAlignVertical: "top",
              }}
            />
            <Button
              icon={Send}
              disabled={reply.trim().length < 5}
              fullWidth
              onPress={() => setPosted(true)}
            >
              উত্তর পাঠান
            </Button>
          </View>
        )}
      </Screen>
    </AppFrame>
  );
}

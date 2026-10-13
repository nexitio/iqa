import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Plus, Sparkles } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { CURRENT_USER } from "../../data/personal";
import { getDepartment, TRENDING_TOPICS } from "../../data/departments";
import { SCHOLAR_BY_ID } from "../../data/scholars";
import { Avatar, Text } from "../ui";

interface StoryNode {
  id: string;
  label: string;
  href: string;
  color: string;
  name: string;
  verified?: boolean;
  isNew: boolean;
}

/**
 * "জ্ঞানের ধারা" — the daily rail plus the compose entry point.
 *
 * The familiar circular-avatar rail surfaces today's fresh content from the
 * scholars and departments the reader follows. A gold/emerald ring marks what
 * is new since last visit.
 */
export function KnowledgeStories() {
  const theme = useTheme();
  const router = useRouter();
  const { t, pick } = useI18n();


  const scholarStories: StoryNode[] = CURRENT_USER.followingScholarIds
    .map((id, index): StoryNode | null => {
      const scholar = SCHOLAR_BY_ID[id];
      if (!scholar) return null;
      return {
        id: `scholar-${id}`,
        label: pick(scholar.name),
        href: `/scholars/${scholar.slug}`,
        color: scholar.avatarColor,
        name: scholar.name.bn,
        verified: scholar.verified,
        isNew: index < 3,
      };
    })
    .filter((s): s is StoryNode => s !== null);

  const departmentStories: StoryNode[] = CURRENT_USER.followingDepartmentSlugs
    .map((slug) => getDepartment(slug))
    .filter((d): d is NonNullable<ReturnType<typeof getDepartment>> => Boolean(d))
    .map((department) => ({
      id: `dept-${department.slug}`,
      label: department.shortName.bn,
      href: `/topics`,
      color: theme.colors.primary,
      name: department.name.bn,
      isNew: false,
    }));

  const topicStories: StoryNode[] = TRENDING_TOPICS.slice(0, 3).map((topic) => ({
    id: `topic-${topic.slug}`,
    label: topic.name.bn,
    href: `/topics`,
    color: theme.colors.accent,
    name: topic.name.bn,
    isNew: true,
  }));

  const nodes = [...scholarStories, ...departmentStories, ...topicStories];

  return (
    <View
      style={[
        {
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: 16,
        },
        theme.elevation.card,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} color={theme.colors.primary} />
          <Text variant="title" style={{ fontSize: 15 }}>
            জ্ঞানের ধারা
          </Text>
        </View>
        <Pressable onPress={() => undefined} hitSlop={6}>
          <Text weight="medium" style={{ fontSize: 12.5, color: theme.colors.primary }}>
            {t("action.viewAll")}
          </Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        <Pressable
          onPress={() => router.push("/questions/ask" as never)}
          accessibilityRole="button"
          style={{ width: 72, alignItems: "center", gap: 6 }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: theme.colors.borderStrong,
              backgroundColor: theme.colors.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={20} color={theme.colors.fgMuted} strokeWidth={2.4} />
          </View>
          <Text variant="small" align="center" style={{ fontSize: 10.5, lineHeight: 13 }}>
            প্রশ্ন করুন
          </Text>
        </Pressable>

        {nodes.map((node) => (
          <Pressable
            key={node.id}
            onPress={() => router.push(node.href as never)}
            accessibilityRole="button"
            style={{ width: 72, alignItems: "center", gap: 6 }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                padding: 2,
                backgroundColor: node.isNew ? theme.colors.primary : theme.colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 28,
                  padding: 2,
                  backgroundColor: theme.colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Avatar name={node.name} color={node.color} size="lg" verified={node.verified} />
              </View>
            </View>
            <Text variant="small" align="center" numberOfLines={2} style={{ fontSize: 10.5, lineHeight: 13 }}>
              {node.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

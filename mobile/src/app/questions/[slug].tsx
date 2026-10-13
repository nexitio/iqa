import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MessageCircleQuestion, Quote, Scale } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { relativeTime } from "../../lib/utils";
import { FATWAS, getQuestion } from "../../data/content";
import { getDepartment } from "../../data/departments";
import { Badge, Button, Chip, EmptyState, PageHeader, Text } from "../../components/ui";
import { statusTone } from "../../theme/tone";

/** Which fatwa answers a given question, where one exists. */
const FATWA_FOR_QUESTION: Record<string, string> = {
  "q-1": "mobail-banking-sud-o-kashbyak",
  "q-2": "joutuk-dabi-o-bibaho",
};

export default function QuestionDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { pick, locale } = useI18n();
  const question = getQuestion(slug ?? "");

  if (!question) {
    return (
      <AppFrame back>
        <Screen>
          <EmptyState icon={MessageCircleQuestion} title="প্রশ্নটি পাওয়া যায়নি" />
        </Screen>
      </AppFrame>
    );
  }

  const departments = question.departmentIds.map((id) => getDepartment(id)).filter(Boolean);
  const fatwaSlug = FATWA_FOR_QUESTION[question.id];
  const fatwa = fatwaSlug ? FATWAS.find((f) => f.slug === fatwaSlug) : undefined;

  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={MessageCircleQuestion}
          eyebrow={question.visibility === "anonymous" ? "নাম প্রকাশে অনিচ্ছুক" : "প্রশ্ন"}
          title={question.titleBn}
          patterned
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Badge tone={statusTone(question.status)} size="xs" dot>
              {question.status === "answered" ? "উত্তর দেওয়া হয়েছে" : question.status}
            </Badge>
            {question.fatwaRequested ? (
              <Badge tone="warning" size="xs">
                ফতোয়া চেয়েছেন
              </Badge>
            ) : null}
            <Text variant="small" style={{ fontSize: 11.5 }}>
              {relativeTime(question.createdAt, locale)} · {question.views} বার দেখা হয়েছে
            </Text>
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
              gap: 10,
            },
            theme.elevation.card,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Quote size={14} color={theme.colors.fgSubtle} />
            <Text variant="label">প্রশ্নের বিস্তারিত</Text>
          </View>
          <Text style={{ fontSize: 14.5, lineHeight: 24 }}>{question.bodyBn}</Text>
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

        {fatwa ? (
          <View
            style={{
              borderRadius: theme.radius.panel,
              borderLeftWidth: 3,
              borderLeftColor: theme.colors.primary,
              backgroundColor: theme.colors.primarySoft,
              padding: 16,
              gap: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Scale size={14} color={theme.colors.primarySoftFg} />
              <Text variant="label" color={theme.colors.primarySoftFg}>
                এই প্রশ্নের বিস্তারিত রায়
              </Text>
            </View>
            <Text weight="medium" style={{ fontSize: 13.5, lineHeight: 22, color: theme.colors.primarySoftFg }}>
              {fatwa.rulingBn}
            </Text>
            <Button variant="soft" size="sm" onPress={() => router.push(`/fatwas/${fatwa.slug}` as never)}>
              সম্পূর্ণ ফতোয়া পড়ুন
            </Button>
          </View>
        ) : (
          <Text variant="small">
            এই প্রশ্নটির একটি সাধারণ উত্তর দেওয়া হয়েছে; বিস্তারিত রায়ের জন্য আলেমের প্রতি ফতোয়া অনুরোধ রাখা হয়েছে।
          </Text>
        )}
      </Screen>
    </AppFrame>
  );
}

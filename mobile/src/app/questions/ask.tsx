import { useState, type ReactNode } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle2, MessageCircleQuestion } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { DEPARTMENTS } from "../../data/departments";
import { Badge, Button, Chip, ChipList, PageHeader, Text } from "../../components/ui";

export default function AskScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { pick } = useI18n();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [department, setDepartment] = useState<string>("fiqh");
  const [submitted, setSubmitted] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  const ready = title.trim().length > 4 && body.trim().length > 20;

  if (submitted) {
    return (
      <AppFrame back>
        <Screen>
          <View
            style={[
              {
                borderRadius: theme.radius.panel,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderColor: theme.colors.success,
                backgroundColor: theme.colors.successSoft,
                padding: 20,
                gap: 10,
                alignItems: "center",
              },
              theme.elevation.card,
            ]}
          >
            <CheckCircle2 size={34} color={theme.colors.successSoftFg} />
            <Text variant="title" color={theme.colors.successSoftFg}>
              আপনার প্রশ্ন জমা হয়েছে
            </Text>
            <Text align="center" style={{ fontSize: 13.5, lineHeight: 21, color: theme.colors.successSoftFg }}>
              সংশ্লিষ্ট বিভাগের একজন আলেম প্রশ্নটি পাবেন। উত্তর প্রস্তুত হলে আপনি বিজ্ঞপ্তি পাবেন ইনশাআল্লাহ।
            </Text>
            <Button variant="soft" onPress={() => router.replace("/questions" as never)}>
              প্রশ্নোত্তর দেখুন
            </Button>
          </View>
        </Screen>
      </AppFrame>
    );
  }

  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={MessageCircleQuestion}
          eyebrow="নতুন প্রশ্ন"
          title="আলেমকে প্রশ্ন করুন"
          description="যত স্পষ্ট লিখবেন, তত নির্ভুল উত্তর পাবেন। ব্যক্তিগত তথ্য কখনো প্রকাশ করা হয় না।"
          patterned
        />

        <Field label="প্রশ্নের শিরোনাম">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="সংক্ষেপে প্রশ্নটি লিখুন…"
            placeholderTextColor={theme.colors.fgSubtle}
            style={inputStyle(theme)}
          />
        </Field>

        <Field label="বিষয় বা বিভাগ">
          <ChipList contentStyle={{ paddingHorizontal: 0 }}>
            {DEPARTMENTS.map((dept) => (
              <Chip
                key={dept.id}
                tone={dept.tone}
                active={department === dept.id}
                onPress={() => setDepartment(dept.id)}
              >
                {pick(dept.shortName)}
              </Chip>
            ))}
          </ChipList>
        </Field>

        <Field label="বিস্তারিত">
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            placeholder="আপনার পরিস্থিতি, প্রশ্নটি ও যা জানতে চান বিস্তারিত লিখুন…"
            placeholderTextColor={theme.colors.fgSubtle}
            style={[inputStyle(theme), { height: 160, paddingTop: 12, textAlignVertical: "top" }]}
          />
        </Field>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Chip active={anonymous} onPress={() => setAnonymous((v) => !v)}>
            নাম প্রকাশে অনিচ্ছুক
          </Chip>
          <Badge tone="neutral" size="xs">
            প্রশ্ন সর্বজনীন হলে সবাই উপকৃত হয়
          </Badge>
        </View>

        <Button disabled={!ready} fullWidth onPress={() => setSubmitted(true)}>
          প্রশ্ন জমা দিন
        </Button>
      </Screen>
    </AppFrame>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="label">{label}</Text>
      {children}
    </View>
  );
}

function inputStyle(theme: ReturnType<typeof useTheme>) {
  return {
    minHeight: 46,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    color: theme.colors.fg,
    fontFamily: theme.font.sans,
    fontSize: 14,
  };
}

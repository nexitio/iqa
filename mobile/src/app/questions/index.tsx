import { View } from "react-native";
import { useRouter } from "expo-router";
import { MessageCircleQuestion, Plus } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { useI18n } from "../../i18n";
import { QUESTIONS } from "../../data/content";
import { Button, PageHeader } from "../../components/ui";
import { QuestionCard } from "../../components/knowledge/cards";

export default function QuestionsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={MessageCircleQuestion}
          eyebrow="প্রশ্নোত্তর"
          title="আপনার প্রশ্নের উত্তর"
          description="যাচাইকৃত আলেমদের কাছ থেকে দলিলভিত্তিক উত্তর — জেনে রাখুন, তারপর আমল করুন।"
          patterned
          actions={
            <Button icon={Plus} size="sm" onPress={() => router.push("/questions/ask" as never)}>
              {t("action.askScholar")}
            </Button>
          }
        />
        <View style={{ gap: 12 }}>
          {QUESTIONS.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </View>
      </Screen>
    </AppFrame>
  );
}

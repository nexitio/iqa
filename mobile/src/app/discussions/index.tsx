import { View } from "react-native";
import { MessagesSquare } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { DISCUSSIONS } from "../../data/content";
import { PageHeader } from "../../components/ui";
import { DiscussionCard } from "../../components/knowledge/cards";

export default function DiscussionsScreen() {
  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={MessagesSquare}
          eyebrow="আলোচনা"
          title="সম্প্রদায়ের আলোচনা"
          description="পরস্পরের প্রতি আদব রক্ষা করে জিজ্ঞাসা, শেখা ও অভিজ্ঞতা ভাগ করে নেওয়ার জায়গা।"
          patterned
        />
        <View style={{ gap: 12 }}>
          {DISCUSSIONS.map((discussion) => (
            <DiscussionCard key={discussion.id} discussion={discussion} />
          ))}
        </View>
      </Screen>
    </AppFrame>
  );
}

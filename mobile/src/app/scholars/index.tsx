import { View } from "react-native";
import { Users } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { useI18n } from "../../i18n";
import { SCHOLARS } from "../../data/scholars";
import { PageHeader } from "../../components/ui";
import { ScholarCard } from "../../components/people/scholar-card";

export default function ScholarsScreen() {
  const { t } = useI18n();
  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={Users}
          eyebrow="আলেম ও মুফতি"
          title={t("scholars.title")}
          description={t("scholars.subtitle")}
          patterned
        />
        <View style={{ gap: 12 }}>
          {SCHOLARS.map((scholar) => (
            <ScholarCard key={scholar.id} scholar={scholar} />
          ))}
        </View>
      </Screen>
    </AppFrame>
  );
}

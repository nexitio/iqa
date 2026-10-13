import { View } from "react-native";
import { Tabs } from "expo-router";
import { useTheme } from "../../theme/ThemeProvider";
import { TopBar } from "../../components/layout/top-bar";
import { BottomNav } from "../../components/layout/bottom-nav";

/**
 * The tab group: one header above the screens, the custom bar below them.
 *
 * Putting the header here rather than inside each screen means a tab switch
 * never remounts it, and the raised compose disc — which lives in the bar, not
 * in a screen — is available from every tab.
 */
export default function TabsLayout() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopBar />
      <Tabs
        tabBar={(props) => <BottomNav {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: theme.colors.bg },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="quran" />
        <Tabs.Screen name="hadith" />
        <Tabs.Screen name="library" />
      </Tabs>
    </View>
  );
}

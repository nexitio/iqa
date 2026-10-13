import type { ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { TopBar } from "./top-bar";

/**
 * The public frame every route sits in: the sticky header, then the route's own
 * content. The tab bar is owned by the `(tabs)` group so it appears only where
 * it should.
 */
export function AppFrame({ children, back = false }: { children: ReactNode; back?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopBar back={back} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

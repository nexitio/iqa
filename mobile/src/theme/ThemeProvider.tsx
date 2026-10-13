import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  darkColors,
  darkElevation,
  fontFamily,
  lightColors,
  lightElevation,
  radius,
  space,
  type ThemeColors,
} from "./tokens";

export type ThemePreference = "light" | "dark" | "system";
export type ColorScheme = "light" | "dark";

const STORAGE_KEY = "ilm.theme";

export interface Theme {
  colors: ThemeColors;
  scheme: ColorScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  toggleScheme: () => void;
  radius: typeof radius;
  space: typeof space;
  font: typeof fontFamily;
  elevation: typeof lightElevation;
  isDark: boolean;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [systemScheme, setSystemScheme] = useState<ColorScheme>(
    () => (Appearance.getColorScheme() === "dark" ? "dark" : "light"),
  );

  // Restore the saved preference once, and keep following the OS while the
  // reader has not chosen explicitly.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        setPreferenceState(saved);
      }
    });
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === "dark" ? "dark" : "light");
    });
    return () => sub.remove();
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const scheme: ColorScheme = preference === "system" ? systemScheme : preference;

  const value = useMemo<Theme>(() => {
    const isDark = scheme === "dark";
    return {
      colors: isDark ? darkColors : lightColors,
      scheme,
      preference,
      setPreference,
      toggleScheme: () => setPreference(isDark ? "light" : "dark"),
      radius,
      space,
      font: fontFamily,
      elevation: isDark ? darkElevation : lightElevation,
      isDark,
    };
  }, [scheme, preference, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

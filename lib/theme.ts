import { useColorScheme as useRNColorScheme } from "react-native";

export type Theme = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  border: string;
  clear: string;
  hold: string;
  spiral: string;
  danger: string;
  tabBar: string;
};

const light: Theme = {
  bg: "#F7F3FC",
  surface: "#FFFFFF",
  surfaceAlt: "#EFE8F8",
  text: "#2A2138",
  muted: "#8A7BA3",
  accent: "#7C3AED",
  accentSoft: "#E9DEF9",
  border: "#E2D8F0",
  clear: "#5B8A63",
  hold: "#B07E2B",
  spiral: "#B4564E",
  danger: "#B4564E",
  tabBar: "#FFFFFF",
};

const dark: Theme = {
  bg: "#150E22",
  surface: "#1F1430",
  surfaceAlt: "#2A1D42",
  text: "#F2EBFD",
  muted: "#A79BC4",
  accent: "#9D6BF5",
  accentSoft: "#2E2148",
  border: "#3A2B55",
  clear: "#7BC98A",
  hold: "#D9A94E",
  spiral: "#E07A7A",
  danger: "#E07A7A",
  tabBar: "#1A1128",
};

export function useTheme(): Theme {
  // Midnight purple is the default theme per user request
  return dark;
}

export function useSystemTheme(): Theme {
  const scheme = useRNColorScheme();
  return scheme === "dark" ? dark : light;
}

export const radius = { sm: 8, md: 14, lg: 20 };
export const spacing = { xs: 6, sm: 12, md: 18, lg: 26, xl: 36 };

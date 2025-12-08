import { Platform } from "react-native";

const tintColorLight = "#F5A623";
const tintColorDark = "#F5A623";

export const Colors = {
  light: {
    text: "#24314A",
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tintColorLight,
    link: "#F5A623",
    tint: tintColorLight,
    backgroundRoot: "#FFFBF5",
    backgroundDefault: "rgba(255, 255, 255, 0.15)",
    backgroundSecondary: "rgba(255, 255, 255, 0.25)",
    backgroundTertiary: "rgba(255, 255, 255, 0.35)",
    glassBackground: "rgba(255, 255, 255, 0.15)",
    glassBorder: "rgba(255, 255, 255, 0.3)",
    cardBackground: "rgba(255, 255, 255, 0.85)",
    primary: "#F5A623",
    primaryDark: "#D4890F",
    navy: "#24314A",
    accent: "#F5A623",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    ivory: "#FFFBF5",
    slate: "#64748B",
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: tintColorDark,
    link: "#F5A623",
    tint: tintColorDark,
    backgroundRoot: "#0F172A",
    backgroundDefault: "rgba(255, 255, 255, 0.05)",
    backgroundSecondary: "rgba(255, 255, 255, 0.08)",
    backgroundTertiary: "rgba(255, 255, 255, 0.12)",
    glassBackground: "rgba(255, 255, 255, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.15)",
    cardBackground: "rgba(30, 41, 59, 0.85)",
    primary: "#F5A623",
    primaryDark: "#D4890F",
    navy: "#24314A",
    accent: "#F5A623",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    ivory: "#FFFBF5",
    slate: "#64748B",
  },
};

export const Gradients = {
  saffronGold: ["#F5A623", "#D4890F"] as const,
  saffronWarm: ["#F5A623", "#FF6B35"] as const,
  navyIndigo: ["#24314A", "#1E3A5F"] as const,
  warmSunset: ["#F5A623", "#EC4899"] as const,
  darkOverlay: ["rgba(36, 49, 74, 0.9)", "rgba(36, 49, 74, 0.4)"] as const,
  lightOverlay: ["rgba(255, 251, 245, 0.9)", "rgba(255, 251, 245, 0.6)"] as const,
  heroOverlay: ["rgba(36, 49, 74, 0.7)", "rgba(36, 49, 74, 0.3)"] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "500" as const,
  },
  h4: {
    fontSize: 18,
    fontWeight: "500" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  glass: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  fab: {
    shadowColor: "#F5A623",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  button: {
    shadowColor: "#F5A623",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  searchBar: {
    shadowColor: "#24314A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const CategoryColors: Record<string, { start: string; end: string }> = {
  food: { start: "#F5A623", end: "#FF6B35" },
  culture: { start: "#8B5CF6", end: "#6366F1" },
  nature: { start: "#22C55E", end: "#10B981" },
  nightlife: { start: "#EC4899", end: "#F43F5E" },
  shopping: { start: "#3B82F6", end: "#06B6D4" },
  experiences: { start: "#F59E0B", end: "#EF4444" },
};

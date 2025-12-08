import { Platform } from "react-native";

const tintColorLight = "#8B5CF6";
const tintColorDark = "#A855F7";

export const Colors = {
  light: {
    text: "#1F2937",
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tintColorLight,
    link: "#8B5CF6",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "rgba(255, 255, 255, 0.15)",
    backgroundSecondary: "rgba(255, 255, 255, 0.25)",
    backgroundTertiary: "rgba(255, 255, 255, 0.35)",
    glassBackground: "rgba(255, 255, 255, 0.15)",
    glassBorder: "rgba(255, 255, 255, 0.3)",
    cardBackground: "rgba(255, 255, 255, 0.85)",
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: tintColorDark,
    link: "#A855F7",
    backgroundRoot: "#0F172A",
    backgroundDefault: "rgba(255, 255, 255, 0.05)",
    backgroundSecondary: "rgba(255, 255, 255, 0.08)",
    backgroundTertiary: "rgba(255, 255, 255, 0.12)",
    glassBackground: "rgba(255, 255, 255, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.15)",
    cardBackground: "rgba(30, 41, 59, 0.85)",
  },
};

export const Gradients = {
  purpleBlue: ["#8B5CF6", "#3B82F6"] as const,
  purplePink: ["#A855F7", "#EC4899"] as const,
  blueCyan: ["#3B82F6", "#06B6D4"] as const,
  neonAccent: ["#F59E0B", "#EF4444"] as const,
  darkOverlay: ["rgba(15, 23, 42, 0.8)", "rgba(15, 23, 42, 0.4)"] as const,
  lightOverlay: ["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.6)"] as const,
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
  md: 20,
  lg: 25,
  xl: 30,
  "2xl": 40,
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
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  button: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  searchBar: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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

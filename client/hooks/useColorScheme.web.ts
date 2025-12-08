import { useThemeContext } from "@/contexts/ThemeContext";

export function useColorScheme() {
  try {
    const { colorScheme } = useThemeContext();
    return colorScheme;
  } catch {
    return "light";
  }
}

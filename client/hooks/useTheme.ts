import { Colors } from "@/constants/theme";
import { useThemeContext } from "@/contexts/ThemeContext";

export function useTheme() {
  const { colorScheme, isDark, toggleTheme, setColorScheme } = useThemeContext();
  const theme = Colors[colorScheme];

  return {
    theme,
    isDark,
    colorScheme,
    toggleTheme,
    setColorScheme,
  };
}

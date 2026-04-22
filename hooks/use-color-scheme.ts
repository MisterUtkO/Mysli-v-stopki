import { useThemeContext } from "@/lib/theme/theme-provider";

export function useColorScheme() {
  return useThemeContext().colorScheme;
}

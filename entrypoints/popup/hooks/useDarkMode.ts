import { useDark, useToggle } from "@vueuse/core";

export function useDarkMode() {
  const isDarkMode = useDark();
  const toggleMode = useToggle(isDarkMode);

  return {
    isDarkMode,
    toggleMode,
  };
}

import defaultFavicon from "@/assets/vue.svg";
import blackLogo from "@/assets/logo-black.svg";
import whiteLogo from "@/assets/logo-white.svg";

export function generateFavicon(url?: string) {
  if (!url) return defaultFavicon;
  if (["chrome://bookmarks/"].includes(url)) {
    const isDark = document.documentElement.classList.contains("dark");
    return isDark ? whiteLogo : blackLogo;
  }
  const u = new URL(url);
  return `${u.origin}/favicon.ico`;
}

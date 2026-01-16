import defaultFavicon from "@/assets/vue.svg";

export function generateFavicon(url?: string) {
  if (!url) return defaultFavicon;
  const u = new URL(url);
  return `${u.origin}/favicon.ico`;
}

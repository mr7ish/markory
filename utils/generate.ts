/**
 * 图标候选列表
 */
const ICON_PATHS = ["/favicon.ico", "/favicon.svg", "/favicon.png", "/logo.svg", "/icon.png"];

export function generateFavicons(url: string) {
  if (!url) return [];
  const u = new URL(url);
  return ICON_PATHS.map((i) => `${u.origin}${i}`);
}

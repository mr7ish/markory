export const DEFAULT_LOCALE = "zh";

export function getLocale() {
  return localStorage.getItem("locale") || DEFAULT_LOCALE;
}

export function setLocale(locale: string) {
  localStorage.setItem("locale", locale);
}

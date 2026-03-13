export const DEFAULT_LOCALE = "en";

export function getLocale() {
  return localStorage.getItem("locale") || DEFAULT_LOCALE;
}

export function setLocale(locale: string) {
  localStorage.setItem("locale", locale);
}

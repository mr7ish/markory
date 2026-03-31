import { useI18n } from "vue-i18n";
import { setLocale } from "@/i18n/locale";

export function useLocale() {
  const { locale } = useI18n();

  function changeLocale(lang: string) {
    locale.value = lang;
    setLocale(lang);
    browser.storage.local.set({
      locale: lang,
    });
  }

  return {
    locale,
    changeLocale,
  };
}

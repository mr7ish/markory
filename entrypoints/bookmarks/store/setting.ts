import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export const useSettingStore = defineStore("settingStore", () => {
  const enablePreview = useStorage("enable-preview", false);

  function setEnablePreview(value: boolean) {
    enablePreview.value = value;
  }

  return {
    enablePreview,
    setEnablePreview,
  };
});

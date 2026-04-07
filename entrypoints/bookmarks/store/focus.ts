import { defineStore } from "pinia";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";

export const useFocusStore = defineStore("focusStore", () => {
  const {
    data: focusNodes,
    set: setFocusNodes,
    isFinished: isFocusNodesFinished,
  } = useIDBKeyval<Browser.bookmarks.BookmarkTreeNode[]>("focus-nodes", [], {
    shallow: true,
  });

  return {
    focusNodes,
    isFocusNodesFinished,
    setFocusNodes,
  };
});

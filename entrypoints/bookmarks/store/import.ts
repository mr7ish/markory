import { defineStore } from "pinia";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";

export const useImportStore = defineStore("importStore", () => {
  const {
    data: importNodeIds,
    set: setImportNodeIds,
    isFinished: isImportNodesFinished,
  } = useIDBKeyval<string[]>("import-nodes", []);

  return {
    importNodeIds,
    isImportNodesFinished,
    setImportNodeIds,
  };
});

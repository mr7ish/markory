import { defineStore } from "pinia";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";

export const useGroupStore = defineStore("groupStore", () => {
  const {
    data: groupNodeIds,
    set: setGroupNodeIds,
    isFinished: isGroupNodesFinished,
  } = useIDBKeyval<string[]>("group-nodes", []);

  return {
    groupNodeIds,
    isGroupNodesFinished,
    setGroupNodeIds,
  };
});

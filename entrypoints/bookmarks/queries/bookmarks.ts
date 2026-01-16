import { defineQuery, useQuery } from "@pinia/colada";
import {
  fetchAllNodes,
  fetchBookmarkFolders,
  fetchFolderChildren,
} from "@/entrypoints/bookmarks/api/bookmarks";
import { useRoute } from "vue-router";

export function useBookmarkTopNodes() {
  const { data } = useQuery({
    key: ["bookmark-top-nodes"],
    query: () => fetchAllNodes(),
  });

  return {
    topNodes: computed(() => data.value || []),
  };
}

export const useBookmarkFolders = defineQuery(() => {
  const { data } = useQuery({
    key: ["bookmark-folders"],
    query: () => fetchBookmarkFolders(),
  });

  watchEffect(() => {
    console.log("useBookmarkFolders =>", data.value);
  });

  return {
    folders: computed(() => data.value?.folders || []),
    ungroupedFolders: computed(() => data.value?.ungroupedFolders || []),
  };
});

export function useFolderChildrenQuery() {
  const route = useRoute();
  const childrenNodes = shallowRef<Browser.bookmarks.BookmarkTreeNode[]>([]);

  const { data, ...rest } = useQuery({
    /**
     * 唯一标识，用于缓存数据
     * 如果 key 相同，则会使用缓存的数据
     */
    key: () => ["folder-children", route.params.id],
    query: () => fetchFolderChildren(route.params.id as string),
    // 是否在窗口重新获取焦点时重新获取数据
    refetchOnWindowFocus: false,
  });

  watch(
    () => data.value,
    (_data) => {
      if (_data) {
        childrenNodes.value = _data;
      }
    }
  );

  return {
    childrenNodes,
    ...rest,
  };
}

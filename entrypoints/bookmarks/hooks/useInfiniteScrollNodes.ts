import { useInfiniteScroll } from "@vueuse/core";

interface Options {
  pageSize?: number;
  distance?: number;
  interval?: number;
}

export function useInfiniteScrollNodes<T>(
  containerRef: ReturnType<typeof useTemplateRef<HTMLDivElement>>,
  allItems: () => T[],
  options: Options = {},
) {
  const { pageSize = 20, distance = 50, interval = 300 } = options;

  const displayedCount = ref(pageSize);
  const isLoading = ref(false);

  // 当前显示的节点
  const displayedItems = computed(() => allItems().slice(0, displayedCount.value));

  // 是否还有更多节点可加载
  const hasMore = computed(() => displayedCount.value < allItems().length);

  // 检查是否有滚动条
  function hasScrollbar() {
    const el = containerRef.value;
    if (!el) return false;
    return el.scrollHeight > el.clientHeight;
  }

  // 加载更多节点
  async function loadMore() {
    if (isLoading.value || !hasMore.value) return;
    isLoading.value = true;
    // 模拟异步加载，避免滚动时过于频繁
    await new Promise((resolve) => setTimeout(resolve, 100));
    displayedCount.value = Math.min(displayedCount.value + pageSize, allItems().length);

    // 初始加载时，如果还没有滚动条且还有更多节点，继续加载
    await nextTick();
    if (hasMore.value && !hasScrollbar()) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      await loadMore();
    }

    isLoading.value = false;
  }

  // 重置显示数量和滚动位置
  function reset() {
    displayedCount.value = pageSize;
    const el = containerRef.value;
    if (el) {
      el.scrollTop = 0;
    }
  }

  // 用于追踪数据变化的标识（通过第一个元素的 id 或数组引用）
  const itemsSignature = computed(() => {
    const items = allItems();
    if (items.length === 0) return "";
    // 使用第一个元素的 id 作为签名（假设 items 有 id 属性）
    return (items[0] as any)?.id ?? JSON.stringify(items);
  });

  // 当数据源变化时自动重置
  watch(itemsSignature, () => {
    reset();
  });

  // 使用无限滚动
  useInfiniteScroll(
    containerRef,
    () => {
      loadMore();
    },
    { distance, interval },
  );

  return {
    displayedItems,
    displayedCount,
    hasMore,
    isLoading,
    loadMore,
    reset,
  };
}

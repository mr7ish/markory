import { onBeforeUnmount, ref } from "vue";

interface UseClickWithDblOptions<T> {
  delay?: number;
  onClick: (payload: T) => void;
  onDblClick: (payload: T) => void;
}

export function useClickWithDbl<T>(options: UseClickWithDblOptions<T>) {
  const { delay = 230, onClick, onDblClick } = options;

  const clickTimer = ref<ReturnType<typeof setTimeout> | null>(null);

  function clearClickTimer() {
    if (clickTimer.value) {
      clearTimeout(clickTimer.value);
      clickTimer.value = null;
    }
  }

  function handleClick(payload: T) {
    clearClickTimer();
    clickTimer.value = setTimeout(() => {
      clickTimer.value = null;
      onClick(payload);
    }, delay);
  }

  function handleDblClick(payload: T) {
    clearClickTimer();
    onDblClick(payload);
  }

  onBeforeUnmount(() => {
    clearClickTimer();
  });

  return {
    onClick: handleClick,
    onDblClick: handleDblClick,
  };
}


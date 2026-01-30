<template>
  <div
    class="like-wrapper"
    @mousedown="startLike"
    @mouseup="stopLike"
    @mouseleave="stopLike"
    @click="emitHeart"
  >
    <slot />
    <div class="heart-layer">
      <div
        v-for="heart in hearts"
        :key="heart.id"
        class="heart"
        :style="heart.style"
        @animationend="removeHeart(heart.id)"
      >
        ❤
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface HeartItem {
  id: number;
  style: Record<string, string>;
}

const hearts = ref<HeartItem[]>([]);
let id = 0;
let timer: number | null = null;

function emitHeart(e?: MouseEvent) {
  const x = e?.clientX ?? window.innerWidth / 2;
  const y = e?.clientY ?? window.innerHeight - 120;

  const offsetX = (Math.random() - 0.5) * 160;
  const rotate = (Math.random() - 0.5) * 40;
  const scale = Math.random() * 0.4 + 0.9;
  const duration = Math.random() * 0.4 + 1.4;

  hearts.value.push({
    id: id++,
    style: {
      left: `${x}px`,
      top: `${y}px`,
      "--x": `${offsetX}px`,
      "--r": `${rotate}deg`,
      "--s": scale.toString(),
      animationDuration: `${duration}s`,
    },
  });
}

function removeHeart(id: number) {
  hearts.value = hearts.value.filter((h) => h.id !== id);
}

// 长按连点（抖音同款）
function startLike(e: MouseEvent) {
  emitHeart(e);
  timer = window.setInterval(() => emitHeart(e), 120);
}

function stopLike() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
</script>

<style scoped>
.like-wrapper {
  position: relative;
}

.heart-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.heart {
  position: absolute;
  font-size: 28px;
  color: #ff2c55;
  transform-origin: center;
  animation-name: heart-float;
  animation-timing-function: cubic-bezier(0.21, 0.61, 0.35, 1);
  animation-fill-mode: forwards;
  will-change: transform, opacity;
}

@keyframes heart-float {
  0% {
    transform: translate(0, 0) scale(0.3);
    opacity: 0;
  }

  15% {
    transform: translate(0, -20px) scale(1.2);
    opacity: 1;
  }

  40% {
    transform: translate(calc(var(--x) * 0.4), -120px) scale(var(--s)) rotate(var(--r));
  }

  70% {
    transform: translate(calc(var(--x) * 0.7), -220px) scale(calc(var(--s) * 1.05))
      rotate(calc(var(--r) * 1.2));
    opacity: 1;
  }

  100% {
    transform: translate(var(--x), -320px) scale(calc(var(--s) * 0.9)) rotate(calc(var(--r) * 1.5));
    opacity: 0;
  }
}
</style>

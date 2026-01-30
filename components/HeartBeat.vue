<template>
  <transition name="heartbeat-fade">
    <div
      v-if="visible"
      class="heartbeat-overlay"
    >
      <div
        class="heartbeat-container"
        :style="containerStyle"
      >
        <div class="heartbeat-main"></div>
        <!-- <div class="heartbeat-ring ring-1"></div>
        <div class="heartbeat-ring ring-2"></div> -->
        <div class="heartbeat-particles">
          <div
            v-for="particle in particles"
            :key="particle.id"
            class="particle"
            :style="particle.style"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const visible = ref(false);

interface Particle {
  id: number;
  style: Record<string, string>;
}

const particles = ref<Particle[]>([]);
let pid = 0;
let hideTimer: number | null = null;

const position = ref({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

const containerStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
}));

function createParticles(count = 22) {
  const list: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.7;
    const distance = 70 + Math.random() * 40;
    const size = 4 + Math.random() * 4;
    const delay = Math.random() * 0.18;
    const duration = 0.9 + Math.random() * 0.4;

    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    list.push({
      id: pid++,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        "--tx": `${tx}px`,
        "--ty": `${ty}px`,
      } as unknown as Record<string, string>,
    });
  }

  particles.value = list;
}

function play(pos?: { x: number; y: number }) {
  if (pos) {
    position.value = { ...pos };
  }

  createParticles();
  visible.value = false;

  requestAnimationFrame(() => {
    visible.value = true;

    if (hideTimer) {
      clearTimeout(hideTimer);
    }

    hideTimer = window.setTimeout(() => {
      visible.value = false;
    }, 800);
  });
}

defineExpose({
  play,
});
</script>

<style scoped lang="less">
.heartbeat-overlay {
  position: fixed;
  inset: 0;
  // pointer-events: none;
  z-index: 9999;
}

.heartbeat-container {
  position: absolute;
  transform: translate(-50%, -50%);
}

.heartbeat-main {
  position: relative;
  width: 22px;
  height: 22px;
  background: #ff4d6a;
  transform: rotate(-45deg);
  box-shadow: 0 0 26px rgba(255, 77, 106, 0.85);
  animation: heartbeat-pulse 1.2s ease-in-out 1;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 22px;
    height: 22px;
    background: inherit;
    border-radius: 50%;
  }

  &::before {
    top: -12px;
    left: 0;
  }

  &::after {
    left: 12px;
    top: 0;
  }
}

.heartbeat-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.6);
  transform: translate(-50%, -50%) scale(0.4);
  opacity: 0;
  pointer-events: none;
  left: 50%;
  top: 50%;
}

.ring-1 {
  width: 100px;
  height: 100px;
  animation: heartbeat-ring 1.4s ease-out 1;
}

.ring-2 {
  width: 150px;
  height: 150px;
  animation: heartbeat-ring 1.4s ease-out 1;
  animation-delay: 0.08s;
}

.heartbeat-particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #fff, #ffd1e0 45%, #ff4d6a);
  opacity: 0;
  transform-origin: center;
  animation-name: particle-burst;
  animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
  animation-fill-mode: forwards;
}

@keyframes heartbeat-pulse {
  0% {
    transform: rotate(-45deg) scale(0.7);
    opacity: 0;
  }

  20% {
    transform: rotate(-45deg) scale(1.15);
    opacity: 1;
  }

  40% {
    transform: rotate(-45deg) scale(0.92);
  }

  60% {
    transform: rotate(-45deg) scale(1.06);
  }

  80% {
    transform: rotate(-45deg) scale(0.95);
  }

  100% {
    transform: rotate(-45deg) scale(0.7);
    opacity: 0;
  }
}

@keyframes heartbeat-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.4);
    opacity: 0;
    box-shadow: 0 0 0 rgba(255, 255, 255, 0.4);
  }

  28% {
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
    box-shadow: 0 0 38px rgba(255, 255, 255, 0.18);
  }
}

@keyframes particle-burst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.35);
  }

  18% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.7);
  }
}

.heartbeat-fade-enter-active,
.heartbeat-fade-leave-active {
  transition: opacity 0.22s ease-out;
}

.heartbeat-fade-enter-from,
.heartbeat-fade-leave-to {
  opacity: 0;
}
</style>

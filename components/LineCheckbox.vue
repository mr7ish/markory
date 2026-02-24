<template>
  <!-- /* From Uiverse.io by vinodjangid07 */ -->
  <div class="checkbox-wrapper">
    <input
      type="checkbox"
      id="checkbox"
      :checked="checked"
      @change="change"
    />
    <label
      for="checkbox"
      class="toggle"
    >
      <div
        class="bars"
        id="bar1"
      />
      <div
        class="bars"
        id="bar2"
      />
      <div
        class="bars"
        id="bar3"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  value: boolean;
  checked?: boolean;
}>();

const emit = defineEmits<{
  change: [value: boolean];
}>();

function change() {
  emit("change", !props.value);
}
</script>

<style scoped lang="less">
.checkbox-wrapper {
  display: flex;

  #checkbox {
    display: none;
  }

  .toggle {
    position: relative;
    width: 25px;
    height: 25px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition-duration: 0.5s;
  }

  .bars {
    width: 100%;
    height: 4px;
    // background-color: rgb(176, 92, 255);
    background-color: var(--text-muted);
    border-radius: 4px;
  }

  #bar2 {
    transition-duration: 0.8s;
  }

  #bar1,
  #bar3 {
    width: 70%;
  }

  #checkbox:checked + .toggle .bars {
    position: absolute;
    transition-duration: 0.5s;
  }

  #checkbox:checked + .toggle #bar2 {
    transform: scaleX(0);
    transition-duration: 0.5s;
  }

  #checkbox:checked + .toggle #bar1 {
    width: 100%;
    transform: rotate(45deg);
    transition-duration: 0.5s;
  }

  #checkbox:checked + .toggle #bar3 {
    width: 100%;
    transform: rotate(-45deg);
    transition-duration: 0.5s;
  }

  #checkbox:checked + .toggle {
    transition-duration: 0.5s;
    transform: rotate(180deg);
  }
}
</style>

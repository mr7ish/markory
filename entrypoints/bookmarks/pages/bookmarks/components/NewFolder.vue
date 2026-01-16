<template>
  <div>
    <div class="icon-wrapper">
      <IconTag
        icon="basil:folder-open-solid"
        width="100"
      />
    </div>

    <TinyInput
      v-model="modelValues.folderName"
      style="width: 100%"
      placeholder="新建文件夹"
    />

    <div class="footer-wrapper">
      <TinyButton
        type="secondary"
        @click="cancel"
      >
        取消
      </TinyButton>
      <TinyButton @click="confirm">确定</TinyButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconTag from "@/components/IconTag.vue";
import TinyButton from "@/components/TinyButton.vue";
import TinyInput from "@/components/TinyInput.vue";

export type FormValues = typeof modelValues;

const emits = defineEmits<{
  cancel: [];
  confirm: [FormValues];
}>();

const modelValues = reactive({
  folderName: "",
  bookmarkName: "",
  bookmarkUrl: "",
});

function cancel() {
  emits("cancel");
}

function confirm() {
  emits("confirm", modelValues);
}
</script>

<style scoped lang="less">
.icon-wrapper {
  padding: 10px 0 30px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

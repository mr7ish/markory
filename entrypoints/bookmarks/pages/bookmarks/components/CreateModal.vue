<template>
  <TinyModal
    v-model="visible"
    width="320px"
    :closeOnMask="false"
    destroyOnClose
  >
    <template #header>
      {{ isFolderNode ? `${isEdit ? "编辑" : "新建"}文件夹` : `${isEdit ? "编辑" : "新建"}书签` }}
    </template>
    <div>
      <div class="icon-wrapper">
        <IconTag
          v-if="isFolderNode"
          icon="basil:folder-open-solid"
          width="100"
        />
        <IconTag
          v-else
          icon="icon-park-solid:bookmark-three"
          width="100"
        />
      </div>

      <template v-if="isFolderNode">
        <TinyInput
          v-model.trim="modelValues.folderName"
          placeholder="文件夹名称"
        />
      </template>
      <template v-else>
        <TinyInput
          v-model.trim="modelValues.bookmarkName"
          placeholder="书签名称"
        />
        <TinyInput
          v-model.trim="modelValues.bookmarkUrl"
          style="margin-top: 10px"
          placeholder="书签 URL"
        />
      </template>

      <div class="footer-wrapper">
        <TinyButton
          type="secondary"
          @click="cancel"
        >
          取消
        </TinyButton>
        <TinyButton @click="debounceConfirm">确定</TinyButton>
      </div>
    </div>
  </TinyModal>
</template>

<script setup lang="ts">
import IconTag from "@/components/IconTag.vue";
import { message } from "@/components/tiny-message";
import TinyButton from "@/components/TinyButton.vue";
import TinyInput from "@/components/TinyInput.vue";
import TinyModal from "@/components/TinyModal.vue";
import { debounce } from "@/utils/_";

export type FormValues = typeof modelValues;

const {
  isFolderNode = true,
  isEdit = false,
  node,
} = defineProps<{
  isFolderNode?: boolean;
  isEdit?: boolean;
  node?: Browser.bookmarks.BookmarkTreeNode;
}>();

const emits = defineEmits<{
  cancel: [];
  confirm: [FormValues];
}>();

const visible = defineModel<boolean>({
  default: false,
});

const modelValues = reactive({
  folderName: "",
  bookmarkName: "",
  bookmarkUrl: "",
});

function cancel() {
  emits("cancel");
  visible.value = false;
}

const debounceConfirm = debounce(confirm, 300);

function confirm() {
  if (isFolderNode && !modelValues.folderName) {
    message({
      type: "warning",
      content: "请输入文件夹名称",
    });
    return;
  }

  if (!isFolderNode && (!modelValues.bookmarkName || !modelValues.bookmarkUrl)) {
    message({
      type: "warning",
      content: "请输入书签名称和 URL",
    });
    return;
  }

  emits("confirm", modelValues);
}

function reset() {
  modelValues.folderName = "";
  modelValues.bookmarkName = "";
  modelValues.bookmarkUrl = "";
}

watch(
  () => visible.value,
  (_visible) => {
    if (!_visible) {
      reset();
    } else {
      if (isEdit && node) {
        modelValues.folderName = node.title;
        modelValues.bookmarkName = node.title;
        modelValues.bookmarkUrl = node.url || "";
      }
    }
  },
);
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

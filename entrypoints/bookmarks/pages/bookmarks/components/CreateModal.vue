<template>
  <TinyModal
    v-model="visible"
    width="320px"
    :closeOnMask="false"
    destroyOnClose
  >
    <template #header>
      {{
        isGroup
          ? t("newGroup")
          : isFolderNode
            ? `${isEdit ? t("editText") : t("createText")}${t("folderText")}`
            : `${isEdit ? t("editText") : t("createText")}${t("bookmarkText")}`
      }}
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

      <template v-if="isFolderNode || isGroup">
        <TinyInput
          v-model.trim="modelValues.folderName"
          :placeholder="t('folderPlaceholder')"
        />
      </template>
      <template v-else>
        <TinyInput
          v-model.trim="modelValues.bookmarkName"
          :placeholder="t('bookmarkPlaceholder')"
        />
        <TinyInput
          v-model.trim="modelValues.bookmarkUrl"
          style="margin-top: 10px"
          :placeholder="t('bookmarkUrlPlaceholder')"
        />
      </template>

      <div class="footer-wrapper">
        <TinyButton
          type="secondary"
          @click="cancel"
        >
          {{ t("modalCancelText") }}
        </TinyButton>
        <TinyButton @click="debounceConfirm">{{ t("modalSureText") }}</TinyButton>
      </div>
    </div>
  </TinyModal>
</template>

<script setup lang="ts">
import { initGroupName } from "@/bookmarks/api/bookmarks";
import IconTag from "@/components/IconTag.vue";
import { message } from "@/components/tiny-message";
import TinyButton from "@/components/TinyButton.vue";
import TinyInput from "@/components/TinyInput.vue";
import TinyModal from "@/components/TinyModal.vue";
import { debounce } from "@/utils/_";
import { useI18n } from "vue-i18n";

export type FormValues = typeof modelValues;

const {
  isFolderNode = true,
  isEdit = false,
  isGroup = false,
  node,
} = defineProps<{
  isFolderNode?: boolean;
  isEdit?: boolean;
  isGroup?: boolean;
  node?: Browser.bookmarks.BookmarkTreeNode;
}>();

const emits = defineEmits<{
  cancel: [];
  confirm: [FormValues];
}>();

const { t } = useI18n();

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
      content: t("folderInputEmptyMsg"),
    });
    return;
  }

  if (!isFolderNode && (!modelValues.bookmarkName || !modelValues.bookmarkUrl)) {
    message({
      type: "warning",
      content: t("bookmarkInputEmptyMsg"),
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
  async (_visible) => {
    if (!_visible) {
      reset();
    } else {
      if (isGroup) {
        modelValues.folderName = await initGroupName();
        return;
      }

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

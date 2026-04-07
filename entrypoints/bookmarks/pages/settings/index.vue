<template>
  <div class="page-wrapper">
    <div class="title">{{ t("menuSettings") }}</div>

    <div class="content">
      <div class="setting-item">
        <div class="label">{{ t("lang") }}</div>
        <div class="radio-group">
          <TinyRadio
            class="radio-item"
            :label="t('langZh')"
            :checked="locale === 'zh'"
            @click="changeLocale('zh')"
          />
          <TinyRadio
            class="radio-item"
            :label="t('langEn')"
            :checked="locale === 'en'"
            @click="changeLocale('en')"
          />
        </div>
      </div>
      <div class="setting-item">
        <div class="label">{{ t("preview") }}</div>
        <TinyRadio
          class="radio-item"
          :label="t('settingPreview')"
          :checked="enablePreview"
          @click="setEnablePreview(!enablePreview)"
        />
      </div>
      <div class="setting-item align-start">
        <div class="label">{{ t("importExport") }}</div>
        <div class="transfer-wrapper">
          <div class="link-btn-wrapper">
            <button
              class="link-btn"
              :class="{ 'is-disabled': isTransferDisabled }"
              type="button"
              @click="triggerImport"
            >
              {{ t("import") }}
            </button>
            <button
              class="link-btn"
              :class="{ 'is-disabled': isTransferDisabled }"
              type="button"
              @click="handleExport"
            >
              {{ t("export") }}
            </button>
          </div>
          <div
            v-if="!isTransferReady"
            class="tips"
          >
            {{ t("importExportLoadingTips") }}
          </div>
        </div>
      </div>
      <div class="setting-item">
        <div class="label">{{ t("cache") }}</div>
        <button
          class="link-btn"
          type="button"
          @click="openClearCacheConfirm"
        >
          {{ t("clearCache") }}
        </button>
      </div>
    </div>

    <input
      ref="importInputRef"
      class="hidden-input"
      type="file"
      accept="application/json,.json"
      @change="handleImportFileChange"
    />

    <TinyConfirm
      v-model="importConfirmVisible"
      :title="t('importConfirmTitle')"
      :content="t('importConfirmContent')"
      :maskClosable="false"
      :confirm-text="t('importConfirmText')"
      :cancel-text="t('defaultCancelText')"
      type="danger"
      @confirm="confirmImport"
      @cancel="clearPendingImport"
    />

    <TinyConfirm
      v-model="clearCacheConfirmVisible"
      :title="t('clearCache')"
      :content="t('clearCacheConfirmContent')"
      :maskClosable="false"
      :confirm-text="t('defaultConfirmText')"
      :cancel-text="t('defaultCancelText')"
      type="danger"
      @confirm="clearCache"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { delMany, keys as getIDBKeys } from "idb-keyval";
import { useLocale } from "@/bookmarks/hooks/useLocale";
import { useBookmarkTransfer } from "@/bookmarks/hooks/useBookmarkTransfer";
import TinyRadio from "@/components/tiny-raido";
import TinyConfirm from "@/components/TinyConfirm.vue";
import { useFocusStore } from "@/bookmarks/store/focus";
import { useGroupStore } from "@/bookmarks/store/group";
import { useImportStore } from "@/bookmarks/store/import";
import { useRecycleStore } from "@/bookmarks/store/recycle";
import { useSettingStore } from "@/bookmarks/store/setting";
import { storeToRefs } from "pinia";
import { message } from "@/components/tiny-message";

const { t } = useI18n();
const { changeLocale, locale } = useLocale();

const focusStore = useFocusStore();
const { setFocusNodes } = focusStore;

const groupStore = useGroupStore();
const { setGroupNodeIds } = groupStore;

const importStore = useImportStore();
const { setImportNodeIds } = importStore;

const recycleStore = useRecycleStore();
const { setRecycleNodes, setRemoveNodeIds } = recycleStore;

const settingStore = useSettingStore();
const { setEnablePreview } = settingStore;
const { enablePreview } = storeToRefs(settingStore);
const clearCacheConfirmVisible = ref(false);
const {
  importConfirmVisible,
  isTransferReady,
  isTransferDisabled,
  triggerImport,
  handleExport,
  handleImportFileChange,
  confirmImport,
  clearPendingImport,
} = useBookmarkTransfer();

async function clearCache() {
  const preservedKeys = new Set<IDBValidKey>(["bread-crumb-routes"]);

  try {
    await Promise.all([
      setFocusNodes([]),
      setGroupNodeIds([]),
      setImportNodeIds([]),
      setRecycleNodes([]),
    ]);
    setRemoveNodeIds([]);

    const cacheKeys = await getIDBKeys<IDBValidKey>();
    const removableKeys = cacheKeys.filter((key) => !preservedKeys.has(key));

    if (removableKeys.length > 0) {
      await delMany(removableKeys);
      message.success(t("clearCacheSuccessTips"));
    }
  } catch (error) {
    console.error("clear cache failed", error);
  }
}

function openClearCacheConfirm() {
  clearCacheConfirmVisible.value = true;
}
</script>

<style scoped lang="less">
.page-wrapper {
  height: 100%;
  padding: 20px;

  .title {
    font-size: 16px;
    font-weight: bold;
    line-height: 24px;
  }

  .content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 25px;

    .setting-item {
      display: flex;
      align-items: center;

      &.align-start {
        align-items: flex-start;
      }

      .label {
        width: 110px;
        flex-shrink: 0;
      }

      .radio-group {
        display: flex;
        gap: 8px;

        .radio-item {
          min-width: 100px;
        }
      }

      .transfer-wrapper {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .link-btn-wrapper {
        display: flex;
        gap: 40px;
      }

      .link-btn {
        padding: 0;
        border: none;
        background: transparent;
        color: var(--primary);
        cursor: pointer;
        font: inherit;

        &:hover {
          color: var(--primary-hover);
        }

        &.is-disabled {
          opacity: 0.5;
          cursor: not-allowed;
          color: var(--primary);
        }
      }

      .tips {
        font-size: 12px;
        color: #999;
        line-height: 1.5;
      }
    }
  }

  .hidden-input {
    display: none;
  }
}
</style>

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
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useLocale } from "@/bookmarks/hooks/useLocale";
import { useBookmarkTransfer } from "@/bookmarks/hooks/useBookmarkTransfer";
import TinyRadio from "@/components/tiny-raido";
import TinyConfirm from "@/components/TinyConfirm.vue";
import { useSettingStore } from "@/bookmarks/store/setting";
import { storeToRefs } from "pinia";

const { t } = useI18n();
const { changeLocale, locale } = useLocale();

const settingStore = useSettingStore();
const { setEnablePreview } = settingStore;
const { enablePreview } = storeToRefs(settingStore);
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
    gap: 20px;

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

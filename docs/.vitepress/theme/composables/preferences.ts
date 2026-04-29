import { useLocalStorage } from '@vueuse/core';

const stickyPreviewPreferenceKey = 'm3-vue-docs:sticky-preview-enabled';

export function useStickyPreviewPreference() {
  return useLocalStorage(stickyPreviewPreferenceKey, true);
}

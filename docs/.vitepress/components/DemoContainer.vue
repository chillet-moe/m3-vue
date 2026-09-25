<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue';
import { codeToHtml } from 'shiki';
import { useData } from 'vitepress';
import { useStickyPreviewPreference } from '../theme/composables/preferences';

type ViewportPreset = {
  height: number;
  key: string;
  label: string;
  width: number | 'full';
};

const props = withDefaults(
  defineProps<{
    src?: string;
    sticky?: boolean;
    viewport?: boolean;
  }>(),
  {
    src: undefined,
    sticky: undefined,
    viewport: true,
  },
);
const { lang } = useData();
const isZhHans = computed(() => lang.value === 'zh-Hans');

const sourceOpen = ref(false);
const highlightedSource = ref('');
const container = ref<HTMLElement | null>(null);
const isStuck = ref(false);
const stickyPreviewEnabled = useStickyPreviewPreference();
let stickyUpdateFrame = 0;

watchEffect((onCleanup) => {
  if (!props.src) {
    highlightedSource.value = '';
    return;
  }

  let active = true;
  onCleanup(() => {
    active = false;
  });

  void codeToHtml(props.src, {
    lang: 'vue',
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  }).then((html: string) => {
    if (!active) {
      return;
    }

    highlightedSource.value = html;
  });
});

const hasToolbar = computed(() => {
  return !!props.src;
});

const stickyEnabled = computed(() => {
  return stickyPreviewEnabled.value && (props.sticky ?? !props.src);
});

function getStickyOffset(element: HTMLElement) {
  const styles = window.getComputedStyle(element);
  const rawOffset = styles.insetBlockStart === 'auto' ? styles.top : styles.insetBlockStart;
  const offset = Number.parseFloat(rawOffset);

  return Number.isFinite(offset) ? offset : 0;
}

function updateStickyState() {
  stickyUpdateFrame = 0;

  if (!stickyEnabled.value || !container.value || typeof window === 'undefined') {
    isStuck.value = false;
    return;
  }

  const styles = window.getComputedStyle(container.value);

  if (styles.position !== 'sticky') {
    isStuck.value = false;
    return;
  }

  isStuck.value = container.value.getBoundingClientRect().top <= getStickyOffset(container.value) + 0.5;
}

function queueStickyUpdate() {
  if (typeof window === 'undefined' || stickyUpdateFrame !== 0) {
    return;
  }

  stickyUpdateFrame = window.requestAnimationFrame(updateStickyState);
}

onMounted(() => {
  queueStickyUpdate();
  window.addEventListener('scroll', queueStickyUpdate, { passive: true });
  window.addEventListener('resize', queueStickyUpdate);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', queueStickyUpdate);
  window.removeEventListener('resize', queueStickyUpdate);

  if (stickyUpdateFrame !== 0) {
    window.cancelAnimationFrame(stickyUpdateFrame);
  }
});

watch(stickyEnabled, async () => {
  await nextTick();
  queueStickyUpdate();
});
</script>

<template>
  <section
    ref="container"
    class="vp-raw demo-container"
    :data-sticky="stickyEnabled ? 'true' : undefined"
    :data-stuck="isStuck ? 'true' : undefined"
  >
    <div class="demo-preview">
      <div>
        <slot />
      </div>
    </div>

    <div class="demo-toolbar" v-if="hasToolbar">
      <button
        v-if="src"
        class="demo-toolbar-button"
        :data-selected="sourceOpen ? 'true' : 'false'"
        type="button"
        :aria-expanded="sourceOpen ? 'true' : 'false'"
        @click="sourceOpen = !sourceOpen"
      >
        {{ isZhHans ? (sourceOpen ? '隐藏源码' : '显示源码') : sourceOpen ? 'Hide source' : 'Show source' }}
      </button>
    </div>

    <div v-if="src && sourceOpen" class="demo-source" v-html="highlightedSource" />
  </section>
</template>

<style scoped>
.demo-container {
  display: grid;
  gap: 0;
  margin-block: 1.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1.5rem;
  overflow: clip;
  background: var(--vp-c-bg-soft);
  box-shadow: var(--md-sys-elevation-level0);
  transition: box-shadow 160ms ease;
}

.demo-container[data-sticky='true']:first-of-type {
  position: sticky;
  inset-block-start: 4.75rem;
  z-index: 9;
}

.demo-container[data-sticky='true'][data-stuck='true']:first-of-type {
  box-shadow: 0 0.75rem 2rem --translucent(var(--md-sys-color-shadow), 0.16);
}

.demo-preview {
  padding: 1.25rem;
}

.demo-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 0.625rem;
  border-block-start: 1px solid var(--vp-c-divider);
  padding-block: 0.75rem;
  padding-inline: 1rem;
  background: --translucent(var(--vp-c-bg), 0.72);
  backdrop-filter: blur(16px);
}

.demo-toolbar-button {
  border: 1px solid --translucent(var(--vp-c-divider), 0.9);
  border-radius: 999px;
  padding-block: 0.5rem;
  padding-inline: 0.75rem;
  color: var(--vp-c-text-2);
  background: transparent;
  font: inherit;
  line-height: 1;
  cursor: pointer;
  transition:
    color 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.demo-toolbar-button[data-selected='true'] {
  border-color: --translucent(var(--vp-c-brand-1), 0.4);
  color: var(--vp-c-brand-1);
  background: --translucent(var(--vp-c-brand-1), 0.12);
}

.demo-source :deep(pre) {
  padding: 1.25rem;
  margin: 0;
  border-radius: 0;
}

.demo-source :deep(code) {
  font-size: 0.8125rem;
}

html.dark .demo-source :deep(.shiki),
html.dark .demo-source :deep(.shiki span) {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}

html.dark .demo-source :deep(.shiki span) {
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}

@media (max-width: 40rem) {
  .demo-container[data-sticky='true']:first-of-type {
    position: static;
    box-shadow: none;
  }

  .demo-toolbar {
    align-items: stretch;
    justify-content: flex-start;
  }
}
</style>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { codeToHtml } from 'shiki';
import DemoIframe from './DemoIframe.vue';

type ViewportPreset = {
  height: number;
  key: string;
  label: string;
  width: number | 'full';
};

const props = withDefaults(
  defineProps<{
    src?: string;
    viewport?: boolean;
  }>(),
  {
    src: undefined,
    viewport: true,
  },
);

const presets: ViewportPreset[] = [
  { key: 'mobile', label: 'Mobile', width: 360, height: 640 },
  { key: 'tablet', label: 'Tablet', width: 768, height: 960 },
  { key: 'desktop', label: 'Desktop', width: 1024, height: 720 },
  { key: 'full', label: 'Full', width: 'full', height: 720 },
];

const currentPreset = ref<ViewportPreset>(presets[3]);
const currentHeight = ref<number>(presets[3].height);
const sourceOpen = ref(false);
const highlightedSource = ref('');
const hasFixedViewport = computed(() => {
  return props.viewport && currentPreset.value.width !== 'full';
});

const previewInlineSize = computed(() => {
  if (currentPreset.value.width === 'full') {
    return '100%';
  }

  return `min(100%, ${currentPreset.value.width}px)`;
});

const previewBlockSize = computed(() => {
  return `${currentHeight.value}px`;
});

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

function selectPreset(preset: ViewportPreset) {
  currentPreset.value = preset;
  currentHeight.value = preset.height;
}
</script>

<template>
  <section class="demo-container">
    <div class="demo-preview">
      <div
        class="demo-preview-shell"
        :style="{ inlineSize: previewInlineSize, blockSize: hasFixedViewport ? previewBlockSize : undefined }"
        :data-viewport-enabled="viewport ? 'true' : 'false'"
      >
        <DemoIframe :height="hasFixedViewport ? previewBlockSize : undefined">
          <slot />
        </DemoIframe>
      </div>
    </div>

    <div class="demo-toolbar">
      <div v-if="viewport" class="demo-viewport-presets" role="toolbar" aria-label="Demo viewport presets">
        <button
          v-for="preset in presets"
          :key="preset.key"
          class="demo-toolbar-button"
          :data-selected="currentPreset.key === preset.key ? 'true' : 'false'"
          type="button"
          @click="selectPreset(preset)"
        >
          {{ preset.label }}
        </button>
      </div>

      <label v-if="hasFixedViewport" class="demo-dimension-field">
        <span class="demo-dimension-label">Height</span>
        <input
          v-model.number="currentHeight"
          class="demo-dimension-input"
          type="number"
          min="160"
          step="20"
        />
        <span class="demo-dimension-unit">px</span>
      </label>

      <button
        v-if="src"
        class="demo-toolbar-button"
        :data-selected="sourceOpen ? 'true' : 'false'"
        type="button"
        :aria-expanded="sourceOpen ? 'true' : 'false'"
        @click="sourceOpen = !sourceOpen"
      >
        {{ sourceOpen ? 'Hide source' : 'Show source' }}
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
}

.demo-preview {
  padding: 1.25rem;
}

.demo-preview-shell {
  margin-inline: auto;
  max-inline-size: 100%;
  overflow: auto;
  resize: both;
}

.demo-preview-shell[data-viewport-enabled='false'] {
  inline-size: 100% !important;
  block-size: auto !important;
  resize: none;
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

.demo-viewport-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.demo-dimension-field {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-inline-start: auto;
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
}

.demo-dimension-label,
.demo-dimension-unit {
  white-space: nowrap;
}

.demo-dimension-input {
  inline-size: 4.5rem;
  border: 1px solid --translucent(var(--vp-c-divider), 0.9);
  border-radius: 999px;
  padding-block: 0.5rem;
  padding-inline: 0.75rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font: inherit;
  line-height: 1;
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
  margin: 0;
  border-radius: 0;
}

.demo-source :deep(code) {
  font-size: 0.8125rem;
}

@media (max-width: 40rem) {
  .demo-toolbar {
    align-items: stretch;
    justify-content: flex-start;
  }

  .demo-dimension-field {
    margin-inline-start: 0;
  }
}
</style>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { codeToHtml } from 'shiki';

type ViewportPreset = {
  label: string;
  value: string;
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
  { label: 'Mobile', value: '360px' },
  { label: 'Tablet', value: '768px' },
  { label: 'Desktop', value: '1024px' },
  { label: 'Full', value: '100%' },
];

const currentViewport = ref<string>('100%');
const sourceOpen = ref(false);
const highlightedSource = ref('');

const previewInlineSize = computed(() => {
  if (currentViewport.value === '100%') {
    return '100%';
  }

  return `min(100%, ${currentViewport.value})`;
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
</script>

<template>
  <section class="demo-container">
    <div class="demo-preview">
      <div
        class="demo-preview-shell"
        :style="{ inlineSize: previewInlineSize }"
        :data-viewport-enabled="viewport ? 'true' : 'false'"
      >
        <div class="demo-preview-stage">
          <slot />
        </div>
      </div>
    </div>

    <div class="demo-toolbar">
      <div v-if="viewport" class="demo-viewport-presets" role="toolbar" aria-label="Demo viewport presets">
        <button
          v-for="preset in presets"
          :key="preset.label"
          class="demo-toolbar-button"
          :data-selected="currentViewport === preset.value ? 'true' : 'false'"
          type="button"
          @click="currentViewport = preset.value"
        >
          {{ preset.label }}
        </button>
      </div>

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
  margin-block: --dp(20);
  border: 1px solid var(--vp-c-divider);
  border-radius: --dp(24);
  overflow: clip;
  background: var(--vp-c-bg-soft);
}

.demo-preview {
  padding: --dp(20);
}

.demo-preview-shell {
  margin-inline: auto;
  max-inline-size: 100%;
  overflow: auto;
  resize: horizontal;
}

.demo-preview-shell[data-viewport-enabled='false'] {
  inline-size: 100% !important;
  resize: none;
}

.demo-preview-stage {
  display: grid;
  place-items: center;
  gap: --dp(16);
  min-block-size: --dp(160);
  border-radius: --dp(20);
  padding: --dp(24);
  background:
    linear-gradient(135deg, --translucent(var(--vp-c-brand-1), 0.08), transparent 60%),
    linear-gradient(0deg, var(--vp-c-bg), var(--vp-c-bg));
}

.demo-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: --dp(10);
  border-block-start: 1px solid var(--vp-c-divider);
  padding-block: --dp(12);
  padding-inline: --dp(16);
  background: --translucent(var(--vp-c-bg), 0.72);
  backdrop-filter: blur(16px);
}

.demo-viewport-presets {
  display: flex;
  flex-wrap: wrap;
  gap: --dp(8);
}

.demo-toolbar-button {
  border: 1px solid --translucent(var(--vp-c-divider), 0.9);
  border-radius: 999px;
  padding-block: --dp(8);
  padding-inline: --dp(12);
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
  font-size: --dp(13);
}

@media (max-width: 40rem) {
  .demo-toolbar {
    align-items: stretch;
    justify-content: flex-start;
  }
}
</style>

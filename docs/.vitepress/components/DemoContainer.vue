<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { codeToHtml } from 'shiki';

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

const sourceOpen = ref(false);
const highlightedSource = ref('');

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
</script>

<template>
  <section class="vp-raw demo-container">
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
  .demo-toolbar {
    align-items: stretch;
    justify-content: flex-start;
  }
}
</style>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue';
import { codeToHtml } from 'shiki';
import { useData } from 'vitepress';
import { Button, Card } from '@/index';
import { useStickyPreviewPreference } from '../theme/composables/preferences';

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
    <Card color="outlined" class="demo-surface">
      <div class="demo-preview">
        <div>
          <slot />
        </div>
      </div>

      <div class="demo-toolbar" v-if="hasToolbar">
        <Button
          v-if="src"
          variant="text"
          size="small"
          leading-icon="code"
          :aria-expanded="sourceOpen ? 'true' : 'false'"
          @click="sourceOpen = !sourceOpen"
        >
          {{ isZhHans ? (sourceOpen ? '隐藏源码' : '显示源码') : sourceOpen ? 'Hide source' : 'Show source' }}
        </Button>
      </div>

      <div v-if="src && sourceOpen" class="demo-source" v-html="highlightedSource" />
    </Card>
  </section>
</template>

<style scoped>
.demo-container {
  margin-block: 1.25rem;
}

.demo-surface {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  /* Card draws its outline inside the surface; keep opaque source content inside that line. */
  padding: var(--md-outlined-card-outline-width, 1px);
  overflow: clip;
}

.demo-container[data-sticky='true']:first-of-type {
  position: sticky;
  inset-block-start: 4.75rem;
  z-index: 9;
}

.demo-container[data-sticky='true'][data-stuck='true']:first-of-type {
  border-radius: var(--docs-shape-surface);
  box-shadow: var(--md-sys-elevation-level2);
}

.demo-preview {
  min-inline-size: 0;
  padding: 1.25rem;
}

.demo-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 0.625rem;
  border-block-start: 1px solid var(--vp-c-divider);
  padding-block: 0.5rem;
  padding-inline: 1rem;
}

.demo-source {
  min-inline-size: 0;
}

.demo-source :deep(pre) {
  overflow: auto;
  padding: 1.25rem;
  margin: 0;
  border-radius: 0;
}

.demo-source :deep(code) {
  font-size: 0.8125rem;
}

:global(html.dark) .demo-source :deep(.shiki),
:global(html.dark) .demo-source :deep(.shiki span) {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}

:global(html.dark) .demo-source :deep(.shiki span) {
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

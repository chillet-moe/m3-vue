<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';

const props = defineProps<{
  height?: string;
  title?: string;
}>();

const frameRef = useTemplateRef<HTMLIFrameElement>('frame');

const target = ref<HTMLElement | null>(null);
const frameHeight = ref('160px');
const resolvedFrameHeight = computed(() => {
  return props.height ?? frameHeight.value;
});

let resizeObserver: ResizeObserver | null = null;
let headObserver: MutationObserver | null = null;
let themeObserver: MutationObserver | null = null;

function syncHeadStyles(frameDocument: Document) {
  frameDocument.head.querySelectorAll('[data-demo-iframe-clone="true"]').forEach((node) => node.remove());

  document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    const clone = node.cloneNode(true) as HTMLElement;
    clone.setAttribute('data-demo-iframe-clone', 'true');
    frameDocument.head.appendChild(clone);
  });
}

function syncTheme(frameDocument: Document) {
  frameDocument.documentElement.className = document.documentElement.className;

  const colorScheme = getComputedStyle(document.documentElement).colorScheme;
  frameDocument.documentElement.style.colorScheme = colorScheme;
  frameDocument.body.style.colorScheme = colorScheme;
}

function bindFrame() {
  const frame = frameRef.value;
  const frameDocument = frame?.contentDocument;

  if (!frame || !frameDocument) {
    return;
  }

  frameDocument.open();
  frameDocument.write(`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <base href="${window.location.href}" />
      </head>
      <body>
        <div id="demo-root"></div>
      </body>
    </html>`);
  frameDocument.close();
  frameDocument.documentElement.style.blockSize = '100%';
  frameDocument.body.style.blockSize = '100%';
  frameDocument.body.style.margin = '0';

  syncHeadStyles(frameDocument);
  syncTheme(frameDocument);

  const nextTarget = frameDocument.getElementById('demo-root');
  target.value = nextTarget;

  if (!nextTarget) {
    return;
  }

  nextTarget.style.blockSize = '100%';

  resizeObserver?.disconnect();
  if (!props.height) {
    resizeObserver = new ResizeObserver(() => {
      frameHeight.value = `${Math.max(Math.ceil(nextTarget.scrollHeight), 160)}px`;
    });
    resizeObserver.observe(nextTarget);
  }

  void nextTick(() => {
    if (!props.height) {
      frameHeight.value = `${Math.max(Math.ceil(nextTarget.scrollHeight), 160)}px`;
    }
  });

  headObserver?.disconnect();
  headObserver = new MutationObserver(() => {
    syncHeadStyles(frameDocument);
  });
  headObserver.observe(document.head, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href', 'media'],
  });

  themeObserver?.disconnect();
  themeObserver = new MutationObserver(() => {
    syncTheme(frameDocument);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style'],
  });
}

onMounted(() => {
  bindFrame();
});

watch(frameRef, (frame) => {
  if (!frame) {
    return;
  }

  bindFrame();
});

watch(
  () => props.height,
  () => {
    const nextTarget = target.value;

    if (!nextTarget || props.height) {
      return;
    }

    frameHeight.value = `${Math.max(Math.ceil(nextTarget.scrollHeight), 160)}px`;
  },
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  headObserver?.disconnect();
  themeObserver?.disconnect();
});
</script>

<template>
  <div class="demo-iframe-shell">
    <iframe
      ref="frame"
      class="demo-iframe"
      :title="title ?? 'Component demo preview'"
      :style="{ blockSize: resolvedFrameHeight }"
    />
    <Teleport v-if="target" :to="target">
      <div class="demo-iframe-stage" :style="{ minBlockSize: height ? '100%' : undefined }">
        <slot />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.demo-iframe-shell {
  inline-size: 100%;
  min-inline-size: 0;
}

.demo-iframe {
  display: block;
  inline-size: 100%;
  border: 0;
  background: transparent;
}

.demo-iframe-stage {
  display: grid;
  place-items: center;
  gap: 1rem;
  min-block-size: 10rem;
  border-radius: 1.25rem;
  padding: 1.5rem;
  background:
    linear-gradient(135deg, --translucent(var(--vp-c-brand-1), 0.08), transparent 60%),
    linear-gradient(0deg, var(--vp-c-bg), var(--vp-c-bg));
}
</style>

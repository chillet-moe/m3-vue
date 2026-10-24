<script setup lang="ts">
import { createOverlayHost, provideOverlayHost } from '@/internal/overlayHost/overlayHost';
const overlayHost = provideOverlayHost(createOverlayHost());
import { Content, useData, useRoute } from 'vitepress';
import { computed, watch } from 'vue';
import { OverlayHost } from '@/components/OverlayHost';

import DocsContent from './components/DocsContent.vue';
import DocsSidebar from './components/DocsSidebar.vue';
import DocsTopBar from './components/DocsTopBar.vue';
import HomeLayout from './components/HomeLayout.vue';
import NotFoundView from './components/NotFoundView.vue';
import { useSidebarControl } from './composables/sidebar';

const { frontmatter, page } = useData();
const route = useRoute();
const { isOpen: isSidebarOpen, close: closeSidebar } = useSidebarControl();

watch(() => route.path, closeSidebar);

const isHome = computed(() => frontmatter.value.layout === 'home');
</script>

<template>
  <div
    v-if="frontmatter.layout !== false"
    class="docs-app"
    :class="[frontmatter.pageClass, { 'docs-layout-home': isHome }]"
  >
    <OverlayHost :host="overlayHost" />

    <template v-if="page.isNotFound">
      <HomeLayout>
        <NotFoundView />
      </HomeLayout>
    </template>

    <template v-else-if="isHome">
      <HomeLayout>
        <Content />
      </HomeLayout>
    </template>

    <template v-else>
      <div class="docs-backdrop" :data-open="isSidebarOpen ? 'true' : 'false'" @click="closeSidebar" />

      <div class="docs-layout">
        <DocsSidebar />

        <div class="docs-main-shell">
          <DocsTopBar />
          <DocsContent />
        </div>
      </div>
    </template>
  </div>

  <template v-else>
    <OverlayHost :host="overlayHost" />
    <Content />
  </template>
</template>

<style scoped>
.docs-app {
  min-block-size: 100vh;
}

.docs-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: --translucent(#000000, 0.28);
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease;
}

.docs-backdrop[data-open='true'] {
  opacity: 1;
  pointer-events: auto;
}

.docs-layout {
  display: grid;
  grid-template-columns: 18rem minmax(0, 1fr);
  min-block-size: 100vh;
}

.docs-main-shell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-inline-size: 0;
  background:
    radial-gradient(circle at top, --translucent(var(--md-sys-color-primary), 0.12), transparent 28rem),
    linear-gradient(180deg, var(--vp-c-bg-alt) 0%, var(--vp-c-bg) 18rem);
}

@media (max-width: 64rem) {
  .docs-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

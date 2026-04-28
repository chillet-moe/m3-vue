<script setup lang="ts">
import { withBase } from 'vitepress';

import { useSiteInfo } from '../composables/nav';
import { useSidebar, useSidebarControl } from '../composables/sidebar';
import DocsSidebarItems from './DocsSidebarItems.vue';

const { isOpen, close } = useSidebarControl();
const { sidebarItems } = useSidebar();
const { siteLogo, siteTitle } = useSiteInfo();

function resolveLink(path: string) {
  return withBase(path);
}
</script>

<template>
  <aside class="docs-sidebar" :data-open="isOpen ? 'true' : 'false'">
    <div class="docs-sidebar-surface">
      <div class="docs-sidebar-brand">
        <a class="docs-brand" :href="resolveLink('/')" @click="close()">
          <img v-if="siteLogo" class="docs-brand-logo" :src="siteLogo" alt="" />
          <span class="docs-brand-text">{{ siteTitle }}</span>
        </a>
      </div>

      <nav class="docs-sidebar-nav" aria-label="Sidebar">
        <section v-for="item in sidebarItems" :key="item.text || item.link || 'group'" class="docs-sidebar-group">
          <template v-if="item.items?.length">
            <h2 v-if="item.text" class="docs-sidebar-title">{{ item.text }}</h2>
            <DocsSidebarItems :items="item.items" />
          </template>

          <DocsSidebarItems v-else :items="[item]" />
        </section>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
.docs-sidebar {
  position: sticky;
  inset-block-start: 0;
  block-size: 100vh;
  min-inline-size: 0;
}

.docs-sidebar-surface {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  block-size: 100%;
  border-radius: 0;
  overflow: clip;
}

.docs-sidebar-brand {
  padding-inline: 1rem;
  min-block-size: 4.75rem;
}

.docs-sidebar-brand {
  padding-block: 1.125rem 0.75rem;
}

.docs-brand {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.625rem;
  inline-size: 100%;
  block-size: 100%;
}

.docs-brand-logo {
  inline-size: 1.5rem;
  block-size: 1.5rem;
}

.docs-brand-text {
  font-size: 1rem;
  font-weight: 700;
}

.docs-sidebar-nav {
  min-block-size: 0;
  overflow: auto;
  padding: 1rem;
}

.docs-sidebar-group {
  display: grid;
  gap: 0.5rem;
}

.docs-sidebar-group + .docs-sidebar-group {
  margin-block-start: 1.5rem;
}

.docs-sidebar-title {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 1.25;
  margin-inline-start: 0.5rem;
  margin-block-end: 0.25rem;
}

@media (max-width: 64rem) {
  .docs-sidebar {
    position: fixed;
    inset-block: 0;
    inset-inline-start: 0;
    z-index: 35;
    inline-size: min(88vw, 20rem);
    transform: translateX(-100%);
    transition: transform 180ms ease;
  }

  .docs-sidebar[data-open='true'] {
    transform: translateX(0);
  }

  .docs-sidebar-surface {
    background: var(--vp-c-bg);
  }
}
</style>

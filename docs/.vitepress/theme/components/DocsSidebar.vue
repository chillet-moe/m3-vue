<script setup lang="ts">
import { withBase } from 'vitepress';

import { Button, Card } from '@/index';
import { useNav, useSiteInfo } from '../composables/nav';
import { useSidebar, useSidebarControl } from '../composables/sidebar';
import { normalizePath } from '../utils';

const { isOpen, close } = useSidebarControl();
const { currentPath, sidebarItems } = useSidebar();
const { siteLogo, siteTitle } = useSiteInfo();

function resolveLink(path: string) {
  return withBase(path);
}

function isActiveLink(path?: string) {
  if (!path) return false;
  return normalizePath(path) === currentPath.value;
}
</script>

<template>
  <aside class="docs-sidebar" :data-open="isOpen ? 'true' : 'false'">
    <Card color="filled" class="docs-sidebar-surface">
      <div class="docs-sidebar-brand">
        <Button class="docs-brand" color="text" size="medium" :href="resolveLink('/')" @click="close()">
          <img v-if="siteLogo" class="docs-brand-logo" :src="siteLogo" alt="" />
          <span class="docs-brand-text">{{ siteTitle }}</span>
        </Button>
      </div>

      <nav class="docs-sidebar-nav" aria-label="Sidebar">
        <section v-for="item in sidebarItems" :key="item.text || item.link || 'group'" class="docs-sidebar-group">
          <template v-if="item.items?.length">
            <h2 v-if="item.text" class="docs-sidebar-title">{{ item.text }}</h2>
            <div class="docs-sidebar-links">
              <Button
                v-for="child in item.items"
                :key="child.link || child.text"
                class="docs-sidebar-link"
                color="text"
                size="medium"
                :href="child.link ? resolveLink(child.link) : undefined"
                :data-active="isActiveLink(child.link) ? 'true' : 'false'"
                @click="close()"
              >
                {{ child.text }}
              </Button>
            </div>
          </template>

          <Button
            v-else-if="item.link && item.text"
            class="docs-sidebar-link"
            color="text"
            size="medium"
            :href="resolveLink(item.link)"
            :data-active="isActiveLink(item.link) ? 'true' : 'false'"
            @click="close()"
          >
            {{ item.text }}
          </Button>
        </section>
      </nav>
    </Card>
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
}

.docs-sidebar-brand {
  padding-block: 1.125rem 0.75rem;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
}

.docs-brand:deep(.m3-button) {
  justify-content: flex-start;
  gap: 0.625rem;
  inline-size: 100%;
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
  overflow: auto;
  padding: 1rem;
}

.docs-sidebar-group {
  display: grid;
  gap: 0.5rem;
}

.docs-sidebar-group + .docs-sidebar-group {
  margin-block-start: 1.125rem;
}

.docs-sidebar-title {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.docs-sidebar-links {
  display: grid;
  gap: 0.375rem;
}

.docs-sidebar-link[data-active='true']:deep(.m3-button) {
  color: var(--md-sys-color-primary);
  background: --translucent(var(--md-sys-color-primary), 0.12);
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
}
</style>

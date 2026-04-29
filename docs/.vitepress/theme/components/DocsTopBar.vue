<script setup lang="ts">
import { useData, withBase } from 'vitepress';
import { VPNavBarSearch } from 'vitepress/theme';
import { computed } from 'vue';

import { Button, IconButton } from '@/index';
import { useNav } from '../composables/nav';
import { useStickyPreviewPreference } from '../composables/preferences';
import { useSidebar, useSidebarControl } from '../composables/sidebar';
import { normalizePath, resolveSocialLabel } from '../utils';

const { page, frontmatter, site, isDark } = useData();
const { navItems, socialLinks } = useNav();
const { currentPath } = useSidebar();
const { toggle: toggleSidebar } = useSidebarControl();
const stickyPreviewEnabled = useStickyPreviewPreference();

const pageTitle = computed(() => {
  return page.value.title || frontmatter.value.title || site.value.title || 'M3 Vue';
});

function isActiveLink(path: string) {
  return normalizePath(path) === currentPath.value;
}

function resolveLink(path: string) {
  return withBase(path);
}

function toggleAppearance() {
  isDark.value = !isDark.value;
}

function toggleStickyPreview() {
  stickyPreviewEnabled.value = !stickyPreviewEnabled.value;
}
</script>

<template>
  <header class="docs-topbar">
    <div class="docs-topbar-inner">
      <div class="docs-topbar-leading">
        <IconButton
          class="docs-menu-toggle"
          color="standard"
          size="small"
          width="default"
          icon="menu"
          aria-label="Toggle sidebar"
          @click="toggleSidebar()"
        />
        <VPNavBarSearch class="docs-search" />
      </div>

      <nav v-if="navItems.length" class="docs-nav" aria-label="Primary">
        <Button
          v-for="item in navItems"
          :key="item.link"
          class="docs-nav-link"
          color="text"
          size="medium"
          :href="resolveLink(item.link)"
          :data-active="isActiveLink(item.link) ? 'true' : 'false'"
        >
          {{ item.text }}
        </Button>
      </nav>

      <div class="docs-topbar-actions">
        <Button
          v-for="link in socialLinks"
          :key="link.link"
          class="docs-social-link"
          color="text"
          size="small"
          :href="link.link"
          trailing-icon="open_in_new"
        >
          {{ resolveSocialLabel(link.link) }}
        </Button>

        <IconButton
          color="standard"
          size="small"
          width="default"
          icon="push_pin"
          :aria-label="stickyPreviewEnabled ? 'Disable sticky preview' : 'Enable sticky preview'"
          :data-active="stickyPreviewEnabled ? 'true' : 'false'"
          @click="toggleStickyPreview"
        />

        <IconButton
          color="standard"
          size="small"
          width="default"
          :icon="isDark ? 'light_mode' : 'dark_mode'"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleAppearance"
        />
      </div>
    </div>
  </header>
</template>

<style scoped>
.docs-topbar {
  position: sticky;
  inset-block-start: 0;
  z-index: 20;
  backdrop-filter: blur(20px);
}

.docs-topbar-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding-block: 0.625rem;
  padding-inline: 0.75rem;
}

.docs-topbar-leading {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-inline-size: 0;
}

.docs-menu-toggle {
  display: none;
}

.docs-page-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.docs-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.docs-nav-link[data-active='true']:deep(.m3-button) {
  color: var(--md-sys-color-primary);
  background: --translucent(var(--md-sys-color-primary), 0.12);
}

.docs-topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.docs-topbar-actions :deep([data-active='true']) {
  color: var(--md-sys-color-primary);
  background: --translucent(var(--md-sys-color-primary), 0.12);
}

.docs-search :deep(.VPNavBarSearchButton) {
  border: 1px solid --translucent(var(--vp-c-divider), 0.7);
  border-radius: 999px;
  background: --translucent(var(--vp-c-bg-alt), 0.5);
  block-size: 2.25rem;
  padding-inline: 0.75rem;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.docs-search :deep(.VPNavBarSearchButton:hover) {
  border-color: var(--md-sys-color-primary);
  background: --translucent(var(--md-sys-color-primary), 0.06);
}

.docs-search :deep(.VPNavBarSearchButton .vpi-search) {
  font-size: 1.125rem;
}

@media (max-width: 80rem) {
  .docs-nav {
    display: none;
  }
}

@media (max-width: 64rem) {
  .docs-topbar {
    padding-inline: 1rem;
  }

  .docs-topbar-inner {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .docs-menu-toggle {
    display: inline-flex;
  }

  .docs-social-link {
    display: none;
  }

  .docs-search :deep(.VPNavBarSearchButton .text),
  .docs-search :deep(.VPNavBarSearchButton .keys) {
    display: none;
  }
}

@media (min-width: 768px) {
  .VPNavBarSearch {
    gap: 8px;
    flex-grow: 1;
    padding-left: 0.5rem;
  }
}
</style>

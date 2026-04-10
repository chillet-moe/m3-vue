<script setup lang="ts">
import { withBase } from 'vitepress';
import { VPNavBarSearch } from 'vitepress/theme';
import { Button, IconButton } from '@/index';

import { normalizePath, resolveSocialLabel, type ThemeNavItem, type ThemeSocialLink } from '../utils';

const props = defineProps<{
  currentPath: string;
  isDark: boolean;
  navItems: ThemeNavItem[];
  pageTitle: string;
  socialLinks: ThemeSocialLink[];
}>();

const emit = defineEmits<{
  toggleAppearance: [];
  toggleSidebar: [];
}>();

function isActiveLink(path: string) {
  return normalizePath(path) === props.currentPath;
}

function resolveLink(path: string) {
  return withBase(path);
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
          @click="emit('toggleSidebar')"
        />
        <h1 class="docs-page-title">{{ pageTitle }}</h1>
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
        <VPNavBarSearch class="docs-search" />

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
          :icon="isDark ? 'light_mode' : 'dark_mode'"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="emit('toggleAppearance')"
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
  padding: --dp(16) --dp(24) 0;
  backdrop-filter: blur(20px);
}

.docs-topbar-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: --dp(12);
  align-items: center;
  border: 1px solid --translucent(var(--vp-c-divider), 0.7);
  border-radius: --dp(28);
  padding-block: --dp(10);
  padding-inline: --dp(12);
  background: --translucent(var(--vp-c-bg), 0.78);
}

.docs-topbar-leading {
  display: flex;
  align-items: center;
  gap: --dp(10);
  min-inline-size: 0;
}

.docs-menu-toggle {
  display: none;
}

.docs-page-title {
  margin: 0;
  font-size: --dp(16);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.docs-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: --dp(8);
}

.docs-nav-link[data-active='true']:deep(.m3-button) {
  color: var(--md-sys-color-primary);
  background: --translucent(var(--md-sys-color-primary), 0.12);
}

.docs-topbar-actions {
  display: flex;
  align-items: center;
  gap: --dp(8);
}

.docs-search :deep(.VPNavBarSearchButton) {
  border: 1px solid --translucent(var(--vp-c-divider), 0.7);
  border-radius: 999px;
  background: --translucent(var(--vp-c-bg-alt), 0.5);
  block-size: --dp(36);
  padding-inline: --dp(12);
  font-family: inherit;
  font-size: --dp(14);
  color: var(--vp-c-text-2);
}

.docs-search :deep(.VPNavBarSearchButton:hover) {
  border-color: var(--md-sys-color-primary);
  background: --translucent(var(--md-sys-color-primary), 0.06);
}

.docs-search :deep(.VPNavBarSearchButton .vpi-search) {
  font-size: --dp(18);
}

@media (max-width: 80rem) {
  .docs-nav {
    display: none;
  }
}

@media (max-width: 64rem) {
  .docs-topbar {
    padding-inline: --dp(16);
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
</style>

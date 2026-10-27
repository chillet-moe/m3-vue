<script setup lang="ts">
import { useData, withBase } from 'vitepress';
import { VPNavBarSearch } from 'vitepress/theme';

import { Button, IconButton } from '@/index';
import CustomizationControls from '../../components/CustomizationControls.vue';
import { useLocaleNavigation, useNav } from '../composables/nav';
import { useStickyPreviewPreference } from '../composables/preferences';
import { useSidebar, useSidebarControl } from '../composables/sidebar';
import { normalizePath, resolveSocialLabel } from '../utils';

const { isDark } = useData();
const { navItems, socialLinks } = useNav();
const { isChinese, languageLink } = useLocaleNavigation();
const { currentPath } = useSidebar();
const { toggle: toggleSidebar } = useSidebarControl();
const stickyPreviewEnabled = useStickyPreviewPreference();

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
          variant="standard"
          size="small"
          width="default"
          icon="menu"
          :aria-label="isChinese ? '切换侧边栏' : 'Toggle sidebar'"
          @click="toggleSidebar()"
        />
        <VPNavBarSearch class="docs-search" />
      </div>

      <nav v-if="navItems.length" class="docs-nav" :aria-label="isChinese ? '主导航' : 'Primary'">
        <Button
          v-for="item in navItems"
          :key="item.link"
          class="docs-nav-link"
          :variant="isActiveLink(item.link) ? 'tonal' : 'text'"
          size="small"
          :press-shape-morph="false"
          :href="resolveLink(item.link)"
          :aria-current="isActiveLink(item.link) ? 'page' : undefined"
        >
          {{ item.text }}
        </Button>
      </nav>

      <div class="docs-topbar-actions">
        <Button variant="text" size="small" :href="resolveLink(languageLink)" :lang="isChinese ? 'en' : 'zh-Hans'">
          {{ isChinese ? 'English' : '简体中文' }}
        </Button>

        <Button
          v-for="link in socialLinks"
          :key="link.link"
          class="docs-social-link"
          variant="text"
          size="small"
          :href="link.link"
          trailing-icon="open_in_new"
        >
          {{ resolveSocialLabel(link.link) }}
        </Button>

        <IconButton
          variant="standard"
          size="small"
          width="default"
          class="docs-sticky-toggle"
          icon="push_pin"
          :aria-label="
            stickyPreviewEnabled
              ? isChinese
                ? '关闭预览置顶'
                : 'Disable sticky preview'
              : isChinese
                ? '开启预览置顶'
                : 'Enable sticky preview'
          "
          :aria-pressed="stickyPreviewEnabled"
          @click="toggleStickyPreview"
        />

        <CustomizationControls />

        <IconButton
          variant="standard"
          size="small"
          width="default"
          :icon="isDark ? 'light_mode' : 'dark_mode'"
          :aria-label="
            isDark
              ? isChinese
                ? '切换到浅色模式'
                : 'Switch to light mode'
              : isChinese
                ? '切换到深色模式'
                : 'Switch to dark mode'
          "
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

.docs-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.docs-sticky-toggle[aria-pressed='true'] {
  color: var(--md-sys-color-primary);
  background: --translucent(var(--md-sys-color-primary), 0.12);
}

.docs-topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.docs-search {
  padding: 0;
  flex-grow: 0;
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
}
</style>

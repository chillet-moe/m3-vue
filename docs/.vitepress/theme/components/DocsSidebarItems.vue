<script setup lang="ts">
import { withBase } from 'vitepress';
import type { DefaultTheme } from 'vitepress';

import { Button } from '@/index';
import { useSidebar, useSidebarControl } from '../composables/sidebar';
import { normalizePath } from '../utils';

const props = withDefaults(
  defineProps<{
    items: DefaultTheme.SidebarItem[];
    depth?: number;
  }>(),
  {
    depth: 0,
  },
);

const { close } = useSidebarControl();
const { currentPath } = useSidebar();

function resolveLink(path: string) {
  return withBase(path);
}

function isActiveLink(path?: string) {
  if (!path) return false;
  return normalizePath(path) === currentPath.value;
}

function hasActiveLink(item: DefaultTheme.SidebarItem): boolean {
  if (isActiveLink(item.link)) return true;
  return item.items?.some(hasActiveLink) ?? false;
}

function resolveItemKey(item: DefaultTheme.SidebarItem, index: number) {
  return item.link || item.text || `sidebar-item-${props.depth}-${index}`;
}
</script>

<template>
  <div class="docs-sidebar-links" :data-depth="props.depth">
    <template v-for="(item, index) in props.items" :key="resolveItemKey(item, index)">
      <div
        v-if="item.items?.length"
        class="docs-sidebar-subgroup"
        :data-active="hasActiveLink(item) ? 'true' : 'false'"
        :data-depth="props.depth"
      >
        <Button
          v-if="item.link && item.text"
          class="docs-sidebar-link"
          color="text"
          :size="props.depth === 0 ? 'small' : 'small'"
          :href="resolveLink(item.link)"
          :data-active="isActiveLink(item.link) ? 'true' : 'false'"
          :data-depth="props.depth"
          @click="close()"
        >
          {{ item.text }}
        </Button>
        <h3 v-else-if="item.text" class="docs-sidebar-subtitle" :data-depth="props.depth">
          {{ item.text }}
        </h3>

        <DocsSidebarItems :items="item.items" :depth="props.depth + 1" />
      </div>

      <Button
        v-else-if="item.link && item.text"
        class="docs-sidebar-link"
        color="text"
        :size="props.depth === 0 ? 'small' : 'small'"
        :href="resolveLink(item.link)"
        :data-active="isActiveLink(item.link) ? 'true' : 'false'"
        :data-depth="props.depth"
        @click="close()"
      >
        {{ item.text }}
      </Button>

      <h3 v-else-if="item.text" class="docs-sidebar-subtitle" :data-depth="props.depth">
        {{ item.text }}
      </h3>
    </template>
  </div>
</template>

<style scoped>
.docs-sidebar-links {
  display: grid;
  gap: 0.125rem;
}

.docs-sidebar-links:not([data-depth='0']) {
  gap: 0.25rem;
  margin-inline-start: 0.75rem;
  padding-inline-start: 0.75rem;
  border-inline-start: 0.0625rem solid var(--vp-c-divider);
}

.docs-sidebar-subgroup {
  display: grid;
  gap: 0.25rem;
}

.docs-sidebar-subtitle {
  margin: 0.25rem 0 0.125rem 0.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.25;
}

.docs-sidebar-subtitle[data-depth='0'] {
  margin-block-start: 0.375rem;
}

.docs-sidebar-subgroup[data-active='true'] > .docs-sidebar-subtitle {
  color: var(--md-sys-color-primary);
}

.docs-sidebar-link[data-active='true'] {
  background: --translucent(var(--md-sys-color-primary), 0.12);
}

.docs-sidebar-link {
  text-align: start;
  justify-content: flex-start;
  color: var(--md-sys-color-on-surface);
}
</style>

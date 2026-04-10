import { useData, useRoute } from 'vitepress';
import { computed, ref } from 'vue';

import { flattenSidebarLinks, normalizePath, resolveSidebarItems, type ThemeSidebarLink } from '../utils';

const isOpen = ref(false);

export function useSidebarControl() {
  return {
    isOpen,
    open() {
      isOpen.value = true;
    },
    close() {
      isOpen.value = false;
    },
    toggle() {
      isOpen.value = !isOpen.value;
    },
  };
}

export function useSidebar() {
  const { theme, page } = useData();
  const route = useRoute();

  const currentPath = computed(() => normalizePath(route.path));

  const sidebarItems = computed(() => {
    return resolveSidebarItems(theme.value.sidebar, page.value.relativePath);
  });

  const flatItems = computed(() => flattenSidebarLinks(sidebarItems.value));

  const currentIndex = computed(() => {
    return flatItems.value.findIndex((item) => normalizePath(item.link) === currentPath.value);
  });

  const prevItem = computed<ThemeSidebarLink | null>(() => {
    if (currentIndex.value <= 0) return null;
    return flatItems.value[currentIndex.value - 1] ?? null;
  });

  const nextItem = computed<ThemeSidebarLink | null>(() => {
    if (currentIndex.value < 0) return null;
    return flatItems.value[currentIndex.value + 1] ?? null;
  });

  return { currentPath, sidebarItems, prevItem, nextItem };
}

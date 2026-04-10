import { useData, useRoute } from 'vitepress';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import { flattenOutlineItems } from '../utils';

export function useOutline() {
  const { page, theme } = useData();
  const route = useRoute();

  const activeHeadingId = ref('');
  let observer: IntersectionObserver | null = null;

  const items = computed(() => flattenOutlineItems(page.value.headers ?? []));

  const label = computed(() => {
    const outline = theme.value.outline;

    if (outline && typeof outline === 'object' && typeof outline.label === 'string') {
      return outline.label;
    }

    if (typeof theme.value.outlineTitle === 'string') {
      return theme.value.outlineTitle;
    }

    return 'On This Page';
  });

  function setupScrollSpy() {
    cleanupScrollSpy();

    const headings = items.value
      .map((item) => item.element)
      .filter((element): element is HTMLHeadElement => Boolean(element));

    if (!headings.length) return;

    observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

        if (!visibleEntries.length) return;

        activeHeadingId.value = visibleEntries[0].target.id;
      },
      { rootMargin: '-96px 0px -70% 0px' },
    );

    headings.forEach((heading) => observer?.observe(heading));
  }

  function cleanupScrollSpy() {
    observer?.disconnect();
    observer = null;
  }

  onMounted(() => void nextTick(setupScrollSpy));
  onUnmounted(cleanupScrollSpy);

  watch(
    () => route.path,
    () => {
      activeHeadingId.value = '';
      void nextTick(setupScrollSpy);
    },
  );

  return { items, label, activeHeadingId };
}

import { useData, useRoute } from 'vitepress';
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';

import type { ThemeOutlineLink } from '../utils';

const ignoreRE = /\b(?:header-anchor|ignore-header)\b/;

function serializeHeader(el: Element): string {
  let ret = '';
  for (const node of el.childNodes) {
    if (node.nodeType === 1) {
      if (ignoreRE.test((node as Element).className)) continue;
      ret += node.textContent;
    } else if (node.nodeType === 3) {
      ret += node.textContent;
    }
  }
  return ret.trim();
}

function getHeadersFromDom(): ThemeOutlineLink[] {
  const elements = document.querySelectorAll('.vp-doc :is(h2, h3, h4, h5, h6)');
  return [...elements]
    .filter((el) => el.id && el.hasChildNodes())
    .map((el) => ({
      title: serializeHeader(el),
      link: '#' + el.id,
      depth: Number(el.tagName[1]) - 2,
      element: el as HTMLHeadElement,
    }));
}

export function useOutline() {
  const { theme } = useData();
  const route = useRoute();

  const activeHeadingId = ref('');
  const items = shallowRef<ThemeOutlineLink[]>([]);
  let observer: IntersectionObserver | null = null;

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

  function update() {
    items.value = getHeadersFromDom();
    setupScrollSpy();
  }

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

  onMounted(() => void nextTick(update));
  onUnmounted(cleanupScrollSpy);

  watch(
    () => route.path,
    () => {
      activeHeadingId.value = '';
      void nextTick(update);
    },
  );

  return { items, label, activeHeadingId };
}

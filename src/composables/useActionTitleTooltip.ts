import { onBeforeUnmount, onBeforeUpdate, onMounted, onUpdated, ref, shallowRef, useAttrs } from 'vue';
import { setupTooltip } from '@/directives/Tooltip/setup';

/**
 * Turns an action component's `title` attr into the library tooltip.
 * The native title attr is intentionally omitted from root attrs to avoid double tooltips.
 */
export function useActionTitleTooltip(options: { ariaLabelFallback?: boolean } = {}) {
  const attrs = useAttrs();
  const rootRef = ref<HTMLElement | null>(null);
  let state: ReturnType<typeof setupTooltip> | null = null;

  const resolveTitleTooltip = () => {
    const value = attrs.title;
    return typeof value === 'string' && value ? { content: value, interactive: false } : undefined;
  };

  const resolveRootAttrs = () => {
    const { title: _title, ...rest } = attrs;
    const titleTooltip = resolveTitleTooltip();

    if (
      options.ariaLabelFallback &&
      titleTooltip?.content &&
      rest['aria-label'] === undefined &&
      rest['aria-labelledby'] === undefined
    ) {
      return {
        ...rest,
        'aria-label': titleTooltip.content,
      };
    }

    return rest;
  };

  const rootAttrs = shallowRef(resolveRootAttrs());

  const cleanup = () => {
    state?.cleanup();
    state = null;
  };

  const syncTitleTooltip = () => {
    const root = rootRef.value;
    const tooltip = resolveTitleTooltip();

    if (!root || !tooltip) {
      cleanup();
      return;
    }

    if (state) {
      state.update(tooltip);
      return;
    }

    state = setupTooltip(root, tooltip);
  };

  const syncRootAttrs = () => {
    rootAttrs.value = resolveRootAttrs();
  };

  onMounted(syncTitleTooltip);
  onBeforeUpdate(syncRootAttrs);
  onUpdated(syncTitleTooltip);
  onBeforeUnmount(cleanup);

  return {
    rootRef,
    rootAttrs,
  };
}

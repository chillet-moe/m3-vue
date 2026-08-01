import { onBeforeUnmount, onBeforeUpdate, onMounted, ref, shallowRef, useAttrs } from 'vue';
import { actionTitleTooltipAttribute, registerActionTitleTooltip } from '@/internal/actionTitleTooltip';

/**
 * Turns an action component's `title` attr into the library tooltip.
 * The native title attr is intentionally omitted from root attrs to avoid double tooltips.
 */
export function useActionTitleTooltip(options: { ariaLabelFallback?: boolean } = {}) {
  const attrs = useAttrs();
  const rootRef = ref<HTMLElement | null>(null);
  let unregister: (() => void) | undefined;

  const resolveTitleTooltip = () => {
    const value = attrs.title;
    return typeof value === 'string' && value ? { content: value, interactive: false } : undefined;
  };

  const resolveRootAttrs = () => {
    const { title: _title, ...rest } = attrs;
    const titleTooltip = resolveTitleTooltip();
    const tooltipAttrs = titleTooltip ? { [actionTitleTooltipAttribute]: titleTooltip.content } : undefined;

    if (
      options.ariaLabelFallback &&
      titleTooltip?.content &&
      rest['aria-label'] === undefined &&
      rest['aria-labelledby'] === undefined
    ) {
      return {
        ...rest,
        ...tooltipAttrs,
        'aria-label': titleTooltip.content,
      };
    }

    return {
      ...rest,
      ...tooltipAttrs,
    };
  };

  const rootAttrs = shallowRef(resolveRootAttrs());

  onMounted(() => {
    if (rootRef.value) unregister = registerActionTitleTooltip(rootRef.value);
  });
  onBeforeUpdate(() => {
    rootAttrs.value = resolveRootAttrs();
  });
  onBeforeUnmount(() => {
    unregister?.();
    unregister = undefined;
  });

  return {
    rootRef,
    rootAttrs,
  };
}

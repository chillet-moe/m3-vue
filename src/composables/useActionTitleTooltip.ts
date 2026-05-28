import { computed, useAttrs } from 'vue';

/**
 * Turns an action component's `title` attr into the library tooltip.
 * The native title attr is intentionally omitted from root attrs to avoid double tooltips.
 */
export function useActionTitleTooltip(options: { ariaLabelFallback?: boolean } = {}) {
  const attrs = useAttrs();

  const titleTooltip = computed(() => {
    const value = attrs.title;
    return typeof value === 'string' && value ? { content: value, interactive: false } : undefined;
  });

  const rootAttrs = computed(() => {
    const { title: _title, ...rest } = attrs;

    if (
      options.ariaLabelFallback &&
      titleTooltip.value?.content &&
      rest['aria-label'] === undefined &&
      rest['aria-labelledby'] === undefined
    ) {
      return {
        ...rest,
        'aria-label': titleTooltip.value.content,
      };
    }

    return rest;
  });

  return {
    rootAttrs,
    titleTooltip,
  };
}

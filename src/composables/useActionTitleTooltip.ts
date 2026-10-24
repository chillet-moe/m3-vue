import { onBeforeUnmount, onBeforeUpdate, onMounted, ref, shallowRef, useAttrs } from 'vue';
import { actionTitleTooltipAttribute, registerActionTitleTooltip } from '@/internal/actionTitleTooltip';

/**
 * Turns an action component's `title` attr into the library tooltip.
 * The native title attr is intentionally omitted from root attrs to avoid double tooltips.
 */
export function useActionTitleTooltip(options: { ariaLabelFallback?: boolean } = {}) {
  const attrs = useAttrs();
  const rootRef = ref<HTMLElement | null>(null);
  let registration: ReturnType<typeof registerActionTitleTooltip> | undefined;

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

  const syncRegistration = () => {
    const content = resolveTitleTooltip()?.content;
    if (!content) {
      registration?.();
      registration = undefined;
    } else if (registration) {
      registration.update(content);
    } else if (rootRef.value) {
      registration = registerActionTitleTooltip(rootRef.value);
      registration.update(content);
    }
  };
  onMounted(syncRegistration);
  onBeforeUpdate(() => {
    rootAttrs.value = resolveRootAttrs();
    syncRegistration();
  });
  onBeforeUnmount(() => {
    registration?.();
    registration = undefined;
  });

  return {
    rootRef,
    rootAttrs,
  };
}

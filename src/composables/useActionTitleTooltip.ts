import { onBeforeUnmount, onBeforeUpdate, onMounted, ref, useAttrs } from 'vue';
import { actionTitleTooltipAttribute, registerActionTitleTooltip } from '@/internal/actionTitleTooltip';

/**
 * Turns an action component's `title` attr into the library tooltip.
 * The native title attr is intentionally omitted from root attrs to avoid double tooltips.
 * Read root attrs during render so they always reflect the current fallthrough attributes.
 */
export function useActionTitleTooltip(options: { ariaLabelFallback?: boolean } = {}) {
  const attrs = useAttrs();
  const rootRef = ref<HTMLElement | null>(null);
  let registration: ReturnType<typeof registerActionTitleTooltip> | undefined;

  const resolveTitle = () => {
    const title = attrs.title;
    return typeof title === 'string' && title ? title : undefined;
  };

  const getRootAttrs = () => {
    if (!('title' in attrs)) return attrs;

    const title = resolveTitle();
    const { title: _title, ...rest } = attrs;
    if (title) {
      rest[actionTitleTooltipAttribute] = title;
      if (options.ariaLabelFallback && rest['aria-label'] === undefined && rest['aria-labelledby'] === undefined) {
        rest['aria-label'] = title;
      }
    }
    return rest;
  };

  const syncRegistration = (title: string | undefined) => {
    if (!title) {
      registration?.();
      registration = undefined;
    } else if (registration) {
      registration.update(title);
    } else if (rootRef.value) {
      registration = registerActionTitleTooltip(rootRef.value, title);
    }
  };
  onMounted(() => syncRegistration(resolveTitle()));
  onBeforeUpdate(() => syncRegistration(resolveTitle()));
  onBeforeUnmount(() => {
    registration?.();
    registration = undefined;
  });

  return {
    rootRef,
    getRootAttrs,
  };
}

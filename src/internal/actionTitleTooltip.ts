import { registerSharedPlainTooltip } from './sharedPlainTooltip';

export const actionTitleTooltipAttribute = 'data-m3-action-title-tooltip';

export function registerActionTitleTooltip(trigger: HTMLElement) {
  const getBinding = (content = trigger.getAttribute(actionTitleTooltipAttribute) ?? '') => ({
    content,
    interactive: false as const,
    placement: 'top' as const,
    popoverType: 'hint' as const,
    triggerAria: 'describedby' as const,
  });

  const state = registerSharedPlainTooltip(trigger, getBinding());
  const cleanup = () => {
    state.cleanup();
  };
  cleanup.update = (content: string) => state.update(getBinding(content));
  return cleanup;
}

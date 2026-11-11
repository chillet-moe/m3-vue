import { registerSharedPlainTooltip } from './sharedPlainTooltip';

export const actionTitleTooltipAttribute = 'data-m3-action-title-tooltip';

export function registerActionTitleTooltip(trigger: HTMLElement, content: string) {
  const getBinding = (content: string) => ({
    content,
    interactive: false as const,
    placement: 'top' as const,
    popoverType: 'hint' as const,
    triggerAria: 'describedby' as const,
  });

  const state = registerSharedPlainTooltip(trigger, getBinding(content));
  const cleanup = () => {
    state.cleanup();
  };
  cleanup.update = (nextContent: string) => {
    if (nextContent === content) {
      state.update();
      return;
    }
    state.update(getBinding(nextContent));
    content = nextContent;
  };
  return cleanup;
}

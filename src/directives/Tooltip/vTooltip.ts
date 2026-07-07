import type { TooltipDirective } from './types';
import '../../components/Tooltip/Tooltip.css';
import './vTooltip.css';
import { setupTooltip } from './setup';

const STATE = Symbol('vtt_state');
type TooltipStateEntry = {
  owner: unknown;
  state: ReturnType<typeof setupTooltip>;
};

function getEntry(el: HTMLElement) {
  return (el as HTMLElement & { [STATE]?: TooltipStateEntry })[STATE];
}

function setEntry(el: HTMLElement, entry: TooltipStateEntry) {
  (el as HTMLElement & { [STATE]?: TooltipStateEntry })[STATE] = entry;
}

function clearEntry(el: HTMLElement) {
  delete (el as HTMLElement & { [STATE]?: TooltipStateEntry })[STATE];
}

function ownsEntry(
  entry: TooltipStateEntry | undefined,
  binding: Parameters<NonNullable<TooltipDirective['mounted']>>[1],
): entry is TooltipStateEntry {
  // Component root directives can share the same DOM node. Only the owner that
  // created the tooltip may update or clear it.
  return Boolean(entry && entry.owner === binding.instance);
}

export type { Placement, TooltipConfig, TooltipDirective, TooltipTriggerAriaMode, VTooltipBinding } from './types';
export { normalizeBinding } from './helpers';

export default {
  mounted(el, binding) {
    if (binding.value === undefined) return;
    setEntry(el, {
      owner: binding.instance,
      state: setupTooltip(el, binding.value),
    });
  },
  updated(el, binding) {
    const entry = getEntry(el);
    if (binding.value === undefined) {
      if (ownsEntry(entry, binding)) {
        entry.state.cleanup();
        clearEntry(el);
      }
      return;
    }

    if (!entry) {
      setEntry(el, {
        owner: binding.instance,
        state: setupTooltip(el, binding.value),
      });
      return;
    }

    if (!ownsEntry(entry, binding)) {
      return;
    }

    if (binding.value === binding.oldValue) {
      return;
    }

    entry.state.update(binding.value);
  },
  unmounted(el) {
    const entry = getEntry(el);
    entry?.state.cleanup();
    clearEntry(el);
  },
} satisfies TooltipDirective;

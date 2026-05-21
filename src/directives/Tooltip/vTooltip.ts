import type { TooltipDirective } from './types';
import '../../components/Tooltip/Tooltip.css';
import './vTooltip.css';
import { setupTooltip } from './setup';

const STATE = Symbol('vtt_state');

export type { Placement, TooltipConfig, TooltipDirective, VTooltipBinding } from './types';
export { normalizeBinding } from './helpers';

export default {
  mounted(el, binding) {
    if (binding.value === undefined) return;
    (el as HTMLElement & { [STATE]?: ReturnType<typeof setupTooltip> })[STATE] = setupTooltip(el, binding.value);
  },
  updated(el, binding) {
    const state = (el as HTMLElement & { [STATE]?: ReturnType<typeof setupTooltip> })[STATE];
    if (binding.value === undefined) {
      state?.cleanup();
      delete (el as HTMLElement & { [STATE]?: ReturnType<typeof setupTooltip> })[STATE];
      return;
    }

    if (!state) {
      (el as HTMLElement & { [STATE]?: ReturnType<typeof setupTooltip> })[STATE] = setupTooltip(el, binding.value);
      return;
    }

    if (binding.value === binding.oldValue) {
      return;
    }

    state.update(binding.value);
  },
  unmounted(el) {
    const state = (el as HTMLElement & { [STATE]?: ReturnType<typeof setupTooltip> })[STATE];
    state?.cleanup();
    delete (el as HTMLElement & { [STATE]?: ReturnType<typeof setupTooltip> })[STATE];
  },
} satisfies TooltipDirective;

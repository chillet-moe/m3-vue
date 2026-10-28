import type { ComputedRef, InjectionKey } from 'vue';
import type { UseSelectReturn } from '@/composables/selectTypes';

/** Internal presentation bridge; Select remains the only selection/navigation owner. */
export const selectItemContextKey: InjectionKey<
  Pick<UseSelectReturn, 'optionProps' | 'isOptionSelected'> & {
    customList: boolean;
    showSelectedIcon: ComputedRef<boolean>;
  }
> = Symbol('m3-select');

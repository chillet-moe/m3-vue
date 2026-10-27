import type { InjectionKey } from 'vue';
import type { UseSelectReturn } from '@/composables/selectTypes';

/** Internal presentation bridge; Select remains the only selection/navigation owner. */
export const selectContextKey: InjectionKey<
  Pick<UseSelectReturn, 'optionProps' | 'isOptionSelected'> & { customList: boolean }
> = Symbol('m3-select');

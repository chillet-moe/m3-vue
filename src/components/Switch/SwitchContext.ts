import type { InjectionKey, MaybeRef } from 'vue';

export type SwitchSize = 'small' | 'medium';
export const switchSizeContextKey: InjectionKey<MaybeRef<SwitchSize | undefined>> = Symbol('SwitchSize');

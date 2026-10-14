import type { InjectionKey, MaybeRef } from 'vue';
import type { SliderProps } from './Slider.vue';

/** Appearance or interaction defaults for descendant Slider components. */
export interface SliderContext {
  size?: MaybeRef<SliderProps['size']>;
}

export const sliderContextKey: InjectionKey<SliderContext> = Symbol('SliderContext');

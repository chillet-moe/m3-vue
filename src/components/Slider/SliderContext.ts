import { computed, inject, provide, unref, type InjectionKey, type MaybeRef } from 'vue';
import type { SliderProps } from './Slider.vue';

/** Appearance or interaction defaults for descendant Slider components. */
export interface SliderContext {
  appearance?: MaybeRef<SliderProps['appearance']>;
  wheel?: MaybeRef<boolean | undefined>;
  valueIndicator?: MaybeRef<boolean | undefined>;
  size?: MaybeRef<SliderProps['size']>;
}

export const sliderContextKey: InjectionKey<SliderContext> = Symbol('SliderContext');

/** Merge per-field preferences with the enclosing provider; undefined inherits. */
export function provideSliderDefaults(defaults: SliderContext): SliderContext {
  const inherited = inject(sliderContextKey, undefined);
  const context: SliderContext = {
    appearance: computed(() => unref(defaults.appearance) ?? unref(inherited?.appearance)),
    size: computed(() => unref(defaults.size) ?? unref(inherited?.size)),
    wheel: computed(() => unref(defaults.wheel) ?? unref(inherited?.wheel)),
    valueIndicator: computed(() => unref(defaults.valueIndicator) ?? unref(inherited?.valueIndicator)),
  };
  provide(sliderContextKey, context);
  return context;
}

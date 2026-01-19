import type { InjectionKey, Ref } from 'vue';
import type { ButtonProps } from '@/components/Button/Button.vue';

export interface ButtonContext {
  toggleable?: Ref<ButtonProps['toggleable'] | undefined>;
  size?: Ref<ButtonProps['size'] | undefined>;
  color?: Ref<ButtonProps['color'] | undefined>;
  shape?: Ref<ButtonProps['shape'] | undefined>;
  disabled?: Ref<boolean | undefined>;
}

export const buttonContextKey: InjectionKey<ButtonContext> = Symbol('ButtonContext');
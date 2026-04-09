import type { InjectionKey, MaybeRef } from 'vue';
import type { ButtonProps } from '@/components/Button/Button.vue';

export interface ButtonContext {
  toggleable?: MaybeRef<ButtonProps['toggleable'] | undefined>;
  size?: MaybeRef<ButtonProps['size'] | undefined>;
  color?: MaybeRef<ButtonProps['color'] | undefined>;
  shape?: MaybeRef<ButtonProps['shape'] | undefined>;
  disabled?: MaybeRef<boolean | undefined>;
}

export const buttonContextKey: InjectionKey<ButtonContext> = Symbol('ButtonContext');

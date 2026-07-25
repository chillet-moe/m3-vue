import type { InjectionKey, MaybeRef } from 'vue';
import type { ButtonProps } from '@/components/Button/Button.vue';

export interface ButtonContext {
  toggleable?: MaybeRef<ButtonProps['toggleable'] | undefined>;
  size?: MaybeRef<ButtonProps['size'] | undefined>;
  variant?: MaybeRef<ButtonProps['variant'] | undefined>;
  shape?: MaybeRef<ButtonProps['shape'] | undefined>;
  pressShapeMorph?: MaybeRef<ButtonProps['pressShapeMorph'] | undefined>;
  disabled?: MaybeRef<boolean | undefined>;
}

export const buttonContextKey: InjectionKey<ButtonContext> = Symbol('ButtonContext');

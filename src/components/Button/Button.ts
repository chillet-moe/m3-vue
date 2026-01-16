import type { InjectionKey, Ref } from 'vue';

export type ButtonProps = {
  toggleable?: 'none' | 'single' | 'multiple';
  color?: 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
  shape?: 'rounded' | 'square';
  href?: string;
  disabled?: boolean;
};

export interface ButtonContext {
  toggleable?: Ref<ButtonProps['toggleable'] | undefined>;
  size?: Ref<ButtonProps['size'] | undefined>;
  color?: Ref<ButtonProps['color'] | undefined>;
  shape?: Ref<ButtonProps['shape'] | undefined>;
  disabled?: Ref<boolean | undefined>;
}

export const buttonContextKey: InjectionKey<ButtonContext> = Symbol('ButtonContext');

import type { InjectionKey, MaybeRef } from 'vue';

export type ButtonGroupValue = string | number;
export type ButtonGroupModelValue = ButtonGroupValue | ButtonGroupValue[] | undefined;

export interface ButtonGroupContext {
  name: MaybeRef<string | undefined>;
  disabled: MaybeRef<boolean>;
  selectionMode: MaybeRef<'single' | 'multiple'>;
  modelValue: MaybeRef<ButtonGroupModelValue>;
  select: (value: ButtonGroupValue, checked: boolean) => void;
}

export const buttonGroupContextKey: InjectionKey<ButtonGroupContext> = Symbol('ButtonGroupContext');

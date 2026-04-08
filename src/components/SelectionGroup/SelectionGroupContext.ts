import type { InjectionKey, MaybeRef } from 'vue';

export type SelectionGroupValue = string | number;
export type SelectionGroupModelValue = SelectionGroupValue | SelectionGroupValue[] | undefined;

export interface SelectionGroupContext {
  name: MaybeRef<string | undefined>;
  disabled: MaybeRef<boolean>;
  selectionMode: MaybeRef<'single' | 'multiple'>;
  modelValue: MaybeRef<SelectionGroupModelValue>;
  select: (value: SelectionGroupValue, checked: boolean) => void;
}

export const selectionGroupContextKey: InjectionKey<SelectionGroupContext> = Symbol('SelectionGroupContext');

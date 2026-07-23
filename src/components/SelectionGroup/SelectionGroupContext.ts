import type { InjectionKey, MaybeRef } from 'vue';

export type SelectionGroupValue = string | number;
export type SelectionGroupModelValue = SelectionGroupValue | SelectionGroupValue[] | undefined;
export type SelectionGroupInputType = 'checkbox' | 'radio';

export interface SelectionGroupContext {
  name: MaybeRef<string | undefined>;
  disabled: MaybeRef<boolean>;
  inputType: MaybeRef<SelectionGroupInputType>;
  isSelected: (value: SelectionGroupValue) => boolean;
  select: (value: SelectionGroupValue, checked: boolean) => void;
}

export const selectionGroupContextKey: InjectionKey<SelectionGroupContext> = Symbol('SelectionGroupContext');

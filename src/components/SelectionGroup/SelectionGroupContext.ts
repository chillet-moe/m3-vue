import { provide, toRef, type InjectionKey, type MaybeRef, type Ref } from 'vue';

export type SelectionGroupValue = string | number;
export type SelectionGroupModelValue = SelectionGroupValue | SelectionGroupValue[] | undefined;
export type SelectionGroupInputType = 'checkbox' | 'radio';

export type SelectionGroupProps = {
  disabled?: boolean;
  selectionMode?: 'single' | 'multiple';
  name?: string;
  ariaLabel?: string;
};

export interface SelectionGroupContext {
  name: MaybeRef<string | undefined>;
  disabled: MaybeRef<boolean>;
  inputType: MaybeRef<SelectionGroupInputType>;
  isSelected: (value: SelectionGroupValue) => boolean;
  select: (value: SelectionGroupValue, checked: boolean) => void;
}

export const selectionGroupContextKey: InjectionKey<SelectionGroupContext> = Symbol('SelectionGroupContext');

export function provideSelectionGroup(modelValue: Ref<SelectionGroupModelValue>, props: SelectionGroupProps) {
  const inputType = toRef(() => (props.selectionMode === 'multiple' ? 'checkbox' : 'radio'));

  const isSelected = (value: SelectionGroupValue) => {
    const currentValue = modelValue.value;

    if (Array.isArray(currentValue)) {
      return currentValue.includes(value);
    }

    return currentValue === value;
  };

  const select = (value: SelectionGroupValue, checked: boolean) => {
    if (props.selectionMode === 'multiple') {
      const currentValue = modelValue.value;
      const current = Array.isArray(currentValue) ? currentValue : [];

      if (checked) {
        if (!current.includes(value)) {
          modelValue.value = [...current, value];
        }
        return;
      }

      modelValue.value = current.filter((item) => item !== value);
      return;
    }

    modelValue.value = checked ? value : undefined;
  };

  provide(selectionGroupContextKey, {
    name: toRef(() => props.name),
    disabled: toRef(() => props.disabled ?? false),
    inputType,
    isSelected,
    select,
  });
}

import { computed, inject, unref, type ComputedRef, type Ref } from 'vue';
import { selectionGroupContextKey, type SelectionGroupValue } from '@/components/SelectionGroup/SelectionGroupContext';

export type SelectionGroupInputType = 'checkbox' | 'radio';

export type UseSelectionGroupItemOptions = {
  /** Item value used when participating in a selection group. */
  value: () => SelectionGroupValue | undefined;

  /** Local selected model used outside a selection group. */
  selected?: Ref<boolean>;

  /** Local input name used outside a selection group. */
  name?: () => string | undefined;

  /** Local disabled state merged with the selection group disabled state. */
  disabled?: () => boolean;

  /** Input type used when the item does not participate in a selection group. */
  fallbackInputType?: SelectionGroupInputType;
};

export type UseSelectionGroupItemReturn = {
  participatesInGroup: ComputedRef<boolean>;
  isSelected: ComputedRef<boolean>;
  inputType: ComputedRef<SelectionGroupInputType>;
  inputName: ComputedRef<string | undefined>;
  inputValue: ComputedRef<string>;
  mergedDisabled: ComputedRef<boolean>;
  selectFromInput: (checked: boolean) => void;
};

export function useSelectionGroupItem({
  value,
  selected,
  name,
  disabled,
  fallbackInputType = 'checkbox',
}: UseSelectionGroupItemOptions): UseSelectionGroupItemReturn {
  const context = inject(selectionGroupContextKey, undefined);
  const itemValue = computed(() => value());

  const participatesInGroup = computed(() => context !== undefined && itemValue.value !== undefined);

  const isSelected = computed(() => {
    if (participatesInGroup.value) {
      const currentValue = unref(context?.modelValue);
      const currentItemValue = itemValue.value as SelectionGroupValue;

      if (Array.isArray(currentValue)) {
        return currentValue.includes(currentItemValue);
      }

      return currentValue === currentItemValue;
    }

    return selected?.value ?? false;
  });

  const inputType = computed<SelectionGroupInputType>(() => {
    if (participatesInGroup.value) {
      return unref(context?.selectionMode) === 'multiple' ? 'checkbox' : 'radio';
    }

    return fallbackInputType;
  });

  const inputName = computed(() => unref(context?.name) ?? name?.());

  const inputValue = computed(() => {
    const currentItemValue = itemValue.value;
    return currentItemValue === undefined ? 'on' : String(currentItemValue);
  });

  const mergedDisabled = computed(() => Boolean(disabled?.() || unref(context?.disabled)));

  function selectFromInput(checked: boolean) {
    const currentItemValue = itemValue.value;

    if (participatesInGroup.value && currentItemValue !== undefined) {
      context?.select(currentItemValue, checked);
      return;
    }

    if (selected) {
      selected.value = checked;
    }
  }

  return {
    participatesInGroup,
    isSelected,
    inputType,
    inputName,
    inputValue,
    mergedDisabled,
    selectFromInput,
  };
}

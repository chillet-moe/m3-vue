import { computed, ref } from 'vue';
import {
  formatSelectedOptions,
  getFilteredOptionEntries,
  getSelectedOptions,
  getSubmittedValues,
  isOptionSelected as isModelOptionSelected,
} from './selectModel';
import type { UseSelectModelValue, UseSelectOption, UseSelectOptions, UseSelectReturn } from './selectTypes';
import { useSelectMenu } from './useSelectMenu';

export type {
  UseSelectModelValue,
  UseSelectOptions,
  UseSelectOption,
  UseSelectOptionValue,
  UseSelectReturn,
} from './selectTypes';

export function useSelect(opts: UseSelectOptions): UseSelectReturn {
  const {
    options,
    multiple,
    filterable,
    disabled,
    displaySeparator,
    modelValue,
    open,
    onChange,
    menuRef,
    triggerRef,
    textFieldRef,
  } = opts;

  const filterQuery = ref('');

  const selectedOptions = computed(() => {
    return getSelectedOptions(options(), modelValue.value, multiple());
  });

  const hasValue = computed(() => selectedOptions.value.length > 0);

  const displayText = computed(() => {
    return formatSelectedOptions(selectedOptions.value, displaySeparator());
  });

  const submittedValues = computed(() => {
    return getSubmittedValues(modelValue.value, multiple(), disabled());
  });

  const filteredOptionEntries = computed(() => {
    return getFilteredOptionEntries(options(), filterQuery.value, filterable());
  });

  const hasFilteredOptions = computed(() => filteredOptionEntries.value.length > 0);

  function isOptionSelected(option: UseSelectOption) {
    return isModelOptionSelected(modelValue.value, multiple(), option);
  }

  function updateValue(nextValue: UseSelectModelValue) {
    modelValue.value = nextValue;
    onChange?.(nextValue);
  }

  function toggleOption(option: UseSelectOption) {
    if (option.disabled) {
      return;
    }

    if (multiple()) {
      const nextValues = Array.isArray(modelValue.value) ? [...modelValue.value] : [];
      const currentIndex = nextValues.findIndex((value) => value === option.value);

      if (currentIndex >= 0) {
        nextValues.splice(currentIndex, 1);
      } else {
        nextValues.push(option.value);
      }

      updateValue(nextValues);
      return;
    }

    if (modelValue.value === option.value) {
      return;
    }

    updateValue(option.value);
    filterQuery.value = '';
  }

  function clearValue() {
    if (!hasValue.value) {
      return;
    }

    updateValue(multiple() ? [] : undefined);
    filterQuery.value = '';
  }

  function handleMenuSelect(_event: MouseEvent, itemElement: HTMLElement) {
    const optionIndex = Number(itemElement.dataset.optionIndex);
    if (!Number.isInteger(optionIndex)) {
      return;
    }

    const option = options()[optionIndex];
    if (!option) {
      return;
    }

    toggleOption(option);
  }

  const menu = useSelectMenu({
    filterable,
    disabled,
    open,
    menuRef,
    triggerRef,
    textFieldRef,
    onClosed: () => {
      filterQuery.value = '';
    },
  });

  return {
    filterQuery,
    selectedOptions,
    hasValue,
    displayText,
    submittedValues,
    filteredOptionEntries,
    hasFilteredOptions,
    isOptionSelected,
    toggleOption,
    clearValue,
    handleMenuSelect,
    focus: menu.focus,
    blur: menu.blur,
    show: menu.show,
    hide: menu.hide,
    toggle: menu.toggle,
    openMenu: menu.openMenu,
    closeMenu: menu.closeMenu,
    handleFieldClick: menu.handleFieldClick,
    handleFieldInput: menu.handleFieldInput,
    handleFilterKeydown: menu.handleFilterKeydown,
  };
}

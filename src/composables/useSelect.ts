import { type ComputedRef, type Ref, computed, ref, watch } from 'vue';
import { hideDropdownElement, showDropdownElement } from '@/directives/Dropdown/helpers';

export type UseSelectOptionValue = string | number;

export type UseSelectOption = {
  label: string;
  value: UseSelectOptionValue;
  disabled?: boolean;
  supportingText?: string;
  trailingText?: string;
};

export type UseSelectModelValue = UseSelectOptionValue | UseSelectOptionValue[] | undefined;

export type UseSelectOptions = {
  /** The selectable options. */
  options: () => UseSelectOption[];

  /** Whether multi-select is enabled. */
  multiple: () => boolean;

  /** Whether filtering is enabled. */
  filterable: () => boolean;

  /** Whether the control is disabled. */
  disabled: () => boolean;

  /** Separator for display text in multi-select mode. */
  displaySeparator: () => string;

  /** Model value ref (external). */
  modelValue: Ref<UseSelectModelValue>;

  /** Open state ref (external). */
  open: Ref<boolean>;

  /** Called when value changes. */
  onChange?: (value: UseSelectModelValue) => void;

  /** Ref to the menu exposed API. */
  menuRef: Ref<
    | {
        show: (focusFirst?: boolean, source?: HTMLElement) => Promise<void>;
        hide: () => void;
        toggle: () => void;
        menuRef?: HTMLElement;
      }
    | undefined
  >;

  /** Ref to the trigger element. */
  triggerRef: Ref<HTMLElement | undefined>;

  /** Ref to the text field exposed API. */
  textFieldRef: Ref<
    | {
        focus: () => void;
        blur: () => void;
      }
    | undefined
  >;
};

export type UseSelectReturn = {
  /** Current filter query string. */
  filterQuery: Ref<string>;

  /** Options selected based on current model value. */
  selectedOptions: ComputedRef<UseSelectOption[]>;

  /** Whether any value is selected. */
  hasValue: ComputedRef<boolean>;

  /** Display text for the current selection. */
  displayText: ComputedRef<string>;

  /** Values to submit in hidden form inputs. */
  submittedValues: ComputedRef<string[]>;

  /** Filtered option entries with original indices. */
  filteredOptionEntries: ComputedRef<{ option: UseSelectOption; index: number }[]>;

  /** Whether there are any filtered options. */
  hasFilteredOptions: ComputedRef<boolean>;

  /** Check if an option is currently selected. */
  isOptionSelected: (option: UseSelectOption) => boolean;

  /** Toggle an option in the selection. */
  toggleOption: (option: UseSelectOption) => void;

  /** Handle menu item selection event. */
  handleMenuSelect: (event: MouseEvent, itemElement: HTMLElement) => void;

  /** Focus the text field. */
  focus: () => void;

  /** Blur the text field. */
  blur: () => void;

  /** Show the menu. */
  show: () => Promise<void>;

  /** Hide the menu. */
  hide: () => void;

  /** Toggle the menu. */
  toggle: () => void;

  /** Open menu with optional focus target. */
  openMenu: (focus?: 'first' | 'last') => void;

  /** Close the menu. */
  closeMenu: () => void;

  /** Handle click on the trigger field. */
  handleFieldClick: () => void;

  /** Handle input on the filter field. */
  handleFieldInput: () => void;

  /** Handle keydown on the filter field. */
  handleFilterKeydown: (event: KeyboardEvent) => void;
};

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
    const opts = options();
    if (multiple()) {
      if (!Array.isArray(modelValue.value)) return [] as UseSelectOption[];
      const selectedValues = new Set(modelValue.value);
      return opts.filter((option) => selectedValues.has(option.value));
    }
    return opts.filter((option) => option.value === modelValue.value);
  });

  const hasValue = computed(() => selectedOptions.value.length > 0);

  const displayText = computed(() => {
    if (!selectedOptions.value.length) return '';
    return selectedOptions.value.map((option) => option.label).join(displaySeparator());
  });

  const submittedValues = computed(() => {
    if (disabled()) return [] as string[];

    if (multiple()) {
      if (!Array.isArray(modelValue.value)) return [] as string[];
      return modelValue.value.map((value) => String(value));
    }

    if (modelValue.value === undefined || Array.isArray(modelValue.value)) return [] as string[];
    return [String(modelValue.value)];
  });

  const filteredOptionEntries = computed(() => {
    const normalizedQuery = filterQuery.value.trim().toLocaleLowerCase();

    return options()
      .map((option, index) => ({ option, index }))
      .filter(({ option }) => {
        if (!filterable() || !normalizedQuery) return true;

        const searchableText = [option.label, option.supportingText, option.trailingText]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase();

        return searchableText.includes(normalizedQuery);
      });
  });

  const hasFilteredOptions = computed(() => filteredOptionEntries.value.length > 0);

  function isOptionSelected(option: UseSelectOption) {
    if (multiple()) {
      return Array.isArray(modelValue.value) ? modelValue.value.includes(option.value) : false;
    }
    return modelValue.value === option.value;
  }

  function updateValue(nextValue: UseSelectModelValue) {
    modelValue.value = nextValue;
    onChange?.(nextValue);
  }

  function toggleOption(option: UseSelectOption) {
    if (option.disabled) return;

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

    if (modelValue.value === option.value) return;

    updateValue(option.value);
    filterQuery.value = '';
  }

  function handleMenuSelect(_event: MouseEvent, itemElement: HTMLElement) {
    const optionIndex = Number(itemElement.dataset.optionIndex);
    if (!Number.isInteger(optionIndex)) return;

    const option = options()[optionIndex];
    if (!option) return;

    toggleOption(option);
  }

  function focus() {
    textFieldRef.value?.focus();
  }

  function blur() {
    textFieldRef.value?.blur();
  }

  async function show() {
    if (filterable()) {
      textFieldRef.value?.focus();
    }
    await menuRef.value?.show(false, triggerRef.value);
  }

  function hide() {
    menuRef.value?.hide();
  }

  function toggle() {
    menuRef.value?.toggle();
  }

  function openMenu(focusTarget: 'first' | 'last' | undefined = undefined) {
    const menuElement = menuRef.value?.menuRef;
    if (!menuElement) return;

    open.value = true;
    showDropdownElement(menuElement, {
      focus: focusTarget,
      source: triggerRef.value ?? undefined,
    });
  }

  function closeMenu() {
    const menuElement = menuRef.value?.menuRef;
    if (!menuElement) return;

    open.value = false;
    hideDropdownElement(menuElement);
  }

  function handleFieldClick() {
    if (disabled() || open.value) return;

    if (filterable()) {
      textFieldRef.value?.focus();
    }

    openMenu();
  }

  function handleFieldInput() {
    if (!filterable() || disabled()) return;
    if (!open.value) {
      openMenu();
    }
  }

  function handleFilterKeydown(event: KeyboardEvent) {
    if (disabled()) return;

    if (event.key === 'Escape' && open.value) {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu('first');
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu('last');
      return;
    }

    if (!filterable() && ['Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openMenu('first');
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.stopPropagation();
    }
  }

  // Reset filter when menu closes
  watch(
    open,
    (nextOpen) => {
      if (nextOpen) {
        if (filterable()) {
          textFieldRef.value?.focus();
        }
        return;
      }
      filterQuery.value = '';
    },
    { immediate: true },
  );

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
    handleMenuSelect,
    focus,
    blur,
    show,
    hide,
    toggle,
    openMenu,
    closeMenu,
    handleFieldClick,
    handleFieldInput,
    handleFilterKeydown,
  };
}

import type { ComputedRef, Ref } from 'vue';

export type UseSelectOptionValue = string | number;

export type UseSelectOption = {
  label: string;
  value: UseSelectOptionValue;
  disabled?: boolean;
  supportingText?: string;
  trailingText?: string;
  leadingIcon?: string;
};

export type UseSelectModelValue = UseSelectOptionValue | UseSelectOptionValue[] | undefined;

export type SelectMenuRef = Ref<
  | {
      show: (focusFirst?: boolean, source?: HTMLElement) => Promise<void>;
      hide: () => void;
      toggle: () => void;
      menuRef?: HTMLElement;
    }
  | undefined
>;

export type SelectTextFieldRef = Ref<
  | {
      focus: () => void;
      blur: () => void;
    }
  | undefined
>;

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

  /** BCP 47 locale used for locale-sensitive filtering. */
  locale?: () => string | undefined;

  /** Model value ref (external). */
  modelValue: Ref<UseSelectModelValue>;

  /** Open state ref (external). */
  open: Ref<boolean>;

  /** Called when value changes. */
  onChange?: (value: UseSelectModelValue) => void;

  /** Called after the dropdown menu's visual exit finishes. */
  onClosed?: () => void;

  /** Ref to the menu exposed API. */
  menuRef: SelectMenuRef;

  /** Ref to the trigger element. */
  triggerRef: Ref<HTMLElement | undefined>;

  /** Ref to the text field exposed API. */
  textFieldRef: SelectTextFieldRef;
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

  /** Clear the current selection. */
  clearValue: () => void;

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

  /** Handle completion of the dropdown menu's visual exit. */
  handleMenuClosed: () => void;
};

import type { Ref } from 'vue';

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
export type UseSelectOptions = {
  /** Unique, stable values identify the complete logical result set. */
  options: () => UseSelectOption[];
  multiple: () => boolean;
  filterable: () => boolean;
  disabled: () => boolean;
  displaySeparator: () => string;
  locale?: () => string | undefined;
  /** Disable local filtering when the consumer supplies search results. */
  filterMode?: () => 'local' | 'external';
  /** Resolve values missing from current results. Falls back to String(value). */
  resolveLabel?: (value: UseSelectOptionValue) => string | undefined;
  query?: Ref<string>;
  modelValue: Ref<UseSelectModelValue>;
  open: Ref<boolean>;
  onChange?: (value: UseSelectModelValue) => void;
  onClosed?: () => void;
  /** Stable listbox id, normally derived from useId(). */
  id: () => string;
  focus: () => void;
  blur: () => void;
  /** Use the shared Menu overlay, including source anchoring and close completion. */
  showMenu: () => void;
  hideMenu: () => void;
  /** The MenuContainer is the single scroll owner. */
  scrollElement: () => HTMLElement | undefined;
};
export type UseSelectReturn = ReturnType<typeof import('./useSelect').useSelect>;
export type SelectListSlot = UseSelectReturn['list']['value'];

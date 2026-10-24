import { computed, nextTick, ref, shallowReactive, watch, type ComponentPublicInstance } from 'vue';
import {
  getSelectedOptions,
  formatSelectedOptions,
  getFilteredOptionEntries,
  getSubmittedValues,
  isOptionSelected as isModelOptionSelected,
} from './selectModel';
import type { UseSelectModelValue, UseSelectOption, UseSelectOptions, UseSelectOptionValue } from './selectTypes';
export type {
  UseSelectModelValue,
  UseSelectOptions,
  UseSelectOption,
  UseSelectOptionValue,
  UseSelectReturn,
  SelectListSlot,
} from './selectTypes';

/** One selection and navigation owner for both ordinary and externally virtualized lists. */
export function useSelect(opts: UseSelectOptions) {
  const filterQuery = opts.query ?? ref('');
  const activeValue = ref<UseSelectOptionValue>();
  const mounted = shallowReactive(new Map<UseSelectOptionValue, HTMLElement>());
  let scrollToIndex: ((index: number) => void) | undefined;
  const selectedOptions = computed(() =>
    getSelectedOptions(opts.options(), opts.modelValue.value, opts.multiple(), opts.resolveLabel),
  );
  const hasValue = computed(() => selectedOptions.value.length > 0);
  const displayText = computed(() => formatSelectedOptions(selectedOptions.value, opts.displaySeparator()));
  const submittedValues = computed(() => getSubmittedValues(opts.modelValue.value, opts.multiple(), opts.disabled()));
  const filteredOptionEntries = computed(() =>
    getFilteredOptionEntries(
      opts.options(),
      filterQuery.value,
      opts.filterable() && opts.filterMode?.() !== 'external',
      opts.locale?.(),
    ),
  );
  const hasFilteredOptions = computed(() => filteredOptionEntries.value.length > 0);
  const activeIndex = computed(() =>
    filteredOptionEntries.value.findIndex(({ option }) => option.value === activeValue.value),
  );
  const optionId = (value: UseSelectOptionValue) =>
    `${opts.id()}-option-${typeof value}-${encodeURIComponent(String(value))}`;
  // Only publish a descendant once its row exists. Function refs clear it synchronously on unmount.
  const activeDescendant = computed(() =>
    opts.open.value && activeValue.value !== undefined && mounted.has(activeValue.value) && activeIndex.value >= 0
      ? optionId(activeValue.value)
      : undefined,
  );
  const isOptionSelected = (option: UseSelectOption) =>
    isModelOptionSelected(opts.modelValue.value, opts.multiple(), option);

  function revealActive() {
    if (!opts.open.value || activeIndex.value < 0) return;
    if (scrollToIndex) scrollToIndex(activeIndex.value);
    else mounted.get(activeValue.value!)?.scrollIntoView?.({ block: 'nearest' });
  }
  function setActiveIndex(index: number) {
    const option = filteredOptionEntries.value[index]?.option;
    if (option && !option.disabled) activeValue.value = option.value;
  }
  function resetActive() {
    const entries = filteredOptionEntries.value;
    const selected = entries.findIndex(({ option }) => !option.disabled && isOptionSelected(option));
    activeValue.value =
      entries[selected >= 0 ? selected : entries.findIndex(({ option }) => !option.disabled)]?.option.value;
  }
  watch(
    filteredOptionEntries,
    (entries) => {
      if (!entries.some(({ option }) => option.value === activeValue.value && !option.disabled)) resetActive();
    },
    { immediate: true },
  );
  watch(
    opts.open,
    (open) => {
      if (open) {
        resetActive();
        opts.focus();
      }
    },
    { flush: 'sync' },
  );
  watch([activeIndex, opts.open, filteredOptionEntries], () => {
    void nextTick(revealActive);
  });
  watch(
    () => opts.disabled(),
    (disabled) => {
      if (disabled) opts.open.value = false;
    },
  );

  function updateValue(value: UseSelectModelValue) {
    opts.modelValue.value = value;
    opts.onChange?.(value);
  }
  function closeMenu() {
    opts.open.value = false;
  }
  function toggleOption(option: UseSelectOption) {
    if (opts.disabled() || option.disabled) return;
    if (opts.multiple()) {
      const values = Array.isArray(opts.modelValue.value) ? [...opts.modelValue.value] : [];
      const index = values.indexOf(option.value);
      if (index < 0) values.push(option.value);
      else values.splice(index, 1);
      updateValue(values);
    } else {
      if (opts.modelValue.value !== option.value) updateValue(option.value);
      closeMenu();
    }
  }
  function clearValue() {
    if (opts.disabled() || !hasValue.value) return;
    updateValue(opts.multiple() ? [] : undefined);
    filterQuery.value = '';
  }
  function openMenu(target?: 'first' | 'last') {
    if (opts.disabled()) return;
    opts.open.value = true;
    opts.focus();
    if (target) move(target === 'first' ? 1 : -1, true);
  }
  function move(direction: 1 | -1, edge = false) {
    const entries = filteredOptionEntries.value;
    let index =
      edge || activeIndex.value < 0 ? (direction === 1 ? 0 : entries.length - 1) : activeIndex.value + direction;
    for (; index >= 0 && index < entries.length; index += direction) {
      if (!entries[index]!.option.disabled) {
        setActiveIndex(index);
        break;
      }
    }
    revealActive();
  }
  function handleFilterKeydown(event: KeyboardEvent) {
    if (opts.disabled() || event.isComposing) return;
    if (event.key === 'Tab') {
      closeMenu();
      return;
    }
    if (event.key === 'Escape' && opts.open.value) {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      if (!opts.open.value && ['Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (!opts.open.value) openMenu(event.key === 'ArrowUp' ? 'last' : 'first');
      else move(event.key === 'ArrowUp' || event.key === 'End' ? -1 : 1, event.key === 'Home' || event.key === 'End');
      return;
    }
    if (event.key === 'Enter' || (!opts.filterable() && event.key === ' ')) {
      event.preventDefault();
      if (!opts.open.value) openMenu();
      else {
        const option = filteredOptionEntries.value[activeIndex.value]?.option;
        if (option) toggleOption(option);
      }
    }
  }
  function optionProps(index: number) {
    const option = filteredOptionEntries.value[index]!.option;
    return {
      id: optionId(option.value),
      role: 'option',
      tabindex: -1,
      'aria-selected': isOptionSelected(option),
      'aria-disabled': Boolean(option.disabled),
      'aria-posinset': index + 1,
      'aria-setsize': filteredOptionEntries.value.length,
      'data-active': activeValue.value === option.value ? 'true' : undefined,
      'data-selected': isOptionSelected(option) ? 'true' : undefined,
      ref: (instance: Element | ComponentPublicInstance | null) => {
        const element = instance && (('$el' in instance ? instance.$el : instance) as HTMLElement | null);
        if (element) mounted.set(option.value, element);
        else mounted.delete(option.value);
      },
      onPointerdown: (event: PointerEvent) => event.preventDefault(),
      onPointermove: () => {
        if (!option.disabled) activeValue.value = option.value;
      },
      onClick: () => toggleOption(option),
    };
  }
  const list = computed(() => ({
    entries: filteredOptionEntries.value,
    activeIndex: activeIndex.value,
    open: opts.open.value,
    optionProps,
    isOptionSelected,
    setScrollToIndex: (callback: ((index: number) => void) | undefined) => {
      scrollToIndex = callback;
      revealActive();
    },
  }));
  return {
    filterQuery,
    selectedOptions,
    hasValue,
    displayText,
    submittedValues,
    filteredOptionEntries,
    hasFilteredOptions,
    activeIndex,
    activeDescendant,
    list,
    optionProps,
    isOptionSelected,
    toggleOption,
    clearValue,
    focus: opts.focus,
    blur: opts.blur,
    show: async () => {
      openMenu();
      await nextTick();
    },
    hide: closeMenu,
    toggle: () => {
      if (opts.open.value) closeMenu();
      else openMenu();
    },
    openMenu,
    closeMenu,
    handleFieldClick: () => {
      if (!opts.open.value) openMenu();
    },
    handleFieldInput: () => {
      if (opts.filterable()) openMenu();
    },
    handleFilterKeydown,
    handleMenuClosed: () => {
      filterQuery.value = '';
      opts.onClosed?.();
    },
  };
}

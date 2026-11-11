import { triggerKeyboardRipple } from '@/components/StateLayer/state-layer';
import { computed, nextTick, ref, shallowReactive, toRaw, watch, type ComponentPublicInstance } from 'vue';
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
  // Navigation already knows the position. Revalidate it by value when the results change.
  let activeIndexHint = -1;
  // Text inputs match :focus-visible even after pointer focus. Track navigation
  // modality so moving focus into the field does not add a mouse-only row outline.
  const keyboardActive = ref(false);
  const mounted = shallowReactive(new Map<UseSelectOptionValue, HTMLElement>());
  let scrollToIndex: ((index: number) => void) | undefined;
  const selectedOptions = computed(() =>
    getSelectedOptions(opts.options(), opts.modelValue.value, opts.multiple(), opts.resolveLabel),
  );
  const hasValue = computed(() => selectedOptions.value.length > 0);
  const displayText = computed(() => formatSelectedOptions(selectedOptions.value, opts.displaySeparator()));
  const submittedValues = computed(() => getSubmittedValues(opts.modelValue.value, opts.multiple(), opts.disabled()));
  const normalizedFilterQuery = computed(() => filterQuery.value.trim().toLocaleLowerCase(opts.locale?.()));
  const filteredOptionEntries = computed(() => {
    const options = opts.options();
    const locallyFiltered = opts.filterable() && opts.filterMode?.() !== 'external';
    return getFilteredOptionEntries(
      options,
      locallyFiltered ? normalizedFilterQuery.value : undefined,
      opts.locale?.(),
    );
  });
  const hasFilteredOptions = computed(() => filteredOptionEntries.value.length > 0);
  const activeIndex = computed(() => {
    const value = activeValue.value;
    if (value === undefined) return -1;
    const entries = filteredOptionEntries.value;
    if (entries[activeIndexHint]?.option.value === value) return activeIndexHint;
    return entries.findIndex(({ option }) => option.value === value);
  });
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
  function setActive(index: number, value: UseSelectOptionValue | undefined) {
    activeIndexHint = index;
    activeValue.value = value;
  }
  function resetActive() {
    const entries = filteredOptionEntries.value;
    const model = opts.modelValue.value;
    const multiple = opts.multiple();
    const hasSelection = Array.isArray(model) ? multiple && model.length > 0 : !multiple && model !== undefined;
    const valuesToIndex = multiple && Array.isArray(model) && model.length > 1 ? model : undefined;
    let selectedValues: Set<UseSelectOptionValue> | undefined;
    const selected = hasSelection
      ? entries.findIndex(({ option }, index) => {
          if (option.disabled) return false;
          if (selectedValues) return selectedValues.has(option.value);
          if (isModelOptionSelected(model, multiple, option)) return true;

          // Index only after a miss when enough rows remain to amortize the build.
          if (valuesToIndex && entries.length - index > 128) {
            // This synchronous watch callback only needs a snapshot of the primitive values.
            selectedValues = new Set(toRaw(valuesToIndex));
          }
          return false;
        })
      : -1;
    const index = selected >= 0 ? selected : entries.findIndex(({ option }) => !option.disabled);
    setActive(index, entries[index]?.option.value);
  }
  // A pending external query keeps its result entries and still rechecks the active option.
  watch(
    [filteredOptionEntries, filterQuery],
    ([entries]) => {
      const active = entries[activeIndex.value]?.option;
      if (!active || active.disabled) resetActive();
    },
    { immediate: true },
  );
  watch(
    opts.open,
    (open) => {
      if (open) {
        resetActive();
        keyboardActive.value = false;
        opts.focus();
      }
    },
    { flush: 'sync' },
  );
  watch([opts.open, filteredOptionEntries, filterQuery], () => {
    void nextTick(revealActive);
  });
  watch(
    () => opts.disabled(),
    (disabled) => {
      if (disabled) closeMenu();
    },
  );

  function updateValue(value: UseSelectModelValue) {
    opts.modelValue.value = value;
    opts.onChange?.(value);
  }
  function closeMenu() {
    opts.hideMenu();
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
    opts.showMenu();
    opts.focus();
    if (target) move(target === 'first' ? 1 : -1, true);
  }
  function move(direction: 1 | -1, edge = false) {
    keyboardActive.value = true;
    const entries = filteredOptionEntries.value;
    const start = edge || activeIndex.value < 0 ? (direction === 1 ? -1 : entries.length) : activeIndex.value;
    for (let offset = 1; offset <= entries.length; offset++) {
      const index = (start + direction * offset + entries.length) % entries.length;
      const option = entries[index]!.option;
      if (!option.disabled) {
        setActive(index, option.value);
        break;
      }
    }
    revealActive();
  }
  function handleFilterKeydown(event: KeyboardEvent) {
    if (opts.disabled() || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
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
      if (!opts.open.value) openMenu('first');
      else {
        const option = filteredOptionEntries.value[activeIndex.value]?.option;
        if (option) {
          const row = mounted.get(option.value);
          if (row) triggerKeyboardRipple(event, row);
          toggleOption(option);
        }
      }
    }
  }
  function getActivity(value: UseSelectOptionValue) {
    if (activeValue.value !== value) return undefined;
    return keyboardActive.value ? 'keyboard' : 'active';
  }
  function buildOptionProps(index: number, option: UseSelectOption, activity: ReturnType<typeof getActivity>) {
    return {
      id: optionId(option.value),
      'aria-posinset': index + 1,
      'aria-setsize': filteredOptionEntries.value.length,
      'data-active': activity ? 'true' : undefined,
      'data-keyboard-active': activity === 'keyboard' ? 'true' : undefined,
      'data-first': index === 0 ? 'true' : undefined,
      'data-last': index === filteredOptionEntries.value.length - 1 ? 'true' : undefined,
      ref: (instance: Element | ComponentPublicInstance | null) => {
        const element = instance && (('$el' in instance ? instance.$el : instance) as HTMLElement | null);
        if (element) mounted.set(option.value, element);
        else mounted.delete(option.value);
      },
      onMousedown: (event: MouseEvent) => {
        keyboardActive.value = false;
        event.preventDefault();
      },
      onPointermove: () => {
        keyboardActive.value = false;
        if (!option.disabled) setActive(index, option.value);
      },
      onClick: () => toggleOption(option),
    };
  }
  function optionProps(index: number, option: UseSelectOption) {
    return buildOptionProps(index, option, getActivity(option.value));
  }
  function useOptionProps(index: () => number, option: () => UseSelectOption) {
    const activity = computed(() => getActivity(option().value));
    return () => buildOptionProps(index(), option(), activity.value);
  }
  function setScrollToIndex(callback: ((index: number) => void) | undefined) {
    scrollToIndex = callback;
    revealActive();
  }
  const list = computed(() => ({
    entries: filteredOptionEntries.value,
    scrollElement: opts.scrollElement(),
    activeIndex: activeIndex.value,
    open: opts.open.value,
    setScrollToIndex,
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
    useOptionProps,
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

import { type ComputedRef, type Ref, computed, getCurrentInstance, ref, toValue, useId, watch } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

export type UseTabsOptions<T extends string = string> = {
  /** The current active tab value. Can be a ref, getter, or static value. */
  value?: MaybeRefOrGetter<T | undefined>;

  /** Called when the active tab changes. */
  onValueChange?: (value: T) => void;

  /** The orientation of the tab list. @default 'horizontal' */
  orientation?: MaybeRefOrGetter<'horizontal' | 'vertical'>;

  /** Whether arrow-key navigation loops around. @default true */
  loop?: MaybeRefOrGetter<boolean>;

  /** Whether focusing a trigger selects it. @default true */
  selectWhenFocused?: MaybeRefOrGetter<boolean>;

  /** Stable base id used to build aria ids for triggers/panels. */
  id?: MaybeRefOrGetter<string>;
};

export type UseTabsReturn<T extends string = string> = {
  /** The currently selected tab value. */
  value: ComputedRef<T | undefined>;

  /** Set the active tab value. */
  setValue: (value: T) => void;

  /** Resolved orientation. */
  orientation: ComputedRef<'horizontal' | 'vertical'>;

  /** Attributes to spread on the tab-list container. */
  triggerListAttrs: ComputedRef<Record<string, unknown>>;

  /** Get attributes for a single tab trigger. */
  getTriggerAttrs: (value: T) => Record<string, unknown>;

  /** Get attributes for a single tab panel. */
  getPanelAttrs: (value: T) => Record<string, unknown>;

  /** Unique instance id (for aria id generation). */
  id: string;
};

const TRIGGER_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];

let idCounter = 0;

export function useTabs<T extends string = string>(options: UseTabsOptions<T> = {}): UseTabsReturn<T> {
  const instance = getCurrentInstance();
  const generatedId = instance ? `tabs-${useId()}` : `tabs-${++idCounter}`;
  const id = toValue(options.id) ?? generatedId;

  const orientation = computed(() => toValue(options.orientation) ?? 'horizontal');
  const loop = computed(() => toValue(options.loop) ?? true);
  const selectWhenFocused = computed(() => toValue(options.selectWhenFocused) ?? true);

  const isReactive =
    typeof options.value === 'function' || (options.value !== null && typeof options.value === 'object');

  const internalValue = ref<T | undefined>(toValue(options.value)) as Ref<T | undefined>;

  // When the external value is reactive, sync changes to internal
  if (isReactive) {
    watch(
      () => toValue(options.value),
      (v) => {
        internalValue.value = v;
      },
    );
  }

  const currentValue = computed(() => (isReactive ? toValue(options.value) : internalValue.value));

  function setValue(value: T) {
    internalValue.value = value;
    options.onValueChange?.(value);
  }

  function getTriggerId(value: T) {
    return `${id}-trigger-${value.replace(/\s/g, '_')}`;
  }

  function getPanelId(value: T) {
    return `${id}-panel-${value.replace(/\s/g, '_')}`;
  }

  const triggerListAttrs = computed(() => ({
    role: 'tablist' as const,
    'aria-orientation': orientation.value,
    'data-orientation': orientation.value,
  }));

  function handleTriggerKeydown(e: KeyboardEvent) {
    if (!TRIGGER_KEYS.includes(e.key)) {
      return;
    }

    const el = e.currentTarget as HTMLElement | null;
    if (!el) return;

    e.preventDefault();

    const triggerList = el.parentElement;
    if (!triggerList) return;

    const triggers = Array.from(triggerList.querySelectorAll<HTMLElement>('[role="tab"]'));
    const currIndex = triggers.indexOf(el);
    if (currIndex === -1) return;

    const prevKey = orientation.value === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = orientation.value === 'horizontal' ? 'ArrowRight' : 'ArrowDown';

    let next: HTMLElement | undefined;

    switch (e.key) {
      case prevKey: {
        const idx = currIndex - 1;
        next = loop.value ? triggers.at(idx) : triggers.at(Math.max(idx, 0));
        break;
      }
      case nextKey: {
        const idx = currIndex + 1;
        next = loop.value ? triggers.at(idx % triggers.length) : triggers.at(Math.min(idx, triggers.length - 1));
        break;
      }
      case 'Home':
        next = triggers[0];
        break;
      case 'End':
        next = triggers.at(-1);
        break;
    }

    if (!next) return;
    next.focus();

    if (selectWhenFocused.value) {
      const tabValue = next.dataset.tabValue as T | undefined;
      if (tabValue !== undefined) {
        setValue(tabValue);
      }
    }
  }

  function getTriggerAttrs(value: T): Record<string, unknown> {
    return {
      role: 'tab' as const,
      id: getTriggerId(value),
      tabindex: currentValue.value === value ? 0 : -1,
      'aria-selected': currentValue.value === value,
      'aria-controls': getPanelId(value),
      'data-active': currentValue.value === value ? '' : undefined,
      'data-tab-value': value,
      onClick: () => setValue(value),
      onKeydown: handleTriggerKeydown,
    };
  }

  function getPanelAttrs(value: T): Record<string, unknown> {
    return {
      role: 'tabpanel' as const,
      id: getPanelId(value),
      'aria-labelledby': getTriggerId(value),
      hidden: currentValue.value !== value ? true : undefined,
      'data-active': currentValue.value === value ? '' : undefined,
    };
  }

  return {
    value: currentValue,
    setValue,
    orientation,
    triggerListAttrs,
    getTriggerAttrs,
    getPanelAttrs,
    id,
  };
}

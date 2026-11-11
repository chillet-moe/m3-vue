import { isHTMLElement } from '@/internal/elementEnvironment';
import { type ComputedRef, type Ref, computed, getCurrentInstance, isRef, ref, toValue, useId } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

export type AccordionItemValue = string;
export type AccordionModelValue = AccordionItemValue | AccordionItemValue[] | undefined;

export type UseAccordionOptions<T extends AccordionItemValue = AccordionItemValue> = {
  /** The currently open item value or values. Update reactive arrays or replace the source to change membership. */
  value?: MaybeRefOrGetter<T | T[] | undefined>;

  /** Called when the open item value changes. */
  onValueChange?: (value: T | T[] | undefined) => void;

  /** Allows more than one item to be open at a time. @default false */
  multiple?: MaybeRefOrGetter<boolean>;

  /** Allows the currently open item to be collapsed. @default true */
  collapsible?: MaybeRefOrGetter<boolean>;

  /** Disables all accordion items. @default false */
  disabled?: MaybeRefOrGetter<boolean>;

  /** Whether arrow-key navigation loops around. @default true */
  loop?: MaybeRefOrGetter<boolean>;

  /** Stable base id used to build aria ids for triggers/panels. */
  id?: MaybeRefOrGetter<string>;
};

export type AccordionItemOptions = {
  /** Disables this item. */
  disabled?: MaybeRefOrGetter<boolean>;
};

export type UseAccordionReturn<T extends AccordionItemValue = AccordionItemValue> = {
  /** The current model value. */
  value: ComputedRef<T | T[] | undefined>;

  /** Open values normalized to an array. */
  openValues: ComputedRef<T[]>;

  /** Set the current model value. */
  setValue: (value: T | T[] | undefined) => void;

  /** Returns whether an item is open. */
  isOpen: (value: T) => boolean;

  /** Toggles an item and returns its next open state. */
  toggle: (value: T, options?: AccordionItemOptions) => boolean;

  /** Attributes to spread on the accordion root. */
  rootAttrs: ComputedRef<Record<string, unknown>>;

  /** Get attributes for an item wrapper. */
  getItemAttrs: (value: T, options?: AccordionItemOptions) => Record<string, unknown>;

  /** Get attributes for an item trigger button. */
  getTriggerAttrs: (value: T, options?: AccordionItemOptions) => Record<string, unknown>;

  /** Get attributes for an item panel. */
  getPanelAttrs: (value: T) => Record<string, unknown>;

  /** Unique instance id used for aria id generation. */
  id: string;
};

const TRIGGER_KEYS = ['ArrowDown', 'ArrowUp', 'Home', 'End'];

let idCounter = 0;

function normalizeValue<T extends AccordionItemValue>(value: T | T[] | undefined, multiple: boolean): T[] {
  if (multiple) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  return typeof value === 'string' ? [value] : [];
}

function normalizeIdPart(value: string) {
  return value.replace(/\s/g, '_');
}

function isTriggerEnabled(trigger: HTMLElement) {
  return (
    !trigger.hasAttribute('disabled') &&
    trigger.getAttribute('aria-disabled') !== 'true' &&
    !trigger.hasAttribute('data-disabled')
  );
}

function getEventTrigger(event: KeyboardEvent) {
  if (isHTMLElement(event.currentTarget)) {
    return event.currentTarget;
  }

  if (isHTMLElement(event.target)) {
    return event.target.closest<HTMLElement>('[data-accordion-trigger]');
  }

  return undefined;
}

export function useAccordion<T extends AccordionItemValue = AccordionItemValue>(
  options: UseAccordionOptions<T> = {},
): UseAccordionReturn<T> {
  const instance = getCurrentInstance();
  const generatedId = instance ? `accordion-${useId()}` : `accordion-${++idCounter}`;
  const id = toValue(options.id) ?? generatedId;

  const multiple = computed(() => toValue(options.multiple) ?? false);
  const collapsible = computed(() => toValue(options.collapsible) ?? true);
  const disabled = computed(() => toValue(options.disabled) ?? false);
  const loop = computed(() => toValue(options.loop) ?? true);
  const isControlled = typeof options.value === 'function' || isRef(options.value);
  const internalValue = isControlled ? undefined : (ref(toValue(options.value)) as Ref<T | T[] | undefined>);
  const currentValue = computed(() => (internalValue ? internalValue.value : toValue(options.value)));
  const openValues = computed(() => normalizeValue(currentValue.value, multiple.value));
  const openValueIndex = computed(() => {
    const values = openValues.value;
    return values.length >= 32 ? new Set(values) : undefined;
  });

  function setValue(value: T | T[] | undefined) {
    if (internalValue) internalValue.value = value;
    options.onValueChange?.(value);
  }

  function isOpen(value: T) {
    return openValueIndex.value?.has(value) ?? openValues.value.includes(value);
  }

  function isItemDisabled(itemOptions: AccordionItemOptions = {}) {
    return disabled.value || (toValue(itemOptions.disabled) ?? false);
  }

  function toggle(value: T, itemOptions: AccordionItemOptions = {}) {
    if (isItemDisabled(itemOptions)) {
      return isOpen(value);
    }

    const currentlyOpen = isOpen(value);

    if (multiple.value) {
      if (currentlyOpen) {
        if (!collapsible.value && openValues.value.length <= 1) {
          return true;
        }

        const nextValue = openValues.value.filter((item) => item !== value);
        setValue(nextValue);
        return false;
      }

      const nextValue = [...openValues.value, value];
      setValue(nextValue);
      return true;
    }

    if (currentlyOpen) {
      if (!collapsible.value) {
        return true;
      }

      setValue(undefined);
      return false;
    }

    setValue(value);
    return true;
  }

  function getTriggerId(value: T) {
    return `${id}-trigger-${normalizeIdPart(value)}`;
  }

  function getPanelId(value: T) {
    return `${id}-panel-${normalizeIdPart(value)}`;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!TRIGGER_KEYS.includes(event.key)) {
      return;
    }

    const trigger = getEventTrigger(event);
    if (!trigger) {
      return;
    }

    const root = trigger.closest<HTMLElement>('[data-accordion-root]');
    if (!root) {
      return;
    }

    const triggers = Array.from(root.querySelectorAll<HTMLElement>('[data-accordion-trigger]'));
    const currentIndex = triggers.indexOf(trigger);

    if (currentIndex < 0 || !triggers.some(isTriggerEnabled)) {
      return;
    }

    event.preventDefault();

    let next: HTMLElement | undefined;

    const findAdjacentTrigger = (direction: 1 | -1) => {
      let index = currentIndex;

      for (let i = 0; i < triggers.length; i++) {
        index += direction;

        if (index < 0 || index >= triggers.length) {
          if (!loop.value) {
            return undefined;
          }

          index = (index + triggers.length) % triggers.length;
        }

        const candidate = triggers[index];
        if (!candidate || candidate === trigger) {
          return undefined;
        }

        if (isTriggerEnabled(candidate)) {
          return candidate;
        }
      }

      return undefined;
    };

    if (event.key === 'Home') {
      next = triggers.find(isTriggerEnabled);
    } else if (event.key === 'End') {
      next = triggers.findLast(isTriggerEnabled);
    } else {
      next = findAdjacentTrigger(event.key === 'ArrowDown' ? 1 : -1);
    }

    next?.focus();
  }

  const rootAttrs = computed(() => ({
    'data-accordion-root': '',
    'data-disabled': disabled.value ? 'true' : undefined,
  }));

  function getItemAttrs(value: T, itemOptions: AccordionItemOptions = {}): Record<string, unknown> {
    const open = isOpen(value);
    const itemDisabled = isItemDisabled(itemOptions);

    return {
      'data-open': open ? 'true' : 'false',
      'data-disabled': itemDisabled ? 'true' : undefined,
    };
  }

  function getTriggerAttrs(value: T, itemOptions: AccordionItemOptions = {}): Record<string, unknown> {
    const open = isOpen(value);
    const itemDisabled = isItemDisabled(itemOptions);

    return {
      id: getTriggerId(value),
      type: 'button' as const,
      'aria-expanded': open,
      'aria-controls': getPanelId(value),
      disabled: itemDisabled ? true : undefined,
      'data-accordion-trigger': '',
      'data-accordion-value': value,
      'data-open': open ? 'true' : 'false',
      'data-disabled': itemDisabled ? 'true' : undefined,
      onClick: () => toggle(value, itemOptions),
      onKeydown: handleKeydown,
    };
  }

  function getPanelAttrs(value: T): Record<string, unknown> {
    const open = isOpen(value);

    return {
      id: getPanelId(value),
      role: 'region' as const,
      'aria-labelledby': getTriggerId(value),
      hidden: open ? undefined : true,
      'data-open': open ? 'true' : 'false',
    };
  }

  return {
    value: currentValue,
    openValues,
    setValue,
    isOpen,
    toggle,
    rootAttrs,
    getItemAttrs,
    getTriggerAttrs,
    getPanelAttrs,
    id,
  };
}

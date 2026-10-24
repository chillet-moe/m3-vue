<script setup lang="ts">
import type { StyleValue } from 'vue';
defineOptions({ inheritAttrs: false });
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { useElementEnvironment, isHTMLElement } from '@/internal/elementEnvironment';

import { computed, inject, unref, onBeforeUnmount, ref, useAttrs, useId, useSlots, watch } from 'vue';
import Icon from '@/components/Icon/Icon.vue';
import { menuDefaultsContextKey } from '@/components/Menu/MenuDefaultsContext';
import type { MenuColor } from '@/components/Menu/Menu.vue';
import Popover from '@/components/Popover/Popover.vue';
import SelectItem from './SelectItem.vue';
import { provideSelectDefaults } from './SelectContext';
import type { SelectListSlot } from '@/composables/useSelect';
export type { SelectListSlot } from '@/composables/useSelect';
import { useFieldLabelClearanceStyle, useFieldSize } from '@/components/TextField/FieldContext';
import TextField, { type TextFieldSize } from '@/components/TextField/TextField.vue';
import { useSelect } from '@/composables/useSelect';
import { acquireAnchorName } from '@/internal/anchorName';
import { startMenuPressDrag } from '@/internal/menuPressDrag';
import { useM3Locale } from '@/locales/context';

export type SelectOptionValue = string | number;

export type SelectOption = {
  /** User-facing label rendered in the trigger and menu item. */
  label: string;

  /** Submitted value for the option. */
  value: SelectOptionValue;

  /** Disables selecting the option. */
  disabled?: boolean;

  /** Optional supporting text shown in the menu item. */
  supportingText?: string;

  /** Optional leading Material Symbol name. */
  leadingIcon?: string;

  /** Optional trailing supporting text shown in the menu item. */
  trailingText?: string;
};

export type SelectModelValue = SelectOptionValue | SelectOptionValue[] | undefined;

export type SelectProps = {
  /** Local filtering or consumer-owned asynchronous results. */
  filterMode?: 'local' | 'external';
  /** Label for a selected value absent from options; otherwise String(value). */
  resolveLabel?: (value: SelectOptionValue) => string | undefined;

  /** Visible label. If omitted, provide aria-label via attrs. */
  label?: string;

  /** Optional explicit id for the trigger element. */
  id?: string;

  /** Selectable options rendered in the menu. */
  options: SelectOption[];

  /** Supporting text shown below the field when not in error state. */
  supportingText?: string;

  /** Error text shown below the field. When provided, field is invalid. */
  error?: string;

  /** Whether the control is disabled. */
  disabled?: boolean;

  /** Whether the control is required. */
  required?: boolean;

  /** Name used for hidden inputs during form submission. */
  name?: string;

  /** Placeholder shown when nothing is selected. */
  placeholder?: string;

  /** The trigger height. Matches the 32px, 40px, and 56px TextField and Button sizes. */
  size?: TextFieldSize;

  /** CSS length reserved at block-start for the floating label. Overrides FieldContext. */
  labelClearance?: string;

  /** Shows a checkmark in selected options. Overrides SelectContext; defaults to true. */
  showSelectedIcon?: boolean;

  /** Enables multi-select behavior. */
  multiple?: boolean;

  /** Shows a trailing button that clears the current selection. */
  clearable?: boolean;

  /** Accessible label for the clear button. */
  clearLabel?: string;

  /** Visual color style of the dropdown menu. */
  menuColor?: MenuColor;

  /** Separator used when showing multiple selected labels. */
  displaySeparator?: string;

  /** Enables a filter field inside the menu to narrow long option lists. */
  filterable?: boolean;

  /** Placeholder shown in the menu filter field. */
  filterPlaceholder?: string;

  /** Message shown when filtering returns no matching options. */
  filterNoResultsText?: string;
};

type TextFieldExposed = {
  rootEl?: HTMLDivElement;
  containerEl?: HTMLDivElement;
  el?: HTMLInputElement | HTMLTextAreaElement;
  focus: () => void;
  blur: () => void;
  select: () => void;
};

const attrs = useAttrs();
const slots = useSlots();
const generatedId = useId();

const props = withDefaults(defineProps<SelectProps>(), {
  label: undefined,
  id: undefined,
  supportingText: undefined,
  error: undefined,
  disabled: false,
  required: false,
  name: undefined,
  placeholder: undefined,
  size: undefined,
  labelClearance: undefined,
  showSelectedIcon: undefined,
  multiple: false,
  clearable: false,
  clearLabel: undefined,
  menuColor: undefined,
  displaySeparator: ', ',
  filterable: false,
  filterPlaceholder: undefined,
  filterNoResultsText: undefined,
});

provideSelectDefaults({ showSelectedIcon: computed(() => props.showSelectedIcon) });

const menuDefaults = inject(menuDefaultsContextKey, undefined);
const menuColor = computed(() => props.menuColor ?? unref(menuDefaults?.color) ?? 'standard');
const effectiveSize = useFieldSize(() => props.size);
const labelClearanceStyle = useFieldLabelClearanceStyle(() => props.labelClearance);

const localeContext = useM3Locale();
const messages = computed(() => localeContext.messages.value);
const clearLabel = computed(() => props.clearLabel ?? messages.value.select.clearSelection);
const filterPlaceholder = computed(() => props.filterPlaceholder ?? messages.value.select.filterOptions(props.label));
const filterNoResultsText = computed(() => props.filterNoResultsText ?? messages.value.select.noMatchingOptions);

const emit = defineEmits<{
  change: [value: SelectModelValue];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  /** Fired after the dropdown menu's visual exit finishes. */
  closed: [];
}>();

defineSlots<{
  /** Replace the full list; bind optionProps to each rendered option. */
  list(props: SelectListSlot): any;
  empty(): any;
  leading(): any;
  prefix(): any;
  suffix(): any;
  trailing(): any;
  optionLeading(props: { option: SelectOption; selected: boolean }): any;
  optionTrailing(props: { option: SelectOption; selected: boolean }): any;
}>();

const modelValue = defineModel<SelectModelValue>();
const open = defineModel<boolean>('open', { default: false });
const query = defineModel<string>('query', { default: '' });

const triggerRef = ref<HTMLElement>();
const menuRef = ref<InstanceType<typeof Popover>>();
const textFieldRef = ref<TextFieldExposed>();
const anchorName = `--m3-select-anchor-${generatedId}`;
let releaseAnchorName: (() => void) | undefined;
let cleanupPressDrag: (() => void) | undefined;
let reopenAfterHeldClick = false;

const triggerId = computed(() => {
  return props.id ?? `m3-select-${generatedId}`;
});

const menuId = computed(() => {
  return `${triggerId.value}-menu`;
});

const invalid = computed(() => {
  return Boolean(props.error);
});

const hasLeading = computed(() => {
  return Boolean(slots.leading);
});

const select = useSelect({
  options: () => props.options,
  multiple: () => props.multiple,
  filterable: () => props.filterable,
  disabled: () => props.disabled,
  displaySeparator: () => props.displaySeparator,
  locale: () => localeContext.locale.value,
  modelValue,
  open,
  onChange: (value) => emit('change', value),
  onClosed: () => emit('closed'),
  id: () => menuId.value,
  query,
  filterMode: () => props.filterMode ?? 'local',
  resolveLabel: (value) => props.resolveLabel?.(value),
  focus: () => textFieldRef.value?.focus(),
  blur: () => textFieldRef.value?.blur(),
});

const textFieldPlaceholder = computed(() => {
  if (props.filterable && open.value) {
    return filterPlaceholder.value;
  }

  return props.placeholder;
});

const textFieldValue = computed({
  get() {
    if (props.filterable && open.value) {
      return select.filterQuery.value;
    }

    return select.displayText.value;
  },
  set(nextValue: string) {
    if (!props.filterable) {
      return;
    }

    select.filterQuery.value = nextValue;
  },
});

const filterAriaLabel = computed(() => {
  return messages.value.select.filterOptions(props.label);
});

const controlAttrs = computed(() => {
  const forwarded = { ...attrs };
  delete forwarded.class;
  delete forwarded.style;
  return forwarded;
});

function handleFocus(event: FocusEvent) {
  emit('focus', event);
}

function handleBlur(event: FocusEvent) {
  const nextFocused = event.relatedTarget as Node | null;

  if (nextFocused && menuRef.value?.popoverEl?.contains(nextFocused)) {
    return;
  }

  emit('blur', event);
}

function handleTriggerPointerDown(event: PointerEvent) {
  if (props.disabled || props.filterable || (event.target as Element).closest('[data-part="clear-button"]')) {
    return;
  }

  const menu = menuRef.value?.popoverEl;
  if (!menu) return;

  const trigger = event.currentTarget;
  if (!isHTMLElement(trigger)) return;
  cleanupPressDrag?.();
  reopenAfterHeldClick = false;
  cleanupPressDrag = startMenuPressDrag(event, {
    trigger,
    menu,
    open: select.openMenu,
    close: select.closeMenu,
    onFinish: ({ heldTriggerPress }) => {
      cleanupPressDrag = undefined;
      reopenAfterHeldClick = heldTriggerPress;
    },
  });
}

function handleFieldClick() {
  if (reopenAfterHeldClick) {
    reopenAfterHeldClick = false;
    select.openMenu();
    return;
  }

  if (!props.filterable && open.value) select.closeMenu();
  else select.handleFieldClick();
}

watch(
  () => textFieldRef.value?.containerEl,
  (nextContainer, previousContainer) => {
    if (nextContainer !== previousContainer) {
      releaseAnchorName?.();
      releaseAnchorName = nextContainer ? acquireAnchorName(nextContainer, anchorName) : undefined;
    }

    triggerRef.value = nextContainer ?? undefined;
  },
  {
    immediate: true,
    flush: 'post',
  },
);

// A selector retains input focus, so its manual popover has one explicit
// dismissal owner. Bind to the trigger's Document, including window adoption.
useElementEnvironment(triggerRef, (document) => {
  const dismiss = (event: Event) => {
    const target = event.target as Node | null;
    if (target && !triggerRef.value?.contains(target) && !menuRef.value?.popoverEl?.contains(target))
      select.closeMenu();
  };
  document.addEventListener('pointerdown', dismiss, true);
  document.addEventListener('focusin', dismiss);
  return () => {
    document.removeEventListener('pointerdown', dismiss, true);
    document.removeEventListener('focusin', dismiss);
  };
});

onBeforeUnmount(() => {
  releaseAnchorName?.();
  cleanupPressDrag?.();
});

defineExpose({
  el: textFieldRef,
  focus: select.focus,
  blur: select.blur,
  show: select.show,
  hide: select.hide,
  toggle: select.toggle,
});
</script>

<template>
  <div
    :class="['m3-text-field m3-select', attrs.class]"
    data-scope="select"
    data-part="root"
    :data-invalid="invalid ? 'true' : 'false'"
    :data-disabled="props.disabled ? 'true' : 'false'"
    :data-populated="select.hasValue.value ? 'true' : 'false'"
    :data-size="effectiveSize"
    :data-open="open ? 'true' : 'false'"
    :data-filterable="props.filterable ? 'true' : 'false'"
    :data-has-placeholder="props.placeholder ? 'true' : 'false'"
    :data-has-leading="hasLeading ? 'true' : 'false'"
    :style="[labelClearanceStyle, attrs.style as StyleValue]"
  >
    <div
      class="m3-select-trigger"
      data-scope="select"
      data-part="trigger"
      @pointerdown="handleTriggerPointerDown"
      @click="handleFieldClick"
    >
      <TextField
        :id="triggerId"
        ref="textFieldRef"
        v-model="textFieldValue"
        class="m3-select-field"
        :label="props.label"
        :supporting-text="props.supportingText"
        :error="props.error"
        :disabled="props.disabled"
        :visually-focused="open"
        :required="props.required"
        :readonly="!props.filterable"
        :placeholder="textFieldPlaceholder"
        :size="effectiveSize"
        label-clearance="0rem"
        role="combobox"
        :aria-autocomplete="props.filterable ? 'list' : 'none'"
        :aria-activedescendant="select.activeDescendant.value"
        :aria-controls="menuId"
        :aria-expanded="open ? 'true' : 'false'"
        aria-haspopup="listbox"
        :aria-invalid="invalid ? 'true' : undefined"
        :aria-required="props.required ? 'true' : undefined"
        :aria-label="props.label ? undefined : filterAriaLabel"
        v-bind="controlAttrs"
        @input="select.handleFieldInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="select.handleFilterKeydown"
      >
        <template v-if="slots.leading" #leading>
          <slot name="leading" />
        </template>
        <template v-if="slots.prefix" #prefix>
          <slot name="prefix" />
        </template>
        <template v-if="slots.suffix" #suffix>
          <slot name="suffix" />
        </template>
        <template #trailing>
          <slot v-if="slots.trailing" name="trailing" />
          <button
            v-state-layer
            v-if="props.clearable && select.hasValue.value && !props.disabled"
            class="m3-select-clear-button m3-state-layer"
            data-scope="select"
            data-part="clear-button"
            type="button"
            :aria-label="clearLabel"
            @mousedown.stop.prevent
            @click.stop="select.clearValue"
          >
            <Icon class="m3-select-clear-icon" name="close" data-scope="select" data-part="clear-icon" />
          </button>
          <span class="m3-select-indicator" data-scope="select" data-part="indicator" aria-hidden="true">
            <Icon name="arrow_drop_down" />
          </span>
        </template>
      </TextField>
    </div>

    <input
      v-for="(submittedValue, index) in select.submittedValues.value"
      :key="`${props.name}-${submittedValue}-${index}`"
      type="hidden"
      :name="props.name"
      :value="submittedValue"
    />

    <Popover
      :id="menuId"
      ref="menuRef"
      v-model:open="open"
      class="m3-select-menu"
      data-scope="select"
      data-part="menu"
      popover="manual"
      role="listbox"
      :data-color="menuColor"
      :aria-label="props.label || filterAriaLabel"
      :aria-multiselectable="props.multiple"
      :anchor-name="anchorName"
      :anchor-element="triggerRef"
      match-anchor-width
      @closed="select.handleMenuClosed"
    >
      <slot name="list" v-bind="select.list.value">
        <div class="m3-select-options" data-scope="select" data-part="options">
          <SelectItem
            v-for="({ option }, index) in select.filteredOptionEntries.value"
            :key="`${typeof option.value}-${option.value}`"
            v-bind="select.optionProps(index)"
            :disabled="option.disabled"
            :active="select.activeIndex.value === index"
            :selected="select.isOptionSelected(option)"
            :supporting-text="option.supportingText"
            :leading-icon="option.leadingIcon"
            :trailing-text="option.trailingText"
          >
            <template v-if="slots.optionLeading" #leading>
              <slot name="optionLeading" :option="option" :selected="select.isOptionSelected(option)" />
            </template>
            {{ option.label }}
            <template v-if="slots.optionTrailing" #trailing>
              <slot name="optionTrailing" :option="option" :selected="select.isOptionSelected(option)" />
            </template>
          </SelectItem>
          <div v-if="!select.hasFilteredOptions.value" class="m3-select-empty" data-part="empty" aria-live="polite">
            <slot name="empty">{{ filterNoResultsText }}</slot>
          </div>
        </div>
      </slot>
    </Popover>
  </div>
</template>

<style src="./Select.css"></style>

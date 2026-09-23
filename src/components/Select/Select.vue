<script setup lang="ts">
import { TransitionGroup, computed, onBeforeUnmount, ref, useAttrs, useId, useSlots, watch } from 'vue';
import Icon from '@/components/Icon/Icon.vue';
import Menu, { type MenuColor } from '@/components/Menu/Menu.vue';
import MenuContainer from '@/components/Menu/MenuContainer.vue';
import MenuItem from '@/components/Menu/MenuItem.vue';
import { useFieldLabelClearanceStyle } from '@/components/TextField/FieldContext';
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

type SelectExposed = {
  show: (focusFirst?: boolean, source?: HTMLElement) => Promise<void>;
  hide: () => void;
  toggle: () => void;
  menuRef?: HTMLDivElement;
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
  size: 'medium',
  labelClearance: undefined,
  multiple: false,
  clearable: false,
  clearLabel: undefined,
  menuColor: 'standard',
  displaySeparator: ', ',
  filterable: false,
  filterPlaceholder: undefined,
  filterNoResultsText: undefined,
});

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
  leading(): any;
  prefix(): any;
  suffix(): any;
  trailing(): any;
  optionLeading(props: { option: SelectOption; selected: boolean }): any;
  optionTrailing(props: { option: SelectOption; selected: boolean }): any;
}>();

const modelValue = defineModel<SelectModelValue>();
const open = defineModel<boolean>('open', { default: false });

const triggerRef = ref<HTMLElement>();
const menuRef = ref<SelectExposed>();
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
  menuRef: menuRef as any,
  triggerRef,
  textFieldRef: textFieldRef as any,
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

  if (nextFocused && menuRef.value?.menuRef?.contains(nextFocused)) {
    return;
  }

  emit('blur', event);
}

function handleTriggerPointerDown(event: PointerEvent) {
  if (props.disabled || props.filterable || (event.target as Element).closest('[data-part="clear-button"]')) {
    return;
  }

  const menu = menuRef.value?.menuRef;
  if (!menu) return;

  const trigger = event.currentTarget;
  if (!(trigger instanceof HTMLElement)) return;
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

  select.handleFieldClick();
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
    class="m3-text-field m3-select"
    data-scope="select"
    data-part="root"
    :data-invalid="invalid ? 'true' : 'false'"
    :data-disabled="props.disabled ? 'true' : 'false'"
    :data-populated="select.hasValue.value ? 'true' : 'false'"
    :data-size="props.size"
    :data-open="open ? 'true' : 'false'"
    :data-filterable="props.filterable ? 'true' : 'false'"
    :data-has-placeholder="props.placeholder ? 'true' : 'false'"
    :data-has-leading="hasLeading ? 'true' : 'false'"
    :style="labelClearanceStyle"
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
        :size="props.size"
        label-clearance="0rem"
        :role="props.filterable ? undefined : 'button'"
        :aria-controls="menuId"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-haspopup="'menu'"
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

    <Menu
      :id="menuId"
      ref="menuRef"
      v-model:open="open"
      class="m3-select-menu"
      data-scope="select"
      data-part="menu"
      :color="props.menuColor"
      :style="{ 'position-anchor': anchorName }"
      @select="select.handleMenuSelect"
      @closed="select.handleMenuClosed"
    >
      <MenuContainer>
        <TransitionGroup
          tag="div"
          name="m3-select-options"
          class="m3-select-options"
          data-scope="select"
          data-part="options"
        >
          <MenuItem
            v-for="{ option, index } in select.filteredOptionEntries.value"
            :key="`${index}-${option.value}`"
            class="m3-select-option"
            data-scope="select"
            data-part="option"
            :data-option-index="index"
            :data-has-option-leading="option.leadingIcon || slots.optionLeading ? 'true' : undefined"
            :disabled="option.disabled"
            :role="props.multiple ? 'menuitemcheckbox' : 'menuitemradio'"
            :checked="select.isOptionSelected(option)"
            :selected="select.isOptionSelected(option)"
            :close-on-select="!props.multiple"
          >
            <template #leading>
              <span class="m3-select-option-leading-content" data-scope="select" data-part="option-leading-content">
                <span class="m3-select-option-check" data-scope="select" data-part="option-check" aria-hidden="true">
                  <Icon name="check" />
                </span>

                <span
                  v-if="option.leadingIcon || slots.optionLeading"
                  class="m3-select-option-icon"
                  data-scope="select"
                  data-part="option-icon"
                  aria-hidden="true"
                >
                  <slot name="optionLeading" :option="option" :selected="false">
                    <Icon v-if="option.leadingIcon" :name="option.leadingIcon" />
                  </slot>
                </span>
              </span>
            </template>

            {{ option.label }}

            <template v-if="option.supportingText" #supporting>
              {{ option.supportingText }}
            </template>

            <template v-if="slots.optionTrailing" #trailing>
              <slot name="optionTrailing" :option="option" :selected="select.isOptionSelected(option)" />
            </template>

            <template v-else-if="option.trailingText" #trailingText>
              {{ option.trailingText }}
            </template>
          </MenuItem>

          <div
            v-if="props.filterable && !select.hasFilteredOptions.value"
            key="no-results"
            class="m3-select-empty"
            data-scope="select"
            data-part="empty"
            aria-live="polite"
          >
            {{ filterNoResultsText }}
          </div>
        </TransitionGroup>
      </MenuContainer>
    </Menu>
  </div>
</template>

<style src="./Select.css"></style>

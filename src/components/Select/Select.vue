<script setup lang="ts">
import { TransitionGroup, computed, ref, useAttrs, useSlots, watch } from 'vue';
import Icon from '@/components/Icon/Icon.vue';
import Menu, { type MenuColor } from '@/components/Menu/Menu.vue';
import MenuContainer from '@/components/Menu/MenuContainer.vue';
import MenuItem from '@/components/Menu/MenuItem.vue';
import TextField from '@/components/TextField/TextField.vue';
import { hideDropdownElement, showDropdownElement } from '@/directives/Dropdown/helpers';

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
  description?: string;

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

  /** Enables multi-select behavior. */
  multiple?: boolean;

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
const generatedId =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `select-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const props = withDefaults(defineProps<SelectProps>(), {
  label: undefined,
  id: undefined,
  description: undefined,
  error: undefined,
  disabled: false,
  required: false,
  name: undefined,
  placeholder: undefined,
  multiple: false,
  menuColor: 'standard',
  displaySeparator: ', ',
  filterable: false,
  filterPlaceholder: 'Filter options',
  filterNoResultsText: 'No matching options',
});

const emit = defineEmits<{
  change: [value: SelectModelValue];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
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
const filterQuery = ref('');
const anchorName = `--m3-select-anchor-${generatedId}`;

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

const textFieldPlaceholder = computed(() => {
  if (props.filterable && open.value) {
    return props.filterPlaceholder;
  }

  return props.placeholder;
});

const textFieldValue = computed({
  get() {
    if (props.filterable && open.value) {
      return filterQuery.value;
    }

    return displayText.value;
  },
  set(nextValue: string) {
    if (!props.filterable) {
      return;
    }

    filterQuery.value = nextValue;
  },
});

const filterAriaLabel = computed(() => {
  return props.label ? `Filter ${props.label}` : 'Filter options';
});

const controlAttrs = computed(() => {
  const forwarded = { ...attrs };
  delete forwarded.class;
  delete forwarded.style;
  return forwarded;
});

const selectedOptions = computed(() => {
  if (props.multiple) {
    if (!Array.isArray(modelValue.value)) {
      return [] as SelectOption[];
    }

    const selectedValues = new Set(modelValue.value);
    return props.options.filter((option) => selectedValues.has(option.value));
  }

  return props.options.filter((option) => option.value === modelValue.value);
});

const hasValue = computed(() => {
  return selectedOptions.value.length > 0;
});

const displayText = computed(() => {
  if (!selectedOptions.value.length) {
    return '';
  }

  return selectedOptions.value.map((option) => option.label).join(props.displaySeparator);
});

const submittedValues = computed(() => {
  if (props.disabled || !props.name) {
    return [] as string[];
  }

  if (props.multiple) {
    if (!Array.isArray(modelValue.value)) {
      return [] as string[];
    }

    return modelValue.value.map((value) => String(value));
  }

  if (modelValue.value === undefined || Array.isArray(modelValue.value)) {
    return [] as string[];
  }

  return [String(modelValue.value)];
});

const filteredOptionEntries = computed(() => {
  const normalizedQuery = filterQuery.value.trim().toLocaleLowerCase();

  return props.options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => {
      if (!props.filterable || !normalizedQuery) {
        return true;
      }

      const searchableText = [option.label, option.supportingText, option.trailingText]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();

      return searchableText.includes(normalizedQuery);
    });
});

const hasFilteredOptions = computed(() => {
  return filteredOptionEntries.value.length > 0;
});

function isOptionSelected(option: SelectOption) {
  if (props.multiple) {
    return Array.isArray(modelValue.value) ? modelValue.value.includes(option.value) : false;
  }

  return modelValue.value === option.value;
}

function updateValue(nextValue: SelectModelValue) {
  modelValue.value = nextValue;
  emit('change', nextValue);
}

function toggleOption(option: SelectOption) {
  if (option.disabled) {
    return;
  }

  if (props.multiple) {
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

function handleMenuSelect(_event: MouseEvent, itemElement: HTMLElement) {
  const optionIndex = Number(itemElement.dataset.optionIndex);

  if (!Number.isInteger(optionIndex)) {
    return;
  }

  const option = props.options[optionIndex];

  if (!option) {
    return;
  }

  toggleOption(option);
}

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

function focus() {
  textFieldRef.value?.focus();
}

function blur() {
  textFieldRef.value?.blur();
}

async function show() {
  if (props.filterable) {
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

function openMenu(focus: 'first' | 'last' | undefined = undefined) {
  const menuElement = menuRef.value?.menuRef;

  if (!menuElement) {
    return;
  }

  open.value = true;
  showDropdownElement(menuElement, {
    focus,
    source: triggerRef.value ?? undefined,
  });
}

function closeMenu() {
  const menuElement = menuRef.value?.menuRef;

  if (!menuElement) {
    return;
  }

  open.value = false;
  hideDropdownElement(menuElement);
}

function handleFieldClick() {
  if (props.disabled || open.value) {
    return;
  }

  if (props.filterable) {
    textFieldRef.value?.focus();
  }

  openMenu();
}

function handleFieldInput() {
  if (!props.filterable || props.disabled) {
    return;
  }

  if (!open.value) {
    openMenu();
  }
}

function handleFilterKeydown(event: KeyboardEvent) {
  if (props.disabled) {
    return;
  }

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

  if (!props.filterable && ['Enter', ' '].includes(event.key)) {
    event.preventDefault();
    openMenu('first');
    return;
  }

  if (event.key === 'Home' || event.key === 'End') {
    event.stopPropagation();
  }
}

watch(
  () => textFieldRef.value?.containerEl,
  (nextContainer, previousContainer) => {
    previousContainer?.style.removeProperty('anchor-name');
    nextContainer?.style.setProperty('anchor-name', anchorName);
    triggerRef.value = nextContainer ?? undefined;
  },
  {
    immediate: true,
    flush: 'post',
  },
);

watch(
  open,
  (nextOpen) => {
    if (nextOpen) {
      if (props.filterable) {
        textFieldRef.value?.focus();
      }

      return;
    }

    filterQuery.value = '';
  },
  {
    immediate: true,
  },
);

defineExpose({
  el: textFieldRef,
  focus,
  blur,
  show,
  hide,
  toggle,
});
</script>

<template>
  <div
    class="m3-text-field m3-select"
    data-scope="select"
    data-part="root"
    :data-invalid="invalid ? 'true' : 'false'"
    :data-disabled="props.disabled ? 'true' : 'false'"
    :data-populated="hasValue ? 'true' : 'false'"
    :data-open="open ? 'true' : 'false'"
    :data-filterable="props.filterable ? 'true' : 'false'"
    :data-has-placeholder="props.placeholder ? 'true' : 'false'"
    :data-has-leading="hasLeading ? 'true' : 'false'"
  >
    <div class="m3-select-trigger" data-scope="select" data-part="trigger" @click="handleFieldClick">
      <TextField
        :id="triggerId"
        ref="textFieldRef"
        v-model="textFieldValue"
        class="m3-select-field"
        :label="props.label"
        :description="props.description"
        :error="props.error"
        :disabled="props.disabled"
        :visually-focused="open"
        :required="props.required"
        :readonly="!props.filterable"
        :placeholder="textFieldPlaceholder"
        :role="props.filterable ? undefined : 'button'"
        :aria-controls="menuId"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-haspopup="'menu'"
        :aria-invalid="invalid ? 'true' : undefined"
        :aria-required="props.required ? 'true' : undefined"
        :aria-label="props.label ? undefined : filterAriaLabel"
        v-bind="controlAttrs"
        @click="handleFieldClick"
        @input="handleFieldInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleFilterKeydown"
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
          <span class="m3-select-indicator" data-scope="select" data-part="indicator" aria-hidden="true">
            <Icon name="arrow_drop_down" />
          </span>
        </template>
      </TextField>
    </div>

    <input
      v-for="(submittedValue, index) in submittedValues"
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
      @select="handleMenuSelect"
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
            v-for="{ option, index } in filteredOptionEntries"
            :key="`${index}-${option.value}`"
            class="m3-select-option"
            data-scope="select"
            data-part="option"
            :data-option-index="index"
            :data-has-option-leading="option.leadingIcon || slots.optionLeading ? 'true' : undefined"
            :disabled="option.disabled"
            :role="props.multiple ? 'menuitemcheckbox' : 'menuitemradio'"
            :checked="isOptionSelected(option)"
            :selected="isOptionSelected(option)"
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
              <slot name="optionTrailing" :option="option" :selected="isOptionSelected(option)" />
            </template>

            <template v-else-if="option.trailingText" #trailingText>
              {{ option.trailingText }}
            </template>
          </MenuItem>

          <div
            v-if="props.filterable && !hasFilteredOptions"
            key="no-results"
            class="m3-select-empty"
            data-scope="select"
            data-part="empty"
            aria-live="polite"
          >
            {{ props.filterNoResultsText }}
          </div>
        </TransitionGroup>
      </MenuContainer>
    </Menu>
  </div>
</template>

<style src="./Select.css"></style>

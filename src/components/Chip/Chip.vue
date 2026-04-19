<script setup lang="ts">
import { computed, inject, unref } from 'vue';

import { usePressedState } from '@/composables/pressedState.ts';
import { Icon } from '@/components/Icon';
import { selectionGroupContextKey, type SelectionGroupValue } from '@/components/SelectionGroup/SelectionGroupContext';

export type ChipProps = {
  /** Material 3 chip variant. */
  variant?: 'assist' | 'filter' | 'input' | 'suggestion';

  /** Value used when the chip participates in a selection group model. */
  value?: SelectionGroupValue;

  /** Name forwarded to the native input when used outside a selection group. */
  name?: string;

  /** Whether to use the elevated filter chip treatment. */
  elevated?: boolean;

  /** Leading icon shown before the label. */
  leadingIcon?: string;

  /** Trailing icon shown after the label. */
  trailingIcon?: string;

  /** Avatar image URL shown by input chips. */
  avatarSrc?: string;

  /** Optional selected-state icon used when no leading icon is provided. */
  selectedIcon?: string | false;

  /** Whether the chip is disabled. */
  disabled?: boolean;

  /** ARIA label forwarded to the native input. */
  ariaLabel?: string;
};

const props = withDefaults(defineProps<ChipProps>(), {
  variant: 'filter',
  elevated: false,
  leadingIcon: undefined,
  trailingIcon: undefined,
  avatarSrc: undefined,
  selectedIcon: 'check',
  disabled: false,
  name: undefined,
  value: undefined,
  ariaLabel: undefined,
});

const selected = defineModel<boolean>({ default: false });

const groupContext = inject(selectionGroupContextKey, undefined);

const selectableVariant = computed(() => {
  return props.variant === 'filter' || props.variant === 'input';
});

const participatesInGroup = computed(() => {
  return groupContext !== undefined && props.value !== undefined;
});

const selectable = computed(() => {
  return selectableVariant.value || participatesInGroup.value;
});

const isSelected = computed(() => {
  if (!selectable.value) {
    return false;
  }

  if (participatesInGroup.value) {
    const currentValue = unref(groupContext?.modelValue);

    if (Array.isArray(currentValue)) {
      return currentValue.includes(props.value as SelectionGroupValue);
    }

    return currentValue === props.value;
  }

  return selected.value;
});

const inputType = computed(() => {
  if (participatesInGroup.value && unref(groupContext?.selectionMode) === 'single') {
    return 'radio';
  }

  return 'checkbox';
});

const inputName = computed(() => {
  return unref(groupContext?.name) ?? props.name;
});

const inputValue = computed(() => {
  if (props.value !== undefined) {
    return String(props.value);
  }

  return 'on';
});

const mergedDisabled = computed(() => {
  return props.disabled || unref(groupContext?.disabled) || false;
});

const showAvatar = computed(() => {
  return props.variant === 'input' && Boolean(props.avatarSrc);
});

const leadingSource = computed(() => {
  if (showAvatar.value) {
    return 'avatar';
  }

  if (props.leadingIcon) {
    return 'icon';
  }

  if (props.variant === 'filter' && isSelected.value && props.selectedIcon) {
    return 'selected-icon';
  }

  return 'none';
});

const resolvedLeadingIcon = computed(() => {
  if (leadingSource.value === 'avatar') {
    return undefined;
  }

  if (leadingSource.value === 'icon') {
    return props.leadingIcon;
  }

  if (leadingSource.value === 'selected-icon') {
    return props.selectedIcon;
  }

  return undefined;
});

const hasLeading = computed(() => {
  return leadingSource.value !== 'none';
});

const hasTrailing = computed(() => {
  if (props.variant !== 'filter' && props.variant !== 'input') {
    return false;
  }

  return Boolean(props.trailingIcon);
});

const tag = computed(() => {
  if (selectable.value) {
    return 'label';
  }

  return 'button';
});

const nativeDisabled = computed(() => {
  if (tag.value === 'button') {
    return mergedDisabled.value;
  }

  return undefined;
});

const type = computed(() => {
  if (tag.value === 'button') {
    return 'button';
  }

  return undefined;
});

const { pressed, onPointerDown, onPointerUp, onPointerCancel } = usePressedState();

const guardDisabledInteraction = (event: Event) => {
  if (!mergedDisabled.value) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  return true;
};

const handlePointerDown = (event: PointerEvent) => {
  if (guardDisabledInteraction(event)) return;
  onPointerDown(event);
};

const handlePointerUp = (event: PointerEvent) => {
  if (guardDisabledInteraction(event)) return;
  onPointerUp(event);
};

const handlePointerCancel = (event: PointerEvent) => {
  if (guardDisabledInteraction(event)) return;
  onPointerCancel(event);
};

const handleClick = (event: MouseEvent) => {
  guardDisabledInteraction(event);
};

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;

  if (participatesInGroup.value) {
    groupContext?.select(props.value as SelectionGroupValue, target.checked);
    return;
  }

  selected.value = target.checked;
};

defineSlots<{
  /** Main chip label. */
  default(): any;
}>();
</script>

<template>
  <component
    :is="tag"
    :class="['m3-state-layer', 'm3-chip']"
    data-scope="chip"
    data-part="root"
    :data-variant="variant"
    :data-selected="isSelected ? 'true' : 'false'"
    :data-elevated="elevated ? 'true' : 'false'"
    :data-pressed="!mergedDisabled && pressed ? 'true' : 'false'"
    :data-with-leading="hasLeading ? 'true' : 'false'"
    :data-with-trailing="hasTrailing ? 'true' : 'false'"
    :data-leading-source="leadingSource !== 'none' ? leadingSource : undefined"
    :aria-disabled="mergedDisabled ? 'true' : 'false'"
    :disabled="nativeDisabled"
    :type="type"
    @click="handleClick"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
  >
    <input
      v-if="selectable"
      :class="'m3-chip-input'"
      data-scope="chip"
      data-part="input"
      :type="inputType"
      :name="inputName"
      :value="inputValue"
      :checked="isSelected"
      :disabled="mergedDisabled"
      :aria-label="ariaLabel"
      @change="handleChange"
    />

    <span v-if="showAvatar" :class="'m3-chip-avatar'" data-scope="chip" data-part="avatar" aria-hidden="true">
      <img :src="avatarSrc" :class="'m3-chip-avatar-image'" data-scope="chip" data-part="avatar-image" alt="" />
    </span>
    <span
      v-if="resolvedLeadingIcon"
      :class="'m3-chip-leading'"
      data-scope="chip"
      data-part="leading"
      aria-hidden="true"
    >
      <Icon :name="resolvedLeadingIcon" :class="'m3-chip-icon'" data-scope="chip" data-part="icon" />
    </span>
    <span :class="'m3-chip-content'" data-scope="chip" data-part="content">
      <span :class="'m3-chip-label'" data-scope="chip" data-part="label"><slot /></span>
      <span
        v-if="hasTrailing && trailingIcon"
        :class="'m3-chip-trailing'"
        data-scope="chip"
        data-part="trailing"
        aria-hidden="true"
      >
        <Icon :name="trailingIcon" :class="'m3-chip-icon'" data-scope="chip" data-part="icon" />
      </span>
    </span>
  </component>
</template>

<style src="./Chip.css"></style>

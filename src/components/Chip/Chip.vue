<script setup lang="ts">
import { useShape, type M3Shape } from '@/styles/shape';
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { computed } from 'vue';

import { usePressShapeMorphAttrs } from '@/composables/usePressShapeMorph';
import { Icon } from '@/components/Icon';
import type { SelectionGroupValue } from '@/components/SelectionGroup/SelectionGroupContext';
import { useSelectionGroupItem } from '@/components/SelectionGroup/useSelectionGroupItem';

export type ChipProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
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

const selectableVariant = computed(() => {
  return props.variant === 'filter' || props.variant === 'input';
});

const selectionItem = useSelectionGroupItem({
  value: () => props.value,
  selected,
  name: () => props.name,
  disabled: () => props.disabled,
});
const { mergedDisabled, selectFromInput } = selectionItem;

const selectable = computed(() => selectableVariant.value || selectionItem.participatesInGroup());
const isSelected = computed(() => selectable.value && selectionItem.isSelected.value);

const leadingSource = computed(() => {
  if (props.variant === 'input' && props.avatarSrc) return 'avatar';
  if (props.leadingIcon) return 'icon';
  if (props.variant === 'filter' && isSelected.value && props.selectedIcon) return 'selected-icon';
  return undefined;
});
const hasTrailing = computed(() => selectableVariant.value && Boolean(props.trailingIcon));

const pressShapeMorphAttrs = usePressShapeMorphAttrs({ disabled: mergedDisabled });

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  selectFromInput(target.checked);
};

defineSlots<{
  /** Main chip label. */
  default(): any;
}>();
const shape = useShape(() => props.shape);
</script>

<template>
  <component
    v-state-layer
    :is="selectable ? 'label' : 'button'"
    :class="['m3-state-layer', 'm3-chip']"
    data-scope="chip"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    :data-variant="variant"
    :data-selected="isSelected ? 'true' : 'false'"
    :data-elevated="elevated ? 'true' : 'false'"
    :data-with-trailing="hasTrailing ? 'true' : 'false'"
    :data-leading-source="leadingSource"
    :aria-disabled="mergedDisabled ? 'true' : 'false'"
    :disabled="selectable ? undefined : mergedDisabled"
    :type="selectable ? undefined : 'button'"
    v-bind="pressShapeMorphAttrs"
  >
    <input
      v-if="selectable"
      :class="'m3-chip-input'"
      data-scope="chip"
      data-part="input"
      :type="selectionItem.inputType()"
      :name="selectionItem.inputName()"
      :value="selectionItem.inputValue()"
      :checked="isSelected"
      :disabled="mergedDisabled"
      :aria-label="ariaLabel"
      @change="handleChange"
    />

    <img
      v-if="leadingSource === 'avatar'"
      :src="avatarSrc"
      class="m3-chip-avatar"
      data-scope="chip"
      data-part="avatar"
      alt=""
    />
    <Icon
      v-else-if="leadingSource"
      :name="leadingSource === 'icon' ? leadingIcon : selectedIcon || undefined"
      :class="['m3-chip-leading', 'm3-chip-icon']"
      data-scope="chip"
      data-part="leading"
      aria-hidden="true"
    />
    <span :class="'m3-chip-content'" data-scope="chip" data-part="content">
      <span :class="'m3-chip-label'" data-scope="chip" data-part="label"><slot /></span>
      <Icon
        v-if="hasTrailing && trailingIcon"
        :name="trailingIcon"
        :class="['m3-chip-trailing', 'm3-chip-icon']"
        data-scope="chip"
        data-part="trailing"
        aria-hidden="true"
      />
    </span>
  </component>
</template>

<style src="./Chip.css"></style>

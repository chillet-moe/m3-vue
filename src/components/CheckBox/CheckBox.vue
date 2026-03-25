<script setup lang="ts">
import style from './CheckBox.module.css';

export type CheckBoxProps = {
  /** Whether the checkbox is disabled. */
  disabled?: boolean;

  /** Name attribute for the native checkbox input. */
  name?: string;

  /** Value attribute for the native checkbox input. */
  value?: string;

  /** ARIA label forwarded to the native checkbox input. */
  ariaLabel?: string;
};

const { disabled = false, name, value, ariaLabel } = defineProps<CheckBoxProps>();

const checked = defineModel<boolean>('checked', { required: true });

defineSlots<{
  /** Optional label content rendered next to checkbox. */
  default(): any;
}>();
</script>

<template>
  <label :class="style.root" :aria-disabled="disabled ? 'true' : 'false'" data-state-layer-hover-target>
    <input
      v-model="checked"
      :class="style.input"
      type="checkbox"
      :disabled="disabled"
      :name="name"
      :value="value"
      :aria-label="ariaLabel"
    />

    <span :class="style.control" aria-hidden="true">
      <span :class="style.box" />
      <span :class="style.icon" />
      <span
        class="state-layer"
        data-state-layer-hover-from="target"
        style="position: absolute; width: 2.5rem; height: 2.5rem; border-radius: 1.25rem"
      />
    </span>

    <span v-if="$slots.default" :class="style.label"><slot /></span>
  </label>
</template>

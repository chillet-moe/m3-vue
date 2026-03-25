<script setup lang="ts">
import style from './Radio.module.css';

export type RadioProps = {
  /** Whether the radio is disabled. */
  disabled?: boolean;

  /** Name attribute for the native radio input. */
  name?: string;

  /** Value attribute for the native radio input. */
  value?: string;

  /** ARIA label forwarded to the native radio input. */
  ariaLabel?: string;
};

const { disabled = false, name, value, ariaLabel } = defineProps<RadioProps>();

const checked = defineModel<boolean>('checked', { required: true });

const slots = defineSlots<{
  /** Optional label content rendered next to radio. */
  default(): any;
}>();
</script>

<template>
  <label :class="style.root" :aria-disabled="disabled ? 'true' : 'false'" data-state-layer-hover-target>
    <input
      v-model="checked"
      :class="style.input"
      type="radio"
      :disabled="disabled"
      :name="name"
      :value="value"
      :aria-label="ariaLabel"
    />

    <span :class="style.control" aria-hidden="true">
      <span :class="style.outer" />
      <span :class="style.inner" />
      <span
        class="state-layer"
        data-state-layer-hover-from="target"
        style="position: absolute; width: 2.5rem; height: 2.5rem; border-radius: 1.25rem"
      />
    </span>

    <span v-if="slots.default()" :class="style.label"><slot /></span>
  </label>
</template>

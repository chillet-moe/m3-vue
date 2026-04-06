<script setup lang="ts">

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

defineSlots<{
  /** Optional label content rendered next to radio. */
  default(): any;
}>();
</script>

<template>
  <label :class="'m3-radio'" :aria-disabled="disabled ? 'true' : 'false'" data-state-layer-hover-target>
    <input
      v-model="checked"
      :class="'m3-radio-input'"
      type="radio"
      :disabled="disabled"
      :name="name"
      :value="value"
      :aria-label="ariaLabel"
    />

    <span :class="'m3-radio-control'" aria-hidden="true">
      <span :class="'m3-radio-outer'" />
      <span :class="'m3-radio-inner'" />
      <span
        class="state-layer"
        data-state-layer-hover-from="target"
        style="position: absolute; width: 2.5rem; height: 2.5rem; border-radius: 1.25rem"
      />
    </span>

    <span v-if="$slots.default" :class="'m3-radio-label'"><slot /></span>
  </label>
</template>

<style src="./Radio.css"></style>

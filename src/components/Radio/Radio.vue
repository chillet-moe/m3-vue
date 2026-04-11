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
  <label
    :class="'m3-radio'"
    data-scope="radio"
    data-part="root"
    :aria-disabled="disabled ? 'true' : 'false'"
    data-state-layer-hover-target
  >
    <input
      v-model="checked"
      :class="'m3-radio-input'"
      data-scope="radio"
      data-part="input"
      type="radio"
      :disabled="disabled"
      :name="name"
      :value="value"
      :aria-label="ariaLabel"
    />

    <span :class="'m3-radio-control'" data-scope="radio" data-part="control" aria-hidden="true">
      <span :class="'m3-radio-outer'" data-scope="radio" data-part="outer" />
      <span :class="'m3-radio-inner'" data-scope="radio" data-part="inner" />
      <span class="state-layer" data-state-layer-hover-from="target" />
    </span>

    <span v-if="$slots.default" :class="'m3-radio-label'" data-scope="radio" data-part="label"><slot /></span>
  </label>
</template>

<style src="./Radio.css"></style>

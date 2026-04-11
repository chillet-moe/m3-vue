<script setup lang="ts">
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
  <label :class="'m3-checkbox'" data-scope="checkbox" data-part="root" :aria-disabled="disabled ? 'true' : 'false'" data-state-layer-hover-target>
    <input
      v-model="checked"
      :class="'m3-checkbox-input'"
      data-scope="checkbox"
      data-part="input"
      type="checkbox"
      :disabled="disabled"
      :name="name"
      :value="value"
      :aria-label="ariaLabel"
    />

    <span :class="'m3-checkbox-control'" data-scope="checkbox" data-part="control" aria-hidden="true">
      <span :class="'m3-checkbox-box'" data-scope="checkbox" data-part="box" />
      <span :class="'m3-checkbox-icon'" data-scope="checkbox" data-part="icon" />
      <span class="state-layer" data-state-layer-hover-from="target" />
    </span>

    <span v-if="$slots.default" :class="'m3-checkbox-label'" data-scope="checkbox" data-part="label"><slot /></span>
  </label>
</template>

<style src="./CheckBox.css"></style>

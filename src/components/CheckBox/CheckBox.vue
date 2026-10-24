<script setup lang="ts">
import { vStateLayer } from '@/components/StateLayer/state-layer';
export type CheckBoxProps = {
  /** Whether the checkbox is disabled. */
  disabled?: boolean;

  /** Render only the visual checkbox. The parent must provide interaction semantics. */
  presentation?: boolean;

  /** Name attribute for the native checkbox input. */
  name?: string;

  /** Value attribute for the native checkbox input. */
  value?: string;

  /** ARIA label forwarded to the native checkbox input. */
  ariaLabel?: string;
};

const { disabled = false, presentation = false, name, value, ariaLabel } = defineProps<CheckBoxProps>();

const checked = defineModel<boolean>('checked', { required: true });

defineSlots<{
  /** Optional label content rendered next to checkbox. */
  default(): any;
}>();
</script>

<template>
  <component
    :is="presentation ? 'span' : 'label'"
    :class="'m3-checkbox'"
    data-scope="checkbox"
    data-part="root"
    :data-checked="checked ? 'true' : 'false'"
    :data-disabled="disabled ? 'true' : 'false'"
    :data-presentation="presentation ? 'true' : 'false'"
    :aria-disabled="presentation ? undefined : disabled ? 'true' : 'false'"
    :aria-hidden="presentation ? 'true' : undefined"
    :data-state-layer-hover-target="presentation ? undefined : ''"
  >
    <input
      v-if="!presentation"
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

    <span
      v-state-layer
      :class="[presentation ? undefined : 'm3-state-layer', 'm3-checkbox-control']"
      data-scope="checkbox"
      data-part="control"
      :data-state-layer-hover-from="presentation ? undefined : 'target'"
      aria-hidden="true"
    >
      <span :class="'m3-checkbox-box'" data-scope="checkbox" data-part="box" />
      <span :class="'m3-checkbox-icon'" data-scope="checkbox" data-part="icon" />
    </span>

    <span v-if="$slots.default" :class="'m3-checkbox-label'" data-scope="checkbox" data-part="label"><slot /></span>
  </component>
</template>

<style src="./CheckBox.css"></style>

<script setup lang="ts">
import { useShape, type M3Shape } from '@/styles/shape';
import { vStateLayer } from '@/components/StateLayer/state-layer';
export type CheckBoxProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
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

const {
  shape: shapeProp,
  disabled = false,
  presentation = false,
  name,
  value,
  ariaLabel,
} = defineProps<CheckBoxProps>();

const indeterminate = defineModel<boolean>('indeterminate', { default: false });

function handleChange(event: Event) {
  if (disabled || presentation) return;
  checked.value = (event.target as HTMLInputElement).checked;
  indeterminate.value = false;
}

const checked = defineModel<boolean>('checked', { required: true });

defineSlots<{
  /** Optional label content rendered next to checkbox. */
  default(): any;
}>();
const shape = useShape(() => shapeProp);
</script>

<template>
  <component
    :is="presentation ? 'span' : 'label'"
    :class="'m3-checkbox'"
    data-scope="checkbox"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    :data-checked="checked || indeterminate ? 'true' : 'false'"
    :data-indeterminate="indeterminate ? 'true' : 'false'"
    :data-disabled="disabled ? 'true' : 'false'"
    :data-presentation="presentation ? 'true' : 'false'"
    :aria-disabled="presentation ? undefined : disabled ? 'true' : 'false'"
    :aria-hidden="presentation ? 'true' : undefined"
    :data-state-layer-hover-target="presentation ? undefined : ''"
  >
    <input
      v-if="!presentation"
      :checked="checked"
      :indeterminate.prop="indeterminate"
      :aria-checked="indeterminate ? 'mixed' : checked"
      @change="handleChange"
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

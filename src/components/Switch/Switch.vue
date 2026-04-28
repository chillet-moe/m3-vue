<script setup lang="ts">
import { computed } from 'vue';

export type SwitchProps = {
  /** Whether the switch is disabled. */
  disabled?: boolean;

  /** Icon name displayed when checked. */
  checkedIcon?: string;

  /** Icon name displayed when unchecked. */
  uncheckedIcon?: string;

  /** Name attribute for the native checkbox input. */
  name?: string;

  /** Value attribute for the native checkbox input. */
  value?: string;

  /** ARIA label forwarded to the native checkbox input. */
  ariaLabel?: string;
};

const { disabled = false, checkedIcon = 'check', uncheckedIcon, name, value, ariaLabel } = defineProps<SwitchProps>();

const checked = defineModel<boolean>('checked', { required: true });

const withIcon = computed(() => {
  return uncheckedIcon || checkedIcon;
});

defineSlots<{
  /** Optional label content rendered next to switch. */
  default(): any;
}>();
</script>

<template>
  <label
    :class="'m3-switch'"
    data-scope="switch"
    data-part="root"
    :aria-disabled="disabled ? 'true' : 'false'"
    data-state-layer-hover-target
  >
    <input
      v-model="checked"
      :class="'m3-switch-input'"
      data-scope="switch"
      data-part="input"
      type="checkbox"
      :disabled="disabled"
      :name="name"
      :value="value"
      :aria-label="ariaLabel"
    />

    <span
      :class="'m3-switch-control'"
      data-scope="switch"
      data-part="control"
      :data-with-icon="uncheckedIcon ? 'true' : 'false'"
      aria-hidden="true"
    >
      <span :class="'m3-switch-track'" data-scope="switch" data-part="track" />
      <span
        :class="['m3-state-layer', 'm3-switch-handle']"
        data-scope="switch"
        data-part="handle"
        data-state-layer-hover-from="target"
      >
        <span v-if="withIcon" :class="'m3-switch-icon'" data-scope="switch" data-part="icon">{{
          checked ? checkedIcon : uncheckedIcon
        }}</span>
      </span>
    </span>

    <span v-if="$slots.default" :class="'m3-switch-label'" data-scope="switch" data-part="label"><slot /></span>
  </label>
</template>

<style src="./Switch.css"></style>

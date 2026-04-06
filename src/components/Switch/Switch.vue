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
  <label :class="'m3-switch'" :aria-disabled="disabled ? 'true' : 'false'" data-state-layer-hover-target>
    <input
      v-model="checked"
      :class="'m3-switch-input'"
      type="checkbox"
      :disabled="disabled"
      :name="name"
      :value="value"
      :aria-label="ariaLabel"
    />

    <span :class="'m3-switch-control'" :data-with-icon="uncheckedIcon ? 'true' : 'false'" aria-hidden="true">
      <span :class="'m3-switch-track'" />
      <span :class="'m3-switch-handle'">
        <span v-if="withIcon" :class="'m3-switch-icon'">{{ checked ? checkedIcon : uncheckedIcon }}</span>
        <span
          class="state-layer"
          data-state-layer-hover-from="target"
          style="position: absolute; width: 2.5rem; height: 2.5rem; border-radius: 1.25rem"
        />
      </span>
    </span>

    <span v-if="$slots.default" :class="'m3-switch-label'"><slot /></span>
  </label>
</template>

<style src="./Switch.css"></style>

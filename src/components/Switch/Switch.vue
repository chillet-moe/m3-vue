<script setup lang="ts">
import style from './Switch.module.css';
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

const slots = defineSlots<{
  /** Optional label content rendered next to switch. */
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

    <span :class="style.control" :data-with-icon="uncheckedIcon ? 'true' : 'false'" aria-hidden="true">
      <span :class="style.track" />
      <span :class="style.handle">
        <span v-if="withIcon" :class="style.icon">{{ checked ? checkedIcon : uncheckedIcon }}</span>
        <span
          class="state-layer"
          data-state-layer-hover-from="target"
          style="position: absolute; width: 2.5rem; height: 2.5rem; border-radius: 1.25rem"
        />
      </span>
    </span>

    <span v-if="slots.default()" :class="style.label"><slot /></span>
  </label>
</template>

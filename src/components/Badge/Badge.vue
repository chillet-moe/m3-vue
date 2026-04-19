<script setup lang="ts">
import { computed } from 'vue';

export type BadgeProps = {
  /** Visual size of the badge. */
  variant?: 'small' | 'large';

  /** Content rendered inside large badges. */
  content?: number | string;

  /** Maximum number shown before using a "+" suffix. */
  max?: number;

  /** Whether to hide the badge. */
  hidden?: boolean;

  /** Accessible label. Defaults to the resolved content for large badges. */
  ariaLabel?: string;
};

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'small',
  content: undefined,
  max: 999,
  hidden: false,
  ariaLabel: undefined,
});

const normalizedMax = computed(() => {
  if (Number.isFinite(props.max) && props.max >= 0) {
    return Math.trunc(props.max);
  }

  return 999;
});

const resolvedContent = computed(() => {
  if (props.content === undefined || props.content === null) {
    return '';
  }

  if (typeof props.content === 'number' && Number.isFinite(props.content)) {
    const normalizedValue = Math.max(0, Math.trunc(props.content));

    if (normalizedValue > normalizedMax.value) {
      return `${normalizedMax.value}+`;
    }

    return String(normalizedValue);
  }

  return String(props.content);
});

const accessibleLabel = computed(() => {
  if (props.ariaLabel) {
    return props.ariaLabel;
  }

  if (props.variant === 'large' && resolvedContent.value) {
    return resolvedContent.value;
  }

  return undefined;
});

const ariaHidden = computed(() => {
  if (props.hidden) {
    return 'true';
  }

  if (accessibleLabel.value) {
    return undefined;
  }

  return 'true';
});

defineSlots<{
  /** Optional label content for large badges. */
  default(): any;
}>();
</script>

<template>
  <span
    class="m3-badge"
    data-scope="badge"
    data-part="root"
    :data-variant="variant"
    :data-hidden="hidden ? 'true' : 'false'"
    :aria-hidden="ariaHidden"
    :aria-label="accessibleLabel"
  >
    <span v-if="variant === 'large'" class="m3-badge-label" data-scope="badge" data-part="label">
      <slot>{{ resolvedContent }}</slot>
    </span>
  </span>
</template>

<style src="./Badge.css"></style>

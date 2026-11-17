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

const resolvedContent = computed(() => {
  const { content, max } = props;
  if (typeof content !== 'number' || !Number.isFinite(content)) return String(content ?? '');

  const count = Math.max(0, Math.trunc(content));
  const limit = Number.isFinite(max) && max >= 0 ? Math.trunc(max) : 999;
  return count > limit ? `${limit}+` : String(count);
});

const accessibleLabel = computed(
  () => props.ariaLabel || (props.variant === 'large' ? resolvedContent.value : '') || undefined,
);

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
    :aria-hidden="hidden || !accessibleLabel ? 'true' : undefined"
    :aria-label="accessibleLabel"
  >
    <span v-if="variant === 'large'" class="m3-badge-label" data-scope="badge" data-part="label">
      <slot>{{ resolvedContent }}</slot>
    </span>
  </span>
</template>

<style src="./Badge.css"></style>

<script setup lang="ts">
import Button, { type ButtonProps } from '@/components/Button/Button.vue';
import { computed } from 'vue';

export type PaginationLinkProps = {
  /** Marks the current page and applies active emphasis. */
  isActive?: boolean;

  /** Button variant. Defaults to `text` and switches to `outlined` for active pages. */
  variant?: ButtonProps['variant'];

  /** Button size variant. */
  size?: ButtonProps['size'];

  /** Button shape variant. */
  shape?: ButtonProps['shape'];

  /** Optional href. When omitted, renders as a native button. */
  href?: string;

  /** Disabled state. */
  disabled?: boolean;
};

const props = withDefaults(defineProps<PaginationLinkProps>(), {
  isActive: false,
  variant: undefined,
  size: 'small',
  shape: 'rounded',
  href: undefined,
  disabled: false,
});

defineSlots<{
  /** Link content, usually a page number. */
  default(): any;
}>();

const resolvedVariant = computed<ButtonProps['variant']>(() => {
  if (props.variant) {
    return props.variant;
  }

  return props.isActive ? 'outlined' : 'text';
});
</script>

<template>
  <Button
    class="m3-pagination-link"
    data-scope="pagination"
    data-part="link"
    :data-active="props.isActive ? 'true' : 'false'"
    :aria-current="props.isActive ? 'page' : undefined"
    :variant="resolvedVariant"
    :size="props.size"
    :shape="props.shape"
    :href="props.href"
    :disabled="props.disabled"
  >
    <slot />
  </Button>
</template>

<style src="./Pagination.css"></style>

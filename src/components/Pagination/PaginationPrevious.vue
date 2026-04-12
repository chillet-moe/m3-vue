<script setup lang="ts">
import { Icon } from '@/components/Icon';
import PaginationLink, { type PaginationLinkProps } from './PaginationLink.vue';

export type PaginationPreviousProps = Omit<PaginationLinkProps, 'isActive'> & {
  /** Screen text shown beside the icon on larger viewports. */
  text?: string;

  /** Accessible label for assistive technology. */
  ariaLabel?: string;
};

const props = withDefaults(defineProps<PaginationPreviousProps>(), {
  text: 'Previous',
  ariaLabel: 'Go to previous page',
  color: undefined,
  size: 'small',
  shape: 'rounded',
  href: undefined,
  disabled: false,
});
</script>

<template>
  <PaginationLink
    class="m3-pagination-previous"
    data-scope="pagination"
    data-part="previous"
    :aria-label="props.ariaLabel"
    :color="props.color"
    :size="props.size"
    :shape="props.shape"
    :href="props.href"
    :disabled="props.disabled"
  >
    <Icon
      name="chevron_left"
      class="m3-pagination-nav-icon"
      data-scope="pagination"
      data-part="previous-icon"
      aria-hidden="true"
    />
    <span class="m3-pagination-nav-text" data-scope="pagination" data-part="previous-text">{{ props.text }}</span>
  </PaginationLink>
</template>

<style src="./Pagination.css"></style>

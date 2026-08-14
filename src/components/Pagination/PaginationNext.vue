<script setup lang="ts">
import { Icon } from '@/components/Icon';
import PaginationLink, { type PaginationLinkProps } from './PaginationLink.vue';

export type PaginationNextProps = Omit<PaginationLinkProps, 'isActive'> & {
  /** Screen text shown beside the icon on larger viewports. */
  text?: string;

  /** Accessible label for assistive technology. */
  ariaLabel?: string;
};

const props = withDefaults(defineProps<PaginationNextProps>(), {
  text: 'Next',
  ariaLabel: 'Go to next page',
  variant: undefined,
  size: 'small',
  shape: undefined,
  href: undefined,
  disabled: false,
});
</script>

<template>
  <PaginationLink
    class="m3-pagination-next"
    data-scope="pagination"
    data-part="next"
    :aria-label="props.ariaLabel"
    :variant="props.variant"
    :size="props.size"
    :shape="props.shape"
    :href="props.href"
    :disabled="props.disabled"
  >
    <span class="m3-pagination-nav-text" data-scope="pagination" data-part="next-text">{{ props.text }}</span>
    <Icon
      name="chevron_right"
      class="m3-pagination-nav-icon"
      data-scope="pagination"
      data-part="next-icon"
      aria-hidden="true"
    />
  </PaginationLink>
</template>

<style src="./Pagination.css"></style>

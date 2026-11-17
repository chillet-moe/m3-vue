import { h, type PropType } from 'vue';
import { Icon } from '@/components/Icon';
import PaginationLink, { type PaginationLinkProps } from './PaginationLink.vue';

export type PaginationStepProps = Omit<PaginationLinkProps, 'isActive'> & {
  /** Text shown beside the icon on larger viewports. */
  text?: string;

  /** Accessible label for assistive technology. */
  ariaLabel?: string;
};

export const stepLinkProps = {
  /** Button variant. */
  variant: String as PropType<PaginationStepProps['variant']>,
  /** Button size variant. */
  size: { type: String as PropType<PaginationStepProps['size']>, default: 'small' },
  /** Button shape variant. */
  shape: String as PropType<PaginationStepProps['shape']>,
  /** Optional href. When omitted, renders as a native button. */
  href: String,
  /** Disabled state. */
  disabled: { type: Boolean, default: false },
};

export function renderPaginationStep(
  direction: 'previous' | 'next',
  { text, ariaLabel, ...props }: PaginationStepProps,
) {
  const next = direction === 'next';
  return h(
    PaginationLink,
    {
      ...props,
      class: `m3-pagination-${direction}`,
      'data-scope': 'pagination',
      'data-part': direction,
      'aria-label': ariaLabel,
    },
    () => {
      const label = h(
        'span',
        {
          class: 'm3-pagination-nav-text',
          'data-scope': 'pagination',
          'data-part': `${direction}-text`,
        },
        text,
      );
      const icon = h(Icon, {
        name: next ? 'chevron_right' : 'chevron_left',
        class: 'm3-pagination-nav-icon',
        'data-scope': 'pagination',
        'data-part': `${direction}-icon`,
        'aria-hidden': 'true',
      });
      return next ? [label, icon] : [icon, label];
    },
  );
}

<script lang="ts">
import { defineComponent } from 'vue';
import { renderPaginationStep, stepLinkProps, type PaginationStepProps } from './renderPaginationStep';

export type PaginationNextProps = PaginationStepProps;
export default defineComponent({
  name: 'PaginationNext',
  props: {
    ...stepLinkProps,
    /** Text shown beside the icon on larger viewports. */
    text: { type: String, default: 'Next' },
    /** Accessible label for assistive technology. */
    ariaLabel: { type: String, default: 'Go to next page' },
  },
  setup(props) {
    return () => renderPaginationStep('next', props);
  },
});
</script>

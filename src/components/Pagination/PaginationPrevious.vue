<script lang="ts">
import { defineComponent } from 'vue';
import { renderPaginationStep, stepLinkProps, type PaginationStepProps } from './renderPaginationStep';

export type PaginationPreviousProps = PaginationStepProps;
export default defineComponent({
  name: 'PaginationPrevious',
  props: {
    ...stepLinkProps,
    /** Text shown beside the icon on larger viewports. */
    text: { type: String, default: 'Previous' },
    /** Accessible label for assistive technology. */
    ariaLabel: { type: String, default: 'Go to previous page' },
  },
  setup(props) {
    return () => renderPaginationStep('previous', props);
  },
});
</script>

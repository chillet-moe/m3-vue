<script setup lang="ts">
import { useShape, type M3Shape } from '@/styles/shape';
import { computed, ref, useId, watch } from 'vue';
import { usePopover, type UsePopoverReturn } from '@/composables/usePopover';
import { acquireAnchorName } from '@/internal/anchorName';

export type PopoverPlacement =
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'start'
  | 'start-top'
  | 'start-bottom'
  | 'end'
  | 'end-top'
  | 'end-bottom';

export type PopoverProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
  /** Optional explicit id for the popover element. */
  id?: string;

  /** Native popover behavior. */
  popover?: 'auto' | 'manual' | 'hint';

  /** Preferred placement relative to the anchor. */
  placement?: PopoverPlacement;

  /** CSS anchor name used to position the popover. */
  anchorName?: string;

  /** Element used as the position anchor and showPopover source. */
  anchorElement?: HTMLElement;

  /** Whether the popover surface should match the anchor width. */
  matchAnchorWidth?: boolean;

  /** Accessible role for authored interactive content. */
  role?: string;

  /** Accessible label for the popover surface. */
  ariaLabel?: string;

  /** Element id that labels the popover surface. */
  ariaLabelledBy?: string;
};

const props = withDefaults(defineProps<PopoverProps>(), {
  id: undefined,
  popover: 'auto',
  placement: 'bottom-start',
  anchorName: undefined,
  anchorElement: undefined,
  matchAnchorWidth: false,
  role: undefined,
  ariaLabel: undefined,
  ariaLabelledBy: undefined,
});

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  /** Fired after the Popover-owned visual exit finishes. */
  closed: [];
}>();

const generatedId = useId();
const popoverRef = ref<HTMLDivElement>();
const surfaceRef = ref<HTMLDivElement>();
const cssId = computed(() => generatedId.replace(/[^a-zA-Z0-9_-]/g, '-'));
const popoverId = computed(() => props.id ?? `m3-popover-${generatedId}`);
const resolvedAnchorName = computed(
  () => props.anchorName ?? (props.anchorElement ? `--m3-popover-${cssId.value}` : undefined),
);
const popoverStyle = computed(() => {
  if (!resolvedAnchorName.value) {
    return undefined;
  }

  return {
    'position-anchor': resolvedAnchorName.value,
  };
});

const popover = usePopover({
  open,
  popoverRef,
  anchorElement: () => props.anchorElement,
  exitElements: () => [surfaceRef.value],
  onAfterClose: () => emit('closed'),
});

watch(
  [() => props.anchorElement, resolvedAnchorName],
  ([anchorElement, anchorName], _previous, onCleanup) => {
    if (!anchorElement || !anchorName) {
      return;
    }

    onCleanup(acquireAnchorName(anchorElement, anchorName));
  },
  {
    immediate: true,
    flush: 'post',
  },
);

defineSlots<{
  /** Popover content. */
  default(props: {
    open: boolean;
    show: UsePopoverReturn['show'];
    hide: UsePopoverReturn['hide'];
    toggle: UsePopoverReturn['toggle'];
  }): any;
}>();

defineExpose({
  popoverEl: popoverRef,
  show: popover.show,
  hide: popover.hide,
  toggle: popover.toggle,
});
const shape = useShape(() => props.shape);
</script>

<template>
  <div
    :id="popoverId"
    ref="popoverRef"
    class="m3-popover"
    data-scope="popover"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    :data-placement="placement"
    :data-match-anchor-width="matchAnchorWidth ? 'true' : 'false'"
    :popover="props.popover"
    :role="role"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledBy"
    :style="popoverStyle"
    @toggle="popover.handlePopoverToggle"
  >
    <div ref="surfaceRef" class="m3-popover-surface" data-scope="popover" data-part="surface">
      <slot :open="open" :show="popover.show" :hide="popover.hide" :toggle="popover.toggle" />
    </div>
  </div>
</template>

<style src="./Popover.css"></style>

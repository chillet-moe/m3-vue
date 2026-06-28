<script setup lang="ts">
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

  /** Teleport target. Set to false to render in place. */
  teleport?: boolean | string;
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
  teleport: 'body',
});

const open = defineModel<boolean>('open', { default: false });

const generatedId = useId();
const popoverRef = ref<HTMLDivElement>();
const cssId = computed(() => generatedId.replace(/[^a-zA-Z0-9_-]/g, '-'));
const popoverId = computed(() => props.id ?? `m3-popover-${generatedId}`);
const resolvedAnchorName = computed(
  () => props.anchorName ?? (props.anchorElement ? `--m3-popover-${cssId.value}` : undefined),
);
const teleportTarget = computed(() => (props.teleport === true || props.teleport === false ? 'body' : props.teleport));
const teleportDisabled = computed(() => props.teleport === false);
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
</script>

<template>
  <Teleport :to="teleportTarget" :disabled="teleportDisabled">
    <div
      :id="popoverId"
      ref="popoverRef"
      class="m3-popover"
      data-scope="popover"
      data-part="root"
      :data-placement="placement"
      :data-match-anchor-width="matchAnchorWidth ? 'true' : 'false'"
      :popover="props.popover"
      :role="role"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledBy"
      :style="popoverStyle"
      @toggle="popover.handlePopoverToggle"
    >
      <div class="m3-popover-surface" data-scope="popover" data-part="surface">
        <slot :open="open" :show="popover.show" :hide="popover.hide" :toggle="popover.toggle" />
      </div>
    </div>
  </Teleport>
</template>

<style src="./Popover.css"></style>

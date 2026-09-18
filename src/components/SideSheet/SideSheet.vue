<script setup lang="ts">
import { useNativeDialog } from '@/composables/useNativeDialog';
import { computed, type CSSProperties, useId, useSlots, useTemplateRef } from 'vue';

export type SideSheetProps = {
  /** Whether clicking the backdrop closes the sheet. */
  closeOnBackdrop?: boolean;

  /** Whether page scrolling behind the sheet is locked while open. */
  lockScroll?: boolean;

  /** Which viewport side the sheet enters from. */
  side?: 'start' | 'end';

  /** Sheet visual style. */
  variant?: 'docked' | 'detached';

  /** Sheet surface width. Such as '20rem'. */
  width?: string;
};

const props = withDefaults(defineProps<SideSheetProps>(), {
  closeOnBackdrop: true,
  lockScroll: true,
  side: 'end',
  variant: 'docked',
  width: undefined,
});

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  /** Fired when the user requests closing the sheet, such as pressing Escape. */
  cancel: [event: Event];

  /** Fired when the native dialog closes. Receives its return value. */
  close: [returnValue: string];

  /** Fired after the sheet's visual exit finishes. Receives the native dialog return value. */
  closed: [returnValue: string];
}>();

defineSlots<{
  /** Optional sheet headline. */
  headline(): any;

  /** Sheet body content. */
  default(): any;

  /** Optional action row. */
  actions(): any;
}>();

const slots = useSlots();
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog');
const surfaceRef = useTemplateRef<HTMLElement>('surface');
const headlineRef = useTemplateRef<HTMLElement>('headline');
const contentRef = useTemplateRef<HTMLElement>('content');
const actionsRef = useTemplateRef<HTMLElement>('actions');

const headlineId = `side-sheet-headline-${useId()}`;
const contentId = `side-sheet-content-${useId()}`;

const hasHeadline = computed(() => Boolean(slots.headline));
const hasContent = computed(() => Boolean(slots.default));
const hasActions = computed(() => Boolean(slots.actions));

const rootStyle = computed<CSSProperties>(() => {
  const style: Record<string, string> = {};

  if (props.width) {
    style['--md-side-sheet-width'] = props.width;
  }

  return style as CSSProperties;
});

const { showModal, close, onCancel, onClose, onBackdropClick } = useNativeDialog({
  dialogRef,
  open,
  closeOnBackdrop: () => props.closeOnBackdrop,
  exitElements: () => [surfaceRef.value, headlineRef.value, contentRef.value, actionsRef.value],
  lockScroll: () => props.lockScroll,
  onCancel: (event) => emit('cancel', event),
  onClose: (returnValue) => emit('close', returnValue),
  onClosed: (returnValue) => emit('closed', returnValue),
});

defineExpose({
  showModal,
  close,
  dialogRef,
});
</script>

<template>
  <dialog
    ref="dialog"
    class="m3-side-sheet"
    data-scope="side-sheet"
    data-part="root"
    :data-side="props.side"
    :data-variant="props.variant"
    :data-has-headline="hasHeadline ? 'true' : 'false'"
    :data-has-actions="hasActions ? 'true' : 'false'"
    :style="rootStyle"
    :aria-labelledby="hasHeadline ? headlineId : undefined"
    :aria-describedby="hasContent ? contentId : undefined"
    @cancel="onCancel"
    @close="onClose"
    @click="onBackdropClick"
  >
    <div ref="surface" class="m3-side-sheet-surface" data-scope="side-sheet" data-part="surface">
      <h2
        v-if="hasHeadline"
        :id="headlineId"
        ref="headline"
        class="m3-side-sheet-headline"
        data-scope="side-sheet"
        data-part="headline"
      >
        <slot name="headline" />
      </h2>

      <div
        v-if="hasContent"
        :id="contentId"
        ref="content"
        class="m3-side-sheet-content"
        data-scope="side-sheet"
        data-part="content"
      >
        <slot />
      </div>

      <div v-if="hasActions" ref="actions" class="m3-side-sheet-actions" data-scope="side-sheet" data-part="actions">
        <slot name="actions" />
      </div>
    </div>
  </dialog>
</template>

<style src="./SideSheet.css"></style>

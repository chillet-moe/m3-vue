<script setup lang="ts">
import { useShape, type M3Shape } from '@/styles/shape';
import { useNativeDialog } from '@/composables/useNativeDialog';
import { computed, type CSSProperties, useId, useTemplateRef } from 'vue';

export type SideSheetProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
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

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog');
const headlineRef = useTemplateRef<HTMLElement>('headline');
const contentRef = useTemplateRef<HTMLElement>('content');
const actionsRef = useTemplateRef<HTMLElement>('actions');

const headlineId = `side-sheet-headline-${useId()}`;
const contentId = `side-sheet-content-${useId()}`;

const rootStyle = computed<CSSProperties>(() => (props.width ? { '--md-side-sheet-width': props.width } : {}));

const { showModal, close, onBeforeToggle, onCancel, onClose, onBackdropClick } = useNativeDialog({
  dialogRef,
  open,
  closeOnBackdrop: () => props.closeOnBackdrop,
  exitElements: () => [headlineRef.value, contentRef.value, actionsRef.value],
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
const shape = useShape(() => props.shape);
</script>

<template>
  <dialog
    ref="dialog"
    class="m3-side-sheet"
    data-scope="side-sheet"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    :data-side="props.side"
    :data-variant="props.variant"
    :style="rootStyle"
    :aria-labelledby="$slots.headline ? headlineId : undefined"
    :aria-describedby="$slots.default ? contentId : undefined"
    @beforetoggle="onBeforeToggle"
    @cancel="onCancel"
    @close="onClose"
    @click="onBackdropClick"
  >
    <h2
      v-if="$slots.headline"
      :id="headlineId"
      ref="headline"
      class="m3-side-sheet-headline"
      data-scope="side-sheet"
      data-part="headline"
    >
      <slot name="headline" />
    </h2>

    <div
      v-if="$slots.default"
      :id="contentId"
      ref="content"
      class="m3-side-sheet-content"
      data-scope="side-sheet"
      data-part="content"
    >
      <slot />
    </div>

    <div v-if="$slots.actions" ref="actions" class="m3-side-sheet-actions" data-scope="side-sheet" data-part="actions">
      <slot name="actions" />
    </div>
  </dialog>
</template>

<style src="./SideSheet.css"></style>

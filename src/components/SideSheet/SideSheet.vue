<script setup lang="ts">
import { lockPageScroll } from '@/internal/scrollLock/scrollLock';
import { computed, onUnmounted, type CSSProperties, useId, useSlots, useTemplateRef, watch } from 'vue';

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

  /** Fired after the sheet closes. Receives the native dialog return value. */
  close: [returnValue: string];
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

const headlineId = `side-sheet-headline-${useId()}`;
const contentId = `side-sheet-content-${useId()}`;

const hasHeadline = computed(() => Boolean(slots.headline));
const hasContent = computed(() => Boolean(slots.default));
const hasActions = computed(() => Boolean(slots.actions));
let releaseScrollLock: (() => void) | undefined;

const rootStyle = computed<CSSProperties>(() => {
  const style: Record<string, string> = {};

  if (props.width) {
    style['--md-side-sheet-width'] = props.width;
  }

  return style as CSSProperties;
});

const showDialog = () => {
  const dialog = dialogRef.value;

  if (!dialog || dialog.open) {
    return;
  }

  dialog.showModal();
};

const closeDialog = (returnValue?: string) => {
  const dialog = dialogRef.value;

  if (!dialog || !dialog.open) {
    return;
  }

  dialog.close(returnValue);
};

const acquireScrollLock = () => {
  releaseScrollLock ??= lockPageScroll();
};

const releaseScrollLockIfNeeded = () => {
  releaseScrollLock?.();
  releaseScrollLock = undefined;
};

const syncScrollLock = () => {
  if (open.value && props.lockScroll) {
    acquireScrollLock();
    return;
  }

  releaseScrollLockIfNeeded();
};

watch(
  [dialogRef, open, () => props.lockScroll],
  ([dialog]) => {
    if (!dialog) {
      return;
    }

    if (open.value) {
      syncScrollLock();
      showDialog();
      return;
    }

    releaseScrollLockIfNeeded();
    closeDialog();
  },
  {
    immediate: true,
    flush: 'post',
  },
);

const onCancel = (event: Event) => {
  emit('cancel', event);
};

const onClose = (event: Event) => {
  const dialog = event.currentTarget as HTMLDialogElement;

  releaseScrollLockIfNeeded();

  if (open.value) {
    open.value = false;
  }

  emit('close', dialog.returnValue);
};

const onClick = (event: MouseEvent) => {
  if (!props.closeOnBackdrop || event.target !== dialogRef.value) {
    return;
  }

  closeDialog();
};

const showModal = () => {
  open.value = true;
  showDialog();
};

const close = (returnValue?: string) => {
  open.value = false;
  closeDialog(returnValue);
};

defineExpose({
  showModal,
  close,
  dialogRef,
});

onUnmounted(() => {
  releaseScrollLockIfNeeded();
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
    @click="onClick"
  >
    <div class="m3-side-sheet-surface" data-scope="side-sheet" data-part="surface">
      <h2
        v-if="hasHeadline"
        :id="headlineId"
        class="m3-side-sheet-headline"
        data-scope="side-sheet"
        data-part="headline"
      >
        <slot name="headline" />
      </h2>

      <div v-if="hasContent" :id="contentId" class="m3-side-sheet-content" data-scope="side-sheet" data-part="content">
        <slot />
      </div>

      <div v-if="hasActions" class="m3-side-sheet-actions" data-scope="side-sheet" data-part="actions">
        <slot name="actions" />
      </div>
    </div>
  </dialog>
</template>

<style src="./SideSheet.css"></style>

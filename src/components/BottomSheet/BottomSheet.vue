<script setup lang="ts">
import { lockPageScroll } from '@/internal/scrollLock/scrollLock';
import { computed, onMounted, onUnmounted, ref, type CSSProperties, useId, useSlots, useTemplateRef, watch } from 'vue';

export type BottomSheetProps = {
  /** Whether clicking the backdrop closes the sheet. */
  closeOnBackdrop?: boolean;

  /** Whether to show the Material drag handle. */
  showDragHandle?: boolean;

  /** Maximum block size of the sheet surface. Such as '80vh'. */
  maxHeight?: string;
};

const props = withDefaults(defineProps<BottomSheetProps>(), {
  closeOnBackdrop: true,
  showDragHandle: true,
  maxHeight: undefined,
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
const surfaceRef = useTemplateRef<HTMLElement>('surface');
const contentRef = useTemplateRef<HTMLElement>('content');

const headlineId = `bottom-sheet-headline-${useId()}`;
const contentId = `bottom-sheet-content-${useId()}`;

const hasHeadline = computed(() => Boolean(slots.headline));
const hasContent = computed(() => Boolean(slots.default));
const hasActions = computed(() => Boolean(slots.actions));

const dragOffset = ref(0);
const dragging = ref(false);

let dragPointerId: number | undefined;
let dragStartY = 0;
let dragLastY = 0;
let dragLastTime = 0;
let dragVelocity = 0;
let dragStartedInContent = false;
let dragActive = false;
let touchDragActive = false;
let releaseScrollLock: (() => void) | undefined;
let removeTouchListeners: (() => void) | undefined;

const rootStyle = computed<CSSProperties>(() => {
  const style: Record<string, string> = {
    '--md-bottom-sheet-drag-offset': `${dragOffset.value}px`,
    '--md-bottom-sheet-translate-offset': `${Math.max(0, dragOffset.value)}px`,
    '--md-bottom-sheet-background-extension': `${Math.max(0, -dragOffset.value)}px`,
  };

  if (props.maxHeight) {
    style['--md-bottom-sheet-max-height'] = props.maxHeight;
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

const resetDrag = () => {
  dragOffset.value = 0;
  dragging.value = false;
  dragPointerId = undefined;
  dragStartY = 0;
  dragLastY = 0;
  dragLastTime = 0;
  dragVelocity = 0;
  dragStartedInContent = false;
  dragActive = false;
  touchDragActive = false;
};

watch(
  [dialogRef, open],
  ([dialog]) => {
    if (!dialog) {
      return;
    }

    if (open.value) {
      resetDrag();
      acquireScrollLock();
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

  resetDrag();
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

const getEventTime = () => (typeof performance === 'undefined' ? Date.now() : performance.now());

const getResistedDragOffset = (deltaY: number) => {
  if (deltaY >= 0) {
    return deltaY;
  }

  return -Math.min(28, Math.abs(deltaY) * 0.22);
};

const canStartDragFromContent = (deltaY: number) => {
  if (!dragStartedInContent || deltaY === 0) {
    return true;
  }

  const content = contentRef.value;

  if (!content) {
    return true;
  }

  if (deltaY > 0) {
    return content.scrollTop <= 0;
  }

  return false;
};

const onSurfacePointerDown = (event: PointerEvent) => {
  if (event.pointerType === 'touch') {
    return;
  }

  if (event.isPrimary === false || event.button > 0 || !dialogRef.value?.open) {
    return;
  }

  const content = contentRef.value;
  dragPointerId = event.pointerId;
  dragStartY = event.clientY;
  dragLastY = event.clientY;
  dragLastTime = getEventTime();
  dragVelocity = 0;
  dragStartedInContent = content ? content.contains(event.target as Node) : false;
  dragActive = false;
};

const onSurfacePointerMove = (event: PointerEvent) => {
  if (event.pointerType === 'touch') {
    return;
  }

  if (dragPointerId !== event.pointerId) {
    return;
  }

  const deltaY = event.clientY - dragStartY;
  const absDeltaY = Math.abs(deltaY);

  if (!dragActive) {
    if (absDeltaY < 6 || !canStartDragFromContent(deltaY)) {
      return;
    }

    dragActive = true;
    dragging.value = true;
    surfaceRef.value?.setPointerCapture?.(event.pointerId);
  }

  event.preventDefault();

  const now = getEventTime();
  const elapsed = Math.max(now - dragLastTime, 1);
  dragVelocity = (event.clientY - dragLastY) / elapsed;
  dragLastY = event.clientY;
  dragLastTime = now;
  dragOffset.value = getResistedDragOffset(deltaY);
};

const finishSurfaceDrag = (event: PointerEvent) => {
  if (event.pointerType === 'touch') {
    return;
  }

  if (dragPointerId !== event.pointerId) {
    return;
  }

  finishDrag();
};

const finishDrag = () => {
  const surfaceHeight = surfaceRef.value?.offsetHeight ?? 0;
  const closeDistance = surfaceHeight > 0 ? Math.min(surfaceHeight * 0.35, 160) : 96;
  const shouldClose = dragOffset.value > closeDistance || (dragOffset.value > 24 && dragVelocity > 0.45);

  dragging.value = false;
  dragPointerId = undefined;
  dragStartedInContent = false;
  dragActive = false;
  touchDragActive = false;

  if (shouldClose) {
    close();
    return;
  }

  dragOffset.value = 0;
};

const onSurfaceTouchStart = (event: TouchEvent) => {
  if (event.touches.length !== 1 || !dialogRef.value?.open) {
    return;
  }

  const touch = event.touches[0];
  const content = contentRef.value;

  dragPointerId = undefined;
  dragStartY = touch.clientY;
  dragLastY = touch.clientY;
  dragLastTime = getEventTime();
  dragVelocity = 0;
  dragStartedInContent = content ? content.contains(event.target as Node) : false;
  dragActive = false;
  touchDragActive = true;
};

const onSurfaceTouchMove = (event: TouchEvent) => {
  if (!touchDragActive || event.touches.length !== 1) {
    return;
  }

  const touch = event.touches[0];
  const deltaY = touch.clientY - dragStartY;
  const absDeltaY = Math.abs(deltaY);

  if (!dragActive) {
    if (absDeltaY < 6 || !canStartDragFromContent(deltaY)) {
      return;
    }

    dragActive = true;
    dragging.value = true;
  }

  event.preventDefault();

  const now = getEventTime();
  const elapsed = Math.max(now - dragLastTime, 1);
  dragVelocity = (touch.clientY - dragLastY) / elapsed;
  dragLastY = touch.clientY;
  dragLastTime = now;
  dragOffset.value = getResistedDragOffset(deltaY);
};

const finishSurfaceTouchDrag = () => {
  if (!touchDragActive) {
    return;
  }

  finishDrag();
};

defineExpose({
  showModal,
  close,
  dialogRef,
});

onUnmounted(() => {
  releaseScrollLockIfNeeded();
  removeTouchListeners?.();
});

onMounted(() => {
  const surface = surfaceRef.value;

  if (!surface) {
    return;
  }

  surface.addEventListener('touchstart', onSurfaceTouchStart, { passive: true });
  surface.addEventListener('touchmove', onSurfaceTouchMove, { passive: false });
  surface.addEventListener('touchend', finishSurfaceTouchDrag);
  surface.addEventListener('touchcancel', finishSurfaceTouchDrag);

  removeTouchListeners = () => {
    surface.removeEventListener('touchstart', onSurfaceTouchStart);
    surface.removeEventListener('touchmove', onSurfaceTouchMove);
    surface.removeEventListener('touchend', finishSurfaceTouchDrag);
    surface.removeEventListener('touchcancel', finishSurfaceTouchDrag);
  };
});
</script>

<template>
  <dialog
    ref="dialog"
    class="m3-bottom-sheet"
    data-scope="bottom-sheet"
    data-part="root"
    :data-has-drag-handle="props.showDragHandle ? 'true' : 'false'"
    :data-has-headline="hasHeadline ? 'true' : 'false'"
    :data-has-actions="hasActions ? 'true' : 'false'"
    :data-dragging="dragging ? 'true' : 'false'"
    :style="rootStyle"
    :aria-labelledby="hasHeadline ? headlineId : undefined"
    :aria-describedby="hasContent ? contentId : undefined"
    @cancel="onCancel"
    @close="onClose"
    @click="onClick"
  >
    <div
      ref="surface"
      class="m3-bottom-sheet-surface"
      data-scope="bottom-sheet"
      data-part="surface"
      @pointerdown="onSurfacePointerDown"
      @pointermove="onSurfacePointerMove"
      @pointerup="finishSurfaceDrag"
      @pointercancel="finishSurfaceDrag"
      @lostpointercapture="finishSurfaceDrag"
    >
      <div
        v-if="props.showDragHandle"
        class="m3-bottom-sheet-drag-handle"
        data-scope="bottom-sheet"
        data-part="drag-handle"
        aria-hidden="true"
      />

      <h2
        v-if="hasHeadline"
        :id="headlineId"
        class="m3-bottom-sheet-headline"
        data-scope="bottom-sheet"
        data-part="headline"
      >
        <slot name="headline" />
      </h2>

      <div
        v-if="hasContent"
        ref="content"
        :id="contentId"
        class="m3-bottom-sheet-content"
        data-scope="bottom-sheet"
        data-part="content"
      >
        <slot />
      </div>

      <div v-if="hasActions" class="m3-bottom-sheet-actions" data-scope="bottom-sheet" data-part="actions">
        <slot name="actions" />
      </div>
    </div>
  </dialog>
</template>

<style src="./BottomSheet.css"></style>

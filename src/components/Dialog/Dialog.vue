<script setup lang="ts">
import { lockPageScroll } from '@/internal/scrollLock/scrollLock';
import { computed, onUnmounted, useId, useSlots, useTemplateRef, watch } from 'vue';

export type DialogProps = {
  /** Whether clicking the backdrop closes the dialog. */
  closeOnBackdrop?: boolean;
};

const { closeOnBackdrop = true } = defineProps<DialogProps>();

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  /** Fired when the user requests closing the dialog, such as pressing Escape. */
  cancel: [event: Event];

  /** Fired after the dialog closes. Receives the native dialog return value. */
  close: [returnValue: string];
}>();

defineSlots<{
  /** Optional leading icon content. */
  icon(): any;

  /** Optional dialog headline. */
  headline(): any;

  /** Supporting text or custom body content. */
  default(): any;

  /** Action buttons row. */
  actions(): any;
}>();

const slots = useSlots();
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog');

const headlineId = `dialog-headline-${useId()}`;
const contentId = `dialog-content-${useId()}`;

const hasIcon = computed(() => Boolean(slots.icon));
const hasHeadline = computed(() => Boolean(slots.headline));
const hasContent = computed(() => Boolean(slots.default));
const hasActions = computed(() => Boolean(slots.actions));
let releaseScrollLock: (() => void) | undefined;

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

watch(
  [dialogRef, open],
  ([dialog]) => {
    if (!dialog) {
      return;
    }

    if (open.value) {
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

  releaseScrollLockIfNeeded();

  if (open.value) {
    open.value = false;
  }

  emit('close', dialog.returnValue);
};

const onClick = (event: MouseEvent) => {
  if (!closeOnBackdrop || event.target !== dialogRef.value) {
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
    :class="'m3-dialog'"
    data-scope="dialog"
    data-part="root"
    :data-has-icon="hasIcon ? 'true' : 'false'"
    :data-has-headline="hasHeadline ? 'true' : 'false'"
    :data-has-actions="hasActions ? 'true' : 'false'"
    :aria-labelledby="hasHeadline ? headlineId : undefined"
    :aria-describedby="hasContent ? contentId : undefined"
    @cancel="onCancel"
    @close="onClose"
    @click="onClick"
  >
    <div class="m3-dialog-surface" data-scope="dialog" data-part="surface">
      <div v-if="hasIcon" :class="'m3-dialog-icon'" data-scope="dialog" data-part="icon">
        <slot name="icon" />
      </div>

      <h2 v-if="hasHeadline" :id="headlineId" :class="'m3-dialog-headline'" data-scope="dialog" data-part="headline">
        <slot name="headline" />
      </h2>

      <div v-if="hasContent" :id="contentId" :class="'m3-dialog-content'" data-scope="dialog" data-part="content">
        <slot />
      </div>

      <div v-if="hasActions" :class="'m3-dialog-actions'" data-scope="dialog" data-part="actions">
        <slot name="actions" />
      </div>
    </div>
  </dialog>
</template>

<style src="./Dialog.css"></style>

<script setup lang="ts">
import { computed, useId, useSlots, useTemplateRef, watch } from 'vue';
import style from './Dialog.module.css';

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

const showDialog = () => {
  const dialog = dialogRef.value;

  if (!dialog || dialog.open) {
    return;
  }

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
    return;
  }

  dialog.setAttribute('open', '');
};

const closeDialog = (returnValue?: string) => {
  const dialog = dialogRef.value;

  if (!dialog || !dialog.open) {
    return;
  }

  if (typeof dialog.close === 'function') {
    dialog.close(returnValue);
    return;
  }

  if (returnValue !== undefined) {
    dialog.returnValue = returnValue;
  }

  dialog.removeAttribute('open');
  dialog.dispatchEvent(new Event('close'));
};

watch(
  [dialogRef, open],
  ([dialog]) => {
    if (!dialog) {
      return;
    }

    if (open.value) {
      showDialog();
      return;
    }

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
</script>

<template>
  <dialog
    ref="dialog"
    :class="style.dialog"
    :data-has-icon="hasIcon ? 'true' : 'false'"
    :data-has-headline="hasHeadline ? 'true' : 'false'"
    :data-has-actions="hasActions ? 'true' : 'false'"
    :aria-labelledby="hasHeadline ? headlineId : undefined"
    :aria-describedby="hasContent ? contentId : undefined"
    @cancel="onCancel"
    @close="onClose"
    @click="onClick"
  >
    <div v-if="hasIcon" :class="style.icon">
      <slot name="icon" />
    </div>

    <h2 v-if="hasHeadline" :id="headlineId" :class="style.headline">
      <slot name="headline" />
    </h2>

    <div v-if="hasContent" :id="contentId" :class="style.content">
      <slot />
    </div>

    <div v-if="hasActions" :class="style.actions">
      <slot name="actions" />
    </div>
  </dialog>
</template>

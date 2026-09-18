<script setup lang="ts">
import { useNativeDialog } from '@/composables/useNativeDialog';
import { computed, type CSSProperties, useId, useSlots, useTemplateRef } from 'vue';

export type DialogProps = {
  /** Whether clicking the backdrop closes the dialog. */
  closeOnBackdrop?: boolean;

  /** Dialog surface width. Such as '28rem'. */
  width?: string;
};

const props = withDefaults(defineProps<DialogProps>(), {
  closeOnBackdrop: true,
  width: undefined,
});

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  /** Fired when the user requests closing the dialog, such as pressing Escape. */
  cancel: [event: Event];

  /** Fired when the native dialog closes. Receives its return value. */
  close: [returnValue: string];

  /** Fired after the dialog's visual exit finishes. Receives the native dialog return value. */
  closed: [returnValue: string];
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
const surfaceRef = useTemplateRef<HTMLElement>('surface');
const iconRef = useTemplateRef<HTMLElement>('icon');
const headlineRef = useTemplateRef<HTMLElement>('headline');
const contentRef = useTemplateRef<HTMLElement>('content');
const actionsRef = useTemplateRef<HTMLElement>('actions');

const headlineId = `dialog-headline-${useId()}`;
const contentId = `dialog-content-${useId()}`;

const hasIcon = computed(() => Boolean(slots.icon));
const hasHeadline = computed(() => Boolean(slots.headline));
const hasContent = computed(() => Boolean(slots.default));
const hasActions = computed(() => Boolean(slots.actions));

const rootStyle = computed<CSSProperties>(() => {
  const style: Record<string, string> = {};

  if (props.width) {
    style['--md-dialog-container-width'] = props.width;
  }

  return style as CSSProperties;
});

const { showModal, close, onCancel, onClose, onBackdropClick } = useNativeDialog({
  dialogRef,
  open,
  closeOnBackdrop: () => props.closeOnBackdrop,
  exitElements: () => [surfaceRef.value, iconRef.value, headlineRef.value, contentRef.value, actionsRef.value],
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
    :class="'m3-dialog'"
    data-scope="dialog"
    data-part="root"
    :data-has-icon="hasIcon ? 'true' : 'false'"
    :data-has-headline="hasHeadline ? 'true' : 'false'"
    :data-has-actions="hasActions ? 'true' : 'false'"
    :style="rootStyle"
    :aria-labelledby="hasHeadline ? headlineId : undefined"
    :aria-describedby="hasContent ? contentId : undefined"
    @cancel="onCancel"
    @close="onClose"
    @click="onBackdropClick"
  >
    <div ref="surface" class="m3-dialog-surface" data-scope="dialog" data-part="surface">
      <div v-if="hasIcon" ref="icon" :class="'m3-dialog-icon'" data-scope="dialog" data-part="icon">
        <slot name="icon" />
      </div>

      <h2
        v-if="hasHeadline"
        :id="headlineId"
        ref="headline"
        :class="'m3-dialog-headline'"
        data-scope="dialog"
        data-part="headline"
      >
        <slot name="headline" />
      </h2>

      <div
        v-if="hasContent"
        :id="contentId"
        ref="content"
        :class="'m3-dialog-content'"
        data-scope="dialog"
        data-part="content"
      >
        <slot />
      </div>

      <div v-if="hasActions" ref="actions" :class="'m3-dialog-actions'" data-scope="dialog" data-part="actions">
        <slot name="actions" />
      </div>
    </div>
  </dialog>
</template>

<style src="./Dialog.css"></style>

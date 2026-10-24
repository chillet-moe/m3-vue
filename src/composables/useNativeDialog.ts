import { useElementEnvironment } from '@/internal/elementEnvironment';
import { onUnmounted, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';
import { lockPageScroll } from '@/internal/scrollLock/scrollLock';
import { useExitMotionCompletion } from './useExitMotionCompletion';

type DialogRef = Readonly<Ref<HTMLDialogElement | null | undefined>>;

export type UseNativeDialogOptions = {
  dialogRef: DialogRef;
  open: Ref<boolean>;
  exitElements?: () => readonly (HTMLElement | null | undefined)[];
  closeOnBackdrop?: MaybeRefOrGetter<boolean | undefined>;
  lockScroll?: MaybeRefOrGetter<boolean | undefined>;
  onBeforeOpen?: () => void;
  onCancel?: (event: Event) => void;
  onClose?: (returnValue: string, event: Event) => void;
  onClosed?: (returnValue: string) => void;
};

export function useNativeDialog(options: UseNativeDialogOptions) {
  let releaseScrollLock: (() => void) | undefined;

  const shouldLockScroll = () => toValue(options.lockScroll) !== false;
  const shouldCloseOnBackdrop = () => toValue(options.closeOnBackdrop) !== false;
  const exitCompletion = useExitMotionCompletion<string, HTMLDialogElement>({
    rootRef: options.dialogRef,
    open: options.open,
    ownedElements: options.exitElements,
    onComplete: options.onClosed,
  });

  const showDialogElement = () => {
    const dialog = options.dialogRef.value;

    if (!dialog || dialog.open || !dialog.isConnected || dialog.ownerDocument.defaultView?.closed) {
      return;
    }

    dialog.showModal();
  };

  const closeDialogElement = (returnValue?: string) => {
    const dialog = options.dialogRef.value;

    if (!dialog || !dialog.open) {
      return;
    }

    dialog.close(returnValue);
  };

  const acquireScrollLock = () => {
    if (!shouldLockScroll() || options.dialogRef.value?.ownerDocument.defaultView?.closed) {
      return;
    }

    if (options.dialogRef.value) releaseScrollLock ??= lockPageScroll(options.dialogRef.value.ownerDocument);
  };

  const releaseScrollLockIfNeeded = () => {
    releaseScrollLock?.();
    releaseScrollLock = undefined;
  };

  const syncScrollLock = () => {
    if (options.open.value && shouldLockScroll()) {
      acquireScrollLock();
      return;
    }

    releaseScrollLockIfNeeded();
  };

  watch(
    [options.dialogRef, options.open, () => toValue(options.lockScroll)],
    ([dialog]) => {
      if (!dialog) {
        return;
      }

      if (options.open.value) {
        exitCompletion.cancel();
        options.onBeforeOpen?.();
        syncScrollLock();
        showDialogElement();
        return;
      }

      releaseScrollLockIfNeeded();
      closeDialogElement();
    },
    {
      immediate: true,
      flush: 'post',
    },
  );

  let boundDocument: Document | undefined;
  useElementEnvironment(options.dialogRef, (document, dialog) => {
    if (boundDocument && boundDocument !== document && options.open.value && dialog.isConnected) {
      // Adoption removes native modal/top-layer membership, even if open remains set.
      dialog.removeAttribute('open');
      dialog.showModal();
    }
    boundDocument = document;
    syncScrollLock();
    return releaseScrollLockIfNeeded;
  });

  const onCancel = (event: Event) => {
    options.onCancel?.(event);
  };

  const onClose = (event: Event) => {
    const dialog = event.currentTarget as HTMLDialogElement;
    const returnValue = dialog.returnValue;

    releaseScrollLockIfNeeded();

    if (options.open.value) {
      options.open.value = false;
    }

    options.onClose?.(returnValue, event);
    exitCompletion.begin(returnValue, dialog);
  };

  const onBackdropClick = (event: MouseEvent) => {
    if (!shouldCloseOnBackdrop() || event.target !== options.dialogRef.value) {
      return;
    }

    closeDialogElement();
  };

  const showModal = () => {
    options.open.value = true;
    showDialogElement();
  };

  const close = (returnValue?: string) => {
    options.open.value = false;
    closeDialogElement(returnValue);
  };

  onUnmounted(() => {
    releaseScrollLockIfNeeded();
  });

  return {
    showDialogElement,
    closeDialogElement,
    showModal,
    close,
    onCancel,
    onClose,
    onBackdropClick,
    releaseScrollLockIfNeeded,
    syncScrollLock,
  };
}

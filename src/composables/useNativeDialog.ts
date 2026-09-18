import { onUnmounted, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';
import { lockPageScroll } from '@/internal/scrollLock/scrollLock';

type DialogRef = Readonly<Ref<HTMLDialogElement | null | undefined>>;
type AnimationQueryOptions = {
  pseudoElement?: string;
  subtree?: boolean;
};

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
  let exitSequence = 0;
  let exitPending = false;
  let unmounted = false;

  const shouldLockScroll = () => toValue(options.lockScroll) !== false;
  const shouldCloseOnBackdrop = () => toValue(options.closeOnBackdrop) !== false;

  const cancelExitCompletion = () => {
    exitSequence += 1;
    exitPending = false;
  };

  const waitForExit = (dialog: HTMLDialogElement, returnValue: string) => {
    if (exitPending) {
      return;
    }

    exitPending = true;
    const sequence = ++exitSequence;

    queueMicrotask(() => {
      const elements = [dialog, ...(options.exitElements?.() ?? [])];
      const animations = new Set(elements.flatMap((element) => element?.getAnimations?.() ?? []));
      const getDialogAnimations = dialog.getAnimations?.bind(dialog) as
        | ((options?: AnimationQueryOptions) => Animation[])
        | undefined;

      if (getDialogAnimations) {
        try {
          for (const animation of getDialogAnimations({ pseudoElement: '::backdrop' })) {
            animations.add(animation);
          }
        } catch {
          // Some browsers do not support querying a pseudo-element directly.
        }

        try {
          for (const animation of getDialogAnimations({ subtree: true })) {
            if ((animation.effect as KeyframeEffect | null)?.pseudoElement === '::backdrop') {
              animations.add(animation);
            }
          }
        } catch {
          // Direct pseudo-element queries above cover browsers without subtree queries.
        }
      }

      const finish = () => {
        if (unmounted || sequence !== exitSequence || options.open.value || options.dialogRef.value !== dialog) {
          return;
        }

        exitPending = false;
        options.onClosed?.(returnValue);
      };

      if (animations.size === 0) {
        finish();
        return;
      }

      void Promise.allSettled([...animations].map((animation) => animation.finished)).then(finish);
    });
  };

  const showDialogElement = () => {
    const dialog = options.dialogRef.value;

    if (!dialog || dialog.open) {
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
    if (!shouldLockScroll()) {
      return;
    }

    releaseScrollLock ??= lockPageScroll();
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
        cancelExitCompletion();
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
    waitForExit(dialog, returnValue);
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
    unmounted = true;
    cancelExitCompletion();
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

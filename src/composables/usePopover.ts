import { type Ref, nextTick, onUnmounted, watch } from 'vue';
import { usePopoverSource } from './usePopoverSource';
import { useExitMotionCompletion } from './useExitMotionCompletion';

export type UsePopoverShowOptions = {
  /** Position and focus-return source. Omit while open to keep the current source. */
  source?: HTMLElement;
};

export type UsePopoverOptions<T extends HTMLElement = HTMLElement> = {
  /** Reactive open state for the popover. */
  open: Ref<boolean>;

  /** Ref to the native popover element. */
  popoverRef: Ref<T | undefined>;

  /** Element passed as showPopover source when no explicit source is provided. */
  anchorElement?: () => HTMLElement | undefined;

  /** Runs before the native popover is opened. */
  onBeforeOpen?: () => void;

  /** Runs after the native popover has been opened or synchronized. */
  onAfterOpen?: () => void | Promise<void>;

  /** Runs before the native popover is hidden or synchronized closed. */
  onBeforeClose?: () => void;

  /** Runs after the native popover has been hidden or synchronized closed. */
  onAfterClose?: () => void | Promise<void>;

  /** Component-owned elements whose exit motion must finish with the popover root. */
  exitElements?: () => readonly (HTMLElement | null | undefined)[];
};

export type UsePopoverReturn = {
  /** Set the popover open state to true. */
  show: (options?: UsePopoverShowOptions) => void;

  /** Set the popover open state to false. */
  hide: () => void;

  /** Toggle popover open state. */
  toggle: (options?: UsePopoverShowOptions) => void;

  /** Sync native popover dismissal back into the open model. */
  handlePopoverToggle: (event: Event) => void;
};

type ExternalDropdownShowDetail = {
  source?: HTMLElement;
};

function isPopoverOpen(element: HTMLElement) {
  return element.matches(':popover-open');
}

function hidePopoverElement(element: HTMLElement) {
  if (!isPopoverOpen(element)) {
    return;
  }

  element.hidePopover();
}

export function usePopover<T extends HTMLElement = HTMLElement>({
  open,
  popoverRef,
  anchorElement,
  onBeforeOpen,
  onAfterOpen,
  onBeforeClose,
  onAfterClose,
  exitElements,
}: UsePopoverOptions<T>): UsePopoverReturn {
  const popoverSource = usePopoverSource();
  let pendingSource: HTMLElement | undefined;
  const exitCompletion = useExitMotionCompletion<void, T>({
    rootRef: popoverRef,
    open,
    ownedElements: exitElements,
    onComplete: () => {
      popoverSource.release();
      void onAfterClose?.();
    },
  });

  function syncOpen() {
    const popover = popoverRef.value;
    if (!popover || !open.value) return;
    exitCompletion.cancel();
    const wasOpen = isPopoverOpen(popover);
    const source = pendingSource ?? (wasOpen ? undefined : anchorElement?.());
    pendingSource = undefined;
    if (!wasOpen) onBeforeOpen?.();
    popoverSource.show(popover, source);
    if (!wasOpen) void onAfterOpen?.();
  }

  function show(options: UsePopoverShowOptions = {}) {
    pendingSource = options.source ?? (open.value ? pendingSource : undefined);
    exitCompletion.cancel();
    open.value = true;
    if (popoverRef.value && isPopoverOpen(popoverRef.value)) {
      syncOpen();
    } else {
      // Also covers a native dismissal whose queued toggle has not arrived yet:
      // setting an already-true model alone would not schedule the watcher.
      void nextTick(syncOpen);
    }
  }

  function hide() {
    open.value = false;
  }

  function toggle(options: UsePopoverShowOptions = {}) {
    if (open.value) {
      hide();
      return;
    }

    show(options);
  }

  function handlePopoverToggle(event: Event) {
    const target = event.currentTarget as HTMLElement | null;
    const nextOpen = target ? isPopoverOpen(target) : open.value;

    if (nextOpen) {
      exitCompletion.cancel();
      if (!open.value) {
        open.value = true;
      }
      return;
    }

    if (open.value) {
      open.value = false;
    }
    if (target) {
      exitCompletion.begin(undefined, target as T);
    }
  }

  function handleExternalDropdownShow(event: Event) {
    const detail = 'detail' in event ? (event.detail as ExternalDropdownShowDetail | undefined) : undefined;
    show(detail);
  }

  function handleExternalDropdownHide() {
    open.value = false;
  }

  watch(
    [open, popoverRef],
    ([nextOpen]) => {
      const popover = popoverRef.value;

      if (!popover) {
        return;
      }

      if (nextOpen) {
        syncOpen();
        return;
      }

      onBeforeClose?.();
      pendingSource = undefined;
      const wasOpen = isPopoverOpen(popover);
      hidePopoverElement(popover);
      if (wasOpen) {
        exitCompletion.begin(undefined, popover);
      }
    },
    {
      immediate: true,
      flush: 'post',
    },
  );

  watch(
    () => anchorElement?.(),
    (source) => {
      if (open.value && popoverRef.value && source) popoverSource.show(popoverRef.value, source);
    },
    { flush: 'post' },
  );

  watch(
    popoverRef,
    (popover, previousPopover) => {
      previousPopover?.removeEventListener('m3-dropdown:show', handleExternalDropdownShow);
      previousPopover?.removeEventListener('m3-dropdown:hide', handleExternalDropdownHide);

      if (!popover) {
        return;
      }

      popover.addEventListener('m3-dropdown:show', handleExternalDropdownShow);
      popover.addEventListener('m3-dropdown:hide', handleExternalDropdownHide);
    },
    {
      immediate: true,
      flush: 'post',
    },
  );

  onUnmounted(() => {
    const popover = popoverRef.value;
    popover?.removeEventListener('m3-dropdown:show', handleExternalDropdownShow);
    popover?.removeEventListener('m3-dropdown:hide', handleExternalDropdownHide);
  });

  return {
    show,
    hide,
    toggle,
    handlePopoverToggle,
  };
}

import { type Ref, onUnmounted, watch } from 'vue';

export type UsePopoverShowOptions = {
  /** Element passed to showPopover as the source for focus and dismissal semantics. */
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

function showPopoverElement(element: HTMLElement, source?: HTMLElement) {
  if (isPopoverOpen(element)) {
    return;
  }

  if (source) {
    try {
      element.showPopover({ source });
      return;
    } catch {}
  }

  element.showPopover();
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
}: UsePopoverOptions<T>): UsePopoverReturn {
  let pendingSource: HTMLElement | undefined;

  function resolveSource() {
    const source = pendingSource ?? anchorElement?.();
    pendingSource = undefined;
    return source;
  }

  function show(options: UsePopoverShowOptions = {}) {
    pendingSource = options.source;
    open.value = true;
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
    const nextState = (event as Event & { newState?: 'open' | 'closed' }).newState;
    const target = event.currentTarget as HTMLElement | null;
    const nextOpen =
      nextState === 'open' ? true : nextState === 'closed' ? false : target ? isPopoverOpen(target) : open.value;

    if (nextOpen) {
      if (!open.value) {
        open.value = true;
      }
      return;
    }

    if (open.value) {
      open.value = false;
    }
  }

  function handleExternalDropdownShow(event: Event) {
    const detail = event instanceof CustomEvent ? (event.detail as ExternalDropdownShowDetail | undefined) : undefined;
    pendingSource = detail?.source;
    open.value = true;
  }

  function handleExternalDropdownHide() {
    open.value = false;
  }

  watch(
    [open, popoverRef],
    async ([nextOpen]) => {
      const popover = popoverRef.value;

      if (!popover) {
        return;
      }

      if (nextOpen) {
        onBeforeOpen?.();
        showPopoverElement(popover, resolveSource());
        await onAfterOpen?.();
        return;
      }

      onBeforeClose?.();
      pendingSource = undefined;
      hidePopoverElement(popover);
      await onAfterClose?.();
    },
    {
      immediate: true,
      flush: 'post',
    },
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

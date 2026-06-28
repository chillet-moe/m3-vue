import { type Ref, watch } from 'vue';

export type UsePickerPopoverOptions<T extends HTMLElement = HTMLElement> = {
  /** Reactive open state for the picker. */
  open: Ref<boolean>;

  /** Ref to the native popover element. */
  popoverRef: Ref<T | undefined>;

  /** Element passed as showPopover source when the picker is anchored to another control. */
  anchorElement?: () => HTMLElement | undefined;

  /** Runs before the native popover is opened. */
  onBeforeOpen?: () => void;

  /** Runs after the native popover has been opened or synchronized. */
  onAfterOpen?: () => void | Promise<void>;

  /** Runs before the native popover is hidden or synchronized closed. */
  onBeforeClose?: () => void;
};

export type UsePickerPopoverReturn = {
  /** Set the picker open state to true. */
  show: () => void;

  /** Set the picker open state to false. */
  hide: () => void;

  /** Toggle the picker open state. */
  toggle: () => void;

  /** Sync native popover dismissal back into the open model. */
  handlePopoverToggle: (event: Event) => void;
};

export function usePickerPopover<T extends HTMLElement = HTMLElement>({
  open,
  popoverRef,
  anchorElement,
  onBeforeOpen,
  onAfterOpen,
  onBeforeClose,
}: UsePickerPopoverOptions<T>): UsePickerPopoverReturn {
  function show() {
    open.value = true;
  }

  function hide() {
    open.value = false;
  }

  function toggle() {
    if (open.value) {
      hide();
      return;
    }

    show();
  }

  function handlePopoverToggle(event: Event) {
    const nextState = (event as Event & { newState?: 'open' | 'closed' }).newState;

    if (nextState === 'closed' && open.value) {
      open.value = false;
    }
  }

  watch(
    [open, popoverRef],
    async ([nextOpen]) => {
      const popover = popoverRef.value;

      if (nextOpen) {
        onBeforeOpen?.();

        if (popover && !popover.matches(':popover-open')) {
          const source = anchorElement?.();

          if (source) {
            popover.showPopover({ source });
          } else {
            popover.showPopover();
          }
        }

        await onAfterOpen?.();
        return;
      }

      onBeforeClose?.();

      if (popover?.matches(':popover-open')) {
        popover.hidePopover();
      }
    },
    {
      immediate: true,
      flush: 'post',
    },
  );

  return {
    show,
    hide,
    toggle,
    handlePopoverToggle,
  };
}

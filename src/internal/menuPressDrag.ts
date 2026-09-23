type MenuPressDragOptions = {
  trigger: HTMLElement;
  menu: HTMLElement;
  open: () => void;
  close: () => void;
  onFinish?: (result: { releasedOnTrigger: boolean; heldTriggerPress: boolean }) => void;
};

/** Starts one mouse press that can either open a menu or drag onto an item. */
export function startMenuPressDrag(
  event: PointerEvent,
  { trigger, menu, open, close, onFinish }: MenuPressDragOptions,
) {
  if (event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary || menu.matches(':popover-open')) {
    return;
  }

  const document = menu.ownerDocument;
  const startX = event.clientX;
  const startY = event.clientY;
  let active = true;
  let opened = false;

  const openMenu = () => {
    if (!active || opened) return;
    opened = true;
    open();
  };

  // A quick stationary press keeps the regular click-to-open behavior. Movement
  // opens the menu for dragging; holding opens it after the pointerdown event.
  const openTimer = setTimeout(openMenu, 150);

  const cleanup = (finishEvent?: PointerEvent) => {
    active = false;
    clearTimeout(openTimer);
    document.removeEventListener('pointermove', onPointerMove, true);
    document.removeEventListener('pointerup', onPointerUp, true);
    document.removeEventListener('pointercancel', onPointerCancel, true);
    const releasedOnTrigger = finishEvent?.type === 'pointerup' && trigger.contains(finishEvent.target as Node);
    onFinish?.({
      releasedOnTrigger,
      heldTriggerPress:
        releasedOnTrigger &&
        opened &&
        finishEvent !== undefined &&
        Math.hypot(finishEvent.clientX - startX, finishEvent.clientY - startY) < 4,
    });
  };

  const onPointerMove = (moveEvent: PointerEvent) => {
    if (moveEvent.pointerId !== event.pointerId) return;
    if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) >= 4) openMenu();
  };

  const onPointerUp = (releaseEvent: PointerEvent) => {
    if (releaseEvent.pointerId !== event.pointerId) return;
    cleanup(releaseEvent);

    if (!opened) return;

    // A stationary press is the ordinary click-to-open gesture.
    if (Math.hypot(releaseEvent.clientX - startX, releaseEvent.clientY - startY) < 4) return;

    const target = releaseEvent.target;
    const item =
      target instanceof Element
        ? target.closest<HTMLElement>('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]')
        : null;

    if (item && menu.contains(item) && !item.matches('[disabled], [aria-disabled="true"]')) {
      item.click();
      return;
    }

    close();
  };

  const onPointerCancel = (cancelEvent: PointerEvent) => {
    if (cancelEvent.pointerId !== event.pointerId) return;
    cleanup(cancelEvent);
    close();
  };

  document.addEventListener('pointermove', onPointerMove, true);
  document.addEventListener('pointerup', onPointerUp, true);
  document.addEventListener('pointercancel', onPointerCancel, true);

  return cleanup;
}

import { onUnmounted } from 'vue';
import { acquireAnchorName } from '@/internal/anchorName';

let nextAnchor = 0;

/** Keeps positioning independent of the native popover's open/close lifecycle. */
export function usePopoverSource() {
  const anchorName = `--m3-source-${++nextAnchor}`;
  let source: HTMLElement | undefined;
  let element: HTMLElement | undefined;
  let releaseAnchor: (() => void) | undefined;
  let retargeted = false;

  const release = () => {
    releaseAnchor?.();
    releaseAnchor = undefined;
    if (element) {
      if (element.style.getPropertyValue('position-anchor') === anchorName) {
        element.style.removeProperty('position-anchor');
      }
      element.removeEventListener('beforetoggle', beforeToggle);
    }
    element = undefined;
    source = undefined;
    retargeted = false;
  };

  const beforeToggle = (event: Event) => {
    if ((event as ToggleEvent).newState !== 'closed') return;
    // The native session remembers its original focus target. After a retarget,
    // return keyboard focus to the current source before native restoration runs.
    // Pointer dismissal outside the surface must keep the clicked element focused.
    if (retargeted && element?.contains(element.ownerDocument.activeElement)) {
      source?.focus({ preventScroll: true });
    }
  };

  onUnmounted(release);

  return {
    release,
    isChanging(target: HTMLElement, nextSource?: HTMLElement) {
      return target.matches(':popover-open') && !!nextSource && nextSource !== source;
    },
    show(target: HTMLElement, nextSource?: HTMLElement) {
      const wasOpen = target.matches(':popover-open');
      if (wasOpen && (!nextSource || nextSource === source)) return;
      if (!wasOpen || element !== target) {
        release();
        element = target;
        target.addEventListener('beforetoggle', beforeToggle);
      }
      if (nextSource) {
        releaseAnchor?.();
        source = nextSource;
        releaseAnchor = acquireAnchorName(source, anchorName);
        // Authored positioning (Popover anchorName/anchorElement, directives,
        // context-menu coordinates) remains authoritative.
        const positionAnchor = target.style.getPropertyValue('position-anchor');
        if (!positionAnchor || positionAnchor === anchorName) target.style.setProperty('position-anchor', anchorName);
      }
      if (wasOpen) {
        retargeted = true;
        return;
      }
      target.showPopover(nextSource ? { source: nextSource } : undefined);
    },
  };
}

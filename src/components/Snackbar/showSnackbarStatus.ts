import type { VNodeChild } from 'vue';
import type { OverlayHostController } from '@/internal/overlayHost/overlayHost';
import { showPopoverStackItem } from '@/internal/popoverStack/popoverStack';
import type { SnackbarPosition } from './config';
import { snackbarStack } from './snackbarStack';

export type ShowSnackbarStatusOptions = {
  /** Position of the shared snackbar stack. */
  position: SnackbarPosition;
  /** Sort order among statuses, lowest first. Defaults to zero. */
  order?: number;
  /** Render non-interactive content. Reactive reads update this item in place. */
  render: () => VNodeChild;
};

export type SnackbarStatusHandle = {
  /** Start this status item's exit. Safe to call repeatedly. */
  close: () => void;
};

/** Show an application-controlled status until closed or its host unmounts. */
export function showSnackbarStatus(
  host: OverlayHostController,
  options: ShowSnackbarStatusOptions,
): SnackbarStatusHandle {
  return showPopoverStackItem(host, snackbarStack(options.position), {
    order: options.order ?? 0,
    itemClass: 'm3-snackbar-status',
    render: options.render,
  });
}

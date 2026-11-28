import type { SnackbarPosition } from './config';
import './SnackbarStack.css';

export function snackbarStack(position: SnackbarPosition) {
  return {
    stackId: `snackbar:${position}`,
    popoverClass: 'm3-snackbar-stack-popover',
    stackClass: 'm3-snackbar-stack',
    dataAttributes: { 'data-position': position },
  };
}

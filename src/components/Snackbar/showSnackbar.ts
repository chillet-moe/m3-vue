import { h, shallowRef } from 'vue';
import Snackbar from './Snackbar.vue';
import type { SnackbarProps } from './Snackbar.vue';
import { showPopoverStackItem } from '@/internal/popoverStack/popoverStack';
import styles from './Snackbar.module.css';

export type SnackbarAction = {
  /** Label shown in the action area. */
  label: string;

  /** Value returned when the action closes the snackbar. */
  value?: string;

  /** Whether the action button is disabled. */
  disabled?: boolean;

  /** Whether the action button should autofocus when rendered. */
  autofocus?: boolean;

  /** Whether clicking the action should close the snackbar. */
  closeOnClick?: boolean;

  /** Optional callback invoked before the snackbar closes. Return `false` to keep it open. */
  onClick?: () => void | boolean | Promise<void | boolean>;
};

export type SnackbarPosition = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';

export type ShowSnackbarOptions = Pick<SnackbarProps, 'actionOnNewLine' | 'dismissible' | 'dismissButtonLabel'> & {
  /** Supporting text displayed inside the snackbar. */
  message?: string;

  /** Optional action button. */
  action?: SnackbarAction;

  /** Milliseconds before the snackbar closes automatically. Use `null` to disable auto close. */
  duration?: number | null;

  /** Value returned when the snackbar closes automatically. */
  timeoutValue?: string;

  /** Value returned when the dismiss button closes the snackbar. */
  dismissValue?: string;

  /** Where the snackbar stack is placed in the viewport. */
  position?: SnackbarPosition;
};

const DEFAULT_DURATION = 4_000;
const DEFAULT_TIMEOUT_VALUE = 'timeout';
const DEFAULT_DISMISS_VALUE = 'dismiss';
const DEFAULT_ACTION_VALUE = 'action';
const DEFAULT_POSITION: SnackbarPosition = 'bottom';

export function showSnackbar(options: ShowSnackbarOptions = {}): Promise<string> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('showSnackbar requires a browser environment.'));
  }

  return new Promise<string>((resolve, reject) => {
    const action = options.action;
    const position = options.position ?? DEFAULT_POSITION;
    const remainingDuration = shallowRef(options.duration ?? DEFAULT_DURATION);

    let settled = false;
    let timerId = 0;
    let startedAt = 0;

    const finalizeResolve = (value: string) => {
      if (settled) {
        return;
      }

      settled = true;
      resolve(value);
    };

    const finalizeReject = (error: unknown) => {
      if (settled) {
        return;
      }

      settled = true;
      reject(error);
    };

    const clearTimer = () => {
      if (!timerId) {
        return;
      }

      window.clearTimeout(timerId);
      timerId = 0;
      remainingDuration.value = Math.max(0, remainingDuration.value - (performance.now() - startedAt));
    };

    const handle = showPopoverStackItem({
      stackId: `snackbar:${position}`,
      popoverClass: styles.stackPopover,
      stackClass: styles.stack,
      dataAttributes: {
        'data-position': position,
      },
      render: () =>
        h(
          Snackbar,
          {
            actionLabel: action?.label,
            actionDisabled: action?.disabled,
            actionAutofocus: action?.autofocus,
            actionOnNewLine: options.actionOnNewLine,
            dismissible: options.dismissible,
            dismissButtonLabel: options.dismissButtonLabel,
            onAction: () => {
              void handleActionClick();
            },
            onDismiss: () => {
              closeWithValue(options.dismissValue ?? DEFAULT_DISMISS_VALUE);
            },
            onPointerenter: () => {
              clearTimer();
            },
            onPointerleave: () => {
              startTimer();
            },
            onFocusin: () => {
              clearTimer();
            },
            onFocusout: (event: FocusEvent) => {
              const currentTarget = event.currentTarget as HTMLElement | null;
              const nextTarget = event.relatedTarget as Node | null;

              if (currentTarget && nextTarget && currentTarget.contains(nextTarget)) {
                return;
              }

              startTimer();
            },
          },
          {
            default: () => options.message ?? '',
          },
        ),
    });

    const closeWithValue = (value: string) => {
      clearTimer();
      handle.close();
      finalizeResolve(value);
    };

    const startTimer = () => {
      if (options.duration === null || timerId) {
        return;
      }

      if (remainingDuration.value <= 0) {
        closeWithValue(options.timeoutValue ?? DEFAULT_TIMEOUT_VALUE);
        return;
      }

      startedAt = performance.now();
      timerId = window.setTimeout(() => {
        timerId = 0;
        remainingDuration.value = 0;
        closeWithValue(options.timeoutValue ?? DEFAULT_TIMEOUT_VALUE);
      }, remainingDuration.value);
    };

    const handleActionClick = async () => {
      try {
        const result = await action?.onClick?.();

        if (result === false || action?.closeOnClick === false) {
          return;
        }

        closeWithValue(action?.value ?? DEFAULT_ACTION_VALUE);
      } catch (error) {
        clearTimer();
        handle.close();
        finalizeReject(error);
      }
    };

    startTimer();
  });
}

import { bindElementEnvironment } from '@/internal/elementEnvironment';
import {
  getOverlayHostElement,
  getOverlayHostSnackbarDefaults,
  useOverlayHost,
  type OverlayHostController,
} from '@/internal/overlayHost/overlayHost';
import { h, inject, shallowRef } from 'vue';
import Snackbar from './Snackbar.vue';
import { snackbarDefaultsContextKey, type ShowSnackbarDefaults, type SnackbarPosition } from './config';
import { showPopoverStackItem } from '@/internal/popoverStack/popoverStack';
import './SnackbarStack.css';

export type { ShowSnackbarDefaults, SnackbarPosition } from './config';

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

export type ShowSnackbarOptions = ShowSnackbarDefaults & {
  /** Supporting text displayed inside the snackbar. */
  message?: string;

  /** Optional action button. */
  action?: SnackbarAction;
};

const DEFAULT_ACTION_VALUE = 'action';
const BUILT_IN_DEFAULTS = {
  dismissible: true,
  duration: 4_000,
  timeoutValue: 'timeout',
  dismissValue: 'dismiss',
  position: 'bottom',
} as const satisfies ShowSnackbarDefaults;

export type UseSnackbarReturn = (options?: ShowSnackbarOptions) => Promise<string>;

function showSnackbarWithDefaults(
  host: OverlayHostController,
  options: ShowSnackbarOptions,
  contextualDefaults: ShowSnackbarDefaults | undefined,
): Promise<string> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('showSnackbar requires a browser environment.'));
  }

  return new Promise<string>((resolve, reject) => {
    const resolvedOptions = { ...BUILT_IN_DEFAULTS, ...contextualDefaults, ...options };
    const action = resolvedOptions.action;
    const position = resolvedOptions.position;
    const remainingDuration = shallowRef(resolvedOptions.duration ?? BUILT_IN_DEFAULTS.duration);

    let settled = false;
    let timerId = 0;
    let startedAt = 0;
    let view: Window;
    let releaseEnvironment: (() => void) | undefined;

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

      view.clearTimeout(timerId);
      timerId = 0;
      remainingDuration.value = Math.max(0, remainingDuration.value - (view.performance.now() - startedAt));
    };

    const handle = showPopoverStackItem(host, {
      stackId: `snackbar:${position}`,
      popoverClass: 'm3-snackbar-stack-popover',
      stackClass: 'm3-snackbar-stack',
      dataAttributes: {
        'data-position': position,
      },
      onHostUnmounted: (error) => {
        clearTimer();
        releaseEnvironment?.();
        finalizeReject(error);
      },
      render: () =>
        h(
          Snackbar,
          {
            actionLabel: action?.label,
            actionDisabled: action?.disabled,
            actionAutofocus: action?.autofocus,
            actionOnNewLine: resolvedOptions.actionOnNewLine,
            dismissible: resolvedOptions.dismissible,
            dismissButtonLabel: resolvedOptions.dismissButtonLabel,
            onAction: () => {
              void handleActionClick();
            },
            onDismiss: () => {
              closeWithValue(resolvedOptions.dismissValue);
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
            default: () => resolvedOptions.message ?? '',
          },
        ),
    });

    const closeWithValue = (value: string) => {
      clearTimer();
      handle.close();
      releaseEnvironment?.();
      finalizeResolve(value);
    };

    const startTimer = () => {
      if (settled || resolvedOptions.duration === null || timerId) {
        return;
      }

      if (remainingDuration.value <= 0) {
        closeWithValue(resolvedOptions.timeoutValue);
        return;
      }

      startedAt = view.performance.now();
      timerId = view.setTimeout(() => {
        timerId = 0;
        remainingDuration.value = 0;
        closeWithValue(resolvedOptions.timeoutValue);
      }, remainingDuration.value);
    };

    const handleActionClick = async () => {
      try {
        const result = await action?.onClick?.();

        if (settled || result === false || action?.closeOnClick === false) {
          return;
        }

        closeWithValue(action?.value ?? DEFAULT_ACTION_VALUE);
      } catch (error) {
        clearTimer();
        handle.close();
        releaseEnvironment?.();
        finalizeReject(error);
      }
    };

    releaseEnvironment = bindElementEnvironment(getOverlayHostElement(host)!, (document) => {
      view = document.defaultView!;
      startTimer();
      return clearTimer;
    });
    if (settled) releaseEnvironment();
  });
}

export function showSnackbar(host: OverlayHostController, options: ShowSnackbarOptions = {}): Promise<string> {
  return showSnackbarWithDefaults(host, options, getOverlayHostSnackbarDefaults(host));
}

/** Returns a showSnackbar function bound to the nearest provided defaults. */
export function useSnackbar(): UseSnackbarReturn {
  const host = useOverlayHost();
  const defaults = inject(snackbarDefaultsContextKey, undefined);
  return (options = {}) =>
    showSnackbarWithDefaults(host, options, defaults?.value ?? getOverlayHostSnackbarDefaults(host));
}

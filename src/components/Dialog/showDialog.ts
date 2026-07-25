import { createApp, defineComponent, h, nextTick, ref } from 'vue';
import { Button } from '@/components/Button';
import type { ButtonProps } from '@/components/Button/Button.vue';
import { Icon } from '@/components/Icon';
import Dialog from './Dialog.vue';
import type { DialogProps } from './Dialog.vue';

export type DialogAction = {
  /** Label shown in the action row. */
  label: string;

  /** Value returned when this action closes the dialog. */
  value?: string;

  /** Visual style forwarded to the Button component. */
  variant?: ButtonProps['variant'];

  /** Whether the action button is disabled. */
  disabled?: boolean;

  /** Whether this action should autofocus when rendered. */
  autofocus?: boolean;

  /** Whether clicking the action should close the dialog. */
  closeOnClick?: boolean;

  /** Optional callback invoked before the dialog closes. Return `false` to keep it open. */
  onClick?: () => void | boolean | Promise<void | boolean>;
};

export type ShowDialogOptions = DialogProps & {
  /** Optional Material Symbols icon name rendered above the headline. */
  icon?: string;

  /** Optional dialog headline text. */
  headline?: string;

  /** Optional supporting text content. */
  content?: string;

  /** Action buttons rendered in the dialog footer. */
  actions?: DialogAction[];

  /** ARIA role forwarded to the root dialog element. */
  role?: 'dialog' | 'alertdialog';
};

const DEFAULT_ACTIONS: DialogAction[] = [
  {
    label: 'OK',
    value: 'confirm',
    variant: 'text',
  },
];

function parseTimeValue(value: string): number {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  if (trimmed.endsWith('ms')) {
    return Number.parseFloat(trimmed);
  }

  if (trimmed.endsWith('s')) {
    return Number.parseFloat(trimmed) * 1000;
  }

  return 0;
}

function getMaxTimingValue(values: string): number {
  return values
    .split(',')
    .map(parseTimeValue)
    .reduce((max, current) => Math.max(max, current), 0);
}

function getExitDuration(element: HTMLElement | null): number {
  if (!element) {
    return 0;
  }

  const style = window.getComputedStyle(element);
  const transitionDuration = getMaxTimingValue(style.transitionDuration);
  const transitionDelay = getMaxTimingValue(style.transitionDelay);
  const animationDuration = getMaxTimingValue(style.animationDuration);
  const animationDelay = getMaxTimingValue(style.animationDelay);

  return Math.max(transitionDuration + transitionDelay, animationDuration + animationDelay);
}

export function showDialog(options: ShowDialogOptions = {}): Promise<string> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('showDialog requires a browser environment.'));
  }

  return new Promise<string>((resolve, reject) => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    const actions = options.actions?.length ? options.actions : DEFAULT_ACTIONS;

    let settled = false;
    let cleanedUp = false;
    let app: ReturnType<typeof createApp> | null = null;

    const queryDialog = () => host.querySelector('dialog') as HTMLDialogElement | null;

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

    const cleanup = () => {
      if (cleanedUp) {
        return;
      }

      cleanedUp = true;
      app?.unmount();
      host.remove();
    };

    const cleanupAfterExit = () => {
      const dialog = queryDialog();
      const surface = dialog?.querySelector('.m3-dialog-surface') as HTMLElement | null;
      const exitDuration = Math.max(getExitDuration(dialog), getExitDuration(surface));

      if (!dialog || exitDuration === 0) {
        queueMicrotask(cleanup);
        return;
      }

      let finished = false;

      const finish = () => {
        if (finished) {
          return;
        }

        finished = true;
        dialog.removeEventListener('transitionend', onTransitionEnd);
        window.clearTimeout(timeoutId);
        cleanup();
      };

      const onTransitionEnd = (event: TransitionEvent) => {
        if (event.target === surface && event.propertyName === 'opacity') {
          finish();
        }
      };

      const timeoutId = window.setTimeout(finish, exitDuration + 50);
      dialog.addEventListener('transitionend', onTransitionEnd);
    };

    const Root = defineComponent({
      name: 'ProgrammaticDialog',
      setup() {
        const open = ref(true);

        const closeWithValue = (value = '') => {
          const dialog = queryDialog();

          if (!dialog) {
            finalizeResolve(value);
            cleanup();
            return;
          }

          dialog.close(value);
        };

        const handleActionClick = async (action: DialogAction) => {
          try {
            const callbackResult = await action.onClick?.();

            if (callbackResult === false || action.closeOnClick === false) {
              return;
            }

            closeWithValue(action.value ?? action.label);
          } catch (error) {
            finalizeReject(error);
            closeWithValue(action.value ?? '');
          }
        };

        return () =>
          h(
            Dialog,
            {
              open: open.value,
              closeOnBackdrop: options.closeOnBackdrop,
              role: options.role,
              'onUpdate:open': (nextOpen: boolean) => {
                open.value = nextOpen;
              },
              onClose: (returnValue: string) => {
                open.value = false;
                finalizeResolve(returnValue);
                cleanupAfterExit();
              },
            },
            {
              icon: options.icon ? () => h(Icon, { name: options.icon! }) : undefined,
              headline: options.headline ? () => options.headline : undefined,
              default: options.content ? () => options.content : undefined,
              actions: () =>
                actions.map((action, index) =>
                  h(
                    Button,
                    {
                      key: `${action.value ?? action.label}-${index}`,
                      variant: action.variant ?? 'text',
                      disabled: action.disabled,
                      autofocus: action.autofocus,
                      onClick: () => {
                        void handleActionClick(action);
                      },
                    },
                    {
                      default: () => action.label,
                    },
                  ),
                ),
            },
          );
      },
    });

    app = createApp(Root);
    app.mount(host);

    void nextTick(() => {
      const dialog = queryDialog();

      if (!dialog) {
        finalizeReject(new Error('Failed to mount dialog.'));
        cleanup();
      }
    });
  });
}

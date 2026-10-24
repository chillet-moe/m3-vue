import { h, nextTick, ref } from 'vue';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import {
  showOverlayEntry,
  type OverlayHostController,
  type OverlayEntryHandle,
} from '@/internal/overlayHost/overlayHost';
import Dialog from './Dialog.vue';
import type { DialogProps } from './Dialog.vue';

export type DialogAction = {
  /** Label shown in the action row. */
  label: string;

  /** Value returned when this action closes the dialog. */
  value?: string;

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

type DialogExposed = { dialogRef: HTMLDialogElement | null };

const DEFAULT_ACTIONS: DialogAction[] = [
  {
    label: 'OK',
    value: 'confirm',
  },
];

export function showDialog(host: OverlayHostController, options: ShowDialogOptions = {}): Promise<string> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('showDialog requires a browser environment.'));
  }

  return new Promise<string>((resolve, reject) => {
    const actions = options.actions?.length ? options.actions : DEFAULT_ACTIONS;
    const open = ref(true);

    let settled = false;
    let cleanedUp = false;
    let dialogComponent: DialogExposed | null = null;
    let overlayHandle: OverlayEntryHandle | null = null;

    const queryDialog = () => dialogComponent?.dialogRef ?? null;

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
      dialogComponent = null;
      overlayHandle?.remove();
      overlayHandle = null;
    };

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

        if (settled || cleanedUp || callbackResult === false || action.closeOnClick === false) {
          return;
        }

        closeWithValue(action.value ?? action.label);
      } catch (error) {
        finalizeReject(error);
        closeWithValue(action.value ?? '');
      }
    };

    overlayHandle = showOverlayEntry(host, {
      onHostUnmounted: (error) => {
        finalizeReject(error);
        cleanup();
      },
      render: () =>
        h(
          Dialog,
          {
            ref: (instance: unknown) => {
              dialogComponent = instance as DialogExposed | null;
            },
            open: open.value,
            closeOnBackdrop: options.closeOnBackdrop,
            role: options.role,
            'onUpdate:open': (nextOpen: boolean) => {
              open.value = nextOpen;
            },
            onClose: (returnValue: string) => {
              open.value = false;
              finalizeResolve(returnValue);
            },
            onClosed: cleanup,
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
                    variant: 'text',
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
        ),
    });

    void nextTick(() => {
      const dialog = queryDialog();

      if (!dialog) {
        finalizeReject(new Error('Failed to mount dialog.'));
        cleanup();
      }
    });
  });
}

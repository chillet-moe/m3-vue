import { createApp, h, nextTick, type App } from 'vue';
import { BottomSheet, Dialog, OverlayHost, SideSheet, showDialog } from '@/index';

export type LayoutCase = {
  kind: 'dialog' | 'showDialog' | 'bottom-sheet' | 'side-sheet';
  headline: boolean;
  icon: boolean;
  actions: boolean;
  long: boolean;
};

let app: App | undefined;
let pendingDialog: Promise<string> | undefined;
window.__dialogSpacing = async (options: LayoutCase) => {
  document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach((dialog) => dialog.close());
  await pendingDialog;
  pendingDialog = undefined;
  await nextTick();
  app?.unmount();
  const content = () =>
    h(
      'div',
      {
        id: 'body-probe',
        style: {
          height: options.long ? '1200px' : '80px',
          background: '#eee',
          boxShadow: '0 0 0 6px rgb(255, 0, 0)',
          outline: '2px solid blue',
          outlineOffset: '2px',
        },
      },
      'Body',
    );
  app = createApp({
    render: () =>
      options.kind === 'showDialog'
        ? h(OverlayHost)
        : h(
            options.kind === 'dialog' ? Dialog : options.kind === 'bottom-sheet' ? BottomSheet : SideSheet,
            { open: true, showDragHandle: options.icon },
            {
              default: content,
              headline: options.headline ? () => h('span', 'Headline') : undefined,
              icon: options.icon ? () => h('span', 'Icon') : undefined,
              actions: options.actions ? () => h('button', 'Action') : undefined,
            },
          ),
  });
  app.mount('#app');
  if (options.kind === 'showDialog') {
    pendingDialog = showDialog({
      headline: options.headline ? 'Headline' : undefined,
      icon: options.icon ? 'info' : undefined,
      content: options.long ? 'Body text. '.repeat(1500) : 'Body',
    });
  }
  await nextTick();
};

declare global {
  interface Window {
    __dialogSpacing(options: LayoutCase): Promise<void>;
  }
}

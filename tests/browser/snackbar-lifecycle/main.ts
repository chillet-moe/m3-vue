import '@/styles/theme.css';
import '@/styles/themes/default.css';
import { createApp, h, nextTick, ref, type App } from 'vue';
import { OverlayHost } from '@/components/OverlayHost';
import Snackbar from '@/components/Snackbar/Snackbar.vue';
import { showSnackbar, type SnackbarPosition } from '@/components/Snackbar/showSnackbar';
import { showSnackbarStatus, type SnackbarStatusHandle } from '@/components/Snackbar/showSnackbarStatus';
import { createOverlayHost } from '@/internal/overlayHost/overlayHost';

const params = new URLSearchParams(location.search);
const position = (params.get('position') ?? 'top-end') as SnackbarPosition;
if (params.has('cancel')) {
  document.addEventListener(
    'beforetoggle',
    (event) => {
      if ((event.target as HTMLElement).classList.contains('m3-snackbar-stack-popover')) event.preventDefault();
    },
    true,
  );
}
const host = createOverlayHost();
let app: App<Element> | undefined = createApp({
  setup() {
    const result = ref('');
    const clicks = ref(0);
    const statuses: (SnackbarStatusHandle | undefined)[] = [];
    const toggle = (order: number, message: string) => {
      if (statuses[order]) {
        statuses[order].close();
        statuses[order] = undefined;
      } else {
        statuses[order] = showSnackbarStatus(host, {
          position,
          order,
          render: () => h('div', { 'data-testid': `status-${order}`, style: { lineHeight: '20px' } }, message),
        });
      }
    };
    const show = (duration: number | null, autofocus = false) => {
      result.value = '';
      void showSnackbar(host, {
        position,
        message: 'Changes saved',
        duration,
        action: { label: 'Undo', autofocus },
      }).then(
        (value) => {
          result.value = value;
        },
        (error: Error) => {
          result.value = error.message;
        },
      );
    };
    return () => [
      h(
        'button',
        {
          style: { position: 'fixed', inset: '0 0 auto', height: '12rem' },
          onClick: () => clicks.value++,
        },
        `Background clicks: ${clicks.value}`,
      ),
      h('div', { style: { marginTop: '13rem' } }, [
        h('button', { onClick: () => toggle(1, 'Read only') }, 'Toggle mode'),
        h(
          'button',
          { onClick: () => toggle(0, 'Generating previews for the selected files in your collection') },
          'Toggle previews',
        ),
        h('button', { onClick: () => show(null) }, 'Show persistent'),
        h('button', { onClick: () => show(500) }, 'Show timed'),
        h('button', { onClick: () => show(null, true) }, 'Show with autofocus'),
        h('output', { 'data-testid': 'result' }, result.value),
      ]),
      h(Snackbar, { 'data-testid': 'standalone' }, () => 'Standalone snackbar'),
      h(OverlayHost, { host }),
    ];
  },
});
app.mount('#app');

Object.assign(window, {
  async retireStatus(method: 'close' | 'unmount') {
    const payload = { message: 'Finishing' };
    const { close } = showSnackbarStatus(host, {
      position,
      render: () => h('span', { 'data-testid': 'retired-status' }, payload.message),
    });
    await nextTick();
    const element = new WeakRef(document.querySelector('[data-testid="retired-status"]')!);
    if (method === 'unmount') {
      app!.unmount();
      // Vue's development reload callback holds the root vnode while the app is retained.
      app = undefined;
    } else {
      close();
    }
    return { close, element, payload: new WeakRef(payload) };
  },
});

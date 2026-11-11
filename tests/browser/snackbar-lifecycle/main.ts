import '@/styles/theme.css';
import '@/styles/themes/default.css';
import { createApp, h, ref } from 'vue';
import { OverlayHost } from '@/components/OverlayHost';
import { showSnackbar } from '@/components/Snackbar/showSnackbar';
import { createOverlayHost } from '@/internal/overlayHost/overlayHost';

if (new URLSearchParams(location.search).has('cancel')) {
  document.addEventListener(
    'beforetoggle',
    (event) => {
      if ((event.target as HTMLElement).classList.contains('m3-snackbar-stack-popover')) event.preventDefault();
    },
    true,
  );
}
const host = createOverlayHost();
createApp({
  setup() {
    const result = ref('');
    const show = (duration: number | null) => {
      result.value = '';
      void showSnackbar(host, {
        message: 'Changes saved',
        duration,
        action: { label: 'Undo', closeOnClick: false },
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
      h('button', { onClick: () => show(null) }, 'Show persistent'),
      h('button', { onClick: () => show(500) }, 'Show timed'),
      h('output', { 'data-testid': 'result' }, result.value),
      h(OverlayHost, { host }),
    ];
  },
}).mount('#app');

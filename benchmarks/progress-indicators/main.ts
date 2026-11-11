import { createApp, h } from 'vue';
import { CircularProgressIndicator, LinearProgressIndicator, LoadingIndicator, M3VuePlugin } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';

const params = new URLSearchParams(location.search);
const kind = params.get('kind');
const count = Number(params.get('count') ?? 1);
const linearAnimation = kind === 'linear-indeterminate';
const visibility = params.get('visibility');
const shape = params.get('shape') === 'wavy' ? 'wavy' : 'flat';
const style =
  kind === 'linear' || linearAnimation
    ? { display: 'flex', flexDirection: 'column', alignItems: 'start', width: 'min(760px, 100%)', gap: '12px' }
    : { display: 'grid', gridTemplateColumns: 'repeat(10, max-content)', gap: '12px' };
const visibilityStyle =
  visibility === 'visibility-hidden'
    ? { visibility: 'hidden' }
    : visibility === 'display-none'
      ? { display: 'none' }
      : visibility === 'offscreen'
        ? { marginTop: '4200px' }
        : undefined;

if (linearAnimation && params.has('defer-skip')) {
  const probe = document.createElement('style');
  probe.textContent = `
    @keyframes benchmark-linear-enable-skip {
      from { content-visibility: visible; }
      to { content-visibility: auto; }
    }
    [data-scope="linear-progress-indicator"][data-part="viewport"] {
      animation: benchmark-linear-enable-skip 32ms step-end both;
    }
  `;
  document.head.append(probe);
}

createApp({
  render: () =>
    h(
      'main',
      { style: [style, visibilityStyle] },
      Array.from({ length: count }, (_, index) => {
        if (kind === 'linear')
          return h(LinearProgressIndicator, {
            shape: 'wavy',
            value: 15,
            max: 100,
            ariaLabel: 'Progress',
            style: { inlineSize: `calc(100% - ${(index + 1) * 0.4375}px)` },
          });
        if (linearAnimation)
          return h(LinearProgressIndicator, {
            shape,
            indeterminate: true,
            direction: shape === 'wavy' ? 'rtl' : 'ltr',
            ariaLabel: 'Progress',
          });
        if (kind === 'circular')
          return h(CircularProgressIndicator, {
            shape: 'wavy',
            indeterminate: true,
            size: `${36 + (index + 1) * 0.14}px`,
            ariaLabel: 'Progress',
          });
        return h(LoadingIndicator, { ariaLabel: 'Progress' });
      }),
    ),
})
  .use(M3VuePlugin)
  .mount('#app');

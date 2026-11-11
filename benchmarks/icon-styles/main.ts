import type {} from '../componentLifecycle';
import { Breadcrumb, Button, Icon } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';
import { createApp, h, nextTick, ref, type App } from 'vue';

const target = document.querySelector<HTMLElement>('#fixture')!;
const controls = [
  [{ label: 'Workspace', href: '#workspace' }, { label: 'Projects' }, { label: 'Current' }],
  [{ label: 'Workspace', href: '#workspace' }, { label: 'Other projects' }, { label: 'Current' }],
];
const variant = new URLSearchParams(location.search).get('variant');
const step = ref(0);
let app: App | undefined;
const svg = () => h('svg', { viewBox: '0 0 24 24' }, h('path', { d: 'M5 5h14v14H5z' }));
const dynamicOptions = [
  {},
  { size: '1.3rem', weight: 650, contentRatio: 0.74 },
  { weight: 'inherit', variant: 'standalone', style: 'font-weight: 500' },
  { variant: 'inline', weight: 510, style: { '--m3-icon-weight': '540' } },
  { variant: 'inline', style: 'font-size: 19px' },
  { variant: 'inline', size: '1.1em', contentRatio: 0.8 },
] as const;
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const benchmark = {
  async mount(count: number) {
    step.value = 0;
    app = createApp({
      render() {
        const value = step.value;
        return h(
          'div',
          Array.from({ length: count }, (_, i) => {
            if (variant === 'breadcrumb') return h(Breadcrumb, { key: i, items: controls[value % controls.length] });
            if (variant === 'button')
              return h(Button, { key: i, leadingIcon: value % 2 ? 'mail' : 'settings' }, () => 'Action');
            return h(
              Icon,
              {
                key: i,
                name: value % 2 ? 'mail' : 'settings',
                variant: i % 2 ? 'inline' : 'standalone',
                ...(variant === 'overrides' || variant === 'static-overrides'
                  ? dynamicOptions[(i + (variant === 'overrides' ? value : 0)) % dynamicOptions.length]
                  : undefined),
              },
              (variant === 'overrides' || variant === 'static-overrides') && i % 3 === 0 ? svg : undefined,
            );
          }),
        );
      },
    });
    app.mount(target);
    await nextTick();
  },
  async set(value: number) {
    step.value = value;
    await nextTick();
  },
  unmount() {
    app!.unmount();
    app = undefined;
  },
  frame,
};

window.componentLifecycleBenchmark = benchmark;

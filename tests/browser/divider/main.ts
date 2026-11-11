import '@/styles/themes/default.css';
import { createApp, h, ref } from 'vue';
import { Divider } from '@/index';

createApp({
  setup() {
    const custom = ref(false);
    return () =>
      h('main', [
        h(
          'button',
          {
            onClick: () => {
              custom.value = !custom.value;
            },
          },
          'Toggle overrides',
        ),
        ...(['horizontal', 'vertical'] as const).flatMap((orientation) =>
          ['default', 'inherited', 'inline'].map((mode) =>
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  width: '240px',
                  height: '80px',
                  ...(mode === 'inherited' ? { '--md-divider-thickness': '3px', '--md-divider-spacing': '8px' } : {}),
                },
              },
              [
                h(Divider, {
                  'data-testid': `${orientation}-${mode}`,
                  orientation,
                  thickness: custom.value ? '5px' : undefined,
                  spacing: custom.value ? '12px' : undefined,
                  style:
                    mode === 'inline' ? { '--md-divider-thickness': '4px', '--md-divider-spacing': '6px' } : undefined,
                }),
              ],
            ),
          ),
        ),
      ]);
  },
}).mount('#app');

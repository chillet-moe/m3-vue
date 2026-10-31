import '@/styles/themes/default.css';
import { createApp, h } from 'vue';
import { Slider } from '@/index';
createApp(() =>
  h(
    'main',
    ['medium', 'large', 'extra-large'].flatMap((size) =>
      [false, true].flatMap((vertical) =>
        ['ltr', 'rtl'].flatMap((dir) =>
          [0, 50, 100].map((value) =>
            h(Slider, {
              size,
              vertical,
              direction: dir,
              appearance: 'expressive',
              value,
              min: 0,
              max: 100,
              step: 1,
              startIcon: 'volume_down',
              endIcon: 'volume_up',
              style: { inlineSize: '320px', margin: '16px' },
              'data-test-case': `${size}-${vertical}-${dir}-${value}`,
            }),
          ),
        ),
      ),
    ),
  ),
).mount('#app');

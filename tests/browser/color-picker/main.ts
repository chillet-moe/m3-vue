import '@/styles/theme.css';
import '@/styles/themes/default.css';
import { createApp, h, ref } from 'vue';
import { ColorPicker, type ColorPickerLayout } from '@/components/ColorPicker';

const layouts: ColorPickerLayout[] =
  location.search === '?layouts' ? ['sv-h', 'hs-v', 'hv-s', 'hsv-wheel', 'hsl-wheel'] : ['sv-h'];
const initial = { r: 0.18, g: 0.46, b: 0.83, a: 1 };
const value = ref({ ...initial });
createApp(() =>
  layouts.map((layout) =>
    h(ColorPicker, {
      layout,
      defaultValue: initial,
      'data-layout': layout,
      value: value.value,
      'onUpdate:value': (next) => {
        value.value = next;
      },
    }),
  ),
).mount('#app');

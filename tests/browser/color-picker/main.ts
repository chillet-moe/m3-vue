import '@/styles/theme.css';
import '@/styles/themes/default.css';
import { createApp, h, ref } from 'vue';
import { ColorPicker, type ColorPickerLayout } from '@/components/ColorPicker';
import ColorPickerPopover from '../../../docs/demos/color-picker/ColorPickerPopover.vue';

if (location.search === '?layouts') {
  const layouts: ColorPickerLayout[] = ['sv-h', 'hs-v', 'hv-s', 'hsv-wheel', 'hsl-wheel'];
  const value = ref({ r: 0, g: 0, b: 0, a: 128 / 255 });
  createApp(() =>
    layouts.map((layout) =>
      h(ColorPicker, {
        layout,
        'data-layout': layout,
        value: value.value,
        'onUpdate:value': (next) => {
          value.value = next;
        },
      }),
    ),
  ).mount('#app');
} else {
  createApp(ColorPickerPopover).mount('#app');
}

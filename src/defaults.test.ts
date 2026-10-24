// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, defineComponent, h, nextTick, provide, ref } from 'vue';
import {
  Button,
  IconButton,
  Slider,
  Menu,
  Select,
  TextField,
  DatePicker,
  TimePicker,
  M3VuePlugin,
  buttonContextKey,
  iconButtonContextKey,
  sliderContextKey,
  menuDefaultsContextKey,
  datePickerContextKey,
  timePickerContextKey,
  type M3ComponentDefaultsOptions,
} from '@/index';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('component defaults', () => {
  it.each(['plugin', 'provide'] as const)(
    'resolves reactive %s preferences with subtree and prop overrides',
    async (mode) => {
      const size = ref<'small' | 'large'>('small');
      const appearance = ref<'standard' | 'expressive'>('expressive');
      const color = ref<'standard' | 'vibrant'>('vibrant');
      const format = ref<'12h' | '24h'>('12h');
      const inputMode = ref<'clock' | 'keyboard'>('keyboard');
      const firstDayOfWeek = ref<0 | 1>(1);
      const controls = (id: string, explicit = false) =>
        h('section', { id }, [
          h(Button, { size: explicit ? 'medium' : undefined }, () => 'Action'),
          h(IconButton, { icon: 'settings', size: explicit ? 'medium' : undefined }),
          h(Slider, {
            min: 0,
            max: 10,
            step: 1,
            value: 5,
            size: explicit ? 'medium' : undefined,
            appearance: explicit ? 'standard' : undefined,
          }),
          h(Menu, { color: explicit ? 'standard' : undefined }),
          h(Select, { options: [], menuColor: explicit ? 'standard' : undefined }),
          h(DatePicker, { locale: 'en-US', today: '2026-10-15', firstDayOfWeek: explicit ? 0 : undefined }),
          h(TimePicker, {
            locale: 'en-US',
            format: explicit ? '24h' : undefined,
            inputMode: explicit ? 'clock' : undefined,
          }),
          h(TextField, {
            modelValue: '',
            type: 'time',
            timePickerFormat: explicit ? '24h' : undefined,
            timePickerInputMode: explicit ? 'clock' : undefined,
          }),
        ]);
      const Subtree = defineComponent({
        setup() {
          provide(buttonContextKey, { size: 'medium' });
          provide(iconButtonContextKey, { size: 'medium' });
          provide(sliderContextKey, { size: 'medium' });
          provide(menuDefaultsContextKey, { color: 'standard' });
          provide(datePickerContextKey, { firstDayOfWeek: 0 });
          provide(timePickerContextKey, { format: '24h', inputMode: 'clock' });
          return () => controls('subtree');
        },
      });
      const app = createApp(() => h('main', [controls('app'), controls('explicit', true), h(Subtree)]));
      const options = {
        buttonSize: size,
        iconButtonSize: size,
        sliderSize: size,
        sliderAppearance: appearance,
        menuColor: color,
        datePickerDefaults: { firstDayOfWeek },
        timePickerDefaults: { format, inputMode },
      } satisfies M3ComponentDefaultsOptions;
      if (mode === 'plugin') app.use(M3VuePlugin, { ...options, shape: 'square' });
      else {
        app.provide(buttonContextKey, { size });
        app.provide(iconButtonContextKey, { size });
        app.provide(sliderContextKey, { size, appearance });
        app.provide(menuDefaultsContextKey, { color });
        app.provide(datePickerContextKey, { firstDayOfWeek });
        app.provide(timePickerContextKey, { format, inputMode });
      }
      const container = document.createElement('div');
      document.body.appendChild(container);
      app.mount(container);
      const assertControls = (
        id: string,
        expectedSize: string,
        expectedColor: string,
        expectedFormat: string,
        expectedMode: string,
        expectedDay: string,
      ) => {
        const root = container.querySelector(`#${id}`)!;
        expect(root.querySelector<HTMLElement>('[data-scope="button"][data-part="root"]')?.dataset.size).toBe(
          expectedSize,
        );
        expect(root.querySelector<HTMLElement>('[data-scope="icon-button"][data-part="root"]')?.dataset.size).toBe(
          expectedSize,
        );
        expect(
          root
            .querySelector(`[data-scope="slider"][data-part="root"]`)
            ?.classList.contains(`m3-slider-${expectedSize}`),
        ).toBe(true);
        const menus = root.querySelectorAll<HTMLElement>(
          '[data-scope="menu"][data-part="root"], [data-scope="select"][data-part="menu"]',
        );
        expect(menus.length).toBe(2);
        for (const menu of menus) expect(menu.dataset.color).toBe(expectedColor);
        const pickers = root.querySelectorAll<HTMLElement>('[data-scope="time-picker"][data-part="root"]');
        expect(pickers.length).toBe(2);
        for (const picker of pickers) {
          expect(picker.dataset.format).toBe(expectedFormat);
          expect(picker.dataset.inputMode).toBe(expectedMode);
        }
        expect(root.querySelector('[data-part="weekdays"]')?.firstElementChild?.textContent).toBe(expectedDay);
      };
      try {
        expect(container.querySelector('#app .m3-slider-expressive')).not.toBeNull();
        expect(container.querySelector('#explicit .m3-slider-standard')).not.toBeNull();
        expect(container.querySelector('#subtree .m3-slider-standard')).not.toBeNull();
        assertControls('app', 'small', 'vibrant', '12h', 'keyboard', 'M');
        assertControls('subtree', 'medium', 'standard', '24h', 'clock', 'S');
        assertControls('explicit', 'medium', 'standard', '24h', 'clock', 'S');
        if (mode === 'plugin')
          expect(container.querySelector<HTMLElement>('#app [data-scope="button"]')?.dataset.shape).toBe('square');
        size.value = 'large';
        appearance.value = 'standard';
        color.value = 'standard';
        format.value = '24h';
        inputMode.value = 'clock';
        firstDayOfWeek.value = 0;
        await nextTick();
        expect(container.querySelector('#app .m3-slider-standard')).not.toBeNull();
        assertControls('app', 'large', 'standard', '24h', 'clock', 'S');
        assertControls('subtree', 'medium', 'standard', '24h', 'clock', 'S');
        assertControls('explicit', 'medium', 'standard', '24h', 'clock', 'S');
      } finally {
        app.unmount();
      }
    },
  );
});

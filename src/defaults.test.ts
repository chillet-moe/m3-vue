// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, defineComponent, h, nextTick, provide, ref } from 'vue';
import {
  Button,
  ButtonGroup,
  ListItem,
  provideButtonDefaults,
  provideSliderDefaults,
  provideListItemDefaults,
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
        buttonDefaults: { size },
        iconButtonSize: size,
        sliderDefaults: { size, appearance },
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

it('merges nested preferences per field, reacts to undefined, and preserves explicit false', async () => {
  const appWheel = ref(true);
  const localIndicator = ref<boolean | undefined>(false);
  const localAppearance = ref<'standard' | 'expressive' | undefined>(undefined);
  const localMorph = ref<boolean | undefined>(undefined);
  const controls = (id: string, explicit = false) =>
    h('section', { id }, [
      h(Slider, {
        min: 0,
        max: 10,
        step: 1,
        value: 5,
        wheel: explicit ? false : undefined,
        valueIndicator: explicit ? true : undefined,
        appearance: explicit ? 'standard' : undefined,
      }),
      h(ListItem, { title: 'Item', appearance: explicit ? 'standard' : undefined }),
      h(Button, { pressShapeMorph: explicit ? true : undefined }, () => 'Action'),
      h(ButtonGroup, {}, () => h(Button, {}, () => 'Grouped')),
    ]);
  const Inner = defineComponent({
    setup() {
      provideSliderDefaults({ size: 'small' });
      provideButtonDefaults({ size: 'small' });
      provideListItemDefaults({ appearance: undefined });
      return () => h('div', [controls('inner'), controls('explicit', true)]);
    },
  });
  const Outer = defineComponent({
    setup() {
      provideSliderDefaults({ valueIndicator: localIndicator });
      provideButtonDefaults({ pressShapeMorph: localMorph });
      provideListItemDefaults({ appearance: localAppearance });
      return () => h(Inner);
    },
  });
  const app = createApp(() => h('div', [controls('app'), h(Outer)]));
  app.use(M3VuePlugin, {
    shape: 'square',
    sliderDefaults: { appearance: 'expressive', size: 'large', wheel: appWheel, valueIndicator: true },
    buttonDefaults: { size: 'large', pressShapeMorph: false },
    listItemDefaults: { appearance: 'expressive' },
  });
  const container = document.createElement('div');
  document.body.appendChild(container);
  app.mount(container);
  await nextTick();
  const input = (id: string) => container.querySelector<HTMLInputElement>(`#${id} input[type="range"]`)!;
  const wheel = (id: string) => {
    const event = new WheelEvent('wheel', { deltaY: -1, cancelable: true });
    input(id).dispatchEvent(event);
    return event.defaultPrevented;
  };
  const root = (id: string, scope: string) =>
    container.querySelector<HTMLElement>(`#${id} [data-scope="${scope}"][data-part="root"]`)!;
  try {
    expect(root('inner', 'slider').classList.contains('m3-slider-expressive')).toBe(true);
    expect(root('inner', 'slider').classList.contains('m3-slider-small')).toBe(true);
    expect(root('app', 'slider').classList.contains('m3-slider-large')).toBe(true);
    expect(root('inner', 'item').dataset.appearance).toBe('expressive');
    expect(root('inner', 'button').dataset.shape).toBe('square');
    expect(root('inner', 'button').dataset.size).toBe('small');
    expect(root('inner', 'button').dataset.pressShapeMorph).toBe('false');
    expect(
      container
        .querySelector('#inner [data-scope="button-group"] [data-scope="button"]')
        ?.getAttribute('data-press-shape-morph'),
    ).toBe('false');
    expect(input('app').hasAttribute('aria-controls')).toBe(true);
    expect(input('inner').hasAttribute('aria-controls')).toBe(false);
    expect(input('explicit').hasAttribute('aria-controls')).toBe(true);
    expect(wheel('inner')).toBe(true);
    expect(wheel('explicit')).toBe(false);
    expect(root('explicit', 'item').dataset.appearance).toBe('standard');
    expect(root('explicit', 'button').dataset.pressShapeMorph).toBe('true');
    localIndicator.value = undefined;
    localAppearance.value = 'standard';
    localMorph.value = true;
    appWheel.value = false;
    await nextTick();
    expect(input('inner').hasAttribute('aria-controls')).toBe(true);
    expect(root('inner', 'item').dataset.appearance).toBe('standard');
    expect(root('inner', 'button').dataset.pressShapeMorph).toBe('true');
    expect(wheel('inner')).toBe(false);
    localAppearance.value = undefined;
    localMorph.value = undefined;
    await nextTick();
    expect(root('inner', 'item').dataset.appearance).toBe('expressive');
    expect(root('inner', 'button').dataset.pressShapeMorph).toBe('false');
  } finally {
    app.unmount();
  }
});

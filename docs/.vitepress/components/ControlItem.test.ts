// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import Slider from '@/components/Slider/Slider.vue';
import ControlItem from './ControlItem.vue';
import type { PropMeta } from '../plugins/component-meta';

describe('ControlItem', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('updates boolean prop controls as booleans', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const prop: PropMeta = {
      name: 'valueIndicator',
      type: 'boolean | undefined',
      required: false,
      default: 'true',
    };
    const modelValue = ref<unknown>(true);
    const app = createApp({
      setup() {
        return () =>
          h(ControlItem, {
            prop,
            modelValue: modelValue.value,
            'onUpdate:modelValue': (nextValue: unknown) => {
              modelValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]');

    expect(input).not.toBeNull();
    expect(input!.checked).toBe(true);

    input!.checked = false;
    input!.dispatchEvent(new Event('change', { bubbles: true }));
    await nextTick();

    expect(modelValue.value).toBe(false);

    app.unmount();
  });

  it('can drive Slider boolean props through a docs-style props object', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const prop: PropMeta = {
      name: 'valueIndicator',
      type: 'boolean | undefined',
      required: false,
      default: 'true',
    };
    const currentValue = ref(2);
    const sliderProps = ref({
      min: 0,
      max: 5,
      step: 1,
      valueIndicator: true,
    });
    const app = createApp({
      setup() {
        return () =>
          h('div', [
            h(Slider, {
              ...sliderProps.value,
              value: currentValue.value,
              'onUpdate:value': (nextValue: number) => {
                currentValue.value = nextValue;
              },
            }),
            h(ControlItem, {
              prop,
              modelValue: sliderProps.value.valueIndicator,
              'onUpdate:modelValue': (valueIndicator: unknown) => {
                sliderProps.value = {
                  ...sliderProps.value,
                  valueIndicator: Boolean(valueIndicator),
                };
              },
            }),
          ]);
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]');

    expect(input).not.toBeNull();
    expect(container.querySelector('[data-value-indicator="true"]')).not.toBeNull();

    input!.checked = false;
    input!.dispatchEvent(new Event('change', { bubbles: true }));
    await nextTick();

    expect(container.querySelector('[data-value-indicator="true"]')).toBeNull();

    app.unmount();
  });

  it('updates numeric prop controls as numbers', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const prop: PropMeta = {
      name: 'min',
      type: 'number',
      required: true,
      description: 'The minimum value of the slider.',
    };
    const modelValue = ref<unknown>(0);
    const app = createApp({
      setup() {
        return () =>
          h(ControlItem, {
            prop,
            modelValue: modelValue.value,
            'onUpdate:modelValue': (nextValue: unknown) => {
              modelValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('input[type="number"]');

    expect(input).not.toBeNull();
    expect(input!.value).toBe('0');

    input!.value = '2';
    input!.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();

    expect(modelValue.value).toBe(2);

    app.unmount();
  });

  it('updates numeric array prop controls as arrays', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const prop: PropMeta = {
      name: 'stopIndicators',
      type: 'number[] | undefined',
      required: false,
    };
    const modelValue = ref<unknown>([0, 1, 2]);
    const app = createApp({
      setup() {
        return () =>
          h(ControlItem, {
            prop,
            modelValue: modelValue.value,
            'onUpdate:modelValue': (nextValue: unknown) => {
              modelValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('input[type="text"]');

    expect(input).not.toBeNull();
    expect(input!.value).toBe('0, 1, 2');

    input!.value = '0, 2.5, 5';
    input!.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();

    expect(modelValue.value).toEqual([0, 2.5, 5]);

    input!.value = '';
    input!.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();

    expect(modelValue.value).toBeUndefined();

    app.unmount();
  });
});

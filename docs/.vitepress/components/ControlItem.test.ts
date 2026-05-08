// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import ControlItem from './ControlItem.vue';
import type { PropMeta } from '../plugins/component-meta';

describe('ControlItem', () => {
  afterEach(() => {
    document.body.innerHTML = '';
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
});

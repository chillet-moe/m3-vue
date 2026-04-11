// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';

import ButtonGroup from './ButtonGroup.vue';
import ButtonGroupItem from './ButtonGroupItem.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ButtonGroup', () => {
  it('composes SelectionGroup selection with Button defaults', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    let selectedValue = 'first';

    const app = createApp({
      setup() {
        const model = ref('first');

        return () =>
          h(
            ButtonGroup,
            {
              modelValue: model.value,
              color: 'tonal',
              size: 'medium',
              name: 'button-group',
              'onUpdate:modelValue': (nextValue) => {
                model.value = nextValue as string;
                selectedValue = model.value;
              },
            },
            {
              default: () => [
                h(
                  ButtonGroupItem,
                  { value: 'first' },
                  {
                    default: () => 'First',
                  },
                ),
                h(
                  ButtonGroupItem,
                  { value: 'second' },
                  {
                    default: () => 'Second',
                  },
                ),
              ],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const button = container.querySelector('.m3-button');
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');

    expect(container.querySelector('.m3-button-group')).not.toBeNull();
    expect(button?.getAttribute('data-color')).toBe('tonal');
    expect(button?.getAttribute('data-size')).toBe('medium');

    inputs[1]?.click();
    await nextTick();

    expect(selectedValue).toBe('second');

    app.unmount();
  });
});

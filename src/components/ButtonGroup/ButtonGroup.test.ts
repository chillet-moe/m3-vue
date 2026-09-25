// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';

import { M3VuePlugin } from '@/plugin';
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
    expect(button?.getAttribute('data-size')).toBe('medium');

    inputs[1]?.click();
    await nextTick();

    expect(selectedValue).toBe('second');

    app.unmount();
  });

  it('inherits the application-level action shape', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const shape = ref<'rounded' | 'square'>('square');

    const app = createApp(() =>
      h(ButtonGroup, undefined, {
        default: () =>
          h(
            ButtonGroupItem,
            { value: 'first' },
            {
              default: () => 'First',
            },
          ),
      }),
    );

    app.use(M3VuePlugin, { shape });
    app.mount(container);
    await nextTick();

    const button = container.querySelector('.m3-button');
    expect(button?.getAttribute('data-shape')).toBe('square');

    shape.value = 'rounded';
    await nextTick();

    expect(button?.getAttribute('data-shape')).toBe('rounded');

    app.unmount();
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';

import { SelectionGroup } from '@/components/SelectionGroup';
import Chip from './Chip.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Chip', () => {
  it('renders assist chips as buttons instead of toggle controls', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Chip,
        {
          variant: 'assist',
          leadingIcon: 'add',
        },
        {
          default: () => 'Assist',
        },
      ),
    );

    app.mount(container);
    await nextTick();

    expect(container.querySelector('button.m3-chip')).not.toBeNull();
    expect(container.querySelector('.m3-chip-input')).toBeNull();

    app.unmount();
  });

  it('updates standalone selection through v-model', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    let selected = false;

    const app = createApp({
      setup() {
        const model = ref(false);

        return () =>
          h(
            Chip,
            {
              modelValue: model.value,
              'onUpdate:modelValue': (nextValue) => {
                model.value = nextValue as boolean;
                selected = model.value;
              },
            },
            {
              default: () => 'Updates',
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('.m3-chip-input');

    input?.click();
    await nextTick();

    expect(selected).toBe(true);
    expect(container.querySelector('.m3-chip')?.getAttribute('data-selected')).toBe('true');

    app.unmount();
  });

  it('uses SelectionGroup single selection when chips provide values', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    let selectedValue = 'updates';

    const app = createApp({
      setup() {
        const model = ref('updates');

        return () =>
          h(
            SelectionGroup,
            {
              modelValue: model.value,
              name: 'chip-group',
              'onUpdate:modelValue': (nextValue) => {
                model.value = nextValue as string;
                selectedValue = model.value;
              },
            },
            {
              default: () => [
                h(
                  Chip,
                  { value: 'updates' },
                  {
                    default: () => 'Updates',
                  },
                ),
                h(
                  Chip,
                  { value: 'alerts' },
                  {
                    default: () => 'Alerts',
                  },
                ),
              ],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const inputs = container.querySelectorAll<HTMLInputElement>('.m3-chip-input');

    inputs[1]?.click();
    await nextTick();

    expect(selectedValue).toBe('alerts');
    expect(container.querySelectorAll('.m3-chip[data-selected="true"]')).toHaveLength(1);

    app.unmount();
  });

  it('uses SelectionGroup multiple selection to toggle arrays', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    let selectedValues = ['updates'];

    const app = createApp({
      setup() {
        const model = ref(['updates']);

        return () =>
          h(
            SelectionGroup,
            {
              modelValue: model.value,
              name: 'chip-group-multiple',
              selectionMode: 'multiple',
              'onUpdate:modelValue': (nextValue) => {
                model.value = [...(nextValue as string[])];
                selectedValues = [...model.value];
              },
            },
            {
              default: () => [
                h(
                  Chip,
                  { value: 'updates' },
                  {
                    default: () => 'Updates',
                  },
                ),
                h(
                  Chip,
                  { value: 'alerts' },
                  {
                    default: () => 'Alerts',
                  },
                ),
              ],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const inputs = container.querySelectorAll<HTMLInputElement>('.m3-chip-input');

    inputs[1]?.click();
    await nextTick();
    expect(selectedValues).toEqual(['updates', 'alerts']);

    inputs[0]?.click();
    await nextTick();
    expect(selectedValues).toEqual(['alerts']);

    app.unmount();
  });

  it('renders an avatar for input chips', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Chip,
        {
          variant: 'input',
          avatarSrc: 'https://example.com/avatar.png',
          trailingIcon: 'close',
        },
        {
          default: () => 'Alex',
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const avatar = container.querySelector<HTMLImageElement>('.m3-chip-avatar-image');

    expect(avatar?.getAttribute('src')).toBe('https://example.com/avatar.png');
    expect(container.querySelector('.m3-chip')?.getAttribute('data-variant')).toBe('input');

    app.unmount();
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';

import { ChipGroup } from '@/components/ChipGroup';
import { SelectionGroup } from '@/components/SelectionGroup';
import type { SelectionGroupModelValue } from '@/components/SelectionGroup/SelectionGroupContext';
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

  it('updates ChipGroup selection as its slot and model change independently', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const model = ref(['updates']);
    const showAlerts = ref(false);
    const app = createApp(() =>
      h(
        ChipGroup,
        {
          modelValue: model.value,
          selectionMode: 'multiple',
          name: 'notifications',
          'onUpdate:modelValue': (value) => {
            model.value = value as string[];
          },
        },
        {
          default: () => [
            h(Chip, { key: 'updates', value: 'updates' }, () => 'Updates'),
            showAlerts.value ? h(Chip, { key: 'alerts', value: 'alerts' }, () => 'Alerts') : null,
          ],
        },
      ),
    );

    app.mount(container);
    try {
      const checked = () =>
        Array.from(
          container.querySelectorAll<HTMLInputElement>('input[name="notifications"]:checked'),
          (input) => input.value,
        );
      expect(checked()).toEqual(['updates']);

      showAlerts.value = true;
      model.value.push('alerts');
      await nextTick();
      expect(checked()).toEqual(['updates', 'alerts']);

      container.querySelector<HTMLInputElement>('input[value="updates"]')!.click();
      await nextTick();
      expect(model.value).toEqual(['alerts']);
      expect(checked()).toEqual(['alerts']);
    } finally {
      app.unmount();
    }
  });

  it('updates native form fields when a chip changes group membership', async () => {
    const form = document.createElement('form');
    document.body.appendChild(form);
    const value = ref<number>();
    const name = ref<string>();
    const mode = ref<'single' | 'multiple'>('single');
    const localSelected = ref(false);
    const groupSelected = ref<SelectionGroupModelValue>();
    const app = createApp(() =>
      h(
        SelectionGroup,
        {
          name: name.value,
          selectionMode: mode.value,
          modelValue: groupSelected.value,
          'onUpdate:modelValue': (next) => {
            groupSelected.value = next;
          },
        },
        {
          default: () =>
            h(Chip, {
              value: value.value,
              name: 'local',
              modelValue: localSelected.value,
              'onUpdate:modelValue': (next) => {
                localSelected.value = next;
              },
            }),
        },
      ),
    );

    app.mount(form);
    try {
      const input = form.querySelector('input')!;
      expect(input.type).toBe('checkbox');
      input.click();
      await nextTick();
      expect(new window.FormData(form).get('local')).toBe('on');

      value.value = 0;
      name.value = 'group';
      await nextTick();
      expect(input.type).toBe('radio');
      input.click();
      await nextTick();
      expect(groupSelected.value).toBe(0);
      expect(new window.FormData(form).get('group')).toBe('0');
      expect(new window.FormData(form).has('local')).toBe(false);

      mode.value = 'multiple';
      value.value = 2;
      groupSelected.value = [2];
      name.value = 'updated';
      await nextTick();
      expect(input.type).toBe('checkbox');
      expect(new window.FormData(form).get('updated')).toBe('2');
      input.click();
      await nextTick();
      expect(groupSelected.value).toEqual([]);
      expect(new window.FormData(form).has('updated')).toBe(false);
    } finally {
      app.unmount();
    }
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

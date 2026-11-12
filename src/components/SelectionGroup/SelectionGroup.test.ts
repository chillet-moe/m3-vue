// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import ButtonGroup from '../ButtonGroup/ButtonGroup.vue';
import ChipGroup from '../ChipGroup/ChipGroup.vue';
import SelectionGroup from './SelectionGroup.vue';

describe('SelectionGroup fieldsets', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it.each([
    ['SelectionGroup', SelectionGroup],
    ['ButtonGroup', ButtonGroup],
    ['ChipGroup', ChipGroup],
  ] as const)('applies native disabled behavior to controls in %s slots', async (_name, Group) => {
    const form = document.createElement('form');
    const container = document.createElement('div');
    form.appendChild(container);
    document.body.appendChild(form);
    const disabled = ref(true);
    const app = createApp(() =>
      h(Group, { disabled: disabled.value }, () => [
        h('legend', [h('input', { name: 'legend', value: 'available' })]),
        h('input', { type: 'checkbox', name: 'option', value: 'checked', checked: true }),
      ]),
    );
    app.mount(container);

    const option = form.querySelector<HTMLInputElement>('input[name="option"]')!;
    expect(Object.fromEntries(new FormData(form))).toEqual({ legend: 'available' });
    option.click();
    expect(option.checked).toBe(true);

    disabled.value = false;
    await nextTick();
    expect(Object.fromEntries(new FormData(form))).toEqual({ legend: 'available', option: 'checked' });
    option.click();
    expect(option.checked).toBe(false);

    app.unmount();
  });
});

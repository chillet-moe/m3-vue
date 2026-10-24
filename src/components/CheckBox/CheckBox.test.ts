// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import CheckBox from './CheckBox.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('CheckBox', () => {
  it('renders a native checkbox input by default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() => h(CheckBox, { checked: true, name: 'updates', ariaLabel: 'Updates' }));

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('.m3-checkbox');
    const input = container.querySelector<HTMLInputElement>('.m3-checkbox-input');

    expect(root?.tagName).toBe('LABEL');
    expect(root?.dataset.checked).toBe('true');
    expect(input?.type).toBe('checkbox');
    expect(input?.name).toBe('updates');
    expect(input?.getAttribute('aria-label')).toBe('Updates');

    app.unmount();
  });

  it('updates v-model through native interaction and blocks disabled input', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const checked = ref(false);
    const disabled = ref(false);
    const updates: boolean[] = [];

    const app = createApp(() =>
      h(CheckBox, {
        checked: checked.value,
        disabled: disabled.value,
        'onUpdate:checked': (nextChecked) => {
          updates.push(nextChecked);
          checked.value = nextChecked;
        },
      }),
    );

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('.m3-checkbox-input');
    const root = container.querySelector<HTMLElement>('.m3-checkbox');

    input?.click();
    await nextTick();

    expect(checked.value).toBe(true);
    expect(root?.dataset.checked).toBe('true');
    expect(updates).toEqual([true]);

    checked.value = false;
    disabled.value = true;
    await nextTick();
    input?.click();
    await nextTick();

    expect(checked.value).toBe(false);
    expect(input?.disabled).toBe(true);
    expect(root?.dataset.checked).toBe('false');
    expect(updates).toEqual([true]);

    app.unmount();
  });

  it('renders only the visual checkbox in presentation mode', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() => h(CheckBox, { checked: true, presentation: true }));

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('.m3-checkbox');

    expect(root?.tagName).toBe('SPAN');
    expect(root?.dataset.presentation).toBe('true');
    expect(root?.dataset.checked).toBe('true');
    expect(root?.getAttribute('aria-hidden')).toBe('true');
    expect(root?.hasAttribute('data-state-layer-hover-target')).toBe(false);
    expect(container.querySelector('.m3-state-layer')).toBeNull();
    expect(container.querySelector('.m3-checkbox-input')).toBeNull();

    app.unmount();
  });
});

it('exposes native mixed state and clears it after native checked changes', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const checked = ref(false);
  const mixed = ref(true);
  const events: string[] = [];
  const app = createApp(() =>
    h(CheckBox, {
      checked: checked.value,
      indeterminate: mixed.value,
      'onUpdate:checked': (value) => {
        checked.value = value;
        events.push(`checked:${value}`);
      },
      'onUpdate:indeterminate': (value) => {
        mixed.value = value;
        events.push(`mixed:${value}`);
      },
    }),
  );
  app.mount(container);
  await nextTick();
  const input = container.querySelector('input')!;
  expect(input.indeterminate).toBe(true);
  expect(input.getAttribute('aria-checked')).toBe('mixed');
  input.click();
  await nextTick();
  expect(input.checked).toBe(true);
  expect(input.indeterminate).toBe(false);
  expect(events).toEqual(['checked:true', 'mixed:false']);
  mixed.value = true;
  await nextTick();
  input.click();
  await nextTick();
  expect(checked.value).toBe(false);
  expect(mixed.value).toBe(false);
  app.unmount();
});

it('preserves mixed presentation and disabled state without interactive updates', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const updates: boolean[] = [];
  const app = createApp(() =>
    h('div', [
      h(CheckBox, {
        checked: false,
        indeterminate: true,
        disabled: true,
        'onUpdate:indeterminate': (value) => updates.push(value),
      }),
      h(CheckBox, { checked: false, indeterminate: true, presentation: true }),
    ]),
  );
  app.mount(container);
  await nextTick();
  expect(container.querySelectorAll('input')).toHaveLength(1);
  container.querySelector('input')!.click();
  await nextTick();
  expect(container.querySelector('input')!.indeterminate).toBe(true);
  expect(container.querySelector('[data-presentation="true"]')?.getAttribute('aria-hidden')).toBe('true');
  expect(updates).toEqual([]);
  app.unmount();
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import Switch from './Switch.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Switch', () => {
  it('renders a native checkbox input by default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() => h(Switch, { checked: true, name: 'wifi', value: 'on', ariaLabel: 'Wi-Fi' }));

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('.m3-switch');
    const input = container.querySelector<HTMLInputElement>('.m3-switch-input');

    expect(root?.tagName).toBe('LABEL');
    expect(root?.dataset.checked).toBe('true');
    expect(input?.type).toBe('checkbox');
    expect(input?.name).toBe('wifi');
    expect(input?.value).toBe('on');
    expect(input?.getAttribute('aria-label')).toBe('Wi-Fi');

    app.unmount();
  });

  it('updates v-model through native interaction and blocks disabled input', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const checked = ref(false);
    const disabled = ref(false);
    const updates: boolean[] = [];

    const app = createApp(() =>
      h(Switch, {
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

    const input = container.querySelector<HTMLInputElement>('.m3-switch-input');
    const root = container.querySelector<HTMLElement>('.m3-switch');

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

  it('renders only the visual switch in presentation mode', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() => h(Switch, { checked: true, presentation: true }));

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('.m3-switch');

    expect(root?.tagName).toBe('SPAN');
    expect(root?.dataset.presentation).toBe('true');
    expect(root?.dataset.checked).toBe('true');
    expect(root?.getAttribute('aria-hidden')).toBe('true');
    expect(root?.hasAttribute('data-state-layer-hover-target')).toBe(false);
    expect(container.querySelector('.m3-state-layer')).toBeNull();
    expect(container.querySelector('.m3-switch-input')).toBeNull();

    app.unmount();
  });
});

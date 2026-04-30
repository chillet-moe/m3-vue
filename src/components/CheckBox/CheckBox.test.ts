// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick } from 'vue';
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

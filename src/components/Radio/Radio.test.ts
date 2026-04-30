// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick } from 'vue';
import Radio from './Radio.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Radio', () => {
  it('renders a native radio input by default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() => h(Radio, { checked: true, name: 'plan', value: 'pro', ariaLabel: 'Pro plan' }));

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('.m3-radio');
    const input = container.querySelector<HTMLInputElement>('.m3-radio-input');

    expect(root?.tagName).toBe('LABEL');
    expect(root?.dataset.checked).toBe('true');
    expect(input?.type).toBe('radio');
    expect(input?.name).toBe('plan');
    expect(input?.value).toBe('pro');
    expect(input?.getAttribute('aria-label')).toBe('Pro plan');

    app.unmount();
  });

  it('renders only the visual radio in presentation mode', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() => h(Radio, { checked: true, presentation: true }));

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('.m3-radio');

    expect(root?.tagName).toBe('SPAN');
    expect(root?.dataset.presentation).toBe('true');
    expect(root?.dataset.checked).toBe('true');
    expect(root?.getAttribute('aria-hidden')).toBe('true');
    expect(root?.hasAttribute('data-state-layer-hover-target')).toBe(false);
    expect(container.querySelector('.m3-state-layer')).toBeNull();
    expect(container.querySelector('.m3-radio-input')).toBeNull();

    app.unmount();
  });
});

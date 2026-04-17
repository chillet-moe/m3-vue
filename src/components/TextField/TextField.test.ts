// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import TextField from './TextField.vue';

describe('TextField', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the supporting slot and wires it to aria-describedby', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const value = ref('');

        return () =>
          h(
            TextField,
            {
              label: 'Amount',
              modelValue: value.value,
              'onUpdate:modelValue': (nextValue) => {
                value.value = nextValue as string;
              },
            },
            {
              supporting: () => 'Custom supporting text',
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('.m3-text-field-input');
    const supporting = container.querySelector<HTMLElement>('.m3-text-field-supporting');

    expect(supporting?.textContent?.trim()).toBe('Custom supporting text');
    expect(input?.getAttribute('aria-describedby')).toBeTruthy();
    expect(supporting?.id).toBe(input?.getAttribute('aria-describedby'));

    app.unmount();
  });

  it('falls back to the error text when no supporting slot is provided', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TextField, {
        label: 'Amount',
        error: 'Amount is required',
        description: 'Helper text',
        modelValue: '',
      }),
    );

    app.mount(container);
    await nextTick();

    expect(container.querySelector('.m3-text-field-supporting')?.textContent?.trim()).toBe('Amount is required');

    app.unmount();
  });

  it('renders description when error is an empty string', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TextField, {
        label: 'Amount',
        error: '',
        description: 'Helper text',
        modelValue: '',
      }),
    );

    app.mount(container);
    await nextTick();

    expect(container.querySelector('.m3-text-field-supporting')?.textContent?.trim()).toBe('Helper text');

    app.unmount();
  });
});

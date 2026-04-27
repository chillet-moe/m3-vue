// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import InputOtp from './InputOtp.vue';

describe('InputOtp', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders one input per character', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(InputOtp, {
        'aria-label': 'Verification code',
        length: 4,
        modelValue: '12',
      }),
    );

    app.mount(container);
    await nextTick();

    const inputs = container.querySelectorAll<HTMLInputElement>('.m3-input-otp-input');

    expect(inputs).toHaveLength(4);
    expect(inputs[0]?.value).toBe('1');
    expect(inputs[1]?.value).toBe('2');
    expect(inputs[2]?.value).toBe('');

    app.unmount();
  });

  it('distributes pasted numeric text and emits complete', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const complete = vi.fn();

    const app = createApp({
      setup() {
        const value = ref('');

        return () =>
          h(InputOtp, {
            length: 4,
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as string;
            },
            onComplete: complete,
          });
      },
    });

    app.mount(container);
    await nextTick();

    const firstInput = container.querySelector<HTMLInputElement>('.m3-input-otp-input');

    firstInput?.dispatchEvent(
      Object.assign(new Event('paste', { bubbles: true, cancelable: true }), {
        clipboardData: {
          getData: () => '12a34',
        },
      }),
    );

    await nextTick();

    const inputs = Array.from(container.querySelectorAll<HTMLInputElement>('.m3-input-otp-input'));

    expect(inputs.map((input) => input.value).join('')).toBe('1234');
    expect(complete).toHaveBeenCalledWith('1234');

    app.unmount();
  });

  it('moves backward and clears the previous cell on backspace', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const value = ref('12');

        return () =>
          h(InputOtp, {
            length: 4,
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as string;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const inputs = container.querySelectorAll<HTMLInputElement>('.m3-input-otp-input');
    inputs[2]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    await nextTick();

    expect(
      Array.from(inputs)
        .map((input) => input.value)
        .join(''),
    ).toBe('1');

    app.unmount();
  });

  it('sets the requested visual size on the root', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(InputOtp, {
        'aria-label': 'Verification code',
        size: 'large',
        modelValue: '',
      }),
    );

    app.mount(container);
    await nextTick();

    expect(container.querySelector<HTMLElement>('.m3-input-otp')?.dataset.size).toBe('large');

    app.unmount();
  });
});

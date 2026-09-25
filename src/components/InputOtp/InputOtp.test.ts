// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import InputOtp from './InputOtp.vue';

describe('InputOtp', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('distributes the model across accessible inputs and a form value', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(InputOtp, {
        'aria-label': 'Verification code',
        length: 4,
        modelValue: '12',
        name: 'verification-code',
      }),
    );

    app.mount(container);
    await nextTick();

    const inputs = container.querySelectorAll<HTMLInputElement>('.m3-input-otp-input');

    expect(inputs).toHaveLength(4);
    expect(inputs[0]?.value).toBe('1');
    expect(inputs[1]?.value).toBe('2');
    expect(inputs[2]?.value).toBe('');
    expect(inputs[0]?.getAttribute('aria-label')).toBe('Verification code character 1 of 4');
    expect(container.querySelector<HTMLInputElement>('input[type="hidden"]')?.value).toBe('12');

    app.unmount();
  });

  it('updates the model and advances focus during ordinary input', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const value = ref('');

    const app = createApp(() =>
      h(InputOtp, {
        length: 4,
        modelValue: value.value,
        'onUpdate:modelValue': (nextValue) => {
          value.value = nextValue;
        },
      }),
    );

    app.mount(container);
    await nextTick();

    const inputs = container.querySelectorAll<HTMLInputElement>('.m3-input-otp-input');

    if (inputs[0]) {
      inputs[0].value = '1';
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    }
    await nextTick();
    await nextTick();

    expect(value.value).toBe('1');
    expect(document.activeElement).toBe(inputs[1]);

    if (inputs[1]) {
      inputs[1].value = '2';
      inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    }
    await nextTick();
    await nextTick();

    expect(value.value).toBe('12');
    expect(document.activeElement).toBe(inputs[2]);

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
});

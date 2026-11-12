// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import InputOtp from './InputOtp.vue';

describe('InputOtp', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('distributes the model across accessible inputs and a form value', async () => {
    const form = document.createElement('form');
    const container = document.createElement('div');
    form.appendChild(container);
    document.body.appendChild(form);
    const disabled = ref(false);

    const app = createApp(() =>
      h(InputOtp, {
        'aria-label': 'Verification code',
        length: 4,
        modelValue: '12',
        name: 'verification-code',
        disabled: disabled.value,
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
    expect(new FormData(form).getAll('verification-code')).toEqual(['12']);

    disabled.value = true;
    await nextTick();
    expect(new FormData(form).has('verification-code')).toBe(false);

    disabled.value = false;
    await nextTick();
    expect(new FormData(form).getAll('verification-code')).toEqual(['12']);

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
        const value = ref('1');

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

    const inputs = Array.from(container.querySelectorAll<HTMLInputElement>('.m3-input-otp-input'));

    inputs[1]?.dispatchEvent(
      Object.assign(new Event('paste', { bubbles: true, cancelable: true }), {
        clipboardData: {
          getData: () => '2a3😺4 567',
        },
      }),
    );

    await nextTick();
    await nextTick();

    expect(inputs.map((input) => input.value).join('')).toBe('1234');
    expect(complete).toHaveBeenCalledWith('1234');
    expect(document.activeElement).toBe(inputs[3]);

    app.unmount();
  });

  it('counts displayed Unicode code points when deciding completion', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const value = ref('A');
    const complete = vi.fn();
    const app = createApp(() =>
      h(InputOtp, {
        type: 'text',
        length: 3,
        modelValue: value.value,
        'onUpdate:modelValue': (nextValue) => {
          value.value = nextValue;
        },
        onComplete: complete,
      }),
    );

    app.mount(container);
    const inputs = Array.from(container.querySelectorAll<HTMLInputElement>('.m3-input-otp-input'));
    const group = container.querySelector<HTMLElement>('[role="group"]')!;
    const paste = async (index: number, text: string) => {
      inputs[index]!.dispatchEvent(
        Object.assign(new Event('paste', { bubbles: true, cancelable: true }), {
          clipboardData: { getData: () => text },
        }),
      );
      await nextTick();
      await nextTick();
    };

    await paste(1, '\u00a0😺');
    expect(value.value).toBe('A😺');
    expect(inputs.map((input) => input.value)).toEqual(['A', '😺', '']);
    expect(group.dataset.complete).toBe('false');
    expect(complete).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(inputs[2]);

    await paste(2, '\nB\tCD');
    expect(value.value).toBe('A😺B');
    expect(inputs.map((input) => input.value)).toEqual(['A', '😺', 'B']);
    expect(group.dataset.complete).toBe('true');
    expect(complete.mock.calls).toEqual([['A😺B']]);
    expect(document.activeElement).toBe(inputs[2]);

    app.unmount();
  });

  it('truncates the model on shrink and renders empty cells when the length grows again', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const value = ref('A😺BC');
    const length = ref(4);
    const app = createApp(() =>
      h(InputOtp, {
        type: 'text',
        length: length.value,
        modelValue: value.value,
        name: 'code',
        'onUpdate:modelValue': (nextValue) => {
          value.value = nextValue;
        },
      }),
    );

    app.mount(container);
    const cells = () => Array.from(container.querySelectorAll<HTMLInputElement>('.m3-input-otp-input'));
    expect(cells().map((input) => input.value)).toEqual(['A', '😺', 'B', 'C']);

    length.value = 2;
    await nextTick();
    expect(value.value).toBe('A😺');
    expect(cells().map((input) => input.value)).toEqual(['A', '😺']);
    expect(container.querySelector<HTMLElement>('[role="group"]')?.dataset.complete).toBe('true');

    length.value = 4;
    await nextTick();
    expect(cells().map((input) => input.value)).toEqual(['A', '😺', '', '']);
    expect(container.querySelector<HTMLElement>('[role="group"]')?.dataset.complete).toBe('false');
    expect(cells()[3]?.getAttribute('aria-label')).toBe('One-time code character 4 of 4');
    expect(container.querySelector<HTMLInputElement>('input[name="code"]')?.value).toBe('A😺');

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

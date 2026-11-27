// @vitest-environment jsdom
import { describe, expect, it, onTestFinished } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import { NumberField, type NumberFieldProps } from './index';

function mountField(initial: number | null, props: Omit<NumberFieldProps, 'value'> = {}) {
  const model = ref(initial);
  const container = document.createElement('div');
  document.body.append(container);
  const app = createApp(() =>
    h(NumberField, {
      ...props,
      value: model.value,
      'onUpdate:value': (next) => {
        model.value = next;
      },
    }),
  );
  app.mount(container);
  onTestFinished(() => {
    app.unmount();
    container.remove();
  });

  const input = container.querySelector<HTMLInputElement>('input')!;
  async function type(text: string) {
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
  }
  async function key(key: string) {
    input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    await nextTick();
  }
  return {
    model,
    input,
    type,
    key,
    up: container.querySelector<HTMLButtonElement>('button[aria-label="Increase value"]')!,
    down: container.querySelector<HTMLButtonElement>('button[aria-label="Decrease value"]')!,
  };
}

describe('NumberField', () => {
  it('keeps sign and decimal drafts through model updates, and clears to null', async () => {
    const { input, model, type, key } = mountField(null, { step: 1 });
    await type('-');
    expect(input.value).toBe('-');
    expect(model.value).toBeNull();
    await type('-42.');
    expect(model.value).toBe(-42);
    expect(input.value).toBe('-42.');
    await type('-42.125');
    expect(model.value).toBe(-42.125);
    await key('ArrowUp');
    expect(model.value).toBe(-41.125);
    await type('');
    expect(model.value).toBeNull();
    expect(input.value).toBe('');
  });

  it('associates the numeric input with its field label, limits and error', () => {
    const { input } = mountField(null, { label: 'Weight', min: 0, max: 50, error: 'Enter a weight' });
    expect(input.labels?.[0].textContent).toBe('Weight');
    expect(input.getAttribute('aria-valuemin')).toBe('0');
    expect(input.getAttribute('aria-valuemax')).toBe('50');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const description = document.getElementById(input.getAttribute('aria-describedby')!);
    expect(description?.textContent).toBe('Enter a weight');
  });

  it('restores the last value after an unfinished edit and follows external updates', async () => {
    const { input, model, type } = mountField(7);
    input.focus();
    await type('-');
    expect(model.value).toBe(7);
    input.blur();
    await nextTick();
    expect(input.value).toBe('7');
    await type('7.');
    model.value = 0;
    await nextTick();
    expect(input.value).toBe('0');
  });

  it('uses decimal steps from the current value and stops both controls at inclusive bounds', async () => {
    const { input, model, up, down, key } = mountField(0.2, { min: 0.15, max: 0.35, step: 0.1 });
    up.click();
    await nextTick();
    expect(model.value).toBe(0.3);
    await key('ArrowUp');
    expect(input.value).toBe('0.35');
    expect(up.disabled).toBe(true);
    await key('ArrowUp');
    expect(model.value).toBe(0.35);
    down.click();
    await nextTick();
    expect(model.value).toBe(0.25);
    await key('ArrowDown');
    expect(model.value).toBe(0.15);
    expect(down.disabled).toBe(true);
    expect(input.getAttribute('aria-valuenow')).toBe('0.15');
  });

  it('bounds values from empty and lets a user finish typing across a limit', async () => {
    const { input, model, key, type } = mountField(null, { min: 10, max: 20 });
    await key('ArrowDown');
    expect(model.value).toBe(10);
    await type('1');
    expect(input.value).toBe('1');
    await type('15');
    expect(model.value).toBe(15);
    await type('150');
    expect(model.value).toBe(20);
    input.blur();
    await nextTick();
    expect(input.value).toBe('20');
  });

  it.each(['disabled', 'readonly'] as const)('prevents stepping when %s', async (state) => {
    const { input, model, up, down, key } = mountField(2, { [state]: true });
    expect(input.hasAttribute(state)).toBe(true);
    expect(up.disabled).toBe(true);
    expect(down.disabled).toBe(true);
    await key('ArrowUp');
    down.click();
    await nextTick();
    expect(model.value).toBe(2);
  });
});

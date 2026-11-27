// @vitest-environment jsdom
import { describe, expect, it, onTestFinished } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import { SliderField, type SliderFieldProps } from './index';

function mountField(initial: number, props: SliderFieldProps = {}, width = 200) {
  const value = ref(initial);
  const disabled = ref(false);
  const container = document.createElement('div');
  document.body.append(container);
  const app = createApp(() =>
    h(SliderField, {
      ...props,
      disabled: disabled.value,
      value: value.value,
      'onUpdate:value': (next) => {
        value.value = next;
      },
    }),
  );
  app.mount(container);
  onTestFinished(() => {
    app.unmount();
    container.remove();
  });

  const input = container.querySelector('input')!;
  // jsdom has no layout or native pointer capture.
  input.getBoundingClientRect = () => new DOMRect(0, 0, width, 24);
  input.setPointerCapture = () => {};
  async function pointer(type: string, x: number) {
    const event = new PointerEvent(type, { pointerId: 1, isPrimary: true, clientX: x, cancelable: true });
    input.dispatchEvent(event);
    await nextTick();
    return event;
  }
  async function key(key: string) {
    const event = new KeyboardEvent('keydown', { key, cancelable: true });
    input.dispatchEvent(event);
    await nextTick();
    return event;
  }
  async function type(draft: string) {
    input.value = draft;
    input.dispatchEvent(new Event('input'));
    await nextTick();
  }
  return { input, value, disabled, pointer, key, type };
}

describe('SliderField', () => {
  it.each([160, 320])('maps the same fractions of a %i px field to the same snapped values', async (width) => {
    const { input, value, pointer, key } = mountField(12.75, { min: -10, max: 90, step: 5 }, width);
    const start = width / 2;
    await pointer('pointerdown', start);
    await pointer('pointermove', start + 2);
    expect(value.value).toBe(12.75);

    await pointer('pointermove', start + width / 8);
    expect(value.value).toBe(25);
    // A quarter width is 25 units before snapping, relative to the precise starting value.
    await pointer('pointermove', start + width / 4);
    expect(value.value).toBe(40);
    await pointer('pointermove', start - width / 4);
    expect(value.value).toBe(-10);
    await pointer('pointerup', start + width / 4);
    input.dispatchEvent(new MouseEvent('click', { detail: 1 }));
    await nextTick();
    expect(value.value).toBe(40);
    expect(input.readOnly).toBe(true);
    await key('ArrowDown');
    expect(value.value).toBe(35);
  });

  it('selects the value on click and leaves subsequent pointer and cursor movements to the editor', async () => {
    const { input, pointer, key, type, value } = mountField(12.5);
    await pointer('pointerdown', 50);
    await pointer('pointerup', 51);
    expect(input.readOnly).toBe(false);
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 4]);
    input.setSelectionRange(1, 3);
    expect((await pointer('pointerdown', 45)).defaultPrevented).toBe(false);
    await pointer('pointerup', 45);
    expect([input.selectionStart, input.selectionEnd]).toEqual([1, 3]);
    expect((await key('ArrowLeft')).defaultPrevented).toBe(false);
    await type('42.125');
    expect(value.value).toBe(12.5);
    await key('Enter');
    expect(value.value).toBe(42.125);
    expect(document.activeElement).toBe(input);
    await key('ArrowLeft');
    expect(value.value).toBe(42);
  });

  it('supports keyboard-only editing, Escape, blur and incomplete drafts', async () => {
    const { input, value, key, type } = mountField(18);
    input.focus();
    await key('Enter');
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 2]);
    await type('23');
    await key('Escape');
    expect(input.value).toBe('18');
    expect(input.readOnly).toBe(true);

    for (const draft of ['', '-']) {
      await key('Enter');
      await type(draft);
      expect(value.value).toBe(18);
      input.blur();
      await nextTick();
      expect(input.value).toBe('18');
      input.focus();
    }

    await key('Enter');
    await type('42.125');
    input.blur();
    await nextTick();
    expect(value.value).toBe(42.125);
    expect(input.readOnly).toBe(true);
  });

  it('steps from min, includes a shortened final interval and clamps exact entries', async () => {
    const { value, pointer, key, type } = mountField(1.18, { min: 1, max: 1.25, step: 0.1 });
    await key('ArrowUp');
    expect(value.value).toBe(1.2);
    await key('ArrowRight');
    expect(value.value).toBe(1.25);
    await pointer('pointerdown', 10);
    await pointer('pointermove', -22);
    expect(value.value).toBe(1.2);
    await pointer('pointerup', 2);
    expect(value.value).toBe(1.25);
    await key('Home');
    expect(value.value).toBe(1);
    await key('Enter');
    await type('2');
    await key('Enter');
    expect(value.value).toBe(1.25);
  });

  it('discards an active draft when disabled and blocks both ways of adjusting', async () => {
    const { input, value, disabled, pointer, key, type } = mountField(42);
    await key('Enter');
    await type('17');
    disabled.value = true;
    await nextTick();
    expect(input.disabled).toBe(true);
    expect(input.value).toBe('42');
    await key('Enter');
    await key('ArrowUp');
    await pointer('pointerdown', 20);
    await pointer('pointerup', 40);
    expect(input.readOnly).toBe(true);
    expect(value.value).toBe(42);
  });
});

// @vitest-environment jsdom
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import { installPopoverPolyfill } from '../../../tests/unit/popover';
import { ColorPicker, type ColorPickerValue, type ColorPickerLayout } from './index';

const initial = { r: 0.123456789012345, g: 0.500000003, b: 0.876543210987654, a: 0.287654321 };
function mount(initialColor = initial) {
  installPopoverPolyfill();
  const value = ref({ ...initialColor });
  const alpha = ref(true);
  const layout = ref<ColorPickerLayout>('sv-h');
  const disabled = ref(false);
  const container = document.createElement('div');
  document.body.append(container);
  const updates = vi.fn((next: ColorPickerValue) => {
    value.value = next;
  });
  const close = vi.fn();
  const app = createApp(() =>
    h(ColorPicker, {
      value: value.value,
      layout: layout.value,
      'onUpdate:value': updates,
      onClose: close,
      alpha: alpha.value,
      disabled: disabled.value,
      defaultValue: initial,
    }),
  );
  app.mount(container);
  onTestFinished(() => {
    app.unmount();
    container.remove();
  });
  const input = (name: string) => container.querySelector<HTMLInputElement>(`input[aria-label="${name}"]`)!;
  async function select(label: string, next: string) {
    if (label === 'Color model') {
      container.querySelector<HTMLInputElement>(`input[type="radio"][value="${next}"]`)!.click();
    } else {
      const options = container.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]');
      Array.from(options)
        .find((option) => option.textContent?.trim().endsWith(next))!
        .click();
    }
    await nextTick();
  }
  async function key(el: HTMLElement, key: string) {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    await nextTick();
  }
  async function type(label: string, text: string) {
    const field = input(label);
    field.focus();
    if (field.readOnly) await key(field, 'Enter');
    field.value = text;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
  }
  async function enter(label: string, text: string) {
    await type(label, text);
    await key(input(label), 'Enter');
  }
  return { value, layout, updates, close, container, alpha, disabled, input, select, key, type, enter };
}

describe('ColorPicker', () => {
  it('preserves full precision across layouts, models, spaces and unedited fields', async () => {
    const p = mount();
    for (const layout of ['hs-v', 'hv-s', 'hsv-wheel', 'hsl-wheel', 'sv-h'] as const) {
      p.layout.value = layout;
      await nextTick();
    }
    for (const space of ['Linear sRGB', 'sRGB']) {
      await p.select('Channel space', space);
      for (const [model, field] of [
        ['HSV', 'Hue'],
        ['HSL', 'Lightness'],
        ['RGB', 'Blue'],
      ]) {
        await p.select('Color model', model);
        p.input(field).focus();
        await p.key(p.input(field), 'Enter');
        await p.key(p.input(field), 'Enter');
        p.input(field).blur();
      }
    }
    expect(p.updates).not.toHaveBeenCalled();
    expect(p.value.value).toEqual(initial);
    await p.select('Channel space', 'Linear sRGB');
    await p.enter('Red', '0.21404114048223255');
    expect(p.value.value).toEqual({ ...initial, r: expect.closeTo(0.5, 14) });
    await p.enter('Green', '1');
    expect(p.value.value.g).toBe(1);
    await p.enter('Hex', '800000');
    expect(p.value.value).toEqual({ r: 128 / 255, g: 0, b: 0, a: initial.a });
    expect(Number(p.input('Red').getAttribute('aria-valuenow'))).toBeCloseTo(0.2158605001, 9);
    await p.select('Channel space', 'sRGB');
    expect(p.input('Red').value).toContain('128');
    await p.key(p.input('Red'), 'ArrowUp');
    expect(p.value.value.r).toBe(129 / 255);
  });

  it.each([
    ['HSV', 'Value', 0.7353569830524495],
    ['HSL', 'Lightness', 0.8808250210902997],
  ] as const)('edits %s in linear sRGB while keeping alpha independent', async (model, level, cyan) => {
    const p = mount({ r: 0, g: 1, b: 0, a: 0 });
    await p.select('Channel space', 'Linear sRGB');
    await p.select('Color model', model);
    await p.enter('Hue', '180');
    await p.enter('Saturation', '50');
    await p.enter(level, '50');
    expect(p.value.value.r).toBeCloseTo(0.5370987304831942, 14);
    expect(p.value.value.g).toBeCloseTo(cyan, 14);
    expect(p.value.value.b).toBeCloseTo(cyan, 14);
    expect(p.value.value.a).toBe(0);
  });

  it.each([
    ['HSV', 'Value'],
    ['HSL', 'Lightness'],
  ])('recovers hue at gray and saturation at black in %s', async (model, level) => {
    const p = mount({ r: 0.4, g: 0.4, b: 0.4, a: 0 });
    await p.select('Color model', model);
    await p.enter('Hue', '240');
    expect(p.updates).not.toHaveBeenCalled();
    await p.enter('Saturation', '75');
    const chromatic = { ...p.value.value };
    expect(chromatic.b).toBeGreaterThan(chromatic.g);
    expect(chromatic.g).toBe(chromatic.r);
    await p.enter(level, '0');
    expect(p.value.value).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    await p.select('Color model', 'RGB');
    await p.select('Color model', model);
    await p.enter(level, '40');
    expect(p.value.value).toEqual(chromatic);
    await p.enter(level, '0');
    await p.enter('Hue', '120');
    await p.enter('Saturation', '50');
    await p.enter(level, '40');
    expect(p.value.value.g).toBeGreaterThan(p.value.value.b);
    expect(Number(p.input('Saturation').getAttribute('aria-valuenow'))).toBeCloseTo(50);
    expect(p.value.value.a).toBe(0);
  });

  it('commits valid Hex on blur or Enter and retains RGB under zero alpha', async () => {
    const p = mount();
    await p.type('Hex', '#12a0');
    expect(p.value.value).toEqual(initial);
    p.input('Hex').blur();
    await nextTick();
    expect(p.value.value).toEqual({ r: 17 / 255, g: 34 / 255, b: 170 / 255, a: 0 });
    await p.enter('Hex', 'acf');
    expect(p.value.value).toEqual({ r: 170 / 255, g: 204 / 255, b: 1, a: 0 });
    await p.enter('Alpha', '12.3456789');
    p.alpha.value = false;
    await nextTick();
    await p.enter('Hex', '#98765432');
    expect(p.input('Alpha')).toBeNull();
    expect(p.value.value).toEqual({ r: 0x98 / 255, g: 0x76 / 255, b: 0x54 / 255, a: 0.123456789 });
    p.alpha.value = true;
    await nextTick();
    await p.enter('Hex', '01020380');
    expect(p.value.value).toEqual({ r: 1 / 255, g: 2 / 255, b: 3 / 255, a: 128 / 255 });
  });

  it('discards invalid and cancelled drafts, including when the parent changes a channel in place', async () => {
    const p = mount();
    for (const [name, text] of [
      ['Hex', 'abcde'],
      ['Red', ''],
      ['Red', '256'],
      ['Red', '1e'],
    ]) {
      await p.enter(name, text);
      expect(p.input(name).value).not.toBe(text);
    }
    expect(p.updates).not.toHaveBeenCalled();
    await p.type('Hex', 'fedc');
    await p.key(p.input('Hex'), 'Escape');
    expect(p.close).not.toHaveBeenCalled();
    expect(p.input('Hex').value).toBe('#1F80E049');
    await p.key(p.input('Hex'), 'Escape');
    expect(p.close).toHaveBeenCalledOnce();
    await p.type('Red', '-');
    p.value.value.r = 0.456789;
    await nextTick();
    expect(p.input('Red').value).toContain('116');
    expect(p.input('Red').readOnly).toBe(true);
    await p.key(p.input('Red'), 'Enter');
    expect(p.updates).not.toHaveBeenCalled();
  });

  it('continues editing after a cancelled eyedropper and samples encoded RGB independently of alpha', async () => {
    let cancel = true;
    vi.stubGlobal(
      'EyeDropper',
      class {
        async open() {
          if (cancel) throw new DOMException('Cancelled', 'AbortError');
          return { sRGBHex: '#336699' };
        }
      },
    );
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });
    const p = mount();
    await nextTick();
    const button = p.container.querySelector<HTMLButtonElement>('[aria-label="Screen eyedropper"]')!;
    button.click();
    await nextTick();
    expect(p.value.value).toEqual(initial);
    await p.enter('Alpha', '0');
    cancel = false;
    button.click();
    await nextTick();
    expect(p.value.value).toEqual({ r: 0.2, g: 0.4, b: 0.6, a: 0 });
    p.disabled.value = true;
    await nextTick();
    expect(button.disabled).toBe(true);
    expect(p.input('Hex').disabled).toBe(true);
    await p.key(p.container.querySelector('[data-part="plane"]')!, 'ArrowDown');
    expect(p.value.value).toEqual({ r: 0.2, g: 0.4, b: 0.6, a: 0 });
  });
});

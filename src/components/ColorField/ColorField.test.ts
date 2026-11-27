// @vitest-environment jsdom
import { expect, it, onTestFinished, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import { installPopoverPolyfill, isPopoverOpen } from '../../../tests/unit/popover';
import type { ColorPickerLayout, ColorPickerSpace, ColorPickerValue } from '@/components/ColorPicker';
import { ColorField } from './index';

it('synchronizes the field and open editor with the parent, including while disabled', async () => {
  installPopoverPolyfill();
  const value = ref({ r: 0.123456789, g: 1, b: 0, a: 0 });
  const disabled = ref(false);
  const update = vi.fn((next: ColorPickerValue) => {
    value.value = next;
  });
  const app = createApp(() =>
    h(ColorField, { label: 'Fill', value: value.value, disabled: disabled.value, 'onUpdate:value': update }),
  );
  const container = document.createElement('div');
  document.body.append(container);
  app.mount(container);
  onTestFinished(() => {
    app.unmount();
    container.remove();
  });

  const field = container.querySelector<HTMLInputElement>('input')!;
  const trigger = container.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
  const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!;
  trigger.click();
  await nextTick();
  expect(isPopoverOpen(dialog)).toBe(true);
  expect(update).not.toHaveBeenCalled();
  const hex = dialog.querySelector<HTMLInputElement>('input[aria-label="Hex"]')!;
  hex.value = 'ABC';
  hex.dispatchEvent(new Event('input', { bubbles: true }));
  hex.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await nextTick();
  expect(value.value).toEqual({ r: 170 / 255, g: 187 / 255, b: 204 / 255, a: 0 });
  expect(field.value).toBe('#AABBCC00');
  value.value.r = 0;
  await nextTick();
  expect(field.value).toBe('#00BBCC00');
  expect(hex.value).toBe('#00BBCC00');

  disabled.value = true;
  await nextTick();
  expect(isPopoverOpen(dialog)).toBe(false);
  value.value.a = 1;
  trigger.click();
  await nextTick();
  expect(isPopoverOpen(dialog)).toBe(false);
  expect(field.value).toBe('#00BBCCFF');
  expect(update).toHaveBeenCalledTimes(1);
});

it('shares diagram and numeric space preferences between fields without editing either color', async () => {
  installPopoverPolyfill();
  const layout = ref<ColorPickerLayout>('sv-h');
  const space = ref<ColorPickerSpace>('srgb');
  const value = { r: 0.123456789, g: 0, b: 1, a: 0.501234 };
  const update = vi.fn();
  const app = createApp(() =>
    ['Fill', 'Stroke'].map((label) =>
      h(ColorField, {
        label,
        value,
        layout: layout.value,
        channelSpace: space.value,
        'onUpdate:value': update,
        'onUpdate:layout': (next) => {
          layout.value = next;
        },
        'onUpdate:channelSpace': (next) => {
          space.value = next;
        },
      }),
    ),
  );
  const container = document.createElement('div');
  document.body.append(container);
  app.mount(container);
  onTestFinished(() => {
    app.unmount();
    container.remove();
  });
  const openField = async (label: string) => {
    container
      .querySelector<HTMLButtonElement>(`button[aria-haspopup="dialog"][aria-label="Color picker (${label})"]`)!
      .click();
    await nextTick();
    return container.querySelector<HTMLElement>(`[role="dialog"][aria-label="Color picker (${label})"]`)!;
  };
  const fill = await openField('Fill');
  for (const label of ['HSL wheel', 'Linear sRGB']) {
    fill.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')!.click();
    await nextTick();
    const options = [...fill.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')];
    options.find((option) => option.textContent?.trim().endsWith(label))!.click();
    await nextTick();
  }
  const stroke = await openField('Stroke');
  expect(stroke.querySelector('[data-part="plane"]')?.getAttribute('data-wheel')).toBe('true');
  expect(stroke.querySelector('[role="spinbutton"][aria-label="Red"]')?.getAttribute('aria-valuemax')).toBe('1');
  expect(update).not.toHaveBeenCalled();
});

it('commits Hex drafts from the input and preserves precision, opacity and read-only state', async () => {
  installPopoverPolyfill();
  const original = { r: 0.123456789, g: 0, b: 1, a: 0.567891 };
  const value = ref({ ...original });
  const readonly = ref(false);
  const update = vi.fn((next: ColorPickerValue) => {
    value.value = next;
  });
  const app = createApp(() =>
    h(ColorField, { value: value.value, readonly: readonly.value, alpha: false, 'onUpdate:value': update }),
  );
  const container = document.createElement('div');
  document.body.append(container);
  app.mount(container);
  onTestFinished(() => {
    app.unmount();
    container.remove();
  });
  const field = container.querySelector('input')!;
  const type = async (text: string) => {
    field.value = text;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
  };
  const press = (key: string) => field.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

  field.focus();
  field.blur();
  press('Enter');
  expect(update).not.toHaveBeenCalled();
  await type('#ACF');
  expect(value.value).toEqual(original);
  press('Escape');
  await nextTick();
  expect(field.value).toBe('#1F00FF');
  field.focus();
  await type('');
  field.blur();
  await nextTick();
  expect(field.value).toBe('#1F00FF');
  expect(update).not.toHaveBeenCalled();
  await type('#ACF0');
  press('Enter');
  await nextTick();
  expect(value.value).toEqual({ r: 170 / 255, g: 204 / 255, b: 1, a: original.a });
  await type('#123');
  value.value.g = 0;
  await nextTick();
  expect(field.value).toBe('#AA00FF');
  readonly.value = true;
  await nextTick();
  expect(field.readOnly).toBe(true);
  expect(field.disabled).toBe(false);
  expect(container.querySelector('button')!.disabled).toBe(true);
});

// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { createApp, h, ref, nextTick, inject } from 'vue';
import { M3VuePlugin } from '../plugin';
import { presets } from './definitions';
import {
  Switch,
  Button,
  IconButton,
  TextField,
  Select,
  Combobox,
  MenuItem,
  ListItem,
  buttonContextKey,
} from '../index';

it('installs a complete compact preset and honors reactive explicit overrides', async () => {
  const host = document.createElement('div');
  const size = ref<'small' | 'medium'>('medium');
  const app = createApp(() =>
    h('div', [
      h(Switch, { checked: false }),
      h(Switch, { checked: false, size: 'small' }),
      h({
        setup() {
          expect(inject(buttonContextKey)).toEqual({ size: 'small', pressShapeMorph: false });
          return () => h(Button, {}, () => 'Action');
        },
      }),
      h(IconButton, { icon: 'add' }),
      h(TextField, { modelValue: '' }),
      h(MenuItem, {}, () => 'Item'),
      h(ListItem, {}, () => 'List'),
    ]),
  );
  app.use(M3VuePlugin, {
    preset: presets.compact,
    switchSize: size,
    buttonDefaults: { pressShapeMorph: false, size: undefined },
  });
  app.mount(host);
  try {
    expect(
      [...host.querySelectorAll('[data-scope="switch"][data-part="root"]')].map((el) => el.getAttribute('data-size')),
    ).toEqual(['medium', 'small']);
    for (const [scope, expected] of [
      ['button', 'small'],
      ['icon-button', 'extra-small'],
      ['text-field', 'small'],
      ['menu-item', 'small'],
      ['item', 'small'],
    ]) {
      expect(host.querySelector(`[data-scope="${scope}"][data-part="root"]`)?.getAttribute('data-size')).toBe(expected);
    }
    size.value = 'small';
    await nextTick();
    expect(host.querySelector('[data-scope="switch"]')?.getAttribute('data-size')).toBe('small');
    expect(presets.compact.defaults.buttonDefaults).toEqual({ size: 'small' });
  } finally {
    app.unmount();
  }
});

it('can disable global directives without disabling compact component defaults', () => {
  const host = document.createElement('div');
  const app = createApp(() => h(TextField, { modelValue: '', label: 'Name' }));
  const directive = vi.spyOn(app, 'directive');
  app.use(M3VuePlugin, { preset: presets.compact, directives: false });
  app.mount(host);
  try {
    expect(directive).not.toHaveBeenCalled();
    expect(host.querySelector('[data-part="root"]')?.getAttribute('data-size')).toBe('small');
    expect(host.querySelector('input')?.getAttribute('aria-label')).toBe('Name');
    expect(host.querySelector('label')).toBeNull();
  } finally {
    app.unmount();
  }
});

it('compact installs external labels, while application and component overrides remain available', () => {
  for (const override of [undefined, 'floating'] as const) {
    const host = document.createElement('div');
    const app = createApp(() =>
      h('div', [
        h(TextField, { label: 'Name', modelValue: '' }),
        h(Select, { label: 'Units', options: [] }),
        h(Combobox, { label: 'Material', options: [] }),
      ]),
    );
    app.use(M3VuePlugin, { preset: presets.compact, fieldLabelBehavior: override });
    app.mount(host);
    try {
      expect(host.querySelectorAll('label')).toHaveLength(override ? 3 : 0);
      if (!override)
        expect(
          [...host.querySelectorAll('[data-scope="text-field"][data-part="input"]')].map((el) =>
            el.getAttribute('aria-label'),
          ),
        ).toEqual(['Name', 'Units', 'Material']);
    } finally {
      app.unmount();
    }
  }
});

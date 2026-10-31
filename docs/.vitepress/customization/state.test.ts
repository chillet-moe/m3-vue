import { themePresets } from '@/theme/presets';
// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { createApp, h, nextTick } from 'vue';
import { Switch } from '@/components/Switch';
import { M3VuePlugin } from '@/plugin';
import { provideDocsCustomization } from './state';
import { customizationCode } from './code';

it('keeps the live Switch default and generated plugin configuration in sync', async () => {
  localStorage.clear();
  const host = document.createElement('div');
  let customization!: ReturnType<typeof provideDocsCustomization>;
  const app = createApp({
    setup() {
      customization = provideDocsCustomization();
      return () => h('div', [h(Switch, { checked: false }), h(Switch, { checked: false, size: 'medium' })]);
    },
  });
  app.mount(host);
  try {
    for (const size of ['small', 'medium'] as const) {
      customization.setDefault('switchSize', size);
      await nextTick();
      const controls = host.querySelectorAll<HTMLElement>('[data-scope="switch"][data-part="root"]');
      expect([...controls].map((el) => el.dataset.size)).toEqual([size, 'medium']);
      const code = customizationCode(customization.state, customization.resolvedTokens.value, {});
      const options = JSON.parse(
        code.setup
          .match(/app.use\(M3VuePlugin, ([\s\S]+?)\);/)![1]!
          .replace('defaultPreset', JSON.stringify(themePresets.default)),
      );
      const consumerHost = document.createElement('div');
      const consumer = createApp(() => h(Switch, { checked: false }));
      consumer.use(M3VuePlugin, options);
      consumer.mount(consumerHost);
      try {
        expect(consumerHost.firstElementChild?.getAttribute('data-size')).toBe(size);
      } finally {
        consumer.unmount();
      }
    }
    customization.reset();
    customization.setPreset('compact');
    await nextTick();
    expect(host.querySelector('[data-part="root"]')?.getAttribute('data-size')).toBe('small');
    expect(customizationCode(customization.state, customization.resolvedTokens.value, {}).setup).not.toContain(
      'switchSize',
    );
    customization.setTypography('default');
    await nextTick();
    expect(host.querySelector('[data-part="root"]')?.getAttribute('data-size')).toBe('small');
    customization.reset();
    await nextTick();
    expect(host.querySelector('[data-part="root"]')?.getAttribute('data-size')).toBe('medium');
    expect(customizationCode(customization.state, customization.resolvedTokens.value, {}).setup).not.toContain(
      'switchSize',
    );
  } finally {
    app.unmount();
    localStorage.clear();
  }
});

it('applies the preset label behavior and emits only explicit differences', async () => {
  localStorage.clear();
  const { TextField } = await import('@/components/TextField');
  const host = document.createElement('div');
  let customization!: ReturnType<typeof provideDocsCustomization>;
  const app = createApp({
    setup() {
      customization = provideDocsCustomization();
      return () => h(TextField, { modelValue: '', label: 'Name' });
    },
  });
  app.mount(host);
  try {
    customization.setPreset('compact');
    await nextTick();
    expect(host.querySelector('label')).toBeNull();
    expect(host.querySelector('input')?.getAttribute('aria-label')).toBe('Name');
    expect(customizationCode(customization.state, customization.resolvedTokens.value, {}).setup).not.toContain(
      'fieldLabelBehavior',
    );
    customization.setDefault('fieldLabelBehavior', 'floating');
    await nextTick();
    expect(host.querySelector('label')?.textContent).toBe('Name');
    expect(customizationCode(customization.state, customization.resolvedTokens.value, {}).setup).toContain(
      '"fieldLabelBehavior": "floating"',
    );
    customization.setDefault('fieldLabelBehavior', '');
    await nextTick();
    expect(host.querySelector('label')).toBeNull();
  } finally {
    app.unmount();
    localStorage.clear();
  }
});

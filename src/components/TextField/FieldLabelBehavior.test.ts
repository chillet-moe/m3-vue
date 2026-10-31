// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { createApp, h, nextTick, ref, provide, type Component as ComponentType } from 'vue';
import { TextField, Select, Combobox, fieldContextKey, type FieldLabelBehavior } from '@/index';

for (const Component of [TextField, Select, Combobox]) {
  it(`${Component.__name} follows reactive external labeling and explicit overrides`, async () => {
    const host = document.createElement('div');
    const behavior = ref<FieldLabelBehavior>('external');
    const app = createApp({
      setup() {
        provide(fieldContextKey, { labelBehavior: behavior, labelClearance: '2rem' });
        return () =>
          h('div', [
            h(Component as ComponentType, { label: 'Name', modelValue: '', options: [] }),
            h(Component as ComponentType, {
              modelValue: '',
              label: 'Override',
              labelBehavior: 'floating',
              options: [],
            }),
            h(Component as ComponentType, {
              modelValue: '',
              label: 'Fallback',
              'aria-labelledby': 'visible-label',
              options: [],
            }),
            h(Component as ComponentType, {
              modelValue: '',
              label: 'Fallback',
              'aria-label': 'Explicit name',
              options: [],
            }),
          ]);
      },
    });
    app.mount(host);
    try {
      const inputs = host.querySelectorAll('[data-scope="text-field"][data-part="input"]');
      expect(inputs[0]?.getAttribute('aria-label')).toBe('Name');
      expect(inputs[2]?.getAttribute('aria-label')).toBeNull();
      expect(inputs[2]?.getAttribute('aria-labelledby')).toBe('visible-label');
      expect(inputs[3]?.getAttribute('aria-label')).toBe('Explicit name');
      expect([...host.querySelectorAll('label')].map((el) => el.textContent)).toEqual(['Override']);
      expect(host.querySelectorAll('legend')).toHaveLength(1);
      const root = host.firstElementChild!.firstElementChild as HTMLElement;
      expect(root.style.marginBlockStart).toBe('');
      behavior.value = 'floating';
      await nextTick();
      expect(inputs[0]?.getAttribute('aria-label')).toBeNull();
      expect(host.querySelector('label')?.htmlFor).toBe(inputs[0]?.getAttribute('id'));
      expect(root.style.marginBlockStart).toBe('2rem');
    } finally {
      app.unmount();
    }
  });
}

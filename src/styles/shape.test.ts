// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { createApp, defineComponent, h, nextTick, provide, ref } from 'vue';
import { Button, Select, Combobox, fieldContextKey, provideShape, type M3Shape } from '@/index';

it('preserves component defaults and explicit field shapes across reactive subtree changes', async () => {
  const mode = ref<M3Shape>();
  const options = [{ value: 'one', label: 'One' }];
  const FieldRegion = defineComponent({
    setup() {
      provide(fieldContextKey, { shape: 'square' });
      return () => h(Select, { id: 'explicit', shape: 'minimal', options });
    },
  });
  const Root = defineComponent({
    setup() {
      provideShape(mode);
      return () =>
        h('div', [
          h(Select, { id: 'select', options }),
          h(Combobox, { id: 'combo', options }),
          h(Button, { id: 'local', shape: 'rounded' }, () => 'Local'),
          h(FieldRegion),
        ]);
    },
  });
  const host = document.createElement('div');
  document.body.append(host);
  const app = createApp(Root);
  app.mount(host);
  const fieldShape = (id: string) =>
    host.querySelector(`#${id}`)?.closest('[data-scope="text-field"][data-part="root"]')?.getAttribute('data-shape');
  try {
    expect(fieldShape('select')).toBe('square');
    expect(fieldShape('combo')).toBe('square');
    expect(fieldShape('explicit')).toBe('minimal');
    mode.value = 'sharp';
    await nextTick();
    expect(fieldShape('select')).toBe('sharp');
    expect(fieldShape('combo')).toBe('sharp');
    expect(fieldShape('explicit')).toBe('minimal');
    expect(host.querySelector('#local')?.getAttribute('data-shape')).toBe('rounded');
    mode.value = undefined;
    await nextTick();
    expect(fieldShape('select')).toBe('square');
  } finally {
    app.unmount();
    host.remove();
  }
});

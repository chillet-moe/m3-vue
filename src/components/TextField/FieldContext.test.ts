// @vitest-environment jsdom
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';
import { createApp, defineComponent, h, inject, nextTick, provide, ref } from 'vue';
import {
  fieldContextKey,
  type FieldContext,
  TextField,
  type TextFieldSize,
  Select,
  Combobox,
  M3VuePlugin,
  type M3VuePluginOptions,
} from '@/index';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('field size defaults', () => {
  it.each(['provide', 'plugin', 'unconfigured'] as const)(
    'resolves %s defaults, subtree overrides and explicit props reactively',
    async (installation) => {
      const size = ref<TextFieldSize | undefined>('small');
      const subtreeSize = ref<TextFieldSize>('medium');
      const explicitSize = ref<TextFieldSize | undefined>('extra-small');
      const shape = ref<'rounded' | 'square'>('rounded');
      const labelClearance = ref('0.5rem');
      const controls = (prefix: string, explicit = false) => [
        h(TextField, { modelValue: '', class: `${prefix}-input`, size: explicit ? explicitSize.value : undefined }),
        h(Combobox, { class: `${prefix}-combobox`, options: [], size: explicit ? explicitSize.value : undefined }),
        h(Select, { class: `${prefix}-select`, options: [], size: explicit ? explicitSize.value : undefined }),
        h(TextField, {
          modelValue: '',
          class: `${prefix}-textarea`,
          as: 'textarea',
          size: explicit ? explicitSize.value : undefined,
        }),
      ];
      const Subtree = defineComponent({
        setup() {
          const inherited = inject(fieldContextKey, {});
          provide(fieldContextKey, { ...inherited, size: subtreeSize });
          return () => h('section', [...controls('local'), ...controls('explicit', true)]);
        },
      });
      const app = createApp(() => h('div', [...controls('app'), h(Subtree)]));
      if (installation === 'provide') app.provide(fieldContextKey, { size, shape, labelClearance });
      if (installation === 'plugin') app.use(M3VuePlugin, { fieldSize: size, shape });
      const container = document.createElement('div');
      document.body.appendChild(container);
      app.mount(container);
      const element = (name: string) => container.querySelector<HTMLElement>(`.${name}`)!;
      const expectSizes = (prefix: string, expected: TextFieldSize) => {
        expect(element(`${prefix}-input`).dataset.size).toBe(expected);
        expect(element(`${prefix}-select`).dataset.size).toBe(expected);
        expect(element(`${prefix}-combobox`).dataset.size).toBe(expected);
        expect(
          element(`${prefix}-select`).querySelector<HTMLElement>('[data-scope="text-field"][data-part="root"]')?.dataset
            .size,
        ).toBe(expected);
        expect(element(`${prefix}-textarea`).dataset.size).toBe('medium');
        expect(element(`${prefix}-textarea`).querySelector('textarea')).not.toBeNull();
      };
      try {
        expectSizes('app', installation === 'unconfigured' ? 'medium' : 'small');
        expectSizes('local', 'medium');
        expectSizes('explicit', 'extra-small');
        if (installation !== 'unconfigured') {
          expect(element('local-input').dataset.shape).toBe('rounded');
          shape.value = 'square';
        }
        if (installation === 'provide') {
          expect(element('local-input').style.marginBlockStart).toBe('0.5rem');
          expect(element('local-select').style.marginBlockStart).toBe('0.5rem');
          labelClearance.value = '1rem';
        }
        size.value = 'extra-small';
        subtreeSize.value = 'small';
        await nextTick();
        expectSizes('app', installation === 'unconfigured' ? 'medium' : 'extra-small');
        expectSizes('local', 'small');
        expectSizes('explicit', 'extra-small');
        if (installation !== 'unconfigured') expect(element('local-input').dataset.shape).toBe('square');
        if (installation === 'provide') expect(element('local-select').style.marginBlockStart).toBe('1rem');
        size.value = undefined;
        explicitSize.value = undefined;
        await nextTick();
        expectSizes('app', 'medium');
        expectSizes('explicit', 'small');
      } finally {
        app.unmount();
      }
    },
  );

  it('exports typed field and plugin configuration', () => {
    expectTypeOf<FieldContext['size']>().toEqualTypeOf<M3VuePluginOptions['fieldSize']>();
    expectTypeOf<'large'>().not.toExtend<NonNullable<FieldContext['size']>>();
  });
});

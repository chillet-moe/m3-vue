// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref } from 'vue';
import { M3VuePlugin } from '@/plugin';
import Combobox from '@/components/Combobox/Combobox.vue';
import Select from './Select.vue';
import SelectItem from './SelectItem.vue';
import { provideSelectDefaults, selectContextKey } from './SelectContext';
import type { SelectListSlot } from '@/composables/selectTypes';

const options = [{ value: 'a', label: 'Alpha' }];

describe('Select checkmark defaults', () => {
  it.each(['plugin', 'context'] as const)(
    'inherits reactive %s, subtree and instance defaults for all list compositions',
    async (mode) => {
      const application = ref<boolean | undefined>(false);
      const subtree = ref<boolean | undefined>();
      const instance = ref<boolean | undefined>();
      const Subtree = defineComponent({
        setup() {
          provideSelectDefaults({ showSelectedIcon: subtree });
          return () =>
            h('section', { id: 'subtree' }, [
              h(Select, { options, modelValue: 'a', showSelectedIcon: instance.value }),
              h(Combobox, { options, modelValue: 'a', showSelectedIcon: instance.value }),
              h(
                Select,
                { options, modelValue: 'a', showSelectedIcon: instance.value },
                {
                  list: (list: SelectListSlot) =>
                    list.entries.map(({ option }, index) => h(SelectItem, { key: option.value, option, index })),
                },
              ),
            ]);
        },
      });
      const app = createApp(() =>
        h('main', [h(Select, { options, modelValue: 'a' }), h(Combobox, { options, modelValue: 'a' }), h(Subtree)]),
      );
      if (mode === 'plugin') app.use(M3VuePlugin, { selectDefaults: { showSelectedIcon: application } });
      else app.provide(selectContextKey, { showSelectedIcon: application });
      const container = document.createElement('div');
      document.body.append(container);
      try {
        app.mount(container);
        const assertChecks = (total: number) =>
          expect(container.querySelectorAll('[data-part="option-check"]')).toHaveLength(total);
        assertChecks(0);
        expect(container.querySelectorAll('.m3-menu-item-leading')).toHaveLength(0);
        expect(container.querySelectorAll('[aria-selected="true"]')).toHaveLength(5);
        subtree.value = true;
        await nextTick();
        assertChecks(3);
        instance.value = false;
        await nextTick();
        assertChecks(0);
        instance.value = undefined;
        await nextTick();
        assertChecks(3);
        subtree.value = undefined;
        await nextTick();
        assertChecks(0);
        application.value = true;
        await nextTick();
        assertChecks(5);
        application.value = undefined;
        await nextTick();
        assertChecks(5);
      } finally {
        app.unmount();
        container.remove();
      }
    },
  );

  it('keeps leading icons and authored leading content when checkmarks are hidden', () => {
    const container = document.createElement('div');
    const app = createApp(() =>
      h('main', [
        h(Select, { options: [{ ...options[0]!, leadingIcon: 'coffee' }], modelValue: 'a', showSelectedIcon: false }),
        h(
          Combobox,
          { options, modelValue: ['a'], multiple: true, showSelectedIcon: false },
          { optionLeading: () => h('span', 'Custom leading') },
        ),
      ]),
    );
    try {
      app.mount(container);
      expect(container.querySelector('[data-part="option-check"]')).toBeNull();
      expect([...container.querySelectorAll('[data-part="option-icon"]')].map((el) => el.textContent)).toEqual([
        'coffee',
        'Custom leading',
      ]);
      expect(container.querySelectorAll('[aria-selected="true"]')).toHaveLength(2);
    } finally {
      app.unmount();
    }
  });
});

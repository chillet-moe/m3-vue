// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref, type EffectScope } from 'vue';
import { useSelect } from './useSelect';
import type { UseSelectModelValue, UseSelectOption } from './selectTypes';

const scopes: EffectScope[] = [];
afterEach(() => scopes.splice(0).forEach((scope) => scope.stop()));
function setup(initial: UseSelectOption[], multiple = false) {
  const options = ref(initial);
  const modelValue = ref<UseSelectModelValue>();
  const query = ref('');
  const open = ref(false);
  const disabled = ref(false);
  const labels = ref<Record<string, string>>({});
  const external = ref(false);
  const scope = effectScope();
  scopes.push(scope);
  const select = scope.run(() =>
    useSelect({
      options: () => options.value,
      multiple: () => multiple,
      disabled: () => disabled.value,
      filterable: () => true,
      displaySeparator: () => ', ',
      id: () => 'list',
      resolveLabel: (value) => labels.value[value],
      filterMode: () => (external.value ? 'external' : 'local'),
      modelValue,
      open,
      query,
      focus: vi.fn(),
      blur: vi.fn(),
      showMenu: () => {
        open.value = true;
      },
      hideMenu: () => {
        open.value = false;
      },
      scrollElement: () => undefined,
    }),
  )!;
  const key = (key: string) => select.handleFilterKeydown(new KeyboardEvent('keydown', { key, cancelable: true }));
  return { select, options, modelValue, query, open, disabled, labels, external, key };
}

describe('Select logical collection', () => {
  it('navigates unmounted rows, skips disabled entries and keeps activity independent of selection', async () => {
    const { select, key, modelValue, open } = setup([
      { value: 0, label: 'Disabled', disabled: true },
      { value: 1, label: 'First' },
      { value: 2, label: 'Last' },
    ]);
    const scroll = vi.fn();
    select.list.value.setScrollToIndex(scroll);
    key('ArrowDown');
    await nextTick();
    expect(select.activeIndex.value).toBe(1);
    expect(modelValue.value).toBeUndefined();
    key('End');
    expect(scroll).toHaveBeenLastCalledWith(2);
    expect(select.activeDescendant.value).toBeUndefined();
    const row = document.createElement('button');
    select.optionProps(2, { value: 2, label: 'Last' }).ref(row);
    expect(select.activeDescendant.value).toBe('list-option-number-2');
    select.optionProps(2, { value: 2, label: 'Last' }).ref(null);
    expect(select.activeDescendant.value).toBeUndefined();
    key('ArrowDown');
    expect(select.activeIndex.value).toBe(1);
    key('ArrowUp');
    expect(select.activeIndex.value).toBe(2);
    key('Enter');
    expect(modelValue.value).toBe(2);
    expect(open.value).toBe(false);
  });

  it('retains identity when results reorder and resolves selected labels outside asynchronous results', async () => {
    const { select, key, modelValue, options, query, labels, external } = setup([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]);
    modelValue.value = 'b';
    select.openMenu();
    options.value.reverse();
    await nextTick();
    expect(select.activeIndex.value).toBe(0);
    external.value = true;
    query.value = 'unrelated search';
    options.value = [{ value: 'c', label: 'Server result' }];
    await nextTick();
    expect(select.displayText.value).toBe('b');
    labels.value.b = 'Resolved Beta';
    expect(select.displayText.value).toBe('Resolved Beta');
    expect(select.submittedValues.value).toEqual(['b']);
    expect(select.filteredOptionEntries.value).toHaveLength(1);
    key('Escape');
    expect(query.value).toBe('unrelated search');
    select.handleMenuClosed();
    expect(query.value).toBe('');
  });

  it('keeps multi-select open, rejects disabled interaction and preserves editable spaces', async () => {
    const { select, key, modelValue, disabled, open } = setup([{ value: 'a', label: 'Alpha' }], true);
    key('ArrowDown');
    key(' ');
    expect(modelValue.value).toBeUndefined();
    key('Enter');
    expect(modelValue.value).toEqual(['a']);
    expect(open.value).toBe(true);
    disabled.value = true;
    await nextTick();
    expect(open.value).toBe(false);
    select.clearValue();
    key('Enter');
    expect(modelValue.value).toEqual(['a']);
  });
});

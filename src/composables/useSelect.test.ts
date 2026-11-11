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
  const locale = ref<string>();
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
      locale: () => locale.value,
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
  return { select, options, modelValue, query, locale, open, disabled, labels, external, key };
}

describe('Select logical collection', () => {
  it.each([false, true])(
    'uses numeric identity consistently for display, navigation and selection (multiple: %s)',
    (multiple) => {
      const text = { value: '0', label: 'Text zero' };
      const number = { value: 0, label: 'Numeric zero' };
      const { select, modelValue, key } = setup([text, number], multiple);
      modelValue.value = multiple ? [0] : 0;
      select.openMenu();
      expect(select.displayText.value).toBe('Numeric zero');
      expect(select.activeIndex.value).toBe(1);
      expect(select.isOptionSelected(number)).toBe(true);
      expect(select.isOptionSelected(text)).toBe(false);
      key('Home');
      key('Enter');
      expect(modelValue.value).toEqual(multiple ? [0, '0'] : '0');
      if (multiple) {
        select.toggleOption(number);
        expect(modelValue.value).toEqual(['0']);
      }
    },
  );

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

  it('reuses external results and reveals the active option while a query is pending', async () => {
    const { select, modelValue, options, query, external } = setup([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]);
    external.value = true;
    modelValue.value = 'b';
    select.openMenu();
    const scroll = vi.fn();
    select.list.value.setScrollToIndex(scroll);
    await nextTick();
    await nextTick();
    scroll.mockClear();

    const pendingEntries = select.list.value.entries;
    query.value = 'server query';
    await nextTick();
    await nextTick();
    expect(select.list.value.entries).toBe(pendingEntries);
    expect(select.activeIndex.value).toBe(1);
    expect(scroll).toHaveBeenLastCalledWith(1);

    options.value = [{ value: 'c', label: 'Server result' }];
    await nextTick();
    expect(select.list.value.entries).toEqual([{ option: options.value[0], index: 0 }]);
    expect(select.activeIndex.value).toBe(0);
  });

  it.each([0, 200])('tracks locale and text changes with %i unrelated options', (extraCount) => {
    const { select, options, query, locale } = setup([
      { value: 'a', label: 'IĞDIR' },
      { value: 'b', label: 'Another city' },
      ...Array.from({ length: extraCount }, (_, index) => ({ value: index, label: 'Other city ' + index })),
    ]);
    locale.value = 'tr';
    query.value = ' IĞDIR ';
    const entries = select.list.value.entries;
    expect(entries).toEqual([{ option: options.value[0], index: 0 }]);

    query.value = 'ığdır  ';
    expect(select.list.value.entries).toBe(entries);

    options.value[0]!.label = 'Somewhere else';
    options.value[1]!.supportingText = 'IĞDIR';
    expect(select.list.value.entries).toEqual([{ option: options.value[1], index: 1 }]);

    locale.value = 'en-US';
    expect(select.list.value.entries).toEqual([]);
  });

  it('keeps row activity in sync when keyboard navigation switches to pointer input', () => {
    const first = { value: 'a', label: 'Alpha' };
    const second = { value: 'b', label: 'Beta' };
    const { select, key } = setup([first, second]);
    const firstProps = select.useOptionProps(
      () => 0,
      () => first,
    );
    const secondProps = select.useOptionProps(
      () => 1,
      () => second,
    );

    key('ArrowDown');
    expect(firstProps()['data-keyboard-active']).toBe('true');
    key('ArrowDown');
    expect(firstProps()['data-active']).toBeUndefined();
    expect(secondProps()['data-keyboard-active']).toBe('true');

    secondProps().onPointermove();
    expect(secondProps()['data-active']).toBe('true');
    expect(secondProps()['data-keyboard-active']).toBeUndefined();
    firstProps().onPointermove();
    expect(firstProps()['data-active']).toBe('true');
    expect(secondProps()['data-active']).toBeUndefined();
  });

  it('uses the option value if a pointer event still carries its previous row position', () => {
    const first = { value: 'a', label: 'Alpha' };
    const second = { value: 'b', label: 'Beta' };
    const { select, options, modelValue, key } = setup([first, second]);
    select.openMenu();
    const previousRow = select.optionProps(1, second);

    options.value = [second, first];
    previousRow.onPointermove();
    key('Enter');

    expect(modelValue.value).toBe('b');
  });

  it('opens on the first enabled selection in result order and falls back to the first enabled option', () => {
    const { select, modelValue } = setup(
      [
        { value: 0, label: 'Disabled', disabled: true },
        { value: 1, label: 'First' },
        { value: 2, label: 'Second' },
        { value: 3, label: 'Third' },
      ],
      true,
    );

    modelValue.value = [3, 0, 2];
    select.openMenu();
    expect(select.activeIndex.value).toBe(2);
    expect(select.displayText.value).toBe('Disabled, Second, Third');

    select.closeMenu();
    modelValue.value = [0, 9];
    select.openMenu();
    expect(select.activeIndex.value).toBe(1);
    expect(select.displayText.value).toBe('Disabled, 9');
  });

  it('uses the current multi-selection when reopening a large result list', () => {
    const options = [
      { value: 7, label: 'Numeric ID' },
      { value: 'disabled', label: 'Disabled', disabled: true },
      ...Array.from({ length: 128 }, (_, index) => ({ value: `result-${index}`, label: `Result ${index}` })),
      { value: '7', label: 'String ID' },
      { value: 'last', label: 'Last' },
    ];
    const { select, modelValue } = setup(options, true);
    modelValue.value = ['last', 'disabled', '7'];
    select.openMenu();
    expect(select.activeIndex.value).toBe(options.length - 2);

    select.closeMenu();
    modelValue.value.pop();
    select.openMenu();
    expect(select.activeIndex.value).toBe(options.length - 1);
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

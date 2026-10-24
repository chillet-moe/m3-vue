// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import { useSelect, type UseSelectReturn, type UseSelectOption, type UseSelectModelValue } from './useSelect';

function setup(multiple = false) {
  const options = ref<UseSelectOption[]>(
    Array.from({ length: 10000 }, (_, i) => ({ value: i, label: `Item ${i}`, disabled: i % 17 === 0 })),
  );
  const value = ref<UseSelectModelValue>(9998);
  const open = ref(false);
  const query = ref('');
  const windowStart = ref(0);
  const disabled = ref(false);
  const focus = vi.fn();
  let select!: UseSelectReturn;
  const host = document.createElement('div');
  document.body.append(host);
  const app = createApp({
    setup() {
      select = useSelect({
        options: () => options.value,
        multiple: () => multiple,
        filterable: () => true,
        filterMode: () => 'external',
        disabled: () => disabled.value,
        displaySeparator: () => ', ',
        modelValue: value,
        open,
        query,
        id: () => 'test-list',
        focus,
        blur: vi.fn(),
        resolveLabel: (id) => `Saved ${id}`,
      });
      return () =>
        h(
          'div',
          select.filteredOptionEntries.value
            .slice(windowStart.value, windowStart.value + 10)
            .map(({ option }, i) =>
              h('div', { ...select.optionProps(windowStart.value + i), key: option.value }, option.label),
            ),
        );
    },
  });
  app.mount(host);
  const key = async (key: string) => {
    const event = new KeyboardEvent('keydown', { key, cancelable: true });
    select.handleFilterKeydown(event);
    await nextTick();
    await nextTick();
    return event;
  };
  return {
    options,
    value,
    open,
    query,
    windowStart,
    disabled,
    select,
    host,
    focus,
    key,
    dispose: () => {
      app.unmount();
      host.remove();
    },
  };
}

describe('logical select interaction', () => {
  it('navigates all results, reveals virtual targets, and references only mounted rows', async () => {
    const s = setup();
    const reveal = vi.fn((index: number) => {
      s.windowStart.value = Math.max(0, index - 4);
    });
    s.select.list.value.setScrollToIndex(reveal);
    await s.key('ArrowDown');
    expect(s.select.activeIndex.value).toBe(1);
    await s.key('End');
    expect(s.select.activeIndex.value).toBe(9999);
    expect(reveal).toHaveBeenLastCalledWith(9999);
    expect(s.host.querySelectorAll('[role="option"]').length).toBeLessThanOrEqual(10);
    expect(s.select.activeDescendant.value).toBe(s.host.querySelector('[aria-posinset="10000"]')?.id);
    s.windowStart.value = 100;
    await nextTick();
    expect(s.select.activeDescendant.value).toBeUndefined();
    await s.key('Home');
    expect(s.select.activeIndex.value).toBe(1);
    for (let i = 0; i < 16; i++) await s.key('ArrowDown');
    expect(s.select.activeIndex.value).toBe(18);
    await s.key('Enter');
    expect(s.value.value).toBe(18);
    expect(s.open.value).toBe(false);
    s.dispose();
  });
  it('keeps labels and form values without results, reconciles activity, and resets query after closed', async () => {
    const s = setup();
    s.select.openMenu();
    await nextTick();
    expect(s.select.activeIndex.value).toBe(9998);
    s.query.value = 'remote';
    s.options.value = [{ value: 7, label: 'Seven' }];
    await nextTick();
    expect(s.select.displayText.value).toBe('Saved 9998');
    expect(s.select.submittedValues.value).toEqual(['9998']);
    expect(s.select.activeIndex.value).toBe(0);
    await s.key('Escape');
    expect(s.query.value).toBe('remote');
    s.select.handleMenuClosed();
    expect(s.query.value).toBe('');
    s.select.clearValue();
    expect(s.value.value).toBeUndefined();
    s.dispose();
  });
  it('separates multi-selection from activity and allows Tab to leave', async () => {
    const s = setup(true);
    s.value.value = [1];
    await s.key('ArrowDown');
    await s.key('ArrowDown');
    await s.key('Enter');
    expect(s.value.value).toEqual([1, 2]);
    expect(s.open.value).toBe(true);
    const tab = await s.key('Tab');
    expect(tab.defaultPrevented).toBe(false);
    expect(s.open.value).toBe(false);
    s.disabled.value = true;
    await nextTick();
    s.select.openMenu();
    s.select.clearValue();
    expect(s.open.value).toBe(false);
    expect(s.value.value).toEqual([1, 2]);
    s.dispose();
  });
});

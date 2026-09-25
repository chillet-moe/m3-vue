// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useTabs } from './useTabs';

describe('useTabs', () => {
  it('updates an uncontrolled value and notifies the consumer', () => {
    const changes: string[] = [];
    const tabs = useTabs({
      value: 'tab1' as string,
      onValueChange: (v) => changes.push(v),
    });

    tabs.setValue('tab2');

    expect(tabs.value.value).toBe('tab2');
    expect(changes).toEqual(['tab2']);
  });

  it('keeps a reactive value as the canonical controlled source', () => {
    const value = ref('tab1');
    const changes: string[] = [];
    const tabs = useTabs({
      value,
      onValueChange: (nextValue) => changes.push(nextValue),
    });

    tabs.setValue('tab2');

    expect(changes).toEqual(['tab2']);
    expect(tabs.value.value).toBe('tab1');

    value.value = 'tab2';
    expect(tabs.value.value).toBe('tab2');
  });

  it('exposes tablist semantics for the resolved orientation', () => {
    const horizontalAttrs = useTabs().triggerListAttrs.value;
    const verticalAttrs = useTabs({ orientation: 'vertical' }).triggerListAttrs.value;

    expect(horizontalAttrs).toMatchObject({
      role: 'tablist',
      'aria-orientation': 'horizontal',
    });
    expect(verticalAttrs).toMatchObject({
      role: 'tablist',
      'aria-orientation': 'vertical',
    });
  });

  it('generates trigger attributes with correct aria props', () => {
    const tabs = useTabs({ value: 'active' as string });
    const activeAttrs = tabs.getTriggerAttrs('active');
    const inactiveAttrs = tabs.getTriggerAttrs('other');

    expect(activeAttrs.role).toBe('tab');
    expect(activeAttrs['aria-selected']).toBe(true);
    expect(activeAttrs.tabindex).toBe(0);

    expect(inactiveAttrs['aria-selected']).toBe(false);
    expect(inactiveAttrs.tabindex).toBe(-1);
  });

  it('generates panel attributes with correct aria props', () => {
    const tabs = useTabs({ value: 'active' as string });
    const activePanel = tabs.getPanelAttrs('active');
    const inactivePanel = tabs.getPanelAttrs('other');

    expect(activePanel.role).toBe('tabpanel');
    expect(activePanel.hidden).toBeUndefined();
    expect(activePanel['data-active']).toBe('');

    expect(inactivePanel.hidden).toBe(true);
    expect(inactivePanel['data-active']).toBeUndefined();
  });

  it('trigger aria-controls matches panel id', () => {
    const tabs = useTabs({ value: 'tab1' });
    const trigger = tabs.getTriggerAttrs('tab1');
    const panel = tabs.getPanelAttrs('tab1');

    expect(trigger['aria-controls']).toBe(panel.id);
  });

  it('uses explicit id when provided', () => {
    const tabs = useTabs({ value: 'tab1', id: 'main-nav-tabs' });
    const trigger = tabs.getTriggerAttrs('tab1');
    const panel = tabs.getPanelAttrs('tab1');

    expect(tabs.id).toBe('main-nav-tabs');
    expect(trigger.id).toBe('main-nav-tabs-trigger-tab1');
    expect(panel.id).toBe('main-nav-tabs-panel-tab1');
  });

  it('panel aria-labelledby matches trigger id', () => {
    const tabs = useTabs({ value: 'tab1' });
    const trigger = tabs.getTriggerAttrs('tab1');
    const panel = tabs.getPanelAttrs('tab1');

    expect(panel['aria-labelledby']).toBe(trigger.id);
  });

  it('trigger onClick calls setValue', () => {
    const changes: string[] = [];
    const tabs = useTabs({
      value: 'tab1' as string,
      onValueChange: (v) => changes.push(v),
    });

    const attrs = tabs.getTriggerAttrs('tab2');
    (attrs.onClick as () => void)();

    expect(changes).toEqual(['tab2']);
  });

  it('skips disabled triggers during keyboard navigation', () => {
    const changes: string[] = [];
    const tabs = useTabs({
      value: 'overview' as string,
      onValueChange: (v) => changes.push(v),
    });

    const list = document.createElement('div');
    list.setAttribute('role', 'tablist');

    for (const value of ['overview', 'details', 'settings']) {
      const trigger = document.createElement('button');
      const attrs = tabs.getTriggerAttrs(value);

      trigger.setAttribute('role', String(attrs.role));
      trigger.dataset.tabValue = value;

      if (value === 'details') {
        trigger.dataset.disabled = 'true';
      }

      if (value === 'overview') {
        trigger.addEventListener('keydown', attrs.onKeydown as (event: KeyboardEvent) => void);
      }

      list.append(trigger);
    }

    document.body.append(list);

    const overviewTrigger = list.querySelector<HTMLElement>('[data-tab-value="overview"]');
    overviewTrigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(changes).toEqual(['settings']);
  });
});

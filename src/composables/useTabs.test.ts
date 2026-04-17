// @vitest-environment jsdom
import { describe, expect, it } from 'vite-plus/test';
import { useTabs } from './useTabs';

describe('useTabs', () => {
  it('initializes with the provided value', () => {
    const tabs = useTabs({ value: 'tab1' });
    expect(tabs.value.value).toBe('tab1');
  });

  it('initializes without a value', () => {
    const tabs = useTabs();
    expect(tabs.value.value).toBeUndefined();
  });

  it('sets value via setValue', () => {
    const tabs = useTabs({ value: 'tab1' as string });
    tabs.setValue('tab2');
    expect(tabs.value.value).toBe('tab2');
  });

  it('calls onValueChange when setValue is called', () => {
    const changes: string[] = [];
    const tabs = useTabs({
      value: 'tab1' as string,
      onValueChange: (v) => changes.push(v),
    });

    tabs.setValue('tab2');
    expect(changes).toEqual(['tab2']);
  });

  it('defaults orientation to horizontal', () => {
    const tabs = useTabs();
    expect(tabs.orientation.value).toBe('horizontal');
  });

  it('respects orientation option', () => {
    const tabs = useTabs({ orientation: 'vertical' });
    expect(tabs.orientation.value).toBe('vertical');
  });

  it('generates triggerList attributes with role tablist', () => {
    const tabs = useTabs();
    const attrs = tabs.triggerListAttrs.value;

    expect(attrs.role).toBe('tablist');
    expect(attrs['aria-orientation']).toBe('horizontal');
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
});

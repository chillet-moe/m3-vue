// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { createApp, h, ref } from 'vue';
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

  it('keeps a getter-controlled selection unset until the consumer accepts it', () => {
    const value = ref<string>();
    const changes: string[] = [];
    const tabs = useTabs({
      value: () => value.value,
      onValueChange: (nextValue) => changes.push(nextValue),
    });

    tabs.setValue('settings');

    expect(changes).toEqual(['settings']);
    expect(tabs.value.value).toBeUndefined();
    expect(tabs.getPanelAttrs('settings').hidden).toBe(true);

    value.value = 'settings';
    expect(tabs.getTriggerAttrs('settings')['aria-selected']).toBe(true);
    expect(tabs.getPanelAttrs('settings').hidden).toBeUndefined();
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

  it('links each distinct value to its own trigger and panel', () => {
    const values = ['a b', 'a_b', 'a%20b', '设置'];
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp({
      setup() {
        const tabs = useTabs<string>({ value: 'a_b', id: 'main-nav-tabs' });
        expect(tabs.id).toBe('main-nav-tabs');
        return () =>
          values.flatMap((value) => [
            h('button', tabs.getTriggerAttrs(value), value),
            h('section', tabs.getPanelAttrs(value), value),
          ]);
      },
    });
    app.mount(container);
    try {
      const triggers = container.querySelectorAll('button');
      const panels = container.querySelectorAll('section');
      for (let index = 0; index < values.length; index++) {
        expect(document.getElementById(triggers[index]!.getAttribute('aria-controls')!)).toBe(panels[index]);
        expect(document.getElementById(panels[index]!.getAttribute('aria-labelledby')!)).toBe(triggers[index]);
      }
    } finally {
      app.unmount();
      container.remove();
    }
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

  it('focuses the enabled edges without selecting in manual mode', () => {
    const tabs = useTabs<string>({ value: 'first', selectWhenFocused: false });
    const list = document.createElement('div');
    list.setAttribute('role', 'tablist');

    for (const value of ['start-disabled', 'first', 'middle', 'last', 'end-disabled']) {
      const trigger = document.createElement('button');
      trigger.setAttribute('role', 'tab');
      trigger.dataset.tabValue = value;
      trigger.addEventListener('keydown', tabs.getTriggerAttrs(value).onKeydown as (event: KeyboardEvent) => void);
      if (value === 'start-disabled') trigger.setAttribute('aria-disabled', 'true');
      if (value === 'end-disabled') trigger.setAttribute('data-disabled', 'true');
      list.append(trigger);
    }
    document.body.append(list);

    try {
      list.querySelector<HTMLElement>('[data-tab-value="middle"]')!.focus();
      const navigate = (key: string) =>
        document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }));

      navigate('End');
      expect(document.activeElement?.getAttribute('data-tab-value')).toBe('last');
      expect(tabs.value.value).toBe('first');

      navigate('Home');
      expect(document.activeElement?.getAttribute('data-tab-value')).toBe('first');
    } finally {
      list.remove();
    }
  });
});

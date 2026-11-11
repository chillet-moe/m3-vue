// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { createApp, h, nextTick, ref, shallowRef } from 'vue';
import { useAccordion } from './useAccordion';

describe('useAccordion', () => {
  it('initializes with the provided value', () => {
    const accordion = useAccordion({ value: 'account' });

    expect(accordion.value.value).toBe('account');
    expect(accordion.openValues.value).toEqual(['account']);
    expect(accordion.isOpen('account')).toBe(true);
  });

  it('toggles one item at a time by default', () => {
    const changes: Array<string | string[] | undefined> = [];
    const accordion = useAccordion({
      value: 'account' as string,
      onValueChange: (value) => changes.push(value),
    });

    expect(accordion.toggle('billing')).toBe(true);
    expect(accordion.value.value).toBe('billing');
    expect(changes).toEqual(['billing']);

    expect(accordion.toggle('billing')).toBe(false);
    expect(accordion.value.value).toBeUndefined();
  });

  it('supports multiple open items', () => {
    const accordion = useAccordion({
      value: ['account'] as string[],
      multiple: true,
    });

    accordion.toggle('billing');
    expect(accordion.value.value).toEqual(['account', 'billing']);

    accordion.toggle('account');
    expect(accordion.value.value).toEqual(['billing']);
  });

  it('keeps the current item open when collapsible is false', () => {
    const accordion = useAccordion({
      value: 'account' as string,
      collapsible: false,
    });

    expect(accordion.toggle('account')).toBe(true);
    expect(accordion.value.value).toBe('account');
  });

  it('does not toggle disabled accordions or disabled items', () => {
    const disabledAccordion = useAccordion({
      value: 'account' as string,
      disabled: true,
    });
    const itemDisabledAccordion = useAccordion({ value: 'account' as string });

    expect(disabledAccordion.toggle('billing')).toBe(false);
    expect(disabledAccordion.value.value).toBe('account');

    expect(itemDisabledAccordion.toggle('billing', { disabled: true })).toBe(false);
    expect(itemDisabledAccordion.value.value).toBe('account');
  });

  it('supports reactive controlled values', () => {
    const value = ref<string | undefined>('account');
    const accordion = useAccordion({
      value,
      onValueChange: (nextValue) => {
        value.value = nextValue as string | undefined;
      },
    });

    accordion.toggle('billing');

    expect(value.value).toBe('billing');
    expect(accordion.value.value).toBe('billing');
  });

  it('keeps the external value until a controlled request is accepted', async () => {
    const value = ref<string>();
    const requests: Array<string | string[] | undefined> = [];
    const accordion = useAccordion({
      value: () => value.value,
      onValueChange: (requested) => requests.push(requested),
    });

    expect(accordion.toggle('billing')).toBe(true);
    await nextTick();
    expect(accordion.getTriggerAttrs('billing')['aria-expanded']).toBe(false);
    expect(accordion.getPanelAttrs('billing').hidden).toBe(true);

    expect(accordion.toggle('security')).toBe(true);
    await nextTick();
    expect(requests).toEqual(['billing', 'security']);
    expect(accordion.value.value).toBeUndefined();

    value.value = 'security';
    expect(accordion.getTriggerAttrs('security')['aria-expanded']).toBe(true);
    expect(accordion.getPanelAttrs('security').hidden).toBeUndefined();
    expect(accordion.getPanelAttrs('billing').hidden).toBe(true);
  });

  it('updates trigger and panel state after an in-place change to many open values', () => {
    const value = ref(Array.from({ length: 64 }, (_, index) => `item-${index}`));
    const accordion = useAccordion({ value, multiple: true });

    expect(accordion.getTriggerAttrs('item-0')['aria-expanded']).toBe(true);
    expect(accordion.getPanelAttrs('billing').hidden).toBe(true);

    value.value.splice(0, 1, 'billing');

    expect(accordion.getTriggerAttrs('item-0')['aria-expanded']).toBe(false);
    expect(accordion.getPanelAttrs('billing').hidden).toBeUndefined();
    expect(accordion.openValues.value).toBe(value.value);
  });

  it('updates indexed membership when a shallow ref is replaced', () => {
    const value = shallowRef(Array.from({ length: 64 }, (_, index) => `item-${index}`));
    const accordion = useAccordion({ value, multiple: true });

    expect(accordion.isOpen('item-0')).toBe(true);
    value.value = ['billing', ...value.value.slice(1)];
    expect(accordion.isOpen('item-0')).toBe(false);
    expect(accordion.isOpen('billing')).toBe(true);
  });

  it('generates trigger and panel attributes', () => {
    const accordion = useAccordion({
      value: 'account',
      id: 'settings',
    });

    const trigger = accordion.getTriggerAttrs('account');
    const panel = accordion.getPanelAttrs('account');

    expect(trigger.type).toBe('button');
    expect(trigger['aria-expanded']).toBe(true);
    expect(trigger['aria-controls']).toBe(panel.id);
    expect(panel.role).toBe('region');
    expect(panel['aria-labelledby']).toBe(trigger.id);
    expect(panel.hidden).toBeUndefined();
  });

  it('links each distinct value to its own trigger and panel', () => {
    const values = ['a b', 'a_b', 'a%20b', '设置'];
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp({
      setup() {
        const accordion = useAccordion({ value: values, multiple: true });
        return () =>
          values.flatMap((value) => [
            h('button', accordion.getTriggerAttrs(value), value),
            h('section', accordion.getPanelAttrs(value), value),
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

  it('trigger click toggles the item', () => {
    const accordion = useAccordion({ value: 'account' as string });
    const trigger = accordion.getTriggerAttrs('billing');

    (trigger.onClick as () => void)();

    expect(accordion.value.value).toBe('billing');
  });

  it('moves focus between triggers with arrow and boundary keys', () => {
    const accordion = useAccordion();
    const root = document.createElement('div');
    const rootAttrs = accordion.rootAttrs.value;

    root.setAttribute('data-accordion-root', String(rootAttrs['data-accordion-root']));
    document.body.append(root);

    for (const value of ['account', 'billing', 'security']) {
      const trigger = document.createElement('button');
      const attrs = accordion.getTriggerAttrs(value);

      trigger.setAttribute('data-accordion-trigger', '');
      trigger.dataset.accordionValue = value;
      trigger.addEventListener('keydown', attrs.onKeydown as (event: KeyboardEvent) => void);

      if (value === 'billing') {
        trigger.disabled = true;
      }

      root.append(trigger);
    }

    const triggers = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-accordion-trigger]'));

    triggers[0]?.focus();
    triggers[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(triggers[2]);

    triggers[2]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(triggers[0]);

    root.remove();
  });

  it('preserves the native key action when all triggers are disabled', () => {
    const accordion = useAccordion();
    const root = document.createElement('div');
    root.setAttribute('data-accordion-root', '');

    for (const value of ['account', 'billing']) {
      const trigger = document.createElement('button');
      trigger.setAttribute('data-accordion-trigger', '');
      trigger.setAttribute('aria-disabled', 'true');
      trigger.addEventListener('keydown', accordion.getTriggerAttrs(value).onKeydown as (event: KeyboardEvent) => void);
      root.append(trigger);
    }
    document.body.append(root);
    const [first, second] = root.querySelectorAll('button');

    try {
      first!.focus();
      const navigate = () => {
        const event = new KeyboardEvent('keydown', { key: 'End', cancelable: true });
        first!.dispatchEvent(event);
        return event.defaultPrevented;
      };

      expect(navigate()).toBe(false);
      expect(document.activeElement).toBe(first);

      second!.removeAttribute('aria-disabled');
      expect(navigate()).toBe(true);
      expect(document.activeElement).toBe(second);
    } finally {
      root.remove();
    }
  });
});

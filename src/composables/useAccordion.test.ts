// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
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

  it('generates trigger and panel attributes', () => {
    const accordion = useAccordion({
      value: 'account',
      id: 'settings',
    });

    const trigger = accordion.getTriggerAttrs('account');
    const panel = accordion.getPanelAttrs('account');

    expect(trigger.id).toBe('settings-trigger-account');
    expect(trigger.type).toBe('button');
    expect(trigger['aria-expanded']).toBe(true);
    expect(trigger['aria-controls']).toBe('settings-panel-account');
    expect(panel.id).toBe('settings-panel-account');
    expect(panel.role).toBe('region');
    expect(panel['aria-labelledby']).toBe('settings-trigger-account');
    expect(panel.hidden).toBeUndefined();
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
});

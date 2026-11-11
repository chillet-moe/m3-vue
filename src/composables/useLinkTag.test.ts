import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useLinkTag } from './useLinkTag';

describe('useLinkTag', () => {
  it('updates link attributes together as the href and disabled state change', () => {
    const href = ref('');
    const disabled = ref(true);
    const link = useLinkTag({
      defaultTag: 'button',
      href,
      disabled,
    });

    expect(link.value.tag).toBe('button');
    expect(link.value.nativeDisabled).toBe(true);

    href.value = '/account';
    expect(link.value).toMatchObject({
      tag: 'a',
      href: undefined,
      nativeDisabled: undefined,
      ariaDisabled: 'true',
      tabIndex: -1,
      type: undefined,
    });

    href.value = '/profile';
    disabled.value = false;
    expect(link.value).toMatchObject({
      tag: 'a',
      href: '/profile',
      ariaDisabled: undefined,
      tabIndex: undefined,
    });

    href.value = '';
    expect(link.value).toMatchObject({ tag: 'button', href: undefined, nativeDisabled: false, type: 'button' });
  });

  it('keeps button semantics when href is absent', () => {
    const link = useLinkTag({
      defaultTag: 'button',
      disabled: true,
    });

    expect(link.value.tag).toBe('button');
    expect(link.value.nativeDisabled).toBe(true);
    expect(link.value.ariaDisabled).toBeUndefined();
    expect(link.value.tabIndex).toBeUndefined();
    expect(link.value.type).toBe('button');
  });

  it('supports separate aria and tabindex modes for non-button fallbacks', () => {
    const link = useLinkTag({
      defaultTag: 'div',
      disabled: true,
      ariaDisabledMode: 'non-button',
      disabledTabIndexMode: 'anchor',
    });

    expect(link.value.tag).toBe('div');
    expect(link.value.ariaDisabled).toBe('true');
    expect(link.value.tabIndex).toBeUndefined();
  });
});

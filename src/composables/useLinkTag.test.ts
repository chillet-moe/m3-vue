import { describe, expect, it } from 'vite-plus/test';
import { ref } from 'vue';
import { useLinkTag } from './useLinkTag';

describe('useLinkTag', () => {
  it('switches to anchor mode when href is provided', () => {
    const href = ref('/account');
    const disabled = ref(true);
    const link = useLinkTag({
      defaultTag: 'button',
      href,
      disabled,
    });

    expect(link.tag.value).toBe('a');
    expect(link.href.value).toBeUndefined();
    expect(link.ariaDisabled.value).toBe('true');
    expect(link.tabIndex.value).toBe(-1);
    expect(link.type.value).toBeUndefined();
  });

  it('keeps button semantics when href is absent', () => {
    const link = useLinkTag({
      defaultTag: 'button',
      disabled: true,
    });

    expect(link.tag.value).toBe('button');
    expect(link.nativeDisabled.value).toBe(true);
    expect(link.ariaDisabled.value).toBeUndefined();
    expect(link.tabIndex.value).toBeUndefined();
    expect(link.type.value).toBe('button');
  });

  it('supports separate aria and tabindex modes for non-button fallbacks', () => {
    const link = useLinkTag({
      defaultTag: 'div',
      disabled: true,
      ariaDisabledMode: 'non-button',
      disabledTabIndexMode: 'anchor',
    });

    expect(link.tag.value).toBe('div');
    expect(link.ariaDisabled.value).toBe('true');
    expect(link.tabIndex.value).toBeUndefined();
  });
});

// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import { useNavigationItem, type NavigationItemContext } from './useNavigationItem';

function createContext(value = 'home', disabled = false) {
  const currentValue = ref<string | undefined>(value);
  const contextDisabled = ref(disabled);
  const activate = vi.fn((nextValue: string) => {
    currentValue.value = nextValue;
  });

  return {
    context: {
      value: computed(() => currentValue.value),
      disabled: contextDisabled,
      activate,
    } satisfies NavigationItemContext,
    currentValue,
    contextDisabled,
    activate,
  };
}

describe('useNavigationItem', () => {
  it('derives selection from context and activates the item', () => {
    const { context, currentValue, activate } = createContext();
    const item = useNavigationItem({
      context,
      value: () => 'search',
      href: () => undefined,
      disabled: () => false,
      selected: () => undefined,
    });

    expect(item.isSelected.value).toBe(false);

    item.handleClick(new MouseEvent('click', { cancelable: true }));

    expect(activate).toHaveBeenCalledWith('search');
    expect(currentValue.value).toBe('search');
    expect(item.isSelected.value).toBe(true);
  });

  it('switches between explicit selection and the current context value', () => {
    const { context, currentValue } = createContext('home');
    const selected = ref<boolean | undefined>(true);
    const item = useNavigationItem({
      context,
      value: () => 'search',
      href: () => undefined,
      disabled: () => false,
      selected: () => selected.value,
    });

    expect(item.isSelected.value).toBe(true);

    currentValue.value = 'search';
    selected.value = false;
    expect(item.isSelected.value).toBe(false);

    selected.value = undefined;
    expect(item.isSelected.value).toBe(true);

    currentValue.value = 'home';
    expect(item.isSelected.value).toBe(false);
  });

  it('merges disabled state and prevents activation', () => {
    const { context, contextDisabled, activate } = createContext();
    const item = useNavigationItem({
      context,
      value: () => 'search',
      href: () => '/search',
      disabled: () => false,
      selected: () => undefined,
    });

    contextDisabled.value = true;
    const event = new MouseEvent('click', { cancelable: true });
    item.handleClick(event);

    expect(event.defaultPrevented).toBe(true);
    expect(activate).not.toHaveBeenCalled();
    expect(item.link.value.href).toBeUndefined();
    expect(item.link.value.ariaDisabled).toBe('true');
    expect(item.link.value.tabIndex).toBe(-1);
  });

  it('turns Space on an enabled anchor into a click', () => {
    const { context, activate } = createContext();
    const item = useNavigationItem({
      context,
      value: () => 'search',
      href: () => '/search',
      disabled: () => false,
      selected: () => undefined,
    });
    const anchor = document.createElement('a');
    anchor.addEventListener('click', item.handleClick);
    anchor.addEventListener('keydown', item.handleKeydown);

    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(activate).toHaveBeenCalledWith('search');
  });
});

// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import SelectItem from './SelectItem.vue';

describe('SelectItem', () => {
  it('separates activity and selection without button or tab-stop semantics', async () => {
    const selected = ref(false);
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp(() =>
      h(
        SelectItem,
        { active: true, selected: selected.value, supportingText: 'Details', leadingIcon: 'folder' },
        () => 'Files',
      ),
    );
    app.mount(container);
    await nextTick();
    const option = container.querySelector<HTMLElement>('[role="option"]')!;
    expect(option.tagName).toBe('DIV');
    expect(option.tabIndex).toBe(-1);
    expect(option.dataset.active).toBe('true');
    expect(option.getAttribute('aria-selected')).toBe('false');
    expect(option.dataset.appearance).toBe('standard');
    expect(option.querySelector('button, input')).toBeNull();
    expect(option.querySelector('[data-part="check"]')).toBeNull();
    selected.value = true;
    await nextTick();
    expect(option.getAttribute('aria-selected')).toBe('true');
    expect(option.querySelector('[data-part="check"]')?.textContent).toBe('check');
    expect(option.querySelector('[data-part="check"]')?.getAttribute('aria-hidden')).toBe('true');
    app.unmount();
    container.remove();
  });
  it('renders disabled semantics and supporting/trailing content', () => {
    const container = document.createElement('div');
    const app = createApp(() =>
      h(SelectItem, { disabled: true, supportingText: 'Details', trailingText: 'Extra' }, () => 'Label'),
    );
    app.mount(container);
    expect(container.querySelector('[role="option"]')?.getAttribute('aria-disabled')).toBe('true');
    expect(container.textContent).toContain('Details');
    expect(container.textContent).toContain('Extra');
    app.unmount();
  });
});

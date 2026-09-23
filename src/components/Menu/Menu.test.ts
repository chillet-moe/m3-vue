// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h, nextTick, ref, withDirectives } from 'vue';
import Select, { type SelectModelValue, type SelectOption } from '@/components/Select/Select.vue';
import { vContextMenu, vDropdown } from '@/directives/Menu';
import Menu, { type MenuContentItem, type MenuModelValue } from './Menu.vue';
import MenuContainer from './MenuContainer.vue';
import MenuGap from './MenuGap.vue';
import MenuItem from './MenuItem.vue';
import MenuLabel from './MenuLabel.vue';
import MenuSubMenu from './MenuSubMenu.vue';

function createPointerEvent(
  type: string,
  init: EventInit & { clientX?: number; clientY?: number; pointerId?: number; pointerType?: string } = {},
) {
  const EventConstructor = window.PointerEvent ?? MouseEvent;
  const event = new EventConstructor(type, init);

  Object.defineProperty(event, 'pointerType', {
    configurable: true,
    value: init.pointerType ?? 'mouse',
  });

  Object.defineProperty(event, 'isPrimary', {
    configurable: true,
    value: true,
  });

  if (typeof init.pointerId === 'number') {
    Object.defineProperty(event, 'pointerId', {
      configurable: true,
      value: init.pointerId,
    });
  }

  if (typeof init.pointerId !== 'number') {
    Object.defineProperty(event, 'pointerId', {
      configurable: true,
      value: 1,
    });
  }

  return event;
}

const popoverOpenElements = new WeakSet<HTMLElement>();

function installPopoverPolyfill() {
  const prototype = HTMLElement.prototype as HTMLElement & {
    showPopover?: (options?: { source?: HTMLElement }) => void;
    hidePopover?: () => void;
  };

  const originalMatches = Element.prototype.matches;

  Element.prototype.matches = function (this: Element, selector: string) {
    if (selector === ':popover-open') {
      return popoverOpenElements.has(this as HTMLElement);
    }

    return originalMatches.call(this, selector);
  } as typeof Element.prototype.matches;

  if (typeof prototype.showPopover !== 'function') {
    Object.defineProperty(prototype, 'showPopover', {
      configurable: true,
      value(this: HTMLElement, options?: { source?: HTMLElement }) {
        if (options?.source) {
          this.dataset.popoverSourceId =
            options.source.id ||
            options.source.textContent?.trim() ||
            options.source.getAttribute('aria-label') ||
            'source';
        }

        popoverOpenElements.add(this);
        const toggleEvent = new Event('toggle');
        Object.defineProperty(toggleEvent, 'newState', {
          configurable: true,
          value: 'open',
        });
        this.dispatchEvent(toggleEvent);
      },
    });
  }

  if (typeof prototype.hidePopover !== 'function') {
    Object.defineProperty(prototype, 'hidePopover', {
      configurable: true,
      value(this: HTMLElement) {
        popoverOpenElements.delete(this);
        delete this.dataset.popoverSourceId;
        const toggleEvent = new Event('toggle');
        Object.defineProperty(toggleEvent, 'newState', {
          configurable: true,
          value: 'closed',
        });
        this.dispatchEvent(toggleEvent);
      },
    });
  }
}

function isPopoverOpen(element: HTMLElement | null) {
  return element ? popoverOpenElements.has(element) : false;
}

async function flushMicrotasks() {
  await Promise.resolve();
}

describe('Menu', () => {
  const objectItems: MenuContentItem[] = [
    {
      type: 'group',
      items: [
        {
          label: 'Cut',
          value: 'cut',
          leadingIcon: 'content_cut',
        },
        {
          label: 'Copy',
          value: 'copy',
          leadingIcon: 'content_copy',
          supportingText: 'Recommended',
        },
        {
          type: 'submenu',
          label: 'More',
          leadingIcon: 'more_horiz',
          items: [
            {
              label: 'Rename',
              value: 'rename',
            },
          ],
        },
      ],
    },
    {
      type: 'gap',
    },
    {
      type: 'group',
      items: [
        {
          type: 'label',
          label: 'Danger zone',
        },
        {
          label: 'Delete',
          trailingText: 'Del',
        },
      ],
    },
  ];

  const selectOptions: SelectOption[] = [
    {
      label: 'Espresso',
      value: 'espresso',
    },
    {
      label: 'Pour-over',
      value: 'pour-over',
    },
    {
      label: 'Cold brew',
      value: 'cold-brew',
    },
  ];

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders as a pure popover surface controlled by open model', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const open = ref(false);
        return () =>
          h(
            Menu,
            {
              color: 'vibrant',
              open: open.value,
              'onUpdate:open': (nextOpen: boolean) => {
                open.value = nextOpen;
              },
            },
            {
              default: () => [
                h(MenuContainer, null, {
                  default: () => [h(MenuItem, null, { default: () => 'Edit' })],
                }),
              ],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const menu = container.querySelector('[role="menu"]') as HTMLDivElement | null;

    expect(menu).not.toBeNull();
    expect(menu?.dataset.color).toBe('vibrant');
    expect(isPopoverOpen(menu)).toBe(false);

    app.unmount();
  });

  it('emits closed after the menu surface exit finishes', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const open = ref(true);
    const onClosed = vi.fn();
    let finishExit!: () => void;
    const finished = new Promise<void>((resolve) => {
      finishExit = resolve;
    });

    const app = createApp(() =>
      h(
        Menu,
        {
          open: open.value,
          'onUpdate:open': (nextOpen: boolean) => {
            open.value = nextOpen;
          },
          onClosed,
        },
        { default: () => h(MenuItem, null, { default: () => 'Edit' }) },
      ),
    );

    app.mount(container);
    await nextTick();

    const surface = container.querySelector<HTMLElement>('[data-part="surface"]')!;
    Object.defineProperty(surface, 'getAnimations', {
      configurable: true,
      value: () => [{ finished } as unknown as Animation],
    });

    open.value = false;
    await nextTick();

    expect(onClosed).not.toHaveBeenCalled();

    finishExit();
    await finished;
    await Promise.resolve();

    expect(onClosed).toHaveBeenCalledOnce();
    app.unmount();
  });

  it('emits select from slotted MenuItem, closes by default, and ignores disabled item', async () => {
    installPopoverPolyfill();

    const selectedValues: string[] = [];

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          open: true,
          onSelect: (_event: MouseEvent, itemElement: HTMLElement) => {
            selectedValues.push(itemElement.textContent?.trim() ?? '');
          },
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [
                h(MenuItem, null, { default: () => 'Edit' }),
                h(MenuItem, { disabled: true }, { default: () => 'Delete' }),
              ],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const menu = container.querySelector('[role="menu"]') as HTMLDivElement | null;
    const menuItems = container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]');

    menuItems[0]?.click();
    await nextTick();
    menuItems[1]?.click();

    expect(selectedValues).toEqual(['Edit']);
    expect(isPopoverOpen(menu)).toBe(false);

    app.unmount();
  });

  it('supports single model values for slotted MenuItem entries while preserving manual items', async () => {
    installPopoverPolyfill();

    const updates: MenuModelValue[] = [];
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const modelValue = ref<MenuModelValue>('copy');

        return () =>
          h(
            Menu,
            {
              open: true,
              modelValue: modelValue.value,
              'onUpdate:modelValue': (nextValue: MenuModelValue) => {
                updates.push(nextValue);
                modelValue.value = nextValue;
              },
            },
            {
              default: () => [
                h(MenuContainer, null, {
                  default: () => [
                    h(MenuItem, { value: 'cut' }, { default: () => 'Cut' }),
                    h(MenuItem, { value: 'copy' }, { default: () => 'Copy' }),
                    h(MenuItem, { selected: true }, { default: () => 'Pinned' }),
                  ],
                }),
              ],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const menuItems = container.querySelectorAll<HTMLButtonElement>('button');

    expect(menuItems[0]?.getAttribute('role')).toBe('menuitemradio');
    expect(menuItems[1]?.getAttribute('role')).toBe('menuitemradio');
    expect(menuItems[2]?.getAttribute('role')).toBe('menuitem');
    expect(menuItems[0]?.dataset.selected).toBeUndefined();
    expect(menuItems[1]?.dataset.selected).toBe('true');
    expect(menuItems[2]?.dataset.selected).toBe('true');

    menuItems[0]?.click();
    await nextTick();

    expect(updates).toEqual(['cut']);
    expect(menuItems[0]?.dataset.selected).toBe('true');
    expect(menuItems[0]?.getAttribute('aria-checked')).toBe('true');
    expect(menuItems[1]?.dataset.selected).toBeUndefined();
    expect(menuItems[1]?.getAttribute('aria-checked')).toBe('false');
    expect(menuItems[2]?.dataset.selected).toBe('true');

    app.unmount();
  });

  it('supports multiple model values for slotted MenuItem entries', async () => {
    installPopoverPolyfill();

    const updates: MenuModelValue[] = [];
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const modelValue = ref<MenuModelValue>(['copy']);

        return () =>
          h(
            Menu,
            {
              open: true,
              multiple: true,
              modelValue: modelValue.value,
              'onUpdate:modelValue': (nextValue: MenuModelValue) => {
                updates.push(nextValue);
                modelValue.value = nextValue;
              },
            },
            {
              default: () => [
                h(MenuContainer, null, {
                  default: () => [
                    h(MenuItem, { value: 'cut', closeOnSelect: false }, { default: () => 'Cut' }),
                    h(MenuItem, { value: 'copy', closeOnSelect: false }, { default: () => 'Copy' }),
                  ],
                }),
              ],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const menu = container.querySelector('[role="menu"]') as HTMLDivElement | null;
    const menuItems = container.querySelectorAll<HTMLButtonElement>('button');

    expect(menuItems[0]?.getAttribute('role')).toBe('menuitemcheckbox');
    expect(menuItems[1]?.getAttribute('role')).toBe('menuitemcheckbox');
    expect(menuItems[0]?.dataset.selected).toBeUndefined();
    expect(menuItems[1]?.dataset.selected).toBe('true');

    menuItems[0]?.click();
    await nextTick();

    expect(updates).toEqual([['copy', 'cut']]);
    expect(menuItems[0]?.dataset.selected).toBe('true');
    expect(menuItems[1]?.dataset.selected).toBe('true');
    expect(isPopoverOpen(menu)).toBe(true);

    menuItems[1]?.click();
    await nextTick();

    expect(updates).toEqual([['copy', 'cut'], ['cut']]);
    expect(menuItems[0]?.dataset.selected).toBe('true');
    expect(menuItems[1]?.dataset.selected).toBeUndefined();

    app.unmount();
  });

  it('renders declarative object content and keeps selection semantics', async () => {
    installPopoverPolyfill();

    const updates: MenuModelValue[] = [];
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const modelValue = ref<MenuModelValue>('copy');

        return () =>
          h(Menu, {
            open: true,
            items: objectItems,
            modelValue: modelValue.value,
            'onUpdate:modelValue': (nextValue: MenuModelValue) => {
              updates.push(nextValue);
              modelValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const menu = container.querySelector('[role="menu"]') as HTMLDivElement | null;
    const menuItems = container.querySelectorAll<HTMLButtonElement>('button');
    const label = container.querySelector('.m3-menu-label');
    const gaps = container.querySelectorAll('.m3-menu-gap');

    expect(menuItems).toHaveLength(5);
    expect(menuItems[0]?.textContent).toContain('Cut');
    expect(menuItems[1]?.textContent).toContain('Copy');
    expect(menuItems[1]?.dataset.selected).toBe('true');
    expect(menuItems[1]?.getAttribute('role')).toBe('menuitemradio');
    expect(label?.textContent?.trim()).toBe('Danger zone');
    expect(gaps).toHaveLength(1);

    menuItems[2]?.click();
    await nextTick();

    const submenu = container.querySelector<HTMLElement>('.m3-menu[data-submenu="true"]');
    expect(isPopoverOpen(menu)).toBe(true);
    expect(isPopoverOpen(submenu)).toBe(true);

    menuItems[0]?.click();
    await nextTick();

    expect(updates).toEqual(['cut']);
    expect(menuItems[0]?.dataset.selected).toBe('true');
    expect(menuItems[1]?.dataset.selected).toBeUndefined();

    app.unmount();
  });

  it('renders declarative items together with slotted content', async () => {
    installPopoverPolyfill();

    const selectedValues: string[] = [];
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          open: true,
          items: [
            {
              label: 'Generated',
            },
          ] satisfies MenuContentItem[],
          onSelect: (_event: MouseEvent, itemElement: HTMLElement) => {
            selectedValues.push(itemElement.textContent?.trim() ?? '');
          },
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [h(MenuItem, null, { default: () => 'Slotted' })],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const menuItems = container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]');

    expect(menuItems).toHaveLength(2);
    expect(menuItems[0]?.textContent?.trim()).toBe('Generated');
    expect(menuItems[1]?.textContent?.trim()).toBe('Slotted');

    menuItems[1]?.click();
    await nextTick();

    expect(selectedValues).toEqual(['Slotted']);

    app.unmount();
  });

  it('keeps the menu open when MenuItem closeOnSelect is false', async () => {
    installPopoverPolyfill();

    const selectedValues: string[] = [];

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          open: true,
          onSelect: (_event: MouseEvent, itemElement: HTMLElement) => {
            selectedValues.push(itemElement.textContent?.trim() ?? '');
          },
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [h(MenuItem, { closeOnSelect: false }, { default: () => 'Keep open' })],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const menu = container.querySelector('[role="menu"]') as HTMLDivElement | null;
    const menuItem = container.querySelector<HTMLButtonElement>('button[role="menuitem"]');

    menuItem?.click();
    await nextTick();

    expect(selectedValues).toEqual(['Keep open']);
    expect(isPopoverOpen(menu)).toBe(true);

    app.unmount();
  });

  it('keeps the containing menu open when selecting from an embedded Select', async () => {
    installPopoverPolyfill();

    let selectedValue: SelectModelValue = undefined;

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const open = ref(true);
        const value = ref<SelectModelValue>();

        return () =>
          h(
            Menu,
            {
              open: open.value,
              'onUpdate:open': (nextOpen: boolean) => {
                open.value = nextOpen;
              },
            },
            {
              default: () => [
                h(MenuContainer, null, {
                  default: () => [
                    h(
                      'div',
                      {
                        style: {
                          padding: '0.5rem',
                          inlineSize: '16rem',
                        },
                      },
                      [
                        h(Select, {
                          label: 'Coffee',
                          options: selectOptions,
                          modelValue: value.value,
                          'onUpdate:modelValue': (nextValue: SelectModelValue) => {
                            value.value = nextValue;
                            selectedValue = nextValue;
                          },
                        }),
                      ],
                    ),
                  ],
                }),
              ],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const rootMenu = container.querySelector<HTMLElement>('.m3-menu:not(.m3-select-menu)');
    const selectMenu = container.querySelector<HTMLElement>('.m3-select-menu');
    const trigger = container.querySelector<HTMLElement>('.m3-select-trigger');

    expect(isPopoverOpen(rootMenu)).toBe(true);

    trigger?.click();
    await nextTick();

    const selectItems = container.querySelectorAll<HTMLButtonElement>('.m3-select-option');

    expect(isPopoverOpen(selectMenu)).toBe(true);

    selectItems[1]?.click();
    await nextTick();

    expect(selectedValue).toBe('pour-over');
    expect(isPopoverOpen(rootMenu)).toBe(true);
    expect(isPopoverOpen(selectMenu)).toBe(false);

    app.unmount();
  });

  it('renders MenuItem href as an anchor and keeps keyboard activation semantics', async () => {
    installPopoverPolyfill();

    const selectedValues: string[] = [];
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          open: true,
          onSelect: (_event: MouseEvent, itemElement: HTMLElement) => {
            selectedValues.push(itemElement.textContent?.trim() ?? '');
          },
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [h(MenuItem, { href: '#account' }, { default: () => 'Account settings' })],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const menu = container.querySelector('[role="menu"]') as HTMLDivElement | null;
    const linkItem = container.querySelector<HTMLAnchorElement>('a[role="menuitem"]');

    expect(linkItem?.getAttribute('href')).toBe('#account');

    linkItem?.focus();
    linkItem?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));
    await nextTick();

    expect(selectedValues).toEqual(['Account settings']);
    expect(isPopoverOpen(menu)).toBe(false);

    app.unmount();
  });

  it('keeps native disabled state and interaction in sync when MenuItem is updated', async () => {
    const disabled = ref(true);
    let clickCount = 0;
    const container = document.createElement('div');
    container.addEventListener('click', () => {
      clickCount += 1;
    });
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        return () => h(MenuItem, { disabled: disabled.value }, { default: () => 'Disconnect device' });
      },
    });

    app.mount(container);
    await nextTick();

    const menuItem = container.querySelector<HTMLButtonElement>('button[role="menuitem"]');

    expect(menuItem?.disabled).toBe(true);
    expect(menuItem?.hasAttribute('disabled')).toBe(true);
    expect(menuItem?.hasAttribute('aria-disabled')).toBe(false);

    menuItem?.click();
    expect(clickCount).toBe(0);

    disabled.value = false;
    await nextTick();

    expect(menuItem?.disabled).toBe(false);
    expect(menuItem?.hasAttribute('disabled')).toBe(false);
    expect(menuItem?.hasAttribute('aria-disabled')).toBe(false);

    menuItem?.click();
    expect(clickCount).toBe(1);

    disabled.value = true;
    await nextTick();

    expect(menuItem?.disabled).toBe(true);
    expect(menuItem?.hasAttribute('disabled')).toBe(true);

    menuItem?.click();
    expect(clickCount).toBe(1);

    app.unmount();
  });

  it('keeps anchor accessibility and interaction in sync with MenuItem disabled updates', async () => {
    const disabled = ref(false);
    let clickCount = 0;
    let clickDefaultPrevented: boolean | undefined;
    const container = document.createElement('div');
    container.addEventListener('click', (event) => {
      clickCount += 1;
      clickDefaultPrevented = event.defaultPrevented;
      event.preventDefault();
    });
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        return () => h(MenuItem, { disabled: disabled.value, href: '#account' }, { default: () => 'Account settings' });
      },
    });

    app.mount(container);
    await nextTick();

    const menuItem = container.querySelector<HTMLAnchorElement>('a[role="menuitem"]');
    const enabledClick = new MouseEvent('click', { bubbles: true, cancelable: true });

    expect(menuItem?.getAttribute('href')).toBe('#account');
    expect(menuItem?.hasAttribute('disabled')).toBe(false);
    expect(menuItem?.hasAttribute('aria-disabled')).toBe(false);
    expect(menuItem?.hasAttribute('tabindex')).toBe(false);

    menuItem?.dispatchEvent(enabledClick);
    expect(clickDefaultPrevented).toBe(false);
    expect(clickCount).toBe(1);

    disabled.value = true;
    await nextTick();

    const disabledClick = new MouseEvent('click', { bubbles: true, cancelable: true });

    expect(menuItem?.hasAttribute('href')).toBe(false);
    expect(menuItem?.hasAttribute('disabled')).toBe(false);
    expect(menuItem?.getAttribute('aria-disabled')).toBe('true');
    expect(menuItem?.getAttribute('tabindex')).toBe('-1');

    menuItem?.dispatchEvent(disabledClick);
    expect(disabledClick.defaultPrevented).toBe(true);
    expect(clickCount).toBe(1);

    disabled.value = false;
    await nextTick();

    const reenabledClick = new MouseEvent('click', { bubbles: true, cancelable: true });

    expect(menuItem?.getAttribute('href')).toBe('#account');
    expect(menuItem?.hasAttribute('aria-disabled')).toBe(false);
    expect(menuItem?.hasAttribute('tabindex')).toBe(false);

    menuItem?.dispatchEvent(reenabledClick);
    expect(clickDefaultPrevented).toBe(false);
    expect(clickCount).toBe(2);

    app.unmount();
  });

  it('updates the MenuItem element semantics when href changes', async () => {
    const href = ref<string>();
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        return () => h(MenuItem, { href: href.value }, { default: () => 'Account settings' });
      },
    });

    app.mount(container);
    await nextTick();

    expect(container.querySelector('button[role="menuitem"]')).not.toBeNull();

    href.value = '#account';
    await nextTick();

    expect(container.querySelector('button[role="menuitem"]')).toBeNull();
    expect(container.querySelector('a[role="menuitem"]')?.getAttribute('href')).toBe('#account');

    href.value = undefined;
    await nextTick();

    expect(container.querySelector('a[role="menuitem"]')).toBeNull();
    expect(container.querySelector('button[role="menuitem"]')).not.toBeNull();

    app.unmount();
  });

  it('navigates across items rendered in multiple containers', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          open: true,
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [h(MenuItem, null, { default: () => 'First' })],
            }),
            h(MenuGap),
            h(MenuContainer, null, {
              default: () => [
                h(MenuLabel, null, { default: () => 'Edit' }),
                h(MenuItem, null, { default: () => 'Second' }),
                h(MenuItem, null, { default: () => 'Third' }),
              ],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const menu = container.querySelector('[role="menu"]');
    const menuItems = container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]');

    menuItems[0]?.focus();
    menu?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));

    expect(document.activeElement).toBe(menuItems[1]);

    menu?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));

    expect(document.activeElement).toBe(menuItems[2]);

    app.unmount();
  });

  it('opens a submenu trigger without emitting select', async () => {
    installPopoverPolyfill();

    const selectedValues: string[] = [];

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          open: true,
          onSelect: (_event: MouseEvent, itemElement: HTMLElement) => {
            selectedValues.push(itemElement.textContent?.trim() ?? '');
          },
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [
                h(MenuSubMenu, null, {
                  trigger: ({ open }: { open: boolean }) =>
                    h(
                      MenuItem,
                      {
                        submenu: true,
                        submenuOpen: open,
                      },
                      {
                        default: () => 'More',
                      },
                    ),
                  default: () =>
                    h(MenuContainer, null, {
                      default: () => [h(MenuItem, null, { default: () => 'Rename' })],
                    }),
                }),
              ],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector<HTMLButtonElement>('button[role="menuitem"][data-submenu="true"]');
    trigger?.click();
    await nextTick();

    expect(selectedValues).toEqual([]);

    const submenu = container.querySelector<HTMLElement>('.m3-menu[data-submenu="true"]');
    expect(isPopoverOpen(submenu)).toBe(true);
    expect(submenu?.dataset.popoverSourceId).toBe('More');

    app.unmount();
  });

  it('does not open a submenu from touch hover or focus before click', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          open: true,
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [
                h(MenuSubMenu, null, {
                  trigger: ({ open }: { open: boolean }) =>
                    h(
                      MenuItem,
                      {
                        submenu: true,
                        submenuOpen: open,
                      },
                      {
                        default: () => 'More',
                      },
                    ),
                  default: () =>
                    h(MenuContainer, null, {
                      default: () => [h(MenuItem, null, { default: () => 'Rename' })],
                    }),
                }),
              ],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const submenuWrapper = container.querySelector<HTMLElement>('.m3-menu-submenu');
    const trigger = container.querySelector<HTMLButtonElement>('button[role="menuitem"][data-submenu="true"]');
    const submenu = container.querySelector<HTMLElement>('.m3-menu[data-submenu="true"]');

    submenuWrapper?.dispatchEvent(createPointerEvent('pointerenter', { bubbles: true, pointerType: 'touch' }));
    trigger?.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
    trigger?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await nextTick();

    expect(isPopoverOpen(submenu)).toBe(false);

    trigger?.click();
    await nextTick();

    expect(isPopoverOpen(submenu)).toBe(true);

    app.unmount();
  });

  it('supports keyboard open and close for submenu items', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          open: true,
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [
                h(MenuSubMenu, null, {
                  trigger: ({ open }: { open: boolean }) =>
                    h(
                      MenuItem,
                      {
                        submenu: true,
                        submenuOpen: open,
                      },
                      {
                        default: () => 'More',
                      },
                    ),
                  default: () =>
                    h(MenuContainer, null, {
                      default: () => [
                        h(MenuItem, null, { default: () => 'Child 1' }),
                        h(MenuItem, null, { default: () => 'Child 2' }),
                      ],
                    }),
                }),
              ],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector<HTMLButtonElement>('button[role="menuitem"][data-submenu="true"]');
    trigger?.focus();
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    await nextTick();

    const submenu = container.querySelector<HTMLElement>('.m3-menu[data-submenu="true"]');
    const nestedItems = submenu?.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]') ?? [];

    expect(isPopoverOpen(submenu)).toBe(true);
    expect(document.activeElement).toBe(nestedItems[0]);

    nestedItems[0]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
    await nextTick();

    expect(document.activeElement).toBe(nestedItems[1]);

    submenu?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
    await nextTick();

    expect(isPopoverOpen(submenu)).toBe(false);
    expect(document.activeElement).toBe(trigger);

    app.unmount();
  });

  it('closes the full menu chain when selecting a submenu item', async () => {
    installPopoverPolyfill();

    const selectedValues: string[] = [];

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          open: true,
          onSelect: (_event: MouseEvent, itemElement: HTMLElement) => {
            selectedValues.push(itemElement.textContent?.trim() ?? '');
          },
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [
                h(MenuSubMenu, null, {
                  trigger: ({ open }: { open: boolean }) =>
                    h(
                      MenuItem,
                      {
                        submenu: true,
                        submenuOpen: open,
                      },
                      {
                        default: () => 'More',
                      },
                    ),
                  default: () =>
                    h(MenuContainer, null, {
                      default: () => [h(MenuItem, null, { default: () => 'Rename' })],
                    }),
                }),
              ],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const rootMenu = container.querySelector<HTMLElement>('.m3-menu:not([data-submenu="true"])');
    const trigger = container.querySelector<HTMLButtonElement>('button[role="menuitem"][data-submenu="true"]');

    trigger?.click();
    await nextTick();

    const submenu = container.querySelector<HTMLElement>('.m3-menu[data-submenu="true"]');
    const submenuItem = submenu?.querySelector<HTMLButtonElement>('button[role="menuitem"]');

    submenuItem?.click();
    await nextTick();

    expect(selectedValues).toEqual(['Rename']);
    expect(isPopoverOpen(rootMenu)).toBe(false);
    expect(isPopoverOpen(submenu)).toBe(false);

    app.unmount();
  });

  it('keeps submenu open while the pointer stays inside the safe triangle', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          open: true,
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [
                h(MenuSubMenu, null, {
                  trigger: ({ open }: { open: boolean }) =>
                    h(
                      MenuItem,
                      {
                        submenu: true,
                        submenuOpen: open,
                      },
                      {
                        default: () => 'More',
                      },
                    ),
                  default: () =>
                    h(MenuContainer, null, {
                      default: () => [
                        h(MenuItem, null, { default: () => 'Child 1' }),
                        h(MenuItem, null, { default: () => 'Child 2' }),
                      ],
                    }),
                }),
              ],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const pointerEventConstructor = window.PointerEvent ?? MouseEvent;
    const submenuWrapper = container.querySelector<HTMLElement>('.m3-menu-submenu');
    const trigger = container.querySelector<HTMLButtonElement>('button[role="menuitem"][data-submenu="true"]');

    trigger?.click();
    await nextTick();

    const submenu = container.querySelector<HTMLElement>('.m3-menu[data-submenu="true"]');

    Object.defineProperty(submenu as HTMLElement, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 160,
        y: 48,
        top: 48,
        right: 280,
        bottom: 176,
        left: 160,
        width: 120,
        height: 128,
        toJSON: () => null,
      }),
    });

    submenuWrapper?.dispatchEvent(
      new pointerEventConstructor('pointerleave', {
        bubbles: true,
        clientX: 120,
        clientY: 112,
      }),
    );

    document.dispatchEvent(
      new pointerEventConstructor('pointermove', {
        bubbles: true,
        clientX: 144,
        clientY: 112,
      }),
    );
    await nextTick();

    expect(isPopoverOpen(submenu)).toBe(true);

    document.dispatchEvent(
      new pointerEventConstructor('pointermove', {
        bubbles: true,
        clientX: 144,
        clientY: 220,
      }),
    );
    await nextTick();

    expect(isPopoverOpen(submenu)).toBe(false);

    app.unmount();
  });

  it('moves focus into a dropdown menu when opened from the keyboard', async () => {
    installPopoverPolyfill();

    const createDropdownApp = () =>
      createApp(() =>
        h('div', [
          withDirectives(h('button', { type: 'button' }, 'Open dropdown menu'), [[vDropdown, '#dropdown-menu']]),
          h(
            Menu,
            {
              id: 'dropdown-menu',
            },
            {
              default: () => [
                h(MenuContainer, null, {
                  default: () => [
                    h(MenuItem, null, { default: () => 'First' }),
                    h(MenuItem, null, { default: () => 'Second' }),
                    h(MenuItem, null, { default: () => 'Third' }),
                  ],
                }),
              ],
            },
          ),
        ]),
      );

    for (const [key, expectedIndex] of [
      ['Enter', 0],
      [' ', 0],
      ['ArrowDown', 0],
      ['ArrowUp', 2],
    ] as const) {
      document.body.innerHTML = '';

      const container = document.createElement('div');
      document.body.appendChild(container);

      const app = createDropdownApp();
      app.mount(container);
      await nextTick();

      const trigger = container.querySelector<HTMLButtonElement>('button');
      const menuItems = container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]');

      trigger?.focus();
      trigger?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
      await nextTick();

      const menu = container.querySelector<HTMLElement>('[role="menu"]');
      expect(document.activeElement).toBe(menuItems[expectedIndex]);
      expect(menu?.dataset.popoverSourceId).toBe('Open dropdown menu');

      app.unmount();
    }
  });

  it('opens a dropdown menu on mouse press and selects an item on drag release', async () => {
    installPopoverPolyfill();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onSelect = vi.fn();

    const app = createApp(() =>
      h('div', [
        withDirectives(h('button', { type: 'button' }, 'Open menu'), [[vDropdown, '#drag-menu']]),
        h(Menu, { id: 'drag-menu', onSelect }, () =>
          h(MenuContainer, null, () => [
            h(MenuItem, null, () => 'First'),
            h(MenuItem, { disabled: true }, () => 'Disabled'),
          ]),
        ),
      ]),
    );

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector<HTMLButtonElement>('button');
    const menu = container.querySelector<HTMLElement>('#drag-menu');
    const items = container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');

    trigger?.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }));
    trigger?.dispatchEvent(createPointerEvent('pointerup', { bubbles: true, clientX: 10, clientY: 10 }));
    trigger?.click();
    expect(isPopoverOpen(menu)).toBe(true);
    expect(onSelect).not.toHaveBeenCalled();

    menu?.hidePopover();
    trigger?.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }));
    document.dispatchEvent(createPointerEvent('pointermove', { bubbles: true, clientX: 20, clientY: 20 }));
    expect(isPopoverOpen(menu)).toBe(true);
    items[0]?.dispatchEvent(createPointerEvent('pointerup', { bubbles: true, clientX: 30, clientY: 30 }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(isPopoverOpen(menu)).toBe(false);

    trigger?.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }));
    document.dispatchEvent(createPointerEvent('pointermove', { bubbles: true, clientX: 20, clientY: 20 }));
    items[1]?.dispatchEvent(createPointerEvent('pointerup', { bubbles: true, clientX: 30, clientY: 30 }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(isPopoverOpen(menu)).toBe(false);

    app.unmount();
  });

  it('uses native light dismiss for an auto context menu without a document listener', async () => {
    installPopoverPolyfill();
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h('div', [
        withDirectives(h('div', { id: 'context-host' }, 'Context target'), [[vContextMenu, '#context-menu']]),
        h(Menu, { id: 'context-menu' }),
      ]),
    );

    app.mount(container);
    await nextTick();
    expect(addEventListener.mock.calls.filter(([type]) => type === 'pointerdown')).toHaveLength(0);

    container
      .querySelector('#context-host')
      ?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 24, clientY: 32 }));
    await nextTick();

    const menu = container.querySelector<HTMLElement>('#context-menu');
    expect(isPopoverOpen(menu)).toBe(true);
    expect(menu?.style.left).toBe('24px');
    expect(menu?.style.top).toBe('32px');
    expect(addEventListener.mock.calls.filter(([type]) => type === 'pointerdown')).toHaveLength(0);

    app.unmount();
  });

  it('restores focus to the dropdown trigger when the menu closes from keyboard or keyboard selection, but not mouse selection', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h('div', [
        withDirectives(h('button', { type: 'button' }, 'Open dropdown menu'), [[vDropdown, '#dropdown-menu']]),
        h(
          Menu,
          {
            id: 'dropdown-menu',
          },
          {
            default: () => [
              h(MenuContainer, null, {
                default: () => [
                  h(MenuItem, null, { default: () => 'First' }),
                  h(MenuItem, null, { default: () => 'Second' }),
                ],
              }),
            ],
          },
        ),
      ]),
    );

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector<HTMLButtonElement>('button');
    const menu = container.querySelector<HTMLElement>('[role="menu"]');
    const menuItems = container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]');

    trigger?.focus();
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
    await nextTick();

    menu?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    await nextTick();
    await flushMicrotasks();

    expect(isPopoverOpen(menu)).toBe(false);
    expect(document.activeElement).toBe(trigger);

    trigger?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
    await nextTick();

    menuItems[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    await nextTick();
    await flushMicrotasks();

    expect(isPopoverOpen(menu)).toBe(false);
    expect(document.activeElement).toBe(trigger);

    trigger?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
    await nextTick();

    menuItems[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    await nextTick();
    await flushMicrotasks();

    expect(isPopoverOpen(menu)).toBe(false);
    expect(document.activeElement).not.toBe(trigger);

    app.unmount();
  });
});

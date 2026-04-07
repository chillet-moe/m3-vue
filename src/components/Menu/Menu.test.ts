// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick, ref, withDirectives } from 'vue';
import { vDropdownMenu } from '@/directives/Menu';
import Menu from './Menu.vue';
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

  if (typeof init.pointerId === 'number') {
    Object.defineProperty(event, 'pointerId', {
      configurable: true,
      value: init.pointerId,
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
  };

  if (typeof prototype.showPopover !== 'function') {
    Object.defineProperty(prototype, 'showPopover', {
      configurable: true,
      value(this: HTMLElement, options?: { source?: HTMLElement }) {
        if (options?.source) {
          this.dataset.popoverSourceId =
            options.source.id || options.source.textContent?.trim() || options.source.getAttribute('aria-label') || 'source';
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
    expect(isPopoverOpen(menu)).toBe(false);

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

  it('supports vibrant color option', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          color: 'vibrant',
          open: true,
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [h(MenuItem, null, { default: () => 'Edit' })],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const menu = container.querySelector('[role="menu"]') as HTMLDivElement | null;
    expect(menu?.dataset.color).toBe('vibrant');

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
                h(
                  MenuSubMenu,
                  null,
                  {
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
                  },
                ),
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
                h(
                  MenuSubMenu,
                  null,
                  {
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
                  },
                ),
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
                h(
                  MenuSubMenu,
                  null,
                  {
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
                  },
                ),
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
                h(
                  MenuSubMenu,
                  null,
                  {
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
                  },
                ),
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
                h(
                  MenuSubMenu,
                  null,
                  {
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
                  },
                ),
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
          withDirectives(h('button', { type: 'button' }, 'Open dropdown menu'), [[vDropdownMenu, '#dropdown-menu']]),
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
        ]));

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

  it('restores focus to the dropdown trigger when the menu closes from keyboard or selection', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h('div', [
        withDirectives(h('button', { type: 'button' }, 'Open dropdown menu'), [[vDropdownMenu, '#dropdown-menu']]),
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
      ]));

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
    menuItems[0]?.click();
    await nextTick();
    await flushMicrotasks();

    expect(isPopoverOpen(menu)).toBe(false);
    expect(document.activeElement).toBe(trigger);

    app.unmount();
  });
});

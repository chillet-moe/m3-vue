// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick } from 'vue';
import FloatingActionButton from './FloatingActionButton.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('FloatingActionButton', () => {
  it('renders an icon-only FAB by default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(FloatingActionButton, { icon: 'edit', 'aria-label': 'Edit' });
      },
    });

    app.mount(container);
    await nextTick();

    const button = container.querySelector('button') as HTMLButtonElement | null;

    expect(button).not.toBeNull();
    expect(button?.dataset.color).toBe('primary-container');
    expect(button?.dataset.size).toBe('regular');
    expect(button?.dataset.extended).toBe('false');
    expect(button?.querySelector('[data-part="icon"]')?.textContent).toBe('edit');

    app.unmount();
  });

  it('renders label content as an extended FAB', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(
          FloatingActionButton,
          {
            href: '/compose',
            icon: 'add',
            color: 'primary',
            size: 'medium',
          },
          {
            default: () => 'Compose',
          },
        );
      },
    });

    app.mount(container);
    await nextTick();

    const anchor = container.querySelector('a') as HTMLAnchorElement | null;

    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('href')).toBe('/compose');
    expect(anchor?.dataset.color).toBe('primary');
    expect(anchor?.dataset.size).toBe('medium');
    expect(anchor?.dataset.extended).toBe('true');
    expect(anchor?.querySelector('[data-part="icon"]')?.getAttribute('aria-hidden')).toBe('true');
    expect(anchor?.querySelector('[data-part="label"]')?.textContent).toBe('Compose');

    app.unmount();
  });

  it('blocks click listeners on disabled anchor FABs', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    let clickCount = 0;

    const app = createApp({
      render() {
        return h(
          FloatingActionButton,
          {
            href: '/blocked',
            icon: 'edit',
            disabled: true,
            onClick: () => {
              clickCount += 1;
            },
          },
          {
            default: () => 'Edit',
          },
        );
      },
    });

    app.mount(container);
    await nextTick();

    const anchor = container.querySelector('a') as HTMLAnchorElement | null;
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const dispatched = anchor?.dispatchEvent(clickEvent);

    expect(anchor?.getAttribute('href')).toBeNull();
    expect(anchor?.getAttribute('aria-disabled')).toBe('true');
    expect(dispatched).toBe(false);
    expect(clickEvent.defaultPrevented).toBe(true);
    expect(clickCount).toBe(0);

    app.unmount();
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick } from 'vue';
import Breadcrumb from './Breadcrumb.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Breadcrumb', () => {
  it('renders a navigation landmark with default and custom labels', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Breadcrumb, {
        items: [{ label: 'Docs' }],
      }),
    );

    app.mount(container);
    await nextTick();

    const defaultNav = container.querySelector('nav');
    expect(defaultNav?.getAttribute('aria-label')).toBe('Breadcrumb');

    app.unmount();

    const customApp = createApp(() =>
      h(Breadcrumb, {
        ariaLabel: 'Project path',
        items: [{ label: 'Docs' }],
      }),
    );

    customApp.mount(container);
    await nextTick();

    const customNav = container.querySelector('nav');
    expect(customNav?.getAttribute('aria-label')).toBe('Project path');

    customApp.unmount();
  });

  it('renders items, links, separators, and the current page from the items prop', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Breadcrumb, {
        items: [{ label: 'Docs', href: '/docs' }, { label: 'Breadcrumb' }],
      }),
    );

    app.mount(container);
    await nextTick();

    const list = container.querySelector('ol');
    const items = container.querySelectorAll('li');
    const link = container.querySelector('.m3-breadcrumb-link');
    const separator = container.querySelector('.m3-breadcrumb-separator');
    const separatorIcon = separator?.querySelector('.m3-icon');
    const page = container.querySelector('.m3-breadcrumb-page');

    expect(list).toBeTruthy();
    expect(items).toHaveLength(3);
    expect(link?.tagName).toBe('A');
    expect(link?.getAttribute('href')).toBe('/docs');
    expect(separator?.getAttribute('aria-hidden')).toBe('true');
    expect(separatorIcon?.textContent?.trim()).toBe('chevron_right');
    expect(page?.getAttribute('aria-current')).toBe('page');
    expect(page?.textContent?.trim()).toBe('Breadcrumb');

    app.unmount();
  });

  it('renders button items when href is omitted and mirrors disabled state', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Breadcrumb, {
        items: [{ label: 'Disabled', disabled: true }, { label: 'Current' }],
      }),
    );

    app.mount(container);
    await nextTick();

    const link = container.querySelector('.m3-breadcrumb-link');
    expect(link?.tagName).toBe('BUTTON');
    expect(link?.getAttribute('disabled')).toBe('');
    expect(link?.getAttribute('data-disabled')).toBe('true');

    app.unmount();
  });

  it('renders ellipsis marker with accessible text', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Breadcrumb, {
        ellipsisLabel: 'Collapsed folders',
        items: [{ label: 'Workspace', href: '/' }, { label: 'More', ellipsis: true }, { label: 'Current' }],
      }),
    );

    app.mount(container);
    await nextTick();

    const ellipsis = container.querySelector('.m3-breadcrumb-ellipsis');
    const ellipsisIcon = ellipsis?.querySelector('.m3-icon');

    expect(ellipsis?.getAttribute('role')).toBe('img');
    expect(ellipsis?.getAttribute('aria-label')).toBe('Collapsed folders');
    expect(ellipsisIcon?.textContent?.trim()).toBe('more_horiz');

    app.unmount();
  });
});

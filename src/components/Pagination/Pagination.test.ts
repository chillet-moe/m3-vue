// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick } from 'vue';
import Pagination from './Pagination.vue';
import PaginationContent from './PaginationContent.vue';
import PaginationEllipsis from './PaginationEllipsis.vue';
import PaginationItem from './PaginationItem.vue';
import PaginationLink from './PaginationLink.vue';
import PaginationNext from './PaginationNext.vue';
import PaginationPrevious from './PaginationPrevious.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Pagination', () => {
  it('renders a navigation landmark with default and custom labels', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Pagination, null, {
        default: () => [h(PaginationContent)],
      }),
    );

    app.mount(container);
    await nextTick();

    const defaultNav = container.querySelector('nav');
    expect(defaultNav?.getAttribute('aria-label')).toBe('Pagination');

    app.unmount();

    const customApp = createApp(() =>
      h(
        Pagination,
        {
          ariaLabel: 'Search result pages',
        },
        {
          default: () => [h(PaginationContent)],
        },
      ),
    );

    customApp.mount(container);
    await nextTick();

    const customNav = container.querySelector('nav');
    expect(customNav?.getAttribute('aria-label')).toBe('Search result pages');

    customApp.unmount();
  });

  it('sets aria-current when PaginationLink is active', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Pagination, null, {
        default: () => [
          h(PaginationContent, null, {
            default: () => [
              h(PaginationItem, null, {
                default: () =>
                  h(
                    PaginationLink,
                    {
                      isActive: true,
                    },
                    {
                      default: () => '2',
                    },
                  ),
              }),
            ],
          }),
        ],
      }),
    );

    app.mount(container);
    await nextTick();

    const activeLink = container.querySelector('.m3-pagination-link');
    expect(activeLink?.getAttribute('aria-current')).toBe('page');
    expect(activeLink?.getAttribute('data-active')).toBe('true');

    app.unmount();
  });

  it('renders previous/next helpers with icon and text', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Pagination, null, {
        default: () => [
          h(PaginationContent, null, {
            default: () => [
              h(PaginationItem, null, {
                default: () => h(PaginationPrevious),
              }),
              h(PaginationItem, null, {
                default: () =>
                  h(PaginationNext, {
                    text: 'Forward',
                  }),
              }),
            ],
          }),
        ],
      }),
    );

    app.mount(container);
    await nextTick();

    const previous = container.querySelector('.m3-pagination-previous');
    const next = container.querySelector('.m3-pagination-next');
    const previousIcon = previous?.querySelector('.m3-icon');
    const nextIcon = next?.querySelector('.m3-icon');
    const previousText = previous?.querySelector('.m3-pagination-nav-text');
    const nextText = next?.querySelector('.m3-pagination-nav-text');

    expect(previousText?.textContent?.trim()).toBe('Previous');
    expect(nextText?.textContent?.trim()).toBe('Forward');
    expect(previousIcon?.textContent?.trim()).toBe('chevron_left');
    expect(nextIcon?.textContent?.trim()).toBe('chevron_right');

    app.unmount();
  });

  it('renders ellipsis marker with accessible text', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Pagination, null, {
        default: () => [
          h(PaginationContent, null, {
            default: () => [
              h(PaginationItem, null, {
                default: () => h(PaginationEllipsis),
              }),
            ],
          }),
        ],
      }),
    );

    app.mount(container);
    await nextTick();

    const ellipsisIcon = container.querySelector('.m3-pagination-ellipsis-icon');
    const ellipsisLabel = container.querySelector('.m3-pagination-visually-hidden');

    expect(ellipsisIcon?.textContent?.trim()).toBe('more_horiz');
    expect(ellipsisLabel?.textContent?.trim()).toBe('More pages');

    app.unmount();
  });
});

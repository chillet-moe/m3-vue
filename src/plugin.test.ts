// @vitest-environment jsdom
import type { App } from 'vue';
import { createApp, h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import Button from '@/components/Button/Button.vue';
import IconButton from '@/components/IconButton/IconButton.vue';
import ListItem from '@/components/ListItem/ListItem.vue';
import NavigationDrawerItem from '@/components/NavigationDrawer/NavigationDrawerItem.vue';
import NavigationDrawer from '@/components/NavigationDrawer/NavigationDrawer.vue';
import PaginationLink from '@/components/Pagination/PaginationLink.vue';
import PaginationNext from '@/components/Pagination/PaginationNext.vue';
import PaginationPrevious from '@/components/Pagination/PaginationPrevious.vue';
import TextField from '@/components/TextField/TextField.vue';
import { buttonContextKey } from '@/components/Button/ButtonContext';
import { iconButtonContextKey } from '@/components/IconButton/IconButtonContext';
import { navigationDrawerShapeContextKey } from '@/components/NavigationDrawer/NavigationDrawerContext';
import { fieldContextKey } from '@/components/TextField/FieldContext';
import { M3VuePlugin, m3VueDirectiveNames, m3VueDirectives } from './plugin';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('M3VuePlugin', () => {
  it('registers all exported directives with stable global names', () => {
    const directive = vi.fn();
    const provide = vi.fn();

    M3VuePlugin.install({
      directive,
      provide,
    } as unknown as App);

    expect(m3VueDirectiveNames).toEqual(['tooltip', 'dropdown', 'dropdownMenu', 'contextMenu']);
    expect(directive.mock.calls).toEqual(m3VueDirectiveNames.map((name) => [name, m3VueDirectives[name]]));
    expect(provide).toHaveBeenCalledOnce();
  });

  it('installs one reactive shape default for shape-aware components', async () => {
    const shape = ref<'rounded' | 'square'>('square');
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h('div', [
        h(Button, { class: 'global-button' }, { default: () => 'Button' }),
        h(IconButton, { class: 'global-icon-button', icon: 'settings' }),
        h(ListItem, { class: 'global-item', title: 'List item' }),
        h(TextField, { class: 'global-field', modelValue: '' }),
        h(PaginationLink, { class: 'global-pagination' }, { default: () => '1' }),
        h(PaginationPrevious, { class: 'global-pagination-previous' }),
        h(PaginationNext, { class: 'global-pagination-next' }),
        h(
          NavigationDrawer,
          { class: 'global-drawer' },
          {
            default: () => h(NavigationDrawerItem, { class: 'global-drawer-item', value: 'home', label: 'Home' }),
          },
        ),
        h(Button, { class: 'override-button', shape: 'rounded' }, { default: () => 'Override' }),
        h(TextField, { class: 'override-field', modelValue: '', shape: 'rounded' }),
      ]),
    );

    app.use(M3VuePlugin, { shape });
    app.mount(container);
    await nextTick();

    const globalShapeElements = [
      '.global-button',
      '.global-icon-button',
      '.global-item',
      '.global-field',
      '.global-pagination',
      '.global-pagination-previous',
      '.global-pagination-next',
      '.global-drawer-item',
    ];

    for (const selector of globalShapeElements) {
      expect(container.querySelector<HTMLElement>(selector)?.dataset.shape).toBe('square');
    }
    expect(container.querySelector<HTMLElement>('.override-button')?.dataset.shape).toBe('rounded');
    expect(container.querySelector<HTMLElement>('.override-field')?.dataset.shape).toBe('rounded');

    shape.value = 'rounded';
    await nextTick();

    for (const selector of globalShapeElements) {
      expect(container.querySelector<HTMLElement>(selector)?.dataset.shape).toBe('rounded');
    }
    expect(container.querySelector<HTMLElement>('.override-button')?.dataset.shape).toBe('rounded');
    expect(container.querySelector<HTMLElement>('.override-field')?.dataset.shape).toBe('rounded');

    app.unmount();
  });

  it('provides the same configured shape ref to every shape-aware context', () => {
    const directive = vi.fn();
    const provide = vi.fn();
    const shape = ref<'rounded' | 'square'>('square');

    M3VuePlugin.install(
      {
        directive,
        provide,
      } as unknown as App,
      { shape },
    );

    const buttonContext = provide.mock.calls.find(([key]) => key === buttonContextKey)?.[1];
    const iconButtonContext = provide.mock.calls.find(([key]) => key === iconButtonContextKey)?.[1];
    const fieldContext = provide.mock.calls.find(([key]) => key === fieldContextKey)?.[1];
    const navigationDrawerShapeContext = provide.mock.calls.find(
      ([key]) => key === navigationDrawerShapeContextKey,
    )?.[1];

    expect(buttonContext).toEqual({ shape });
    expect(iconButtonContext).toBe(buttonContext);
    expect(fieldContext).toBe(buttonContext);
    expect(navigationDrawerShapeContext).toBe(buttonContext);
  });
});

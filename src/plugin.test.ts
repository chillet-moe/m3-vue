// @vitest-environment jsdom
import type { App } from 'vue';
import { createApp, h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import Button from '@/components/Button/Button.vue';
import IconButton from '@/components/IconButton/IconButton.vue';
import ListItem from '@/components/ListItem/ListItem.vue';
import { buttonContextKey } from '@/components/Button/ButtonContext';
import { iconButtonContextKey } from '@/components/IconButton/IconButtonContext';
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

  it('installs one reactive shape default for action components', async () => {
    const shape = ref<'rounded' | 'square'>('square');
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h('div', [
        h(Button, undefined, { default: () => 'Button' }),
        h(IconButton, { icon: 'settings' }),
        h(ListItem, { title: 'List item' }),
        h(Button, { shape: 'rounded' }, { default: () => 'Override' }),
      ]),
    );

    app.use(M3VuePlugin, { shape });
    app.mount(container);
    await nextTick();

    expect(container.querySelector<HTMLElement>('.m3-button')?.dataset.shape).toBe('square');
    expect(container.querySelector<HTMLElement>('.m3-icon-button')?.dataset.shape).toBe('square');
    expect(container.querySelector<HTMLElement>('.m3-item')?.dataset.shape).toBe('square');
    expect(container.querySelectorAll<HTMLElement>('.m3-button')[2]?.dataset.shape).toBe('rounded');

    shape.value = 'rounded';
    await nextTick();

    expect(container.querySelector<HTMLElement>('.m3-button')?.dataset.shape).toBe('rounded');
    expect(container.querySelector<HTMLElement>('.m3-icon-button')?.dataset.shape).toBe('rounded');
    expect(container.querySelector<HTMLElement>('.m3-item')?.dataset.shape).toBe('rounded');
    expect(container.querySelectorAll<HTMLElement>('.m3-button')[2]?.dataset.shape).toBe('rounded');

    app.unmount();
  });

  it('provides the same configured shape ref to both action contexts', () => {
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

    expect(buttonContext).toEqual({ shape });
    expect(iconButtonContext).toBe(buttonContext);
  });
});

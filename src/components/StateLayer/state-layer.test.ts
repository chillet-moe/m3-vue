// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref, withDirectives } from 'vue';
import CheckBox from '@/components/CheckBox/CheckBox.vue';
import ListItem from '@/components/ListItem/ListItem.vue';
import Radio from '@/components/Radio/Radio.vue';
import Switch from '@/components/Switch/Switch.vue';
import { triggerKeyboardRipple, vStateLayer } from './state-layer';

it('releases the document state layer when a component root has the directive twice', () => {
  const container = document.createElement('div');
  document.body.append(container);
  const Button = defineComponent({
    render: () => withDirectives(h('button', { class: 'm3-state-layer' }), [[vStateLayer]]),
  });
  const app = createApp(() => withDirectives(h(Button), [[vStateLayer]]));
  app.mount(container);

  const button = container.querySelector('button')!;
  button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  expect(button.querySelectorAll('.ripple')).toHaveLength(1);

  app.unmount();
  container.remove();
  expect(button.querySelector('.ripple')).toBeNull();
  expect(document.documentElement.classList.contains('js')).toBe(false);
});

it('creates keyboard ripples for activation keys and ignores navigation and shortcuts', () => {
  const container = document.createElement('div');
  document.body.append(container);
  const app = createApp(() =>
    h('div', [
      withDirectives(h('button', { class: 'm3-state-layer' }, [h('span', 'Action')]), [[vStateLayer]]),
      withDirectives(h('div', { class: 'm3-state-layer' }), [[vStateLayer]]),
    ]),
  );
  app.mount(container);

  const button = container.querySelector('button')!;
  const label = button.querySelector('span')!;
  const surface = container.querySelector<HTMLElement>('div.m3-state-layer')!;

  for (const options of [
    { key: 'ArrowLeft' },
    { key: 'Enter', repeat: true },
    { key: 'Enter', isComposing: true },
    { key: 'Enter', ctrlKey: true },
    { key: ' ', altKey: true },
    { key: ' ', metaKey: true },
  ]) {
    label.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...options }));
  }
  expect(button.querySelector('.ripple')).toBeNull();

  label.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
  expect(button.querySelector('.ripple')).not.toBeNull();

  const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
  surface.dispatchEvent(space);
  expect(surface.querySelector('.ripple')).toBeNull();
  triggerKeyboardRipple(space, surface);
  expect(surface.querySelector('.ripple')).not.toBeNull();

  app.unmount();
  container.remove();
});

it('clears a pending overlapping ripple on adoption after the first ripple settles', async () => {
  vi.useFakeTimers();
  const container = document.createElement('div');
  const frame = document.createElement('iframe');
  document.body.append(container, frame);
  const app = createApp(() => withDirectives(h('button', { class: 'm3-state-layer' }), [[vStateLayer]]));
  app.mount(container);

  try {
    const button = container.querySelector('button')!;
    const activate = () => button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    activate();
    vi.advanceTimersByTime(200);
    activate();
    expect(button.querySelectorAll('.ripple')).toHaveLength(2);

    vi.advanceTimersByTime(650);
    expect(button.querySelectorAll('.ripple')).toHaveLength(1);

    frame.contentDocument!.body.append(container);
    await Promise.resolve();
    expect(button.querySelector('.ripple')).toBeNull();

    activate();
    activate();
    expect(button.querySelectorAll('.ripple')).toHaveLength(2);
    app.unmount();
    expect(button.querySelector('.ripple')).toBeNull();
  } finally {
    if (container.firstChild) app.unmount();
    container.remove();
    frame.remove();
    vi.useRealTimers();
  }
});

it.each([
  ['CheckBox', (interactive: boolean) => h(CheckBox, { presentation: !interactive, checked: false })],
  ['Radio', (interactive: boolean) => h(Radio, { presentation: !interactive, checked: false })],
  ['Switch', (interactive: boolean) => h(Switch, { presentation: !interactive, checked: false })],
  ['ListItem', (interactive: boolean) => h(ListItem, { interactive, title: 'Item' })],
])('binds %s after it becomes interactive in another document', async (_, render) => {
  const interactive = ref(false);
  const container = document.createElement('div');
  const frame = document.createElement('iframe');
  document.body.append(container, frame);
  const destination = frame.contentDocument!;
  const app = createApp(() => render(interactive.value));
  app.mount(container);

  try {
    expect(document.documentElement.classList.contains('js')).toBe(false);
    destination.body.append(container);
    await Promise.resolve();
    expect(destination.documentElement.classList.contains('js')).toBe(false);

    interactive.value = true;
    await nextTick();
    const layer = container.querySelector('.m3-state-layer')!;
    layer.dispatchEvent(new destination.defaultView!.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(layer.querySelectorAll('.ripple')).toHaveLength(1);

    interactive.value = false;
    await nextTick();
    expect(layer.querySelector('.ripple')).toBeNull();
    expect(destination.documentElement.classList.contains('js')).toBe(false);
  } finally {
    app.unmount();
    container.remove();
    frame.remove();
  }
});

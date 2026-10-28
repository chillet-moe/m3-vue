// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick } from 'vue';
import Icon from './Icon.vue';

const iconStyles = readFileSync('src/components/Icon/Icon.css', 'utf8');

async function mountIcon(props: InstanceType<typeof Icon>['$props']) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const app = createApp({
    render() {
      return h(Icon, props);
    },
  });

  app.mount(container);
  await nextTick();

  return {
    app,
    root: container.querySelector('.m3-icon') as HTMLElement | null,
  };
}

describe('Icon', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('uses the standalone size contract by default', async () => {
    const { app, root } = await mountIcon({ name: 'settings' });

    expect(root?.dataset.variant).toBe('standalone');
    expect(root?.style.fontSize).toBe('');
    expect(iconStyles).toContain('font-size: var(--md-icon-size, --density-icon(24))');

    app.unmount();
  });

  it('lets inline icons follow surrounding text unless size is explicit', async () => {
    const inline = await mountIcon({ name: 'settings', variant: 'inline' });

    expect(inline.root?.dataset.variant).toBe('inline');
    expect(inline.root?.style.fontSize).toBe('');
    expect(iconStyles).toContain(".m3-icon[data-variant='inline']");
    expect(iconStyles).toContain('font-size: var(--md-icon-size, 1em)');

    inline.app.unmount();

    const sized = await mountIcon({ name: 'settings', size: '2rem' });

    expect(sized.root?.style.fontSize).toBe('2rem');

    sized.app.unmount();
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import BoundaryParent from './vueScopeBoundary/BoundaryParent.vue';

function marker(element: Element, suffix: string) {
  return element.getAttributeNames().find((name) => name.endsWith(suffix));
}

function capabilityPrefix(parentOwnedMarker: string) {
  return parentOwnedMarker.replace(/-owned$/, '-class--');
}

function hasCapability(element: Element, prefix: string, className: string) {
  return element.classList.contains(`${prefix}${className}`);
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Vue scope boundary compiler integration', () => {
  it('isolates child roots while retaining explicit and dynamic class capabilities', async () => {
    const dynamicClass = ref<unknown>(['dynamic', { active: true }]);
    const Root = defineComponent({
      setup: () => () => h(BoundaryParent, { dynamicClass: dynamicClass.value }),
    });
    const container = document.createElement('div');
    const app = createApp(Root);
    app.mount(container);

    const owned = container.querySelector('#owned')!;
    const parentOwnedMarker = marker(owned, '-owned');
    expect(parentOwnedMarker).toBeTruthy();
    const parentScopeId = parentOwnedMarker!.replace(/-owned$/, '');
    const prefix = capabilityPrefix(parentOwnedMarker!);

    expect(container.querySelector('#owned-content')?.hasAttribute(parentOwnedMarker!)).toBe(true);

    const plain = container.querySelector('#plain')!;
    expect(plain.hasAttribute(parentScopeId)).toBe(true);
    expect(plain.hasAttribute(parentOwnedMarker!)).toBe(false);
    expect([...plain.classList].some((name) => name.startsWith(prefix))).toBe(false);

    const explicit = container.querySelector('#explicit')!;
    expect(hasCapability(explicit, prefix, 'explicit')).toBe(true);

    const coincident = container.querySelector('#coincident')!;
    expect(coincident.classList.contains('coincident')).toBe(true);
    expect(hasCapability(coincident, prefix, 'coincident')).toBe(false);

    const dynamic = container.querySelector('#dynamic')!;
    expect(hasCapability(dynamic, prefix, 'dynamic')).toBe(true);
    expect(hasCapability(dynamic, prefix, 'active')).toBe(true);

    dynamicClass.value = ['next', { active: false, ready: true }];
    await nextTick();
    expect(hasCapability(dynamic, prefix, 'dynamic')).toBe(false);
    expect(hasCapability(dynamic, prefix, 'active')).toBe(false);
    expect(hasCapability(dynamic, prefix, 'next')).toBe(true);
    expect(hasCapability(dynamic, prefix, 'ready')).toBe(true);

    const childOwnedMarker = marker(plain, '-owned');
    expect(childOwnedMarker).toBeTruthy();
    expect(childOwnedMarker).not.toBe(parentOwnedMarker);
    expect(container.querySelector('#child-content')?.hasAttribute(childOwnedMarker!)).toBe(true);
    expect(container.querySelector('#child-content')?.hasAttribute(parentOwnedMarker!)).toBe(false);

    app.unmount();
  });

  it('keeps boundary markers stable through SSR and hydration', async () => {
    const Root = defineComponent({
      setup: () => () => h(BoundaryParent, { dynamicClass: ['dynamic', { active: true }] }),
    });
    const html = await renderToString(createSSRApp(Root));
    expect(html).toContain('-owned');
    expect(html).toContain('-class--explicit');
    expect(html).toContain('-class--dynamic');
    expect(html).toContain('-class--active');

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const before = container.innerHTML;
    const app = createSSRApp(Root);
    app.mount(container);
    await nextTick();

    expect(container.innerHTML).toBe(before);
    app.unmount();
  });
});

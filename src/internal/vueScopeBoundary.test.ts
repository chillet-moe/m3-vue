// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createScopeBoundaryVueOptions } from '@chillet/vue-scope-boundary/vite';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import BoundaryParent from './vueScopeBoundary/BoundaryParent.vue';

function marker(element: Element, suffix: string) {
  return element.getAttributeNames().find((name) => name.endsWith(suffix));
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Vue scope boundary compiler integration', () => {
  it('isolates positive type selectors while preserving normal Vue selectors and classes', async () => {
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

    expect(container.querySelector('#owned-content')?.hasAttribute(parentOwnedMarker!)).toBe(true);
    const ownedButton = container.querySelector('#owned-button')!;
    expect(ownedButton.hasAttribute(parentOwnedMarker!)).toBe(true);

    const plain = container.querySelector('#plain')!;
    expect(plain.hasAttribute(parentScopeId)).toBe(true);
    expect(plain.hasAttribute(parentOwnedMarker!)).toBe(false);

    const explicit = container.querySelector('#explicit')!;
    expect(explicit.hasAttribute(parentScopeId)).toBe(true);
    expect(explicit.hasAttribute(parentOwnedMarker!)).toBe(false);
    expect(explicit.classList.contains('explicit')).toBe(true);

    const coincident = container.querySelector('#coincident')!;
    expect(coincident.hasAttribute(parentScopeId)).toBe(true);
    expect(coincident.hasAttribute(parentOwnedMarker!)).toBe(false);
    expect(coincident.classList.contains('coincident')).toBe(true);

    const dynamic = container.querySelector('#dynamic')!;
    expect(dynamic.classList.contains('dynamic')).toBe(true);
    expect(dynamic.classList.contains('active')).toBe(true);

    dynamicClass.value = ['next', { active: false, ready: true }];
    await nextTick();
    expect(dynamic.classList.contains('dynamic')).toBe(false);
    expect(dynamic.classList.contains('active')).toBe(false);
    expect(dynamic.classList.contains('next')).toBe(true);
    expect(dynamic.classList.contains('ready')).toBe(true);

    const childOwnedMarker = marker(plain, '-owned');
    expect(childOwnedMarker).toBeTruthy();
    expect(childOwnedMarker).not.toBe(parentOwnedMarker);
    expect(container.querySelector('#child-content')?.hasAttribute(childOwnedMarker!)).toBe(true);
    expect(container.querySelector('#child-content')?.hasAttribute(parentOwnedMarker!)).toBe(false);
    expect(container.innerHTML).not.toContain('-class--');

    app.unmount();
  });

  it('rewrites only positive type subjects in scoped CSS', async () => {
    const options = createScopeBoundaryVueOptions();
    const compiled = await options.compiler!.compileStyleAsync({
      source: `
        button { --type: yes; }
        button.explicit { --type-class: yes; }
        .explicit { --class: yes; }
        #plain { --id: yes; }
        [role='button'] { --attribute: yes; }
      `,
      filename: 'BoundaryParent.vue',
      id: 'data-v-test',
      scoped: true,
    });

    expect(compiled.errors).toEqual([]);
    expect(compiled.code).toContain('button[data-v-test-owned]');
    expect(compiled.code).toContain('button.explicit[data-v-test-owned]');
    expect(compiled.code).toContain('.explicit[data-v-test]');
    expect(compiled.code).toContain('#plain[data-v-test]');
    expect(compiled.code).toContain("[role='button'][data-v-test]");
    expect(compiled.code).not.toContain('-class--');
  });

  it('keeps boundary markers stable through SSR and hydration', async () => {
    const Root = defineComponent({
      setup: () => () => h(BoundaryParent, { dynamicClass: ['dynamic', { active: true }] }),
    });
    const html = await renderToString(createSSRApp(Root));
    expect(html).toContain('-owned');
    expect(html).not.toContain('-class--');
    expect(html).toContain('class="coincident explicit"');
    expect(html).toContain('class="coincident dynamic active"');

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

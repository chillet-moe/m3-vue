---
title: Vue Scope Boundaries
---

# Vue Scope Boundaries

Vue intentionally copies a parent's scoped-style ID onto a child component's
root element. That makes parent styles useful for child layout, but it also lets
unrelated parent type, ID, attribute, or coincident class selectors match the
child root.

m3-vue uses `@chillet/vue-scope-boundary` at compile time. The integration gives
native elements an ownership marker and lets only a class explicitly passed to
a component act as a child-root styling capability. Vue's client and server
runtimes remain unmodified.

## What m3-vue already provides

The m3-vue Vite, test, and documentation build pipelines enable the boundary
compiler integration. Scoped styles authored in those pipelines receive the
ownership and class-capability transforms without adding a runtime dependency.

This does not turn the library's unscoped component CSS into isolated CSS. The
current component styles are primarily shipped as ordinary global CSS and keep
normal cascade and inheritance behavior. Use the documented CSS tokens and
`data-part` APIs to customize them.

A consuming application's SFCs are compiled separately. To prevent a scoped
style in your application from gaining unintended access to an m3-vue root, the
application must enable the same compiler integration.

## Vite setup

Install the plugin alongside the Vue plugin and compiler packages used by the
application:

```bash
pnpm add -D @chillet/vue-scope-boundary @vitejs/plugin-vue @vue/compiler-core @vue/compiler-sfc postcss
```

Use the preset instead of creating a second `@vitejs/plugin-vue` instance:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vueScopeBoundary from '@chillet/vue-scope-boundary/vite';

export default defineConfig({
  plugins: [vueScopeBoundary()],
});
```

Existing Vue plugin options belong under `vue`:

```ts
vueScopeBoundary({
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('x-'),
      },
    },
  },
});
```

When a framework owns the Vue plugin, compose its options rather than adding a
second plugin. VitePress supports this directly:

```ts
// .vitepress/config.ts
import { defineConfig } from 'vitepress';
import { createScopeBoundaryVueOptions } from '@chillet/vue-scope-boundary/vite';

export default defineConfig({
  vue: createScopeBoundaryVueOptions(),
});
```

The current plugin version targets Vue 3.5 and Vite 8. Nuxt integration is not
provided yet. A Nuxt consumer still receives m3-vue's precompiled internal
markers, but the consumer's own SFC styles retain normal Vue semantics until a
Nuxt integration is added.

## Result

Given a parent SFC:

```vue
<template>
  <Button class="action" />
</template>

<style scoped>
.action {
  margin-inline: 1rem;
}

button,
[disabled] {
  color: red;
}
</style>
```

The explicitly supplied `.action` rule can match the `Button` fallthrough root.
The `button` and `[disabled]` rules cannot match that root solely because Vue
copied the parent's scope ID. A class used only inside `Button` does not become
a parent styling capability.

For general customization, continue to prefer component props and documented
`--md-*` tokens. Use a parent-owned wrapper for layout when passing a class to
the component root is not appropriate.

## Supported boundary

This integration narrowly changes how a copied parent scope ID is interpreted;
it is not Shadow DOM or general subtree isolation. It does not block:

- global or unscoped selectors;
- normal inheritance such as `color`, `font-family`, and custom properties;
- explicit `:deep()` or `:global()` selectors;
- ordinary Light DOM styling outside scoped SFC compilation.

Additional compiler limitations:

- `class` hidden inside `v-bind="object"` is opaque; put `class` or `:class`
  directly on the component when it should be a capability;
- render functions and JSX do not receive ownership markers automatically;
- precompiled third-party SFCs keep the semantics they were built with;
- `inheritAttrs: false` components must forward `class` to preserve an explicit
  class capability;
- fragment roots cannot receive fallthrough classes;
- transition classes added at runtime are not external class capabilities.

Vue 3.5 also anchors selectors whose rightmost compound is pseudo-only on an
earlier subject. For example, `.container :hover`, `.container :is(...)`, and
`.container *` can retain Vue's existing descendant behavior. Prefer a concrete
rightmost type, class, or attribute, such as `.container button:hover`; expand a
terminal `:is()`/`:where()` selector list when necessary. Use `:deep()` when
cross-component traversal is intentional.

Ordinary `.btn span` remains safe under Vue scoped CSS: Vue scopes `span`, and a
child-internal `span` does not carry the parent's ownership marker.

The integration is provided by
[`@chillet/vue-scope-boundary`](https://www.npmjs.com/package/@chillet/vue-scope-boundary).
Its implementation, limitations, and validation fixtures are maintained in the
[`vue-scope-boundary` repository](https://github.com/chillet-moe/vue-scope-boundary).

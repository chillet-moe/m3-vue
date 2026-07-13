---
title: Vue Scope Boundaries
---

# Vue Scope Boundaries

Vue intentionally copies a parent component's scoped-style ID onto a child
component's root element. This lets a parent style that root for layout, but it
also means a selector such as `button` can accidentally depend on a child's
private root tag.

m3-vue uses `@chillet/vue-scope-boundary` at compile time. Version 0.2 gives
elements written directly in an SFC an ownership marker, then restricts scoped
selectors whose subject contains a positive HTML type selector to those owned
elements. Vue's client and server runtimes remain unmodified.

## Exact boundary

The boundary is deliberately narrow:

| Parent usage                             | Parent scoped selector | Can match the child root? |
| ---------------------------------------- | ---------------------- | ------------------------- |
| `<Child />` with a `<button>` root       | `button`               | No                        |
| `<Child class="primary" />`              | `button.primary`       | No                        |
| `<Child class="primary" />`              | `.primary`             | Yes                       |
| `<Child id="save" />`                    | `#save`                | Yes                       |
| `<Child role="button" />`                | `[role='button']`      | Yes                       |
| Child internally uses root class `.item` | `.item`                | Yes, if it collides       |

In other words, the plugin prevents unintentional dependencies on private HTML
tags. It does **not** isolate pure class, ID, attribute, universal, or
pseudo-only selectors. Passing a class to a component remains ordinary Vue
attribute fallthrough; the plugin neither grants nor removes that behavior.

For example:

```vue
<template>
  <button class="action">Owned button</button>
  <Button id="save" class="action" />
</template>

<style scoped>
button,
button.action {
  /* Matches only the <button> written in this SFC. */
  color: red;
}

.action,
#save {
  /* Keeps Vue's normal behavior and may match the Button root. */
  margin-inline: 1rem;
}
</style>
```

Ordinary Vue scoped CSS already prevents `.btn span` from reaching a `span`
inside a child component, because that internal element lacks the parent's
scope ID. Version 0.2 preserves this behavior and compiles the positive `span`
subject against the ownership marker as well. A pure-class subject such as
`.btn .label` receives no new boundary and can still match a child root with a
colliding `.label` class; it does not gain general access to deeper child DOM.

## What m3-vue provides

The m3-vue Vite, test, package-build, and documentation pipelines enable the
0.2 compiler integration. Scoped SFC styles compiled by those pipelines gain
the type-selector boundary without a runtime dependency.

Most m3-vue component styles are shipped as ordinary unscoped CSS. The plugin
does not turn those styles into isolated CSS and does not stop inheritance or
the normal cascade. Use documented props, `--md-*` tokens, and `data-part`
contracts to customize components.

A consuming application's SFCs are compiled separately. To apply the boundary
to selectors authored by the application, that application must enable the
same compiler integration.

## Vite setup

Install version 0.2 or newer alongside the Vue plugin and compiler packages
used by the application:

```bash
pnpm add -D @chillet/vue-scope-boundary@^0.2.0 @vitejs/plugin-vue @vue/compiler-core @vue/compiler-sfc postcss
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

When a framework owns the Vue plugin, compose its options instead of adding a
second plugin. VitePress supports this directly:

```ts
// .vitepress/config.ts
import { defineConfig } from 'vitepress';
import { createScopeBoundaryVueOptions } from '@chillet/vue-scope-boundary/vite';

export default defineConfig({
  vue: createScopeBoundaryVueOptions(),
});
```

The 0.2 line targets Vue 3.5 and Vite 8. Nuxt integration is not currently
provided. A Nuxt consumer receives m3-vue's precompiled markers, but its own
SFC styles retain normal Vue semantics until its build enables the transform.

## Authoring rules

- Use `button`, `.toolbar > button`, or `button.primary` only when the subject is
  an element written in the same SFC. The type is part of the ownership
  boundary, not a way to style a child component root.
- Use a meaningful class passed to a component and a pure class selector when
  intentionally styling its fallthrough root.
- Treat class naming as an application responsibility. Prefer component or
  feature prefixes, BEM, CSS Modules, or another collision-resistant scheme;
  the plugin does not protect short class names.
- Do not depend on m3-vue's private `.m3-*` classes or root tags. Prefer props,
  documented tokens, and a parent-owned wrapper for layout.
- Use an explicit `:deep([data-part='...'])` selector only when a documented
  `data-part` contract permits deep customization.

Semantic classes that improve an API or make a demo maintainable are still
useful, but they are not required by this plugin and are not an authorization
marker.

## Limitations

This integration is not Shadow DOM or general Light DOM isolation. It does not
block:

- pure class, ID, attribute, universal, or pseudo-only selectors;
- global or unscoped selectors;
- normal inheritance such as `color`, `font-family`, and custom properties;
- explicit `:deep()`, `:global()`, or `:slotted()` behavior;
- ordinary cascade outside scoped SFC compilation.

Selectors with no positive type subject, including negative type tests such as
`:not(button)`, do not gain an ownership boundary. Vue's existing treatment of
terminal universal and pseudo-only compounds is also preserved. Prefer a
concrete positive type when ownership is intended, and use `:deep()` when
cross-component traversal is intentional.

Render functions and JSX do not receive ownership markers automatically, and
precompiled third-party SFCs keep the semantics they were built with. Fragment
roots and `inheritAttrs: false` continue to follow Vue's normal fallthrough
rules.

The integration is maintained in the
[`vue-scope-boundary` repository](https://github.com/chillet-moe/vue-scope-boundary).

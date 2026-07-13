# Vue scoped CSS child-root boundary decision

## Status

m3-vue has migrated its integration and tests to the published 0.2 semantics of
`@chillet/vue-scope-boundary`. The dependency and lockfile resolve the npm
registry package at version 0.2.0.

The earlier `inheritParentScopeId: false` runtime/server-renderer patch remains
removed.

## Problem

Vue gives a child component root both the child's scope ID and its parent's
scope ID. Ordinary scoped descendant selectors do not generally enter the
child's private DOM, but the copied parent ID can make a parent selector match
the child root.

The current goal is intentionally limited to accidental dependencies on that
root's private HTML tag:

| Parent usage                               | Parent scoped selector | Desired child-root result |
| ------------------------------------------ | ---------------------- | ------------------------- |
| `<Child />`, root happens to be `<button>` | `button`               | no match                  |
| `<Child class="item" />`                   | `button.item`          | no match                  |
| `<Child class="item" />`                   | `.item`                | normal Vue match          |
| `<Child id="item" />`                      | `#item`                | normal Vue match          |
| `<Child role="button" />`                  | `[role='button']`      | normal Vue match          |
| Child root privately uses `.item`          | `.item`                | normal Vue collision      |

Pure class, ID, attribute, universal, and pseudo-only selectors are not part of
the isolation promise. Their collision risk belongs to naming conventions,
CSS Modules, or a stronger isolation mechanism such as Shadow DOM.

## Selected 0.2 implementation

The plugin composes two official compiler extension paths:

1. a Vue template `nodeTransform` adds an owned marker to native and recognized
   custom elements authored directly by the SFC;
2. a post-Vue selector transform replaces the normal scope attribute with that
   owned marker only when the selector subject contains a positive type
   selector.

Examples for scope ID `data-v-example`:

| Authored selector | Compiled selector                      |
| ----------------- | -------------------------------------- |
| `button`          | `button[data-v-example-owned]`         |
| `button.primary`  | `button.primary[data-v-example-owned]` |
| `.primary`        | `.primary[data-v-example]`             |
| `#save`           | `#save[data-v-example]`                |
| `[role='button']` | `[role='button'][data-v-example]`      |

Component `class` values remain ordinary Vue input. The only additional DOM
attribute is the owned marker on elements authored by the current SFC.

The Vite preset still creates one official Vue plugin instance. Frameworks
such as VitePress use `createScopeBoundaryVueOptions()` to compose with the Vue
plugin they already own. m3-vue applies the integration to its normal
Vite/Vitest path, library build path, and VitePress path.

## Why the 0.1 semantics were retired

The 0.1 design attempted broader selector isolation and made component class
values part of a compiler protocol. That expanded the transform well beyond the
root-tag leak that motivated the project.

Version 0.2 accepts ordinary Vue class behavior and confines the plugin to the
case it can express cleanly: positive type ownership. Existing semantic classes
may remain where they improve API clarity or maintenance, but they are not
plugin requirements and must not be documented as authorization tokens.

## Why the runtime patch remains rejected

The runtime patch prevented all parent scope ID inheritance for opted-out
components. It required exact Vue-version patches in runtime-core and
server-renderer, per-component or global policy, consumer patch installation,
and upgrade regeneration. It also removed Vue's intentional ability to style a
child root with a passed class.

The compiler integration leaves Vue runtime behavior intact. It changes only
positive type selectors, so class-based root layout remains possible without a
dual-scope or runtime protocol.

## m3-vue source audit

At migration time, the library source contained only the dedicated integration
fixture with scoped styles. The documentation contained 51 scoped style blocks;
37 rule blocks used a positive type selector. Production occurrences target
native elements authored by the same SFC, such as documentation table cells,
code blocks, headings, SVG paths, and captions. None intentionally relied on a
child component's private root tag.

Most shipped component CSS is external and unscoped, so 0.2 does not alter its
selector matching. Existing `docs-outline-link`, field-size, top-bar, and shape
preview classes remain useful semantic implementation details, independent of
the retired 0.1 model.

Component and demo authors must now follow these explicit rules:

- positive type selectors describe elements owned by the current scoped SFC;
- pure class, ID, and attribute selectors retain Vue behavior;
- short class collisions are prevented through naming conventions, BEM, CSS
  Modules, or equivalent project policy;
- a passed semantic class plus a pure class selector is the supported way to
  style a child root intentionally;
- documented `:deep()` and `data-part` contracts remain the mechanism for
  intentional access to component internals.

## Validation contract

The m3-vue integration fixture is compiled by the actual project config and
verifies both CSR and SSR/hydration. It must prove that:

- owned elements receive `data-v-*-owned`;
- a child root keeps the ordinary parent scope ID but not the parent's owned
  marker;
- `button` and `button.foo` compile against the owned marker;
- `.foo`, `#id`, and `[attr]` compile against the ordinary Vue scope ID;
- static and dynamic component classes remain unchanged;
- no `data-v-*-class--*` marker appears.

Type checking, the full test suite, production build, documentation build, and
built-artifact searches are required before completing the migration.

## Packaging note

After installing the CSS adapter required by `vp pack`, packaging previously
stopped before scope-boundary processing because the Vite Plus/tsdown pipeline
passed Vue external `<style src="./Component.css">` references to
`@vitejs/plugin-vue` without a resolvable absolute filename. The same failure
occurred with the repository's plain Vue plugin, while `vp build` succeeded, so
this remains an independent packaging integration issue rather than a boundary
regression.

## Release state

Version 0.2.0 is published. m3-vue uses the registry range `^0.2.0`; local
plugin development may temporarily use a `link:` dependency, but release and CI
validation use the registry package.

## References

- [Vue scoped CSS child component roots](https://vuejs.org/api/sfc-css-features.html#child-component-root-elements)
- [`@chillet/vue-scope-boundary` repository](https://github.com/chillet-moe/vue-scope-boundary)

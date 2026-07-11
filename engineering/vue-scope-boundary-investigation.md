# Vue scoped CSS child-root boundary decision

## Status

Implemented with `@chillet/vue-scope-boundary`. The earlier
`inheritParentScopeId: false` experiment and Vue runtime/server-renderer patches
have been removed.

## Problem

Vue gives a child component root both the child's scope ID and its parent's
scope ID. Consequently, unrelated parent scoped selectors can match that root.
Ordinary descendant selectors do not normally enter the child's internal DOM;
the original problem is specifically the extra styling capability granted to
the root.

The required behavior is:

| Parent usage                               | Parent scoped selector  | Child root |
| ------------------------------------------ | ----------------------- | ---------- |
| `<Child />`                                | `button`, `#id`, `[x]`  | no match   |
| `<Child class="item" />`                   | `.item`                 | match      |
| `<Child class="item" />`                   | `button`                | no match   |
| `<Child />`, child internally uses `.item` | `.item`                 | no match   |
| `<Child :class="dynamic" />`               | matching class selector | reactive   |

Passing a fallthrough class is treated as an explicit request to style the
component root. It must not restore every parent scoped selector.

## Selected implementation

The plugin composes two official compiler extension paths:

1. a Vue template `nodeTransform` adds an owned marker to native elements and
   synthetic capability classes for direct component `class`/`:class` values;
2. a post-Vue selector transform replaces the ordinary scope attribute with an
   owned branch and, for positive class subjects, an external-class capability
   branch.

Capability provenance travels in `class`, rather than a separate `data-*`
attribute, because Vue's no-props functional components only fall through
`class`, `style`, and listeners. Static and dynamic class sources are normalized
together, so functional roots, transparent roots, CSR, SSR, and hydration use
the same carrier.

The Vite preset creates one official Vue plugin instance. Frameworks such as
VitePress use `createScopeBoundaryVueOptions()` to compose with the Vue plugin
they already own. m3-vue applies the integration to its normal Vite/Vitest path,
library pack path, and VitePress path.

## Why the runtime patch was removed

The runtime patch prevented all parent scope ID inheritance for opted-out
components. It required exact Vue-version patches in both runtime-core and
server-renderer, per-component options, consumer patch installation, and
upgrade regeneration. It also removed the intentional case where a class
passed by the parent should style the child root.

The compiler integration leaves Vue's runtime behavior intact and changes only
what generated scoped CSS treats as ownership or an explicit class capability.

## Accepted scope

The plugin only fixes child-root matches enabled by Vue's copied parent scope
ID. It does not claim general scoped-CSS subtree isolation. Vue 3.5's existing
handling of pseudo-only rightmost compounds and universal descendants is
preserved because post-Vue output can be indistinguishable from intentional
`:deep()` output.

Other accepted limits include opaque `v-bind="object"` classes, render
functions/JSX, precompiled third-party SFCs, fragment fallthrough, runtime
transition classes, and normal Light DOM inheritance.

## Validation

The standalone plugin covers compiler output, PostCSS selectors, CSR, SSR,
hydration, functional and transparent roots, Vite builds, source maps, HMR, and
real-browser matching. m3-vue adds an integration fixture compiled through its
actual Vite Plus config and verifies ownership, copied parent scope IDs,
explicit/unpassed/dynamic class capabilities, SSR, and hydration. Production
and VitePress builds verify that the configured plugin compiles the complete
library and documentation codebases.

After installing the CSS adapter required by `vp pack`, packaging currently
stops before scope-boundary processing because the Vite Plus/tsdown pipeline
passes Vue external `<style src="./Component.css">` references to
`@vitejs/plugin-vue` without a resolvable absolute filename. The result is an
`ENOENT` for the relative CSS path. Replacing the boundary preset with this
repository's plain Vue plugin produces the same failure, while the normal
`vp build` path succeeds, so this is tracked as an independent packaging
integration issue rather than a scope-boundary regression.

## References

- [Vue scoped CSS child component roots](https://vuejs.org/api/sfc-css-features.html#child-component-root-elements)
- [`@chillet/vue-scope-boundary` repository](https://github.com/chillet-moe/vue-scope-boundary)

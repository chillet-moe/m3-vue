# Documentation

The public site documents how to use the library. Keep build internals, metadata implementation details, and contributor procedures in `engineering/`; link to them only when consumers need that information.

## Page ownership

- Component pages own basic use, examples, interaction and accessibility contracts, composition patterns, and component-specific migration notes. Document small subcomponents with their parent component.
- Guides own cross-component decisions: appearance and density, field layout, scrolling, and integration with multiple documents or localization. Prefer a section on an existing page over a new guide for a single pattern.
- Utilities, directives, and functions retain their own API reference pages.

## Component page order

Start with a short purpose statement and a usable demo. Follow with common examples and combinations, then interaction constraints and migration notes where relevant. Put Anatomy, API, and style-token tables in a final Reference section; keep subcomponent references adjacent to their own contract. Composable reference belongs after the component usage, not between examples.

Keep example source beside its component under `docs/demos/`. Share demo helpers when multiple pages exercise the same integration. Do not duplicate selection or keyboard implementations just to make a demo self-contained.

## Languages and links

English pages in `docs/` have matching Simplified Chinese pages in `docs/zh-Hans/`. The package-facing `docs/README.md` is the only exception. Follow the repository's translation workflow when changing prose. Update references and navigation in both languages when moving pages. Use explicit stable anchors for sections that replace standalone guides.

Run `pnpm run check` and `pnpm run docs:build` after structural changes. The documentation check verifies page pairs and authored local Markdown link targets; the VitePress build validates imports and rendered page links. Neither substitutes for opening affected pages to inspect layout, API controls, navigation, and examples.

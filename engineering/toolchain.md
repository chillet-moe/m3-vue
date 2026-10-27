# Toolchain

This repository uses pnpm for dependencies and scripts. Vite builds the library, Vitest runs unit tests, Oxfmt formats files, and Oxlint checks code. Their settings live in `vite.config.ts`, `.oxfmtrc.json`, and `.oxlintrc.json` respectively.

Run these commands from the repository root:

```sh
pnpm install
pnpm run build
pnpm run test
pnpm run typecheck
pnpm run fmt:check
pnpm run lint
pnpm run check
pnpm run docs:dev
pnpm run docs:check
pnpm run docs:build
pnpm run test:browser
```

`pnpm run check` combines formatting, lint, type checking, and documentation translation-pair/local-link checks. Use `pnpm exec vitest run <file>` for focused tests. Run `pnpm run check` before publishing or submitting changes.

The repository has no ordinary Vite application entry. Use `pnpm run docs:dev` for the documentation site. The browser fixtures and benchmarks have their own run instructions.

Documentation structure and page authoring conventions are described in [Documentation](documentation.md).

## Theme generation

`src/theme/tokens.json` owns default theme tokens and `src/theme/compact.json` owns compact typography values.
`src/theme/presets.ts` defines the presets shared by the internal build script and the documentation editor. Run `pnpm run themes:generate`
after editing theme data; `build` runs it automatically. Commit both generated files in `src/styles/themes/` so source
fixtures and the documentation dev server can load a selected theme immediately. Consumers load shared `style.css`
and one generated theme. Component density rules are documented in [Density](density.md).

## Floating surface visual checks

Run `pnpm exec tsx tests/browser/overlay-appearance/run.ts` to check real menus, nested menus, Select/Combobox dropdowns, Popover, Dialog, and a consumer-owned native dialog in light/dark schemes on two backgrounds. The test covers hover, selection, keyboard navigation, scrolling, viewport-edge placement, shared tokens, and component border overrides. Screenshots and side-by-side comparisons are written to `.tmp/overlay-appearance/`.

Browser runners use `openFixture(page, url)` from `tests/browser/fonts.ts`. It loads the pinned development dependency
`material-symbols` locally and awaits the actual font face before geometry assertions or screenshots. A missing or
failed font is a test failure; browser tests do not depend on Google Fonts, another checkout, or font-path environment
variables. After a reload or when testing an independently created iframe/Document, call `loadTestFonts(pageOrFrame)`.
Use this helper for new browser fixtures as well. `CHROME_PATH` selects a local Chrome binary.

Run `pnpm exec tsx tests/browser/density/run.ts` for the density scale, component lower bounds, inherited and reset
subtrees, unchanged typography, multiline growth, selection/dialog boundaries, and explicit dimension overrides.
Screenshots are written to `.tmp/density/`.

Run `pnpm run docs:dev --host 127.0.0.1`, then `pnpm exec tsx tests/browser/docs-customization/run.ts` to verify the
documentation customization Popover, nested selectors, live theme/type/shape/default changes,
persistence, reset and mobile scroll boundaries. Set `DOCS_URL` when the dev server is not on port 5173.
Screenshots are written to `.tmp/docs-customization/`.

With the documentation server running, use `pnpm exec tsx tests/browser/field-layout/run.ts` to verify inherited
field gap tokens, independent row/column overrides, density and label-clearance separation, and the responsive preview.
It accepts `DOCS_URL` and writes screenshots to `.tmp/field-layout/`.

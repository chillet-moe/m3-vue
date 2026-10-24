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

## Floating surface visual checks

Run `pnpm exec tsx tests/browser/overlay-appearance/run.ts` to check real menus, nested menus, Select/Combobox dropdowns, Popover, Dialog, and a consumer-owned native dialog in light/dark schemes on two backgrounds. The test covers hover, selection, keyboard navigation, scrolling, viewport-edge placement, shared tokens, and component border overrides. Screenshots and side-by-side comparisons are written to `.tmp/overlay-appearance/`.

For screenshots with Material Symbols, set `OVERLAY_ICON_FONT_PATH` to a local Material Symbols Outlined TTF file. Without it, geometry and interaction assertions still run, but icon ligatures may appear as text. `CHROME_PATH` selects a local Chrome binary.

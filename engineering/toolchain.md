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
pnpm run docs:build
pnpm run test:browser
```

`pnpm run check` combines formatting, lint, and type checking. Use `pnpm exec vitest run <file>` for focused tests. Run `pnpm run check` before publishing or submitting changes.

The repository has no ordinary Vite application entry. Use `pnpm run docs:dev` for the documentation site. The browser fixtures and benchmarks have their own run instructions.

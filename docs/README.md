# Bundled Docs

This package publishes a curated subset of the `docs/` directory for local inspection by editors, agents, and other tooling.

## Start Here

- `docs/getting-started.md` covers installation, plugin registration, and auto import setup.
- `docs/components/*.md` documents components.
- `docs/directives/*.md` documents directives.
- `docs/functions/*.md` documents programmatic APIs.
- `docs/guides/*.md` and `docs/utilities/*.md` cover customization and shared primitives.
- `docs/demos/**/*.vue` contains the example source used by many component pages.

## Notes

- Many markdown pages include VitePress-only components such as `<ApiTable />`, `<SourceApiTable />`, `<AnatomyTable />`, and `<DemoContainer />`.
- When a page references demo source via `...Src` imports, read the matching file under `docs/demos/` for the concrete example implementation.
- API tables rendered by VitePress are supplementary. Public runtime and type definitions in `dist/` remain the source of truth for shipped code.

# Delegated Tooltip benchmark

This benchmark compares a bounded `useDelegatedTooltip` slot pool with one existing `v-tooltip` target per list
item. It measures mount, keyed-list recycling, unmount, listener registrations, Tooltip DOM, anchors, and active
trigger counts.

Start the repository dev server:

```sh
pnpm exec vite --port 4173
```

Open the fixture directly:

```text
http://127.0.0.1:4173/benchmarks/delegated-tooltip/?count=1000&recycleRounds=3
```

For a five-run browser sample:

```sh
pnpm exec tsx benchmarks/delegated-tooltip/run.ts
```

The delegated mode intentionally keeps three Tooltip elements for the slot pool. The per-instance mode creates one
existing target and one full directive setup for every item. Compare unopened DOM and listener counts before using
timings; those counts are the deterministic signal for this optimization.

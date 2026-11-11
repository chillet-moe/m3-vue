# Action title tooltip benchmark

This benchmark mounts a mixed list of `Button`, `IconButton`, and `FloatingActionButton` instances with `title`,
updates every title, recycles the full list five times, and then unmounts it. It reports elapsed time, listener
registrations, tooltip/anchor DOM counts, and Chromium heap measurements when available.

Run it with the repository toolchain:

```sh
pnpm exec vite --port 4173
```

Open `http://127.0.0.1:4173/benchmarks/action-title-tooltip/?count=2000&recycleRounds=5&memoryBatches=3`. All three
parameters are configurable. The timed recycle metric covers one batch; the additional batches produce heap
stability samples without changing the reported timing or listener count. For explicit garbage collection and heap
values, launch Chromium with `--js-flags=--expose-gc`; timing and DOM/listener counts work without that flag.

For a five-run median with explicit garbage collection, keep the dev server running and execute:

```sh
pnpm exec tsx benchmarks/action-title-tooltip/run.ts
```

The runner uses `/usr/bin/google-chrome-stable` by default. Set `CHROME_PATH` when Chrome is installed elsewhere;
pass a URL and iteration count as the first and second arguments to override the defaults.

`memory.html` isolates the shared runtime from Vue's development-mode component bookkeeping. It repeatedly registers
2,000 titled triggers, verifies that the first trigger opens the shared tooltip with its expected text, unregisters
and removes every trigger, forces garbage collection, and records the heap after each of ten batches:

```sh
pnpm exec tsx benchmarks/action-title-tooltip/run.ts \
  'http://127.0.0.1:4173/benchmarks/action-title-tooltip/memory.html?count=2000&batches=10' 1
```

The published-package lifecycle benchmark compares 1, 240 and 1,200 Buttons, with and without titles.
It warms each page, records Chromium traces of mounting, changing the button content and unmounting, and
reports the JavaScript heap, DOM nodes and listeners after garbage collection. Compare `mounted.usedSize -
before.usedSize` in the two revisions' `summary.json` files for the heap cost of keeping the Buttons mounted.
Use the same lifecycle fixture on both revisions; copy the `lifecycle` directory into older checkouts.

```sh
pnpm run build
CHROME_PATH=/usr/bin/google-chrome pnpm exec tsx benchmarks/action-title-tooltip/lifecycle/run.ts titled
CHROME_PATH=/usr/bin/google-chrome pnpm exec tsx benchmarks/action-title-tooltip/lifecycle/run.ts untitled
```

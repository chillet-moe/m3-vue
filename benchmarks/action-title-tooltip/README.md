# Action title tooltip benchmark

This benchmark mounts a mixed list of `Button`, `IconButton`, and `FloatingActionButton` instances with `title`,
updates every title, recycles the full list five times, and then unmounts it. It reports elapsed time, listener
registrations, tooltip/anchor DOM counts, and Chromium heap measurements when available.

Run it with the repository toolchain:

```sh
vp dev --port 4173
```

Open `http://127.0.0.1:4173/benchmarks/action-title-tooltip/?count=2000&recycleRounds=5&memoryBatches=3`. All three
parameters are configurable. The timed recycle metric covers one batch; the additional batches produce heap
stability samples without changing the reported timing or listener count. For explicit garbage collection and heap
values, launch Chromium with `--js-flags=--expose-gc`; timing and DOM/listener counts work without that flag.

For a five-run median with explicit garbage collection, keep the dev server running and execute:

```sh
vp exec tsx benchmarks/action-title-tooltip/run.ts
```

The runner uses `/usr/bin/google-chrome-stable` by default. Set `CHROME_PATH` when Chrome is installed elsewhere;
pass a URL and iteration count as the first and second arguments to override the defaults.

`memory.html` isolates the shared runtime from Vue's development-mode component bookkeeping. It repeatedly registers
2,000 triggers, opens one shared tooltip per batch, unregisters and removes every trigger, forces garbage collection,
and records the heap after each of ten batches:

```sh
vp exec tsx benchmarks/action-title-tooltip/run.ts \
  'http://127.0.0.1:4173/benchmarks/action-title-tooltip/memory.html?count=2000&batches=10' 1
```

type BatchedUpdate = {
  prepare: () => void;
  measure: () => (() => void) | undefined;
};

type ViewportUpdate = (() => void) | BatchedUpdate;

type ViewportRuntime = {
  updates: Set<ViewportUpdate>;
  destroy: () => void;
};

const runtimes = new WeakMap<Document, ViewportRuntime>();

function createRuntime(document: Document): ViewportRuntime | undefined {
  const view = document.defaultView;
  if (!view) {
    return undefined;
  }

  const updates = new Set<ViewportUpdate>();
  let frame: number | null = null;

  const flush = () => {
    frame = null;
    if (updates.size === 1) {
      const update = updates.values().next().value!;
      if (typeof update === 'function') {
        update();
      } else {
        update.prepare();
        update.measure()?.();
      }
      return;
    }

    const batch: BatchedUpdate[] = [];
    const flushBatch = () => {
      for (const update of batch) update.prepare();
      const writes = batch.map((update) => update.measure());
      for (const write of writes) write?.();
      batch.length = 0;
    };

    for (const update of Array.from(updates)) {
      if (typeof update === 'function') {
        if (batch.length) flushBatch();
        update();
      } else {
        batch.push(update);
      }
    }
    if (batch.length) flushBatch();
  };

  const schedule = () => {
    if (frame !== null) {
      return;
    }

    frame = view.requestAnimationFrame(flush);
  };

  const destroy = () => {
    if (frame !== null) {
      view.cancelAnimationFrame(frame);
      frame = null;
    }

    view.removeEventListener('scroll', schedule, true);
    view.removeEventListener('resize', schedule);
    updates.clear();
  };

  view.addEventListener('scroll', schedule, { capture: true, passive: true });
  view.addEventListener('resize', schedule);

  return { updates, destroy };
}

export function registerSharedViewportChange(document: Document, update: ViewportUpdate) {
  let runtime = runtimes.get(document);
  if (!runtime) {
    runtime = createRuntime(document);
    if (!runtime) {
      return () => {};
    }
    runtimes.set(document, runtime);
  }

  runtime.updates.add(update);
  let registered = true;

  return () => {
    if (!registered) {
      return;
    }

    registered = false;
    runtime!.updates.delete(update);
    if (runtime!.updates.size === 0) {
      runtime!.destroy();
      if (runtimes.get(document) === runtime) {
        runtimes.delete(document);
      }
    }
  };
}

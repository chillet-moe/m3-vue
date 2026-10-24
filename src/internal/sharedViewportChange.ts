type ViewportCallback = () => void;

type ViewportRuntime = {
  callbacks: Set<ViewportCallback>;
  destroy: () => void;
};

const runtimes = new WeakMap<Document, ViewportRuntime>();

function createRuntime(document: Document): ViewportRuntime | undefined {
  const view = document.defaultView;
  if (!view) {
    return undefined;
  }

  const callbacks = new Set<ViewportCallback>();
  let frame: number | null = null;

  const flush = () => {
    frame = null;
    for (const callback of Array.from(callbacks)) {
      callback();
    }
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
    callbacks.clear();
  };

  view.addEventListener('scroll', schedule, { capture: true, passive: true });
  view.addEventListener('resize', schedule);

  return { callbacks, destroy };
}

export function registerSharedViewportChange(document: Document, callback: ViewportCallback) {
  let runtime = runtimes.get(document);
  if (!runtime) {
    runtime = createRuntime(document);
    if (!runtime) {
      return () => {};
    }
    runtimes.set(document, runtime);
  }

  runtime.callbacks.add(callback);
  let registered = true;

  return () => {
    if (!registered) {
      return;
    }

    registered = false;
    runtime!.callbacks.delete(callback);
    if (runtime!.callbacks.size === 0) {
      runtime!.destroy();
      if (runtimes.get(document) === runtime) {
        runtimes.delete(document);
      }
    }
  };
}

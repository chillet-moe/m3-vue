export type SharedAnimationFrameController = {
  start: () => void;
  stop: () => void;
  cleanup: () => void;
};

type Entry = {
  callback: (elapsed: number) => void;
  startTime: number | undefined;
};

type Runtime = {
  register: (callback: Entry['callback']) => SharedAnimationFrameController;
};

const runtimes = new WeakMap<Document, Runtime>();

function createRuntime(document: Document, onEmpty: () => void): Runtime {
  const view = document.defaultView;
  const entries = new Set<Entry>();
  const activeEntries = new Set<Entry>();
  let animationFrame = 0;

  const stopFrame = () => {
    if (!animationFrame || !view) return;
    view.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const scheduleFrame = () => {
    if (!view || animationFrame || activeEntries.size === 0) return;
    animationFrame = view.requestAnimationFrame(runFrame);
  };

  function runFrame(timestamp: number) {
    animationFrame = 0;
    for (const entry of activeEntries) {
      entry.startTime ??= timestamp;
      entry.callback(timestamp - entry.startTime);
    }
    scheduleFrame();
  }

  return {
    register(callback) {
      const entry: Entry = { callback, startTime: undefined };
      entries.add(entry);
      let cleaned = false;

      const stop = () => {
        if (!activeEntries.delete(entry)) return;
        entry.startTime = undefined;
        if (activeEntries.size === 0) stopFrame();
      };

      return {
        start() {
          if (cleaned || activeEntries.has(entry)) return;
          entry.startTime = undefined;
          activeEntries.add(entry);
          scheduleFrame();
        },
        stop,
        cleanup() {
          if (cleaned) return;
          cleaned = true;
          stop();
          entries.delete(entry);
          if (entries.size === 0) onEmpty();
        },
      };
    },
  };
}

export function registerSharedAnimationFrame(document: Document, callback: (elapsed: number) => void) {
  let runtime = runtimes.get(document);
  if (!runtime) {
    runtime = createRuntime(document, () => runtimes.delete(document));
    runtimes.set(document, runtime);
  }
  return runtime.register(callback);
}

export type SharedAnimationFrameController = {
  start: () => void;
  stop: () => void;
  cleanup: () => void;
};

type LayoutObservation = { element: Element; measure: () => void };
type FrameCallback = (elapsed: number, hasPeers: boolean) => void;
type Entry = {
  callback: FrameCallback;
  startTime: number | undefined;
  hasBox: boolean;
};

type Runtime = {
  register: (
    element: SVGSVGElement,
    callback: FrameCallback,
    layout?: LayoutObservation,
  ) => SharedAnimationFrameController;
};

const runtimes = new WeakMap<Document, Runtime>();

function createRuntime(document: Document, onEmpty: () => void): Runtime {
  const view = document.defaultView;
  const observed = new Map<Element, Entry>();
  const scheduled = new Set<Entry>();
  let layoutUpdates: Map<Element, () => void> | undefined;
  let registrations = 0;
  let animationFrame: number | undefined;
  let observer: ResizeObserver | undefined;

  const syncFrame = () => {
    if (!view) return;
    if (scheduled.size === 0) {
      if (animationFrame !== undefined) view.cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
    } else {
      animationFrame ??= view.requestAnimationFrame(runFrame);
    }
  };

  function runFrame(timestamp: number) {
    animationFrame = undefined;
    const hasPeers = scheduled.size > 1;
    for (const entry of scheduled) {
      // Start the clock even if the SVG has already become hidden.
      entry.startTime ??= timestamp;
      if (entry.hasBox) entry.callback(timestamp - entry.startTime, hasPeers);
      else scheduled.delete(entry);
    }
    syncFrame();
  }

  const onResize: ResizeObserverCallback = (changes) => {
    const revealed: Entry[] = [];
    for (const { target, contentRect } of changes) {
      const entry = observed.get(target);
      if (!entry) continue;

      // A zero-sized SVG can still have a layout box and visible overflow.
      const hasBox = contentRect.width > 0 || contentRect.height > 0 || target.getClientRects().length > 0;
      if (entry.hasBox === hasBox) continue;

      entry.hasBox = hasBox;
      if (hasBox) {
        scheduled.add(entry);
        revealed.push(entry);
      } else if (entry.startTime !== undefined) {
        scheduled.delete(entry);
      }
    }

    // Resize delivery follows animation frames in the same render cycle.
    // Catch up before paint using the same clock as requestAnimationFrame.
    const timestamp = document.timeline.currentTime;
    if (typeof timestamp === 'number') {
      const hasPeers = revealed.length > 1;
      for (const entry of revealed) {
        if (entry.startTime !== undefined) entry.callback(timestamp - entry.startTime, hasPeers);
      }
    }
    syncFrame();

    // Preserve the visibility catch-up before publishing the new layout snapshots.
    if (layoutUpdates) {
      for (const { target } of changes) layoutUpdates.get(target)?.();
    }
  };

  const observe = (element: Element) => {
    if (!view?.ResizeObserver) return;
    observer ??= new view.ResizeObserver(onResize);
    observer.observe(element);
  };

  return {
    register(element, callback, layout) {
      if (layout && view?.ResizeObserver) {
        (layoutUpdates ??= new Map()).set(layout.element, layout.measure);
        observe(layout.element);
      }
      const entry: Entry = { callback, startTime: undefined, hasBox: true };
      registrations++;
      let active = false;
      let cleaned = false;

      const stop = () => {
        if (!active) return;
        active = false;
        observer?.unobserve(element);
        observed.delete(element);
        scheduled.delete(entry);
        entry.startTime = undefined;
        entry.hasBox = true;
        syncFrame();
      };

      return {
        start() {
          if (cleaned || active) return;
          active = true;
          if (view?.ResizeObserver && document.timeline) {
            observed.set(element, entry);
            observe(element);
          }
          scheduled.add(entry);
          syncFrame();
        },
        stop,
        cleanup() {
          if (cleaned) return;
          cleaned = true;
          stop();
          if (layout && layoutUpdates?.delete(layout.element)) {
            observer?.unobserve(layout.element);
            if (!layoutUpdates.size) layoutUpdates = undefined;
          }
          if (--registrations === 0) {
            observer?.disconnect();
            onEmpty();
          }
        },
      };
    },
  };
}

export function registerSharedAnimationFrame(
  element: SVGSVGElement,
  callback: FrameCallback,
  layout?: LayoutObservation,
) {
  const document = element.ownerDocument;
  let runtime = runtimes.get(document);
  if (!runtime) {
    runtime = createRuntime(document, () => runtimes.delete(document));
    runtimes.set(document, runtime);
  }
  return runtime.register(element, callback, layout);
}

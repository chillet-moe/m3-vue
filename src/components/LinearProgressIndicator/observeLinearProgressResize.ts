type ResizeRuntime = {
  observer: ResizeObserver;
  updates: Map<Element, () => void>;
  hasPeers: () => boolean;
};

const runtimes = new WeakMap<Document, ResizeRuntime>();

export function observeLinearProgressResize(element: HTMLElement, update: () => void) {
  const document = element.ownerDocument;
  const ResizeObserver = document.defaultView?.ResizeObserver;
  if (!ResizeObserver) return;

  let runtime = runtimes.get(document);
  if (!runtime) {
    const updates = new Map<Element, () => void>();
    const observer = new ResizeObserver((entries) => {
      // Measure every resized indicator before Vue patches any of their SVGs.
      for (const { target } of entries) updates.get(target)?.();
    });
    runtime = { observer, updates, hasPeers: () => updates.size > 1 };
    runtimes.set(document, runtime);
  }

  const { observer, updates } = runtime;
  updates.set(element, update);
  observer.observe(element);

  return {
    hasPeers: runtime.hasPeers,
    stop() {
      updates.delete(element);
      if (updates.size) {
        observer.unobserve(element);
      } else {
        observer.disconnect();
        runtimes.delete(document);
      }
    },
  };
}

import { isNode } from '@/internal/elementEnvironment';
type OutsidePointerDownEntry = {
  contains: (target: Node) => boolean;
  onOutside: () => void;
};

type Runtime = {
  register: (entry: OutsidePointerDownEntry) => () => void;
};

const runtimes = new WeakMap<Document, Runtime>();

function createRuntime(document: Document, onEmpty: () => void): Runtime {
  const entries = new Set<OutsidePointerDownEntry>();

  const onPointerDown = (event: PointerEvent) => {
    const target = event.target;
    if (!isNode(target)) return;

    for (const entry of entries) {
      if (!entry.contains(target)) entry.onOutside();
    }
  };

  return {
    register(entry) {
      if (entries.size === 0) document.addEventListener('pointerdown', onPointerDown, true);
      entries.add(entry);
      let registered = true;

      return () => {
        if (!registered) return;
        registered = false;
        entries.delete(entry);
        if (entries.size !== 0) return;

        document.removeEventListener('pointerdown', onPointerDown, true);
        onEmpty();
      };
    },
  };
}

export function registerOutsidePointerDown(document: Document, entry: OutsidePointerDownEntry) {
  let runtime = runtimes.get(document);
  if (!runtime) {
    runtime = createRuntime(document, () => runtimes.delete(document));
    runtimes.set(document, runtime);
  }
  return runtime.register(entry);
}

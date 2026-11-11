import { watch, type Ref } from 'vue';

type Binding = { element: Element; next?: Binding; order: number; refresh: () => void; dispose: () => void };
const adoptionCallback = Symbol.for('@chillet/m3-vue/adoptionCallback');
const detachedRefreshes = Symbol();
type DetachedRefresh = () => void;
type AdoptionSentinel = HTMLElement & {
  [adoptionCallback]?: (this: AdoptionSentinel) => void;
  [detachedRefreshes]?: DetachedRefresh | DetachedRefresh[];
};
const adoptionTag = 'm3-document-adoption-sentinel';

// The registry retains the class, so define it outside any individual binding's scope.
function defineAdoptionSentinel(view: Window & typeof globalThis) {
  if (view.customElements.get(adoptionTag)) return;

  view.customElements.define(
    adoptionTag,
    class extends view.HTMLElement {
      adoptedCallback() {
        (this as AdoptionSentinel)[adoptionCallback]?.();
      }
      connectedCallback() {
        (this as AdoptionSentinel)[adoptionCallback]?.();
      }
    },
  );
}

function queueDetachedRefresh(this: AdoptionSentinel) {
  const callbacks = this[detachedRefreshes];
  if (typeof callbacks === 'function') queueMicrotask(callbacks);
  else if (callbacks) {
    for (const callback of callbacks) queueMicrotask(callback);
  }
}

// A detached subtree can be adopted in a later task, when its old Document's
// observer can no longer see it. A temporary native adoption callback bridges
// that gap; it is removed before the next rendering opportunity.
function watchDetachedAdoption(element: Element, refresh: DetachedRefresh) {
  const document = element.ownerDocument;
  const view = document.defaultView;
  if (!view?.customElements) return () => {};

  // A later binding must follow any intervening descendants' adoption callbacks.
  const previous = element.lastChild as AdoptionSentinel | null;
  const callbacks = previous?.[detachedRefreshes];
  let sentinel: AdoptionSentinel;

  if (previous && callbacks) {
    sentinel = previous;
    if (typeof callbacks === 'function') sentinel[detachedRefreshes] = [callbacks, refresh];
    else callbacks.push(refresh);
  } else {
    defineAdoptionSentinel(view);
    sentinel = document.createElement(adoptionTag) as AdoptionSentinel;
    sentinel.hidden = true;
    sentinel[detachedRefreshes] = refresh;
    sentinel[adoptionCallback] = queueDetachedRefresh;
    element.append(sentinel);
  }

  return () => {
    const current = sentinel[detachedRefreshes];
    if (Array.isArray(current)) {
      const index = current.indexOf(refresh);
      if (index < 0) return;
      current.splice(index, 1);
      if (current.length) return;
    }
    delete sentinel[detachedRefreshes];
    delete sentinel[adoptionCallback];
    sentinel.remove();
  };
}
type Runtime = {
  add: (binding: Binding) => void;
  remove: (binding: Binding) => void;
  trackRoot: (binding: Binding) => void;
  disposeIfEmpty: () => void;
};
const runtimes = new WeakMap<Document, Runtime>();

function runtimeFor(document: Document): Runtime {
  const existing = runtimes.get(document);
  if (existing) return existing;
  const bindings = new Map<Element, Binding>();
  const outsideDocument = new Set<Binding>();
  let outsideInOrder: Binding[] | undefined;
  let nextOrder = 0;

  const inRegistrationOrder = (entries: Iterable<Binding>) => Array.from(entries).sort((a, b) => a.order - b.order);
  const allBindings = () => {
    const entries: Binding[] = [];
    for (const first of bindings.values()) {
      for (let binding: Binding | undefined = first; binding; binding = binding.next) entries.push(binding);
    }
    return entries.sort((a, b) => a.order - b.order);
  };
  const trackRoot = (binding: Binding) => {
    if (binding.element.getRootNode() === document) {
      if (outsideDocument.delete(binding)) outsideInOrder = undefined;
    } else if (!outsideDocument.has(binding)) {
      outsideDocument.add(binding);
      outsideInOrder = undefined;
    }
  };

  const addCandidates = (first: Binding | undefined, candidates: Set<Binding> | undefined) => {
    for (let binding = first; binding; binding = binding.next) {
      candidates ??= new Set();
      candidates.add(binding);
    }
    return candidates;
  };
  const refreshCandidates = (candidates: Set<Binding> | undefined) => {
    if (!candidates) return;
    for (const binding of inRegistrationOrder(candidates)) binding.refresh();
  };
  const refreshMovedBindings = () => {
    let candidates = outsideDocument.size ? new Set(outsideDocument) : undefined;
    for (const [element, first] of bindings) {
      if (element.getRootNode() !== document) candidates = addCandidates(first, candidates);
    }
    refreshCandidates(candidates);
  };

  const observer = new MutationObserver((records) => {
    let candidates: Set<Binding> | undefined;
    let remaining = bindings.size;
    let sawRemoval = false;

    for (const record of records) {
      if (record.removedNodes.length === 0) continue;
      sawRemoval = true;
      for (const node of record.removedNodes) {
        if (node.nodeType !== 1 || node.getRootNode() === document) continue;

        const root = node as Element;
        const children = root.childElementCount;
        if (children >= remaining) {
          refreshMovedBindings();
          return;
        }
        const walker = children ? document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT) : undefined;
        let element: Element | null = root;
        while (element) {
          // Bound discovery by the registry size, without first materializing all descendants.
          if (remaining === 0) {
            refreshMovedBindings();
            return;
          }
          remaining--;
          candidates = addCandidates(bindings.get(element), candidates);
          element = (walker?.nextNode() as Element | null) ?? null;
        }
      }
    }
    // The document observer cannot walk into shadow trees or previously detached trees.
    if (candidates) {
      if (outsideDocument.size) {
        for (const binding of outsideDocument) candidates.add(binding);
      }
      refreshCandidates(candidates);
    } else if (sawRemoval && outsideDocument.size) {
      const ordered = (outsideInOrder ??= inRegistrationOrder(outsideDocument));
      for (const binding of ordered) binding.refresh();
    }
  });
  observer.observe(document, { childList: true, subtree: true });
  const onPageHide = (event: PageTransitionEvent) => {
    if (event.persisted) return;
    for (const binding of allBindings()) {
      // A layout may adopt a panel and close its old window in the same task,
      // before MutationObserver delivery. Preserve resources of the moved UI.
      if (binding.element.ownerDocument !== document) binding.refresh();
      else binding.dispose();
    }
  };
  document.defaultView?.addEventListener('pagehide', onPageHide);
  const runtime: Runtime = {
    add(binding) {
      binding.next = bindings.get(binding.element);
      bindings.set(binding.element, binding);
      binding.order = nextOrder++;
      trackRoot(binding);
    },
    remove(binding) {
      if (outsideDocument.delete(binding)) outsideInOrder = undefined;
      const first = bindings.get(binding.element)!;
      if (first === binding) {
        if (binding.next) bindings.set(binding.element, binding.next);
        else bindings.delete(binding.element);
      } else {
        let previous = first;
        while (previous.next !== binding) previous = previous.next!;
        previous.next = binding.next;
      }
      binding.next = undefined;
      runtime.disposeIfEmpty();
    },
    trackRoot,
    disposeIfEmpty() {
      if (bindings.size) return;
      observer.disconnect();
      document.defaultView?.removeEventListener('pagehide', onPageHide);
      runtimes.delete(document);
    },
  };
  runtimes.set(document, runtime);
  return runtime;
}

/** Bind a DOM resource to an element's document, including adoption without a Vue update. */
export function bindElementEnvironment(element: Element, setup: (document: Document) => void | (() => void)) {
  let document = element.ownerDocument;
  let runtime = runtimeFor(document);
  let cleanup: void | (() => void);
  try {
    cleanup = setup(document);
  } catch (error) {
    runtime.disposeIfEmpty();
    throw error;
  }
  let disposed = false;
  let stopDetachedWatch: (() => void) | undefined;
  const detach = () => {
    cleanup?.();
    runtime.remove(binding);
  };
  const binding: Binding = {
    element,
    next: undefined,
    order: 0,
    refresh() {
      if (disposed) return;
      if (element.ownerDocument === document) {
        runtime.trackRoot(binding);
        if (!element.isConnected) stopDetachedWatch ??= watchDetachedAdoption(element, binding.refresh);
        else {
          stopDetachedWatch?.();
          stopDetachedWatch = undefined;
        }
        return;
      }
      stopDetachedWatch?.();
      stopDetachedWatch = undefined;
      detach();
      document = element.ownerDocument;
      runtime = runtimeFor(document);
      runtime.add(binding);
      cleanup = setup(document);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      stopDetachedWatch?.();
      detach();
    },
  };
  runtime.add(binding);
  if (!element.isConnected) binding.refresh();
  return binding.dispose;
}

export function useElementEnvironment<T extends Element>(
  element: Readonly<Ref<T | null | undefined>>,
  setup: (document: Document, element: T) => void | (() => void),
) {
  watch(
    element,
    (value, _, onCleanup) => {
      if (value) onCleanup(bindElementEnvironment(value, (document) => setup(document, value)));
    },
    { immediate: true, flush: 'post' },
  );
}

// DOM nodes retain their original prototype when adopted into another realm.
// Structural checks work both for adoption and for nodes created by that realm.
export const isNode = (value: unknown): value is Node =>
  !!value && typeof value === 'object' && typeof (value as Node).nodeType === 'number';
export const isElement = (value: unknown): value is Element => isNode(value) && value.nodeType === 1;
export const isHTMLElement = (value: unknown): value is HTMLElement =>
  isElement(value) && value.namespaceURI === 'http://www.w3.org/1999/xhtml';

export function isHTMLTag<K extends keyof HTMLElementTagNameMap>(
  value: unknown,
  tag: K,
): value is HTMLElementTagNameMap[K] {
  return isHTMLElement(value) && value.localName === tag;
}

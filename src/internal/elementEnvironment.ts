import { watch, type Ref } from 'vue';

type Binding = { element: Element; refresh: () => void; dispose: () => void };
const adoptionCallback = Symbol.for('@chillet/m3-vue/adoptionCallback');
type AdoptionSentinel = HTMLElement & { [adoptionCallback]?: () => void };
const adoptionTag = 'm3-document-adoption-sentinel';

// A detached subtree can be adopted in a later task, when its old Document's
// observer can no longer see it. A temporary native adoption callback bridges
// that gap; it is removed before the next rendering opportunity.
function watchDetachedAdoption(element: Element, refresh: () => void) {
  const document = element.ownerDocument;
  const view = document.defaultView;
  if (!view?.customElements) return () => {};
  if (!view.customElements.get(adoptionTag)) {
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
  const sentinel = document.createElement(adoptionTag) as AdoptionSentinel;
  sentinel.hidden = true;
  sentinel[adoptionCallback] = () => queueMicrotask(refresh);
  element.append(sentinel);
  return () => {
    delete sentinel[adoptionCallback];
    sentinel.remove();
  };
}
type Runtime = { bindings: Set<Binding>; destroy: () => void };
const runtimes = new WeakMap<Document, Runtime>();

function runtimeFor(document: Document): Runtime {
  const existing = runtimes.get(document);
  if (existing) return existing;
  const bindings = new Set<Binding>();
  const observer = new MutationObserver((records) => {
    // Adoption removes the subtree from its old document. One observer per
    // document handles all registered resources, only after structural removal.
    if (!records.some((record) => record.removedNodes.length)) return;
    for (const binding of Array.from(bindings)) binding.refresh();
  });
  observer.observe(document, { childList: true, subtree: true });
  const onPageHide = (event: PageTransitionEvent) => {
    if (event.persisted) return;
    for (const binding of Array.from(bindings)) {
      // A layout may adopt a panel and close its old window in the same task,
      // before MutationObserver delivery. Preserve resources of the moved UI.
      if (binding.element.ownerDocument !== document) binding.refresh();
      else binding.dispose();
    }
  };
  document.defaultView?.addEventListener('pagehide', onPageHide);
  const runtime = {
    bindings,
    destroy() {
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
    if (!runtime.bindings.size) runtime.destroy();
    throw error;
  }
  let disposed = false;
  let stopDetachedWatch: (() => void) | undefined;
  const detach = () => {
    cleanup?.();
    runtime.bindings.delete(binding);
    if (!runtime.bindings.size) runtime.destroy();
  };
  const binding: Binding = {
    element,
    refresh() {
      if (disposed) return;
      if (element.ownerDocument === document) {
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
      runtime.bindings.add(binding);
      cleanup = setup(document);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      stopDetachedWatch?.();
      detach();
    },
  };
  runtime.bindings.add(binding);
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

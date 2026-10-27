import '@/styles/themes/default.css';
import { createApp } from 'vue';
import { M3VuePlugin } from '@/index';
import { lockPageScroll } from '@/internal/scrollLock/scrollLock';
import Panel from './Panel.vue';
import '@/styles/theme.css';

function trackDocumentListeners(document: Document) {
  const entries = new Set<{
    target: EventTarget;
    type: string;
    listener: EventListenerOrEventListenerObject | null;
    capture: boolean;
  }>();
  for (const target of [document, document.defaultView!]) {
    const add = target.addEventListener.bind(target);
    const remove = target.removeEventListener.bind(target);
    target.addEventListener = (
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions,
    ) => {
      const capture = typeof options === 'boolean' ? options : (options?.capture ?? false);
      // Playwright installs its own input listeners after opening the popup.
      // Attribute only registrations made by source modules to this audit.
      if (
        new Error().stack?.includes('/src/') &&
        ![...entries].some(
          (entry) =>
            entry.target === target && entry.type === type && entry.listener === listener && entry.capture === capture,
        )
      ) {
        const entry = { target, type, listener, capture };
        entries.add(entry);
        if (typeof options === 'object')
          options.signal?.addEventListener('abort', () => entries.delete(entry), { once: true });
      }
      add(type, listener!, options);
    };
    target.removeEventListener = (
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | EventListenerOptions,
    ) => {
      const capture = typeof options === 'boolean' ? options : (options?.capture ?? false);
      for (const entry of entries) {
        if (entry.target === target && entry.type === type && entry.listener === listener && entry.capture === capture)
          entries.delete(entry);
      }
      remove(type, listener!, options);
    };
  }
  return () => [...entries].map((entry) => entry.type);
}

const mounts = new Map<string, { app: ReturnType<typeof createApp>; container: HTMLElement; instance: any }>();
const mount = (document: Document, id: string, position: 'top' | 'bottom' = 'bottom') => {
  const container = document.createElement('div');
  document.body.append(container);
  const app = createApp(Panel);
  app.use(M3VuePlugin, { snackbarDefaults: { position } });
  const instance = app.mount(container);
  mounts.set(id, { app, container, instance });
};
const api = {
  child: null as Window | null,
  childListeners: () => [] as string[],
  state(id: string) {
    const instance = mounts.get(id)!.instance;
    return { results: [...instance.results], unmounted: instance.isUnmounted() };
  },
  mountExtra() {
    mount(document, 'extra', 'top');
  },
  open() {
    this.child = window.open('about:blank', '_blank', 'width=800,height=600');
    if (!this.child) throw new Error('Popup blocked');
    this.childListeners = trackDocumentListeners(this.child.document);
    for (const node of document.head.querySelectorAll('style, link[rel="stylesheet"]'))
      this.child.document.head.append(node.cloneNode(true));
    mount(this.child.document, 'child', 'top');
  },
  detach(id: string) {
    mounts.get(id)!.container.remove();
  },
  move(id: string, destination: 'main' | 'child') {
    (destination === 'main' ? document : this.child!.document).body.append(mounts.get(id)!.container);
  },
  unmount(id: string) {
    const entry = mounts.get(id)!;
    entry.app.unmount();
    entry.container.remove();
  },
  lock() {
    return [lockPageScroll(document), lockPageScroll(this.child!.document)];
  },
};
mount(document, 'main');
Object.assign(window, { multiWindow: api });

import '@/styles/themes/default.css';
import { createApp, h, nextTick, shallowRef, withDirectives } from 'vue';
import { M3VuePlugin, Menu, MenuItem, MenuSubMenu, OverlayHost, createOverlayHost, showSnackbar } from '@/index';
import { vDropdown, type DropdownTargetBinding } from '@/directives/Dropdown';
import { bindElementEnvironment } from '@/internal/elementEnvironment';
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
let completeIframeAction: (() => void) | undefined;
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
  async updateDropdownAcrossDocuments() {
    const destination = this.child!.document;
    const container = document.createElement('div');
    document.body.append(container);
    const target = destination.createElement('div');
    target.id = 'late-dropdown-target';
    target.popover = 'manual';
    target.style.setProperty('position-anchor', '--authored-anchor');
    const binding = shallowRef<DropdownTargetBinding>();
    const app = createApp(() =>
      withDirectives(h('button', { type: 'button' }, 'Late dropdown'), [[vDropdown, binding.value]]),
    );
    app.mount(container);
    const trigger = container.querySelector('button')!;
    const clickOpens = () => {
      trigger.click();
      const open = target.matches(':popover-open');
      if (open) target.hidePopover();
      return open;
    };

    try {
      const initiallyOpen = clickOpens();
      binding.value = `#${target.id}`;
      await nextTick();
      container.remove();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      destination.body.append(target, container);
      await nextTick();
      const opensAfterAdoption = clickOpens();

      binding.value = null;
      await nextTick();
      const opensAfterClear = clickOpens();
      const restoredAnchor = target.style.getPropertyValue('position-anchor');

      binding.value = target;
      await nextTick();
      const opensAfterReset = clickOpens();

      return { initiallyOpen, opensAfterAdoption, opensAfterClear, restoredAnchor, opensAfterReset };
    } finally {
      app.unmount();
      target.remove();
      container.remove();
    }
  },
  async adoptFromRemovedSubtree() {
    const parent = document.createElement('div');
    const element = document.createElement('span');
    parent.append(element);
    document.body.append(parent);
    const destination = this.child!.document;
    const events: string[] = [];
    const release = bindElementEnvironment(element, (owner) => {
      events.push(owner === destination ? 'bound to destination' : 'bound to source');
      return () => events.push(owner === destination ? 'released destination' : 'released source');
    });
    try {
      parent.remove();
      destination.body.append(element);
      await Promise.resolve();
      return [...events];
    } finally {
      release();
      element.remove();
    }
  },
  async releaseDetachedBinding() {
    const frame = document.createElement('iframe');
    frame.hidden = true;
    document.body.append(frame);
    const source = frame.contentDocument!;
    const element = source.createElement('button');
    source.body.append(element);
    const reference = new WeakRef(element);
    const release = bindElementEnvironment(element, () => {});

    element.remove();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    document.body.append(element);
    await Promise.resolve();
    release();
    element.remove();
    return { frame, reference };
  },
  async adoptOverlaysFromIframe() {
    const frame = document.createElement('iframe');
    frame.srcdoc = '<!doctype html><html><body></body></html>';
    const loaded = new Promise<void>((resolve) => frame.addEventListener('load', () => resolve(), { once: true }));
    document.body.append(frame);
    await loaded;

    const source = frame.contentDocument!;
    const listeners = trackDocumentListeners(source);
    // Create the container in the destination realm to isolate overlay-owned references.
    const container = document.createElement('div');
    source.body.append(container);
    for (const node of document.head.querySelectorAll('style, link[rel="stylesheet"]')) {
      source.head.append(node.cloneNode(true));
    }

    const host = createOverlayHost();
    const app = createApp(() => [
      h(OverlayHost, { host }),
      h(Menu, { open: true }, () =>
        h(MenuSubMenu, null, {
          trigger: () => h(MenuItem, { submenu: true }, () => 'More'),
          default: () => h(MenuItem, null, () => 'Nested'),
        }),
      ),
    ]);
    const instance = app.mount(container);
    mounts.set('overlay-adoption', { app, container, instance });
    await nextTick();

    let actionStarted = false;
    const action = new Promise<void>((resolve) => {
      completeIframeAction = resolve;
    });
    const result = showSnackbar(host, {
      duration: 10_000,
      message: 'Pending action',
      action: {
        label: 'Continue',
        onClick: () => {
          actionStarted = true;
          return action;
        },
      },
    });
    await nextTick();
    container.querySelector<HTMLButtonElement>('.m3-snackbar-action-button')!.click();
    container.querySelector<HTMLButtonElement>('[aria-label="Dismiss notification"]')!.click();
    if (!actionStarted || (await result) !== 'dismiss')
      throw new Error('Snackbar did not dismiss with a pending action');
    await nextTick();

    const submenu = container.querySelector('[data-part="submenu"]')!;
    submenu.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    await nextTick();
    const childMenu = submenu.querySelector('[data-scope="menu"][data-part="root"]')!;
    if (!childMenu.matches(':popover-open')) throw new Error('Submenu did not open in its source document');

    const rect = childMenu.getBoundingClientRect();
    submenu.dispatchEvent(
      new PointerEvent('pointerleave', { pointerType: 'mouse', clientX: rect.left - 24, clientY: rect.top + 8 }),
    );
    if (!listeners().includes('pointermove')) throw new Error('Safe triangle did not install its pointer listener');

    const oldDocument = new WeakRef(source);
    document.body.append(container);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    if (listeners().includes('pointermove')) throw new Error('Safe triangle did not release its pointer listener');
    frame.remove();
    return oldDocument;
  },
  finishIframeAction() {
    completeIframeAction?.();
    completeIframeAction = undefined;
  },
  async retireFirstSnackbar() {
    const { host } = mounts.get('extra')!.instance;
    const payload = { canContinue: true };
    void showSnackbar(host, {
      message: 'Retired notification',
      position: 'top-end',
      duration: null,
      action: { label: 'Continue', onClick: () => payload.canContinue },
    });
    void showSnackbar(host, { message: 'Surviving notification', position: 'top-end', duration: null });
    await nextTick();
    document.querySelector<HTMLButtonElement>('[data-position="top-end"] [aria-label="Dismiss notification"]')!.click();
    return new WeakRef(payload);
  },
};
mount(document, 'main');
Object.assign(window, { multiWindow: api });

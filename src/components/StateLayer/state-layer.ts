import { bindElementEnvironment } from '@/internal/elementEnvironment';
import type { Directive } from 'vue';
import './state-layer.css';

const stateLayerSelector = '.m3-state-layer';
type RippleCleanup = () => void;
const rippleCleanups = new WeakMap<Element, RippleCleanup | Set<RippleCleanup>>();
const registrations = new WeakMap<Document, { count: number; destroy: () => void }>();

const isEnabled = (node: Element): boolean => {
  if (node.closest('[aria-disabled="true"], :disabled')) return false;
  if (node.tagName === 'LABEL' && (node as HTMLLabelElement).control?.matches(':disabled')) return false;
  return true;
};

const createRipple = (node: Element, x: number, y: number, width: number, height: number): void => {
  // Use the furthest corner from the interaction point so the ripple fully covers the control.
  const maxDist = Math.max(
    Math.hypot(x, y),
    Math.hypot(width - x, y),
    Math.hypot(x, height - y),
    Math.hypot(width - x, height - y),
  );

  // Scale duration with ripple travel distance while keeping it within a Material-like range.
  const duration = Math.max(Math.min(Math.log(maxDist) * 100, 600), 200);

  const ripple = node.ownerDocument.createElement('div');
  ripple.className = 'ripple';
  ripple.style.setProperty('--x', `${x}px`);
  ripple.style.setProperty('--y', `${y}px`);
  ripple.style.setProperty('--duration', `${duration}ms`);

  node.appendChild(ripple);

  // Remove the helper node after both the spread and fade-out finish.
  const view = node.ownerDocument.defaultView!;
  const cleanup = () => {
    view.clearTimeout(timer);
    ripple.remove();

    const current = rippleCleanups.get(node);
    if (typeof current === 'function') {
      if (current === cleanup) rippleCleanups.delete(node);
    } else if (current) {
      current.delete(cleanup);
      if (!current.size) rippleCleanups.delete(node);
    }
  };
  const timer = view.setTimeout(cleanup, duration + 650);

  const previous = rippleCleanups.get(node);
  if (typeof previous === 'function') {
    rippleCleanups.set(node, new Set([previous, cleanup]));
  } else if (previous) {
    previous.add(cleanup);
  } else {
    rippleCleanups.set(node, cleanup);
  }
};

function isKeyboardRippleEvent(event: KeyboardEvent) {
  return (
    (event.key === 'Enter' || event.key === ' ') &&
    !event.repeat &&
    !event.isComposing &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey
  );
}

function createKeyboardRipple(layer: HTMLElement) {
  if (!isEnabled(layer)) return;
  const rect = layer.getBoundingClientRect();
  createRipple(layer, rect.width / 2, rect.height / 2, rect.width, rect.height);
}

export function triggerKeyboardRipple(event: KeyboardEvent, layer: HTMLElement) {
  if (isKeyboardRippleEvent(event)) createKeyboardRipple(layer);
}

function initStateLayer(document: Document = globalThis.document): () => void {
  if (!document) return () => {};
  let runtime = registrations.get(document);
  if (!runtime) {
    const hadClass = document.documentElement.classList.contains('js');
    document.documentElement.classList.add('js');
    const pointerdown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const layer = (event.target as Element | null)?.closest?.(stateLayerSelector);
      if (!layer || !isEnabled(layer)) return;
      const rect = layer.getBoundingClientRect();
      createRipple(layer, event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);
    };
    const keydown = (event: KeyboardEvent) => {
      if (!isKeyboardRippleEvent(event)) return;
      const layer = (event.target as Element | null)?.closest?.<HTMLElement>(stateLayerSelector);
      if (!layer || (event.key === ' ' && layer.tagName !== 'BUTTON')) return;
      createKeyboardRipple(layer);
    };
    document.addEventListener('pointerdown', pointerdown);
    document.addEventListener('keydown', keydown);
    runtime = {
      count: 0,
      destroy() {
        document.removeEventListener('pointerdown', pointerdown);
        document.removeEventListener('keydown', keydown);
        if (!hadClass) document.documentElement.classList.remove('js');
        registrations.delete(document);
      },
    };
    registrations.set(document, runtime);
  }
  runtime.count++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--runtime.count === 0) runtime.destroy();
  };
}

const releases = new WeakMap<Element, () => void>();
export const vStateLayer: Directive<HTMLElement> = {
  mounted(element) {
    // Controls that switch between presentation and interaction remount their state-layer element.
    if (!element.matches(stateLayerSelector) || releases.has(element)) return;

    releases.set(
      element,
      bindElementEnvironment(element, (document) => {
        const release = initStateLayer(document);
        return () => {
          const cleanups = rippleCleanups.get(element);
          if (typeof cleanups === 'function') {
            cleanups();
          } else if (cleanups) {
            for (const cleanup of cleanups) cleanup();
          }
          release();
        };
      }),
    );
  },
  beforeUnmount(element) {
    releases.get(element)?.();
    releases.delete(element);
  },
};
export { initStateLayer };

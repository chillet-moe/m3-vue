import { isHTMLElement } from '@/internal/elementEnvironment';
import type { ObjectDirective } from 'vue';
import './focus-ring.css';

export type FocusRingOptions = {
  /** Draw around a direct child matching this selector instead of the host. */
  target?: string;
  /** Also follows descendant keyboard focus unless a nested directive supplies its own ring. */
  within?: boolean;
  /** Show the ring for externally managed focus, such as an active descendant. */
  active?: boolean;
};

type Binding = FocusRingOptions | boolean | undefined;

type FocusRing = {
  update: (options: Binding) => void;
  dispose: () => void;
};
function attach(host: HTMLElement, positioned: boolean): FocusRing {
  let within = false;
  let active = false;
  let target: HTMLElement | undefined;
  let ring: HTMLElement | undefined;
  let observer: IntersectionObserver | undefined;
  let queued = false;

  const shouldOpen = () => active || host.matches(within ? ':focus-within' : ':focus');

  const removeRing = () => {
    observer?.disconnect();
    observer = undefined;
    ring?.remove();
    ring = undefined;
  };

  const sync = () => {
    if (!target?.isConnected) return;
    if (!shouldOpen()) {
      removeRing();
      return;
    }
    if (ring?.matches(':popover-open') && ring.parentElement === target) return;

    removeRing();
    const document = target.ownerDocument;
    const view = document.defaultView;
    // These elements do not paint DOM children, even when a child is an open popover.
    if (target.matches('input, textarea, select, img, iframe, embed, object, video, audio, canvas, meter, progress')) {
      return;
    }
    if (
      typeof view?.HTMLElement.prototype.showPopover !== 'function' ||
      (!positioned &&
        (!view.ToggleEvent ||
          !('source' in view.ToggleEvent.prototype) ||
          !view.CSS?.supports('top: anchor(top)') ||
          !view.CSS.supports('width: anchor-size(width)') ||
          !view.CSS.supports('position-visibility: anchors-visible')))
    ) {
      return;
    }

    const decoration = document.createElement('span');
    decoration.className = 'm3-focus-ring';
    decoration.setAttribute('popover', 'manual');
    decoration.setAttribute('aria-hidden', 'true');
    decoration.toggleAttribute('data-m3-focus-ring-positioned', positioned);
    target.append(decoration);

    // CSS owns :focus-visible. The popover can stay open as input modality changes.
    try {
      decoration.showPopover(positioned ? undefined : { source: target });
    } catch (error) {
      decoration.remove();
      if (error instanceof view.DOMException && error.name === 'InvalidStateError') return false;
      throw error;
    }
    if (!decoration.matches(':popover-open')) {
      decoration.remove();
      return;
    }
    ring = decoration;
    if (positioned && view.IntersectionObserver) {
      observer = new view.IntersectionObserver(([entry]) => {
        decoration.toggleAttribute('data-m3-focus-ring-clipped', !entry?.isIntersecting);
      });
      observer.observe(host);
    }
  };

  const scheduleSync = () => {
    if (queued || !target) return;
    const view = host.ownerDocument.defaultView;
    if (!view) return;
    queued = true;
    const flush = () => {
      queued = false;
      return sync();
    };
    view.queueMicrotask(() => {
      // A focus change inside an animation frame needs its ring before that frame is painted.
      if (flush() !== false || queued) return;
      // Native popover autofocus can run this microtask before the opening steps finish.
      queued = true;
      view.requestAnimationFrame(flush);
    });
  };

  const findTarget = (selector: string | undefined) => {
    if (!selector) return host;
    for (const child of host.children) {
      if (child !== ring && child.matches(selector) && isHTMLElement(child)) return child;
    }
  };

  const onFocus = (event: FocusEvent) => {
    if (within || event.target === host) scheduleSync();
  };

  const setTarget = (nextTarget: HTMLElement | undefined) => {
    removeRing();
    if (!target && nextTarget) {
      host.addEventListener('focusin', onFocus, true);
      host.addEventListener('focusout', onFocus, true);
    } else if (target && !nextTarget) {
      host.removeEventListener('focusin', onFocus, true);
      host.removeEventListener('focusout', onFocus, true);
    }
    target?.removeAttribute('data-m3-focus-ring-target');
    target = nextTarget;
    target?.setAttribute('data-m3-focus-ring-target', target === host ? 'self' : 'child');
  };

  return {
    update(value) {
      const options = typeof value === 'object' ? value : undefined;
      const nextTarget = value === false ? undefined : findTarget(options?.target);
      const nextWithin = Boolean(options?.within);
      const nextActive = Boolean(nextTarget && options?.active);
      const targetChanged = target !== nextTarget;
      const withinChanged = within !== nextWithin;
      const activeChanged = active !== nextActive;

      if (targetChanged) setTarget(nextTarget);
      if (targetChanged || withinChanged) {
        within = nextWithin;
        if (target) host.setAttribute('data-m3-focus-ring', within ? 'within' : '');
        else host.removeAttribute('data-m3-focus-ring');
      }
      if (activeChanged) {
        active = nextActive;
        host.toggleAttribute('data-m3-focus-ring-active', active);
      }

      // Vue can replace the decoration when updating a native element's text.
      if (ring && ring.parentElement !== target) scheduleSync();
      else if (target && (targetChanged || activeChanged || withinChanged) && (ring || shouldOpen())) scheduleSync();
    },
    dispose() {
      setTarget(undefined);
      host.removeAttribute('data-m3-focus-ring');
      host.removeAttribute('data-m3-focus-ring-active');
    },
  };
}

function createFocusRingDirective(positioned: boolean): ObjectDirective<HTMLElement, Binding> {
  const rings = new WeakMap<HTMLElement, FocusRing>();
  return {
    mounted(host, { value }) {
      const ring = attach(host, positioned);
      rings.set(host, ring);
      ring.update(value);
    },
    updated(host, { value }) {
      rings.get(host)?.update(value);
    },
    beforeUnmount(host) {
      rings.get(host)?.dispose();
      rings.delete(host);
    },
  };
}

/** The consumer supplies the ring's viewport position in CSS. */
export const vPositionedFocusRing = createFocusRingDirective(true);

/**
 * Attach with `v-focus-ring`. For an input or other element that cannot render
 * children, apply the directive to a visual wrapper with `{ within: true }`.
 * Customize `--md-focus-ring-color`, `--md-focus-ring-width`,
 * `--md-focus-ring-offset` and `--md-focus-ring-shape` on the ring target.
 *
 * @example
 * `<button v-focus-ring type="button">Save</button>`
 */
export const vFocusRing = createFocusRingDirective(false);

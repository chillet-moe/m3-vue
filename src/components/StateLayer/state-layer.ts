import './state-layer.css';

const supportsAtProperty = typeof window != 'undefined' && window.CSS?.registerProperty !== undefined;
let useJSAnimation = false;
let initialized = false;

if (!supportsAtProperty && typeof CSS != 'undefined' && typeof CSS.registerProperty === 'function') {
  // Some browsers support runtime property registration but not the @property at-rule.
  try {
    CSS.registerProperty({
      name: '--r',
      syntax: '<percentage>',
      inherits: false,
      initialValue: '0%',
    });
  } catch {
    // Fall back to requestAnimationFrame-driven updates when custom property animation is unavailable.
    console.warn('Browser does not support @property, falling back to JS animation');
    useJSAnimation = true;
  }
}

const isEnabled = (node: Element): boolean => {
  // Anchors and custom trigger wrappers communicate disabled state via aria-disabled.
  if (node instanceof HTMLElement && node.getAttribute('aria-disabled') === 'true') return false;
  if (node instanceof HTMLButtonElement && node.disabled) return false;
  if (node instanceof HTMLInputElement && node.disabled) return false;

  // Toggle buttons can render as labels; defer to the associated form control in that case.
  if (node instanceof HTMLLabelElement) {
    const control = node.control;
    if (control instanceof HTMLInputElement && control.disabled) return false;
  }

  return true;
};

const createRippleCSS = (
  node: Element,
  x: number,
  y: number,
  width: number,
  height: number,
  duration: number,
): void => {
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.setProperty('--x', `${x}px`);
  ripple.style.setProperty('--y', `${y}px`);
  ripple.style.setProperty('--duration', `${duration}ms`);

  node.appendChild(ripple);

  // Remove the helper node after both the spread and fade-out finish.
  setTimeout(() => ripple.remove(), duration + 650);
};

const createRippleJS = (node: Element, x: number, y: number, width: number, height: number, duration: number): void => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.setProperty('--x', `${x}px`);
  ripple.style.setProperty('--y', `${y}px`);
  ripple.style.setProperty('--r', '0%');

  node.appendChild(ripple);

  const startTime = performance.now();

  function animate(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Approximate Material's standard emphasized easing curve.
    const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    const currentRadius = ease * 120;

    ripple.style.setProperty('--r', `${currentRadius}%`);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      ripple.style.opacity = '0';
      setTimeout(() => ripple.remove(), 650);
    }
  }

  requestAnimationFrame(animate);
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

  if (useJSAnimation) {
    createRippleJS(node, x, y, width, height, duration);
  } else {
    createRippleCSS(node, x, y, width, height, duration);
  }
};

function initStateLayer() {
  // This API can be called by app bootstrap code more than once; keep listener registration idempotent.
  if (initialized || typeof document == 'undefined') {
    return;
  }

  initialized = true;
  document.documentElement.classList.add('js');

  document.addEventListener('pointerdown', (e) => {
    if (e.button != 0) return;

    const layer = (e.target as Element).closest('.m3-state-layer');
    if (!layer || !isEnabled(layer)) return;

    const rect = layer.getBoundingClientRect();
    createRipple(layer, e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
  });

  document.addEventListener('keydown', (e) => {
    if (e.repeat) return;

    const target = e.target as Element;
    const layer = target.closest('.m3-state-layer');
    if (!layer || !isEnabled(layer)) return;

    const isActivate = e.key == 'Enter' || (e.key == ' ' && layer.tagName == 'BUTTON');
    if (!isActivate) return;

    const rect = layer.getBoundingClientRect();
    createRipple(layer, rect.width / 2, rect.height / 2, rect.width, rect.height);
  });
}

export { initStateLayer };

import './state-layer.css';

let initialized = false;

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

  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.setProperty('--x', `${x}px`);
  ripple.style.setProperty('--y', `${y}px`);
  ripple.style.setProperty('--duration', `${duration}ms`);

  node.appendChild(ripple);

  // Remove the helper node after both the spread and fade-out finish.
  setTimeout(() => ripple.remove(), duration + 650);
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

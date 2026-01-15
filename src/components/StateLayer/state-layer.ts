import './state-layer.css';

const supportsAtProperty = typeof window != 'undefined' && window.CSS?.registerProperty !== undefined;
let useJSAnimation = false;

if (!supportsAtProperty && typeof CSS != 'undefined' && typeof CSS.registerProperty === 'function') {
  // 降级:使用 JS 动态注册
  try {
    CSS.registerProperty({
      name: '--r',
      syntax: '<percentage>',
      inherits: false,
      initialValue: '0%',
    });
  } catch (e) {
    // 完全不支持,降级到 requestAnimationFrame
    console.warn('Browser does not support @property, falling back to JS animation');
    useJSAnimation = true;
  }
}

const isEnabled = (node: Element): boolean => {
  if (node instanceof HTMLButtonElement && node.disabled) return false;
  if (node instanceof HTMLInputElement && node.disabled) return false;

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
  // 创建波纹层
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  // 设置点击中心点和动画时长
  ripple.style.setProperty('--x', `${x}px`);
  ripple.style.setProperty('--y', `${y}px`);
  ripple.style.setProperty('--duration', `${duration}ms`);

  node.appendChild(ripple);

  // 动画结束后自动移除元素（扩散 + 淡出总时长）
  setTimeout(() => ripple.remove(), duration + 650);
};

const createRippleJS = (node: Element, x: number, y: number, width: number, height: number, duration: number): void => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 创建波纹层
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  // 设置点击中心点
  ripple.style.setProperty('--x', `${x}px`);
  ripple.style.setProperty('--y', `${y}px`);
  ripple.style.setProperty('--r', '0%');

  node.appendChild(ripple);

  // JS 动画控制半径扩散
  const startTime = performance.now();

  function animate(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // cubic-bezier(0.4, 0, 0.2, 1) 近似
    const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    // 当前半径百分比
    const currentRadius = ease * 120;

    ripple.style.setProperty('--r', `${currentRadius}%`);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // 动画结束后，开始淡出并销毁
      ripple.style.opacity = '0';
      setTimeout(() => ripple.remove(), 650);
    }
  }

  requestAnimationFrame(animate);
};

const createRipple = (node: Element, x: number, y: number, width: number, height: number): void => {
  // 计算最大半径（到最远角的距离）
  const maxDist = Math.max(
    Math.hypot(x, y), // 左上
    Math.hypot(width - x, y), // 右上
    Math.hypot(x, height - y), // 左下
    Math.hypot(width - x, height - y), // 右下
  );

  // 动画持续时间，根据距离动态调整
  const duration = Math.max(Math.min(Math.log(maxDist) * 100, 600), 200);

  // 根据浏览器支持情况选择动画方式
  if (useJSAnimation) {
    createRippleJS(node, x, y, width, height, duration);
  } else {
    createRippleCSS(node, x, y, width, height, duration);
  }
};

if (typeof document != 'undefined') {
  document.documentElement.classList.add('js');

  // Pointer events
  document.addEventListener('pointerdown', (e) => {
    if (e.button != 0) return;

    const layer = (e.target as Element).closest('.state-layer');
    if (!layer || !isEnabled(layer)) return;

    const rect = layer.getBoundingClientRect();
    createRipple(layer, e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
  });

  // Keyboard events
  document.addEventListener('keydown', (e) => {
    if (e.repeat) return;

    const target = e.target as Element;
    const layer = target.closest('.state-layer');
    if (!layer || !isEnabled(layer)) return;

    const isActivate = e.key == 'Enter' || (e.key == ' ' && layer.tagName == 'BUTTON');
    if (!isActivate) return;

    const rect = layer.getBoundingClientRect();
    createRipple(layer, rect.width / 2, rect.height / 2, rect.width, rect.height);
  });
}

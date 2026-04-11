<script setup lang="ts">
import { computed, inject, nextTick, onUnmounted, provide, ref, useTemplateRef, watch } from 'vue';
import Menu, { type MenuColor } from './Menu.vue';
import { menuContextKey, menuSubmenuContextKey } from './MenuContext';

type Point = {
  x: number;
  y: number;
};

type Triangle = {
  origin: Point;
  sideStart: Point;
  sideEnd: Point;
};

type MenuSubMenuProps = {
  /** Visual color style of the nested menu surface. Defaults to the parent menu color. */
  color?: MenuColor;

  /** Visualize the safe triangle used by pointer navigation. */
  debugSafeTriangle?: boolean;
};

type MenuExposed = {
  show: (focusFirst?: boolean, source?: HTMLElement) => Promise<void>;
  hide: () => void;
  menuRef: HTMLDivElement | null;
};

const props = defineProps<MenuSubMenuProps>();

const open = defineModel<boolean>('open', { default: false });

defineSlots<{
  /** Trigger content. Usually a MenuItem with submenu state. */
  trigger(props: { open: boolean }): any;

  /** Nested menu content; usually MenuContainer and MenuGap. */
  default(): any;
}>();

const parentMenu = inject(menuContextKey, null);

const wrapperRef = useTemplateRef<HTMLDivElement>('wrapper');
const triggerRef = useTemplateRef<HTMLDivElement>('trigger');
const submenuMenuRef = useTemplateRef<MenuExposed>('submenuMenu');

const resolvedColor = computed(() => props.color ?? parentMenu?.getColor() ?? 'standard');
const safeTriangle = ref<Triangle | null>(null);

let shouldRestoreTriggerFocus = false;
let ignoreNextFocusIn = false;
let trackingSafeTriangle = false;
let suppressFocusOpenUntil = 0;

const safeTriangleStyle = computed(() => {
  const wrapper = wrapperRef.value;

  if (!props.debugSafeTriangle || !safeTriangle.value || !wrapper) {
    return null;
  }

  const points = [safeTriangle.value.origin, safeTriangle.value.sideStart, safeTriangle.value.sideEnd];
  const wrapperRect = wrapper.getBoundingClientRect();
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  const clipPath = `polygon(${points
    .map((point) => `${((point.x - minX) / width) * 100}% ${((point.y - minY) / height) * 100}%`)
    .join(', ')})`;

  return {
    left: `${minX - wrapperRect.left}px`,
    top: `${minY - wrapperRect.top}px`,
    width: `${width}px`,
    height: `${height}px`,
    clipPath,
  };
});

function focusTrigger() {
  const triggerItem = triggerRef.value?.querySelector<HTMLElement>('[role="menuitem"]');
  triggerItem?.focus();
}

function isHoverPointer(event: PointerEvent) {
  return (event.pointerType || 'mouse') === 'mouse';
}

function onTriggerPointerDown() {
  suppressFocusOpenUntil = performance.now() + 500;
}

function clearSafeTriangle() {
  safeTriangle.value = null;

  if (!trackingSafeTriangle) {
    return;
  }

  trackingSafeTriangle = false;
  document.removeEventListener('pointermove', onDocumentPointerMove, true);
}

function closeSubmenu(focusTriggerAfterClose = false) {
  clearSafeTriangle();
  shouldRestoreTriggerFocus = focusTriggerAfterClose;

  if (submenuMenuRef.value) {
    submenuMenuRef.value.hide();

    if (focusTriggerAfterClose) {
      ignoreNextFocusIn = true;
      void nextTick(() => {
        focusTrigger();
      });
    }

    return;
  }

  open.value = false;

  if (focusTriggerAfterClose) {
    ignoreNextFocusIn = true;
    void nextTick(() => {
      focusTrigger();
    });
  }
}

const closeSubmenuSelf = () => {
  closeSubmenu();
};

async function openSubmenu(focusFirst = false) {
  parentMenu?.closeSubmenus(closeSubmenuSelf);
  const source = triggerRef.value?.querySelector<HTMLElement>('[role="menuitem"]') ?? undefined;

  if (submenuMenuRef.value) {
    await submenuMenuRef.value.show(focusFirst, source);
    return;
  }

  open.value = true;
}

function isWithinWrapper(target: EventTarget | null) {
  return target instanceof Node && wrapperRef.value?.contains(target);
}

function isPointInsideTriangle(point: Point, triangle: Triangle) {
  const { origin, sideStart, sideEnd } = triangle;

  const denominator =
    (sideStart.y - sideEnd.y) * (origin.x - sideEnd.x) + (sideEnd.x - sideStart.x) * (origin.y - sideEnd.y);

  if (denominator === 0) {
    return false;
  }

  const first =
    ((sideStart.y - sideEnd.y) * (point.x - sideEnd.x) + (sideEnd.x - sideStart.x) * (point.y - sideEnd.y)) /
    denominator;
  const second =
    ((sideEnd.y - origin.y) * (point.x - sideEnd.x) + (origin.x - sideEnd.x) * (point.y - sideEnd.y)) / denominator;
  const third = 1 - first - second;
  const tolerance = 0.001;

  return first >= -tolerance && second >= -tolerance && third >= -tolerance;
}

function createSafeTriangle(origin: Point) {
  const submenuMenu = submenuMenuRef.value?.menuRef;

  if (!submenuMenu || !submenuMenu.matches(':popover-open')) {
    return null;
  }

  const submenuRect = submenuMenu.getBoundingClientRect();

  if (!submenuRect.width || !submenuRect.height) {
    return null;
  }

  const submenuNearEdgeX =
    Math.abs(origin.x - submenuRect.left) <= Math.abs(origin.x - submenuRect.right)
      ? submenuRect.left
      : submenuRect.right;
  const expansion = 12;

  if (submenuNearEdgeX === submenuRect.left && origin.x > submenuNearEdgeX) {
    return null;
  }

  if (submenuNearEdgeX === submenuRect.right && origin.x < submenuNearEdgeX) {
    return null;
  }

  return {
    origin,
    sideStart: {
      x: submenuNearEdgeX,
      y: submenuRect.top - expansion,
    },
    sideEnd: {
      x: submenuNearEdgeX,
      y: submenuRect.bottom + expansion,
    },
  } satisfies Triangle;
}

function updatePreviewTriangle(event: PointerEvent) {
  if (trackingSafeTriangle || !props.debugSafeTriangle || !open.value) {
    return;
  }

  safeTriangle.value = createSafeTriangle({
    x: event.clientX,
    y: event.clientY,
  });
}

function onDocumentPointerMove(event: PointerEvent) {
  if (isWithinWrapper(event.target)) {
    clearSafeTriangle();
    return;
  }

  const triangle = safeTriangle.value;

  if (!triangle) {
    closeSubmenu();
    return;
  }

  if (
    isPointInsideTriangle(
      {
        x: event.clientX,
        y: event.clientY,
      },
      triangle,
    )
  ) {
    return;
  }

  closeSubmenu();
}

function activateSafeTriangle(origin: Point) {
  const triangle = createSafeTriangle(origin);

  if (!triangle) {
    clearSafeTriangle();
    return false;
  }

  safeTriangle.value = triangle;

  if (trackingSafeTriangle) {
    return true;
  }

  trackingSafeTriangle = true;
  document.addEventListener('pointermove', onDocumentPointerMove, true);

  return true;
}

function onPointerEnter(event: PointerEvent) {
  if (!isHoverPointer(event)) {
    return;
  }

  clearSafeTriangle();
  void openSubmenu();
}

function onPointerLeave(event: PointerEvent) {
  if (!isHoverPointer(event)) {
    return;
  }

  if (isWithinWrapper(event.relatedTarget)) {
    return;
  }

  if (
    open.value &&
    activateSafeTriangle({
      x: event.clientX,
      y: event.clientY,
    })
  ) {
    return;
  }

  closeSubmenu();
}

function onFocusIn() {
  if (ignoreNextFocusIn) {
    ignoreNextFocusIn = false;
    return;
  }

  if (performance.now() < suppressFocusOpenUntil) {
    return;
  }

  void openSubmenu();
}

function onFocusOut(event: FocusEvent) {
  if (isWithinWrapper(event.relatedTarget)) {
    return;
  }

  closeSubmenu();
}

function onTriggerClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;

  if (!target || !target.closest('[role="menuitem"]')) {
    return;
  }

  event.preventDefault();
  void openSubmenu(true);
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (!['ArrowRight', 'Enter', ' '].includes(event.key)) {
    return;
  }

  event.preventDefault();
  void openSubmenu(true);
}

watch(
  open,
  (nextOpen) => {
    if (nextOpen) {
      return;
    }

    clearSafeTriangle();

    if (!shouldRestoreTriggerFocus) {
      return;
    }

    shouldRestoreTriggerFocus = false;
    void nextTick(() => {
      focusTrigger();
    });
  },
  {
    flush: 'post',
  },
);

watch(
  open,
  (nextOpen) => {
    if (nextOpen) {
      parentMenu?.closeSubmenus(closeSubmenuSelf);
      return;
    }
  },
  {
    flush: 'post',
  },
);

const unregisterSubmenu = parentMenu?.registerSubmenu(closeSubmenuSelf);

provide(menuSubmenuContextKey, {
  close: () => {
    closeSubmenu();
  },
  closeAndFocusTrigger: () => {
    closeSubmenu(true);
  },
  focusTrigger,
});

onUnmounted(() => {
  clearSafeTriangle();
  unregisterSubmenu?.();
});
</script>

<template>
  <div
    ref="wrapper"
    role="none"
    class="m3-menu-submenu"
    data-scope="menu"
    data-part="submenu"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @pointermove="updatePreviewTriangle"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <div
      ref="trigger"
      role="none"
      class="m3-menu-submenu-trigger"
      @pointerdown="onTriggerPointerDown"
      @click="onTriggerClick"
      @keydown="onTriggerKeydown"
    >
      <slot name="trigger" :open="open" />
    </div>

    <div v-if="safeTriangleStyle" aria-hidden="true" class="m3-menu-submenu-safe-triangle" :style="safeTriangleStyle" />

    <Menu ref="submenuMenu" v-model:open="open" :color="resolvedColor" data-submenu="true">
      <slot />
    </Menu>
  </div>
</template>

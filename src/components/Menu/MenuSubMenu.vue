<script setup lang="ts">
import { computed, inject, nextTick, onUnmounted, provide, useId, useTemplateRef, watch } from 'vue';
import Menu, { type MenuColor } from './Menu.vue';
import { menuContextKey, menuSubmenuContextKey } from './MenuContext';

type MenuSubMenuProps = {
  /** Visual color style of the nested menu surface. Defaults to the parent menu color. */
  color?: MenuColor;
};

type MenuExposed = {
  show: (focusFirst?: boolean) => Promise<void>;
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

const anchorName = `--menu-submenu-anchor-${useId()}`;
const resolvedColor = computed(() => props.color ?? parentMenu?.getColor() ?? 'standard');

let shouldRestoreTriggerFocus = false;
let ignoreNextFocusIn = false;

function focusTrigger() {
  const triggerItem = triggerRef.value?.querySelector<HTMLElement>('[role="menuitem"]');
  triggerItem?.focus();
}

function syncAnchor() {
  const trigger = triggerRef.value;
  const submenuMenu = submenuMenuRef.value?.menuRef;

  if (trigger) {
    trigger.style.setProperty('anchor-name', anchorName);
  }

  if (submenuMenu) {
    submenuMenu.style.setProperty('position-anchor', anchorName);
  }
}

function closeSubmenu(focusTriggerAfterClose = false) {
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

  if (submenuMenuRef.value) {
    await submenuMenuRef.value.show(focusFirst);
    return;
  }

  open.value = true;
}

function isWithinWrapper(target: EventTarget | null) {
  return target instanceof Node && wrapperRef.value?.contains(target);
}

function onPointerEnter() {
  void openSubmenu();
}

function onPointerLeave(event: PointerEvent) {
  if (isWithinWrapper(event.relatedTarget)) {
    return;
  }

  closeSubmenu();
}

function onFocusIn() {
  if (ignoreNextFocusIn) {
    ignoreNextFocusIn = false;
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

watch([triggerRef, submenuMenuRef], syncAnchor, {
  immediate: true,
  flush: 'post',
});

watch(
  open,
  (nextOpen) => {
    if (nextOpen) {
      parentMenu?.closeSubmenus(closeSubmenuSelf);
      return;
    }

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
  unregisterSubmenu?.();
  triggerRef.value?.style.removeProperty('anchor-name');
  submenuMenuRef.value?.menuRef?.style.removeProperty('position-anchor');
});
</script>

<template>
  <div
    ref="wrapper"
    role="none"
    class="m3-menu-submenu"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <div ref="trigger" role="none" class="m3-menu-submenu-trigger" @click="onTriggerClick" @keydown="onTriggerKeydown">
      <slot name="trigger" :open="open" />
    </div>

    <Menu ref="submenuMenu" v-model:open="open" :color="resolvedColor" data-submenu="true">
      <slot />
    </Menu>
  </div>
</template>

<script setup lang="ts">
import { vFocusRing } from '@/directives/FocusRing';
import { provideShape, type M3Shape } from '@/styles/shape';
import { isNode, useElementEnvironment } from '@/internal/elementEnvironment';
import { registerSharedViewportChange } from '@/internal/sharedViewportChange';
import { vStateLayer } from '@/components/StateLayer/state-layer';

import { computed, nextTick, provide, ref, useId, useTemplateRef, watch } from 'vue';

import { Icon } from '@/components/Icon';
import type { MenuModelValue } from '@/components/Menu/MenuTypes';
import { usePressShapeMorphAttrs } from '@/composables/usePressShapeMorph';
import { useMenu } from '@/composables/useMenu';
import { floatingActionButtonMenuContextKey } from './FloatingActionButtonMenuContext';

export type FloatingActionButtonMenuProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
  /** The color set of the FAB menu. */
  color?: 'primary' | 'secondary' | 'tertiary';

  /** Size of the closed trigger FAB. The expanded menu always uses one item size. */
  size?: 'regular' | 'medium' | 'large';

  /** Horizontal alignment of menu items relative to the trigger FAB. */
  alignment?: 'start' | 'end';

  /** Name of the icon shown on the closed trigger FAB. */
  icon?: string;

  /** Name of the icon shown on the close FAB. */
  closeIcon?: string;

  /** Accessible label for the trigger FAB. */
  ariaLabel?: string;

  /** Whether the trigger FAB is disabled. */
  disabled?: boolean;
};

const props = withDefaults(defineProps<FloatingActionButtonMenuProps>(), {
  color: 'primary',
  size: 'regular',
  alignment: 'end',
  icon: 'add',
  closeIcon: 'close',
  ariaLabel: 'Toggle menu',
  disabled: false,
});

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  /** Fired when a menu item is activated. */
  select: [event: MouseEvent, itemElement: HTMLElement];

  /** Fired after the FAB menu's visual exit finishes. */
  closed: [];
}>();

defineSlots<{
  /** Menu items, usually FloatingActionButtonMenuItem components. */
  default(): any;
}>();

const menuId = `fab-menu-${useId()}`;
const triggerId = `${menuId}-trigger`;
const rootRef = useTemplateRef<HTMLDivElement>('root');
const triggerRef = useTemplateRef<HTMLButtonElement>('trigger');
const menuRef = ref<HTMLDivElement>();
const surfaceRef = useTemplateRef<HTMLDivElement>('surface');
const modelValue = ref<MenuModelValue>();
const effectiveAlignment = ref<FloatingActionButtonMenuProps['alignment']>(props.alignment);
let restoreFocusAfterClose = false;

const disabled = computed(() => props.disabled);
const triggerPressShapeMorphAttrs = usePressShapeMorphAttrs({ disabled });

provide(floatingActionButtonMenuContextKey, {
  id: menuId,
});

function toPixelValue(value: string | undefined, relativeTo?: Element | null) {
  if (!value || !relativeTo) return 0;
  const document = relativeTo.ownerDocument;
  const window = document.defaultView!;

  const parsedValue = Number.parseFloat(value);
  if (!Number.isFinite(parsedValue)) return 0;

  if (value.trim().endsWith('rem')) {
    const rootFontSize = window.getComputedStyle(document.documentElement).fontSize;
    return parsedValue * (Number.parseFloat(rootFontSize) || 16);
  }

  if (value.trim().endsWith('em') && relativeTo) {
    const fontSize = window.getComputedStyle(relativeTo).fontSize;
    return parsedValue * (Number.parseFloat(fontSize) || 16);
  }

  return parsedValue;
}

function updatePopoverPosition() {
  const root = rootRef.value;
  const window = root?.ownerDocument.defaultView;
  const trigger = triggerRef.value;
  const menu = menuRef.value;
  const surface = surfaceRef.value;
  if (!window || !root || !trigger || !menu || !surface) return;

  const rootRect = root.getBoundingClientRect();
  const triggerRect = trigger.getBoundingClientRect();
  const triggerStyle = window.getComputedStyle(trigger);
  const closeButtonWidth =
    toPixelValue(triggerStyle.getPropertyValue('--_fab-menu-close-button-container-width'), trigger) ||
    triggerRect.width;
  const closeButtonHeight =
    toPixelValue(triggerStyle.getPropertyValue('--_fab-menu-close-button-container-height'), trigger) ||
    triggerRect.height;
  const hasRootRect = rootRect.width || rootRect.height;
  const closeButtonLeft = props.alignment === 'start' ? rootRect.left : rootRect.right - closeButtonWidth;
  const anchorLeft = hasRootRect ? closeButtonLeft : triggerRect.left;
  const anchorRight = hasRootRect ? closeButtonLeft + closeButtonWidth : triggerRect.right;
  const anchorTop = hasRootRect ? rootRect.bottom - closeButtonHeight : triggerRect.top;

  const surfaceStyle = window.getComputedStyle(surface);
  const surfacePaddingInlineStart = toPixelValue(surfaceStyle.paddingInlineStart, surface);
  const surfacePaddingInlineEnd = toPixelValue(surfaceStyle.paddingInlineEnd, surface);
  const surfaceInlineSize = surface.getBoundingClientRect().width;
  const maxInlineOffset = Math.max(0, window.innerWidth - surfaceInlineSize);

  const getPreferredInlineStart = (alignment: 'start' | 'end') =>
    alignment === 'start'
      ? anchorLeft - surfacePaddingInlineStart
      : anchorRight + surfacePaddingInlineEnd - surfaceInlineSize;

  const requestedInlineStart = getPreferredInlineStart(props.alignment);
  const alternateAlignment = props.alignment === 'start' ? 'end' : 'start';
  const alternateInlineStart = getPreferredInlineStart(alternateAlignment);
  const getInlineOverflow = (inlineStart: number) =>
    Math.max(0, -inlineStart) + Math.max(0, inlineStart - maxInlineOffset);
  const requestedOverflow = getInlineOverflow(requestedInlineStart);
  const alternateOverflow = getInlineOverflow(alternateInlineStart);
  const nextEffectiveAlignment = alternateOverflow < requestedOverflow ? alternateAlignment : props.alignment;
  const preferredInlineStart = nextEffectiveAlignment === props.alignment ? requestedInlineStart : alternateInlineStart;
  const inlineStart = Math.min(Math.max(0, preferredInlineStart), maxInlineOffset);
  effectiveAlignment.value = nextEffectiveAlignment;
  menu.style.setProperty('--_fab-menu-popover-inline-start', `${inlineStart}px`);
  menu.style.setProperty('--_fab-menu-anchor-block-end', `${window.innerHeight - anchorTop}px`);
}

const menuActions = useMenu({
  menuId,
  menuRef,
  open,
  modelValue,
  multiple: () => false,
  onSelect: (event, itemElement) => emit('select', event, itemElement),
  exitElements: () => [surfaceRef.value],
  onClosed: () => emit('closed'),
});

function showPopover() {
  const menu = menuRef.value;
  if (!menu) return;

  updatePopoverPosition();
  if (menu.matches(':popover-open')) return;

  try {
    menu.showPopover(triggerRef.value ? { source: triggerRef.value } : undefined);
  } catch {
    menu.showPopover();
  }

  updatePopoverPosition();
}

function hidePopover() {
  const menu = menuRef.value;
  if (!menu?.matches(':popover-open')) return;

  menu.hidePopover();
}

async function show(focusFirst = false) {
  if (props.disabled) return;

  open.value = true;
  showPopover();
  await nextTick();
  updatePopoverPosition();

  if (focusFirst) {
    await nextTick();
    menuActions.focusItem(0);
  }
}

function hide(options: { restoreFocus?: boolean } = {}) {
  restoreFocusAfterClose = options.restoreFocus ?? false;
  open.value = false;
  hidePopover();
}

function toggle() {
  if (open.value) {
    hide();
    return;
  }

  void show();
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled) return;

  if (event.key === 'Escape' && open.value) {
    event.preventDefault();
    event.stopPropagation();
    hide({ restoreFocus: true });
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    event.stopPropagation();
    void show(true);
  }
}

function handleMenuToggle(event: Event) {
  const menu = event.currentTarget as HTMLElement | null;
  if (!menu) return;

  const nextState = (event as ToggleEvent).newState;
  const nextOpen = nextState ? nextState === 'open' : menu.matches(':popover-open');

  menuActions.onMenuToggle(event);

  if (nextOpen) {
    updatePopoverPosition();
    return;
  }

  if (restoreFocusAfterClose) {
    restoreFocusAfterClose = false;
    void nextTick(() => triggerRef.value?.focus());
  }
}

function handleMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    restoreFocusAfterClose = true;
  }

  menuActions.onMenuKeydown(event);
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!open.value) return;

  const target = event.target;

  if (!isNode(target)) {
    return;
  }

  if (triggerRef.value?.contains(target) || menuRef.value?.contains(target)) {
    return;
  }

  hide();
}

watch([menuRef, open], ([, nextOpen]) => (nextOpen ? showPopover() : hidePopover()), {
  immediate: true,
  flush: 'post',
});

useElementEnvironment(rootRef, (document) => {
  if (!document.defaultView) return;
  if (open.value) updatePopoverPosition();
  return watch(
    open,
    (nextOpen, _, onCleanup) => {
      if (!nextOpen) return;
      const stopViewportUpdates = registerSharedViewportChange(document, updatePopoverPosition);
      document.addEventListener('pointerdown', handleDocumentPointerDown, true);
      onCleanup(() => {
        stopViewportUpdates();
        document.removeEventListener('pointerdown', handleDocumentPointerDown, true);
      });
    },
    { immediate: true, flush: 'post' },
  );
});

defineExpose({
  show,
  hide,
  toggle,
  focusItem: menuActions.focusItem,
  menuRef,
  triggerRef,
});
const shape = provideShape(() => props.shape);
</script>

<template>
  <div
    ref="root"
    class="m3-fab-menu"
    data-scope="floating-action-button-menu"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    :data-color="color"
    :data-size="size"
    :data-alignment="alignment"
    :data-open="open ? 'true' : 'false'"
  >
    <button
      v-state-layer
      v-focus-ring
      :id="triggerId"
      ref="trigger"
      type="button"
      class="m3-state-layer m3-fab-menu-trigger"
      data-scope="floating-action-button-menu"
      data-part="trigger"
      :data-open="open ? 'true' : 'false'"
      :aria-label="ariaLabel"
      aria-haspopup="menu"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="menuId"
      :disabled="disabled"
      @click="toggle"
      @keydown="handleTriggerKeydown"
      v-bind="triggerPressShapeMorphAttrs"
    >
      <Icon
        :name="icon"
        class="m3-fab-menu-trigger-icon"
        data-scope="floating-action-button-menu"
        data-part="trigger-icon"
        :data-visible="open ? 'false' : 'true'"
        aria-hidden="true"
      />
      <Icon
        :name="closeIcon"
        class="m3-fab-menu-close-icon"
        data-scope="floating-action-button-menu"
        data-part="close-icon"
        :data-visible="open ? 'true' : 'false'"
        aria-hidden="true"
      />
    </button>

    <div
      :id="menuId"
      ref="menuRef"
      popover="manual"
      role="menu"
      aria-orientation="vertical"
      class="m3-fab-menu-popover"
      data-scope="floating-action-button-menu"
      data-part="popover"
      :data-color="color"
      :data-size="size"
      :data-alignment="alignment"
      :data-effective-alignment="effectiveAlignment"
      @toggle="handleMenuToggle"
      @click="menuActions.onMenuClick"
      @keydown="handleMenuKeydown"
      @focusin="menuActions.onMenuFocusIn"
    >
      <div ref="surface" class="m3-fab-menu-surface" data-scope="floating-action-button-menu" data-part="surface">
        <slot />
      </div>
    </div>
  </div>
</template>

<style src="./FloatingActionButtonMenu.css"></style>

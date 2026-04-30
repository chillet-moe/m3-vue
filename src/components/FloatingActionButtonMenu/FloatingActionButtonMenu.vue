<script setup lang="ts">
import { computed, nextTick, onUnmounted, provide, ref, useId, useTemplateRef, watch } from 'vue';

import { Icon } from '@/components/Icon';
import { usePressShapeMorph } from '@/composables/usePressShapeMorph';
import { floatingActionButtonMenuContextKey } from './FloatingActionButtonMenuContext';

export type FloatingActionButtonMenuProps = {
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
}>();

defineSlots<{
  /** Menu items, usually FloatingActionButtonMenuItem components. */
  default(): any;
}>();

const menuId = `fab-menu-${useId()}`;
const triggerId = `${menuId}-trigger`;
const rootRef = useTemplateRef<HTMLDivElement>('root');
const triggerRef = useTemplateRef<HTMLButtonElement>('trigger');
const menuRef = useTemplateRef<HTMLDivElement>('menu');
const restoreFocusAfterClose = ref(false);
const effectiveAlignment = ref<FloatingActionButtonMenuProps['alignment']>(props.alignment);

const disabled = computed(() => props.disabled);
const { pressShapeMorphAttrs: triggerPressShapeMorphAttrs } = usePressShapeMorph({ disabled });

provide(floatingActionButtonMenuContextKey, {
  id: menuId,
});

function isPopoverOpen(menu: HTMLElement) {
  return menu.matches(':popover-open');
}

function getMenuItemElements() {
  const menu = menuRef.value;
  if (!menu) return [] as HTMLElement[];

  return Array.from(
    menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled]):not([aria-disabled="true"])'),
  ).filter((item) => item.dataset.menuOwner === menuId);
}

function focusItem(index: number) {
  const items = getMenuItemElements();
  if (!items.length) return;

  const normalizedIndex = (index + items.length) % items.length;
  items[normalizedIndex]?.focus();
}

function toPixelValue(value: string | undefined, relativeTo?: Element | null) {
  if (!value) return 0;

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
  if (typeof window === 'undefined') return;

  const root = rootRef.value;
  const trigger = triggerRef.value;
  const menu = menuRef.value;
  if (!trigger || !menu) return;

  const rootRect = root?.getBoundingClientRect();
  const triggerRect = trigger.getBoundingClientRect();
  const triggerStyle = window.getComputedStyle(trigger);
  const closeButtonWidth =
    toPixelValue(triggerStyle.getPropertyValue('--_fab-menu-close-button-container-width'), trigger) ||
    triggerRect.width;
  const closeButtonHeight =
    toPixelValue(triggerStyle.getPropertyValue('--_fab-menu-close-button-container-height'), trigger) ||
    triggerRect.height;
  const hasRootRect = Boolean(rootRect && (rootRect.width || rootRect.height));
  const anchorLeft =
    hasRootRect && rootRect
      ? props.alignment === 'start'
        ? rootRect.left
        : rootRect.right - closeButtonWidth
      : triggerRect.left;
  const anchorRight =
    hasRootRect && rootRect
      ? props.alignment === 'start'
        ? rootRect.left + closeButtonWidth
        : rootRect.right
      : triggerRect.right;
  const anchorTop = hasRootRect && rootRect ? rootRect.bottom - closeButtonHeight : triggerRect.top;

  const surface = menu.querySelector<HTMLElement>('.m3-fab-menu-surface');
  const surfaceStyle = surface ? window.getComputedStyle(surface) : undefined;
  const surfacePaddingInlineStart = toPixelValue(surfaceStyle?.paddingInlineStart, surface);
  const surfacePaddingInlineEnd = toPixelValue(surfaceStyle?.paddingInlineEnd, surface);
  const itemButtonGap = toPixelValue(surfaceStyle?.rowGap, surface);
  const surfaceRect = surface?.getBoundingClientRect();
  const surfaceInlineSize = surfaceRect?.width ?? 0;
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
  const blockEnd = window.innerHeight - anchorTop + itemButtonGap;

  effectiveAlignment.value = nextEffectiveAlignment;
  menu.style.setProperty('--_fab-menu-popover-inline-start', `${inlineStart}px`);
  menu.style.setProperty('--_fab-menu-popover-block-end', `${Math.max(0, blockEnd)}px`);
}

function showPopover() {
  const menu = menuRef.value;
  if (!menu || isPopoverOpen(menu)) return;

  updatePopoverPosition();

  try {
    menu.showPopover({ source: triggerRef.value } as any);
  } catch {
    menu.showPopover();
  }

  updatePopoverPosition();
}

function hidePopover() {
  const menu = menuRef.value;
  if (!menu || !isPopoverOpen(menu)) return;

  menu.hidePopover();
}

async function show(focusFirst = false) {
  if (props.disabled) return;

  open.value = true;
  await nextTick();
  showPopover();

  if (focusFirst) {
    await nextTick();
    focusItem(0);
  }
}

function hide(options: { restoreFocus?: boolean } = {}) {
  restoreFocusAfterClose.value = options.restoreFocus ?? false;
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

  const nextState = (event as Event & { newState?: 'open' | 'closed' }).newState;
  const nextOpen = nextState === 'open' ? true : nextState === 'closed' ? false : isPopoverOpen(menu);

  if (nextOpen) {
    open.value = true;
    updatePopoverPosition();
    return;
  }

  open.value = false;

  if (restoreFocusAfterClose.value) {
    restoreFocusAfterClose.value = false;
    void nextTick(() => triggerRef.value?.focus());
  }
}

function handleMenuClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const item = target.closest<HTMLElement>('[role="menuitem"]');
  if (!item || item.dataset.menuOwner !== menuId || item.matches('[disabled], [aria-disabled="true"]')) return;

  emit('select', event, item);

  if (item.dataset.closeOnSelect !== 'false') {
    hide();
  }
}

function handleMenuKeydown(event: KeyboardEvent) {
  const items = getMenuItemElements();
  const currentIndex = items.findIndex((item) => item === document.activeElement);

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    event.stopPropagation();
    focusItem(currentIndex + 1);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    event.stopPropagation();
    focusItem(currentIndex - 1);
    return;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    event.stopPropagation();
    focusItem(0);
    return;
  }

  if (event.key === 'End') {
    event.preventDefault();
    event.stopPropagation();
    focusItem(items.length - 1);
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    hide({ restoreFocus: true });
  }
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!open.value) return;

  const target = event.target;

  if (!(target instanceof Node)) {
    return;
  }

  if (triggerRef.value?.contains(target) || menuRef.value?.contains(target)) {
    return;
  }

  hide();
}

watch(
  [menuRef, open],
  ([menu, nextOpen]) => {
    if (!menu) return;

    if (nextOpen) {
      showPopover();
      return;
    }

    hidePopover();
  },
  { immediate: true, flush: 'post' },
);

if (typeof window !== 'undefined') {
  window.addEventListener('resize', updatePopoverPosition);
  window.addEventListener('scroll', updatePopoverPosition, true);
  document.addEventListener('pointerdown', handleDocumentPointerDown, true);
}

onUnmounted(() => {
  if (typeof window === 'undefined') return;

  window.removeEventListener('resize', updatePopoverPosition);
  window.removeEventListener('scroll', updatePopoverPosition, true);
  document.removeEventListener('pointerdown', handleDocumentPointerDown, true);
});

defineExpose({
  show,
  hide,
  toggle,
  focusItem,
  menuRef,
  triggerRef,
});
</script>

<template>
  <div
    ref="root"
    class="m3-fab-menu"
    data-scope="floating-action-button-menu"
    data-part="root"
    :data-color="color"
    :data-size="size"
    :data-alignment="alignment"
    :data-open="open ? 'true' : 'false'"
  >
    <button
      :id="triggerId"
      ref="trigger"
      type="button"
      :class="['m3-state-layer', 'm3-fab-menu-trigger']"
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
      ref="menu"
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
      @click="handleMenuClick"
      @keydown="handleMenuKeydown"
    >
      <div class="m3-fab-menu-surface" data-scope="floating-action-button-menu" data-part="surface">
        <div class="m3-fab-menu-items" data-scope="floating-action-button-menu" data-part="items">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./FloatingActionButtonMenu.css"></style>

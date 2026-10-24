import { useElementEnvironment, isHTMLElement } from '@/internal/elementEnvironment';
import { nextTick, onBeforeUnmount, reactive, watch, type Ref } from 'vue';
import { setupTooltip } from '@/directives/Tooltip/setup';

export type DelegatedTooltipSlotState = 'idle' | 'opening' | 'open' | 'closing';

export type DelegatedTooltipSlot<T> = {
  id: string;
  anchorName: string;
  tooltip: T | null;
  anchor: HTMLElement | null;
  state: DelegatedTooltipSlotState;
  generation: number;
  hideTimeout: number;
  lastActivatedAt: number;
};

type ResolveTooltip<T> = (anchor: HTMLElement) => T | null;
type GetAnchorElement = (target: EventTarget | null) => HTMLElement | null;
type TooltipController = ReturnType<typeof setupTooltip>;

const TOOLTIP_ANIMATION_MS = 120;
const TOOLTIP_POINTER_SWITCH_DELAY_MS = 20;

/**
 * Delegates non-interactive tooltip behavior from a high-cardinality container.
 *
 * The caller owns rendering the returned slots, which keeps rich markup in Vue
 * while bounding tooltip surfaces and interaction listeners to the slot pool.
 * Interactive tooltips must keep using independent `v-tooltip` instances.
 */
export function useDelegatedTooltip<T>(
  container: Ref<HTMLElement | undefined>,
  tooltipId: string,
  resolveTooltip: ResolveTooltip<T>,
  getAnchorElement: GetAnchorElement,
  maxVisible = 3,
) {
  const slotCount = Number.isFinite(maxVisible) ? Math.max(1, Math.floor(maxVisible)) : 1;
  const tooltipSlots = Array.from(
    { length: slotCount },
    (_, index) =>
      reactive({
        id: `${tooltipId}-${index}`,
        anchorName: `--${tooltipId}-anchor-${index}`,
        tooltip: null as T | null,
        anchor: null as HTMLElement | null,
        state: 'idle' as DelegatedTooltipSlotState,
        generation: 0,
        hideTimeout: 0,
        lastActivatedAt: 0,
      }) as DelegatedTooltipSlot<T>,
  );

  const controllers = new WeakMap<object, TooltipController>();
  let activeSlot: DelegatedTooltipSlot<T> | null = null;
  let cleanupContainerListeners: (() => void) | null = null;
  let hoverTimeout = 0;
  let pendingHoverAnchor: HTMLElement | null = null;

  let boundView = container.value?.ownerDocument.defaultView;
  const getView = () => boundView;

  const clearHideTimeout = (slot: DelegatedTooltipSlot<T>) => {
    if (!slot.hideTimeout) {
      return;
    }

    const view = getView();
    if (view) {
      view.clearTimeout(slot.hideTimeout);
    } else {
      globalThis.clearTimeout(slot.hideTimeout);
    }
    slot.hideTimeout = 0;
  };

  const clearPendingHover = () => {
    if (hoverTimeout) {
      const view = getView();
      if (view) {
        view.clearTimeout(hoverTimeout);
      } else {
        globalThis.clearTimeout(hoverTimeout);
      }
      hoverTimeout = 0;
    }

    pendingHoverAnchor = null;
  };

  const getTooltipElement = (slot: DelegatedTooltipSlot<T>) => {
    const ownerDocument = container.value?.ownerDocument;
    if (!ownerDocument) {
      return null;
    }

    const element = ownerDocument.getElementById(slot.id);
    return isHTMLElement(element) ? element : null;
  };

  const cleanupSlot = (slot: DelegatedTooltipSlot<T>) => {
    slot.generation += 1;
    clearHideTimeout(slot);
    const controller = controllers.get(slot);
    controller?.hide();
    controller?.cleanup();
    controllers.delete(slot);
    slot.anchor = null;
    slot.tooltip = null;
    slot.state = 'idle';
  };

  const startHideSlot = (slot: DelegatedTooltipSlot<T>) => {
    if (slot.state === 'idle') {
      return;
    }

    slot.generation += 1;
    const currentGeneration = slot.generation;
    const view = getView();
    clearHideTimeout(slot);
    slot.state = 'closing';
    controllers.get(slot)?.hide();

    if (!view) {
      cleanupSlot(slot);
      return;
    }

    slot.hideTimeout = view.setTimeout(() => {
      if (slot.generation !== currentGeneration) {
        return;
      }

      cleanupSlot(slot);
    }, TOOLTIP_ANIMATION_MS);
  };

  const pickSlot = (anchor: HTMLElement) => {
    const existing = tooltipSlots.find((slot) => slot.anchor === anchor && slot.state !== 'idle');
    if (existing) {
      return existing;
    }

    const idleSlot = tooltipSlots.find((slot) => slot.state === 'idle');
    if (idleSlot) {
      return idleSlot;
    }

    const closingSlot = [...tooltipSlots]
      .filter((slot) => slot.state === 'closing')
      .sort((left, right) => left.lastActivatedAt - right.lastActivatedAt)[0];
    if (closingSlot) {
      return closingSlot;
    }

    return [...tooltipSlots].sort((left, right) => left.lastActivatedAt - right.lastActivatedAt)[0]!;
  };

  const showSlot = async (slot: DelegatedTooltipSlot<T>, anchor: HTMLElement, tooltip: T) => {
    const view = getView();
    if (!view) {
      return;
    }

    const previousController = controllers.get(slot);
    if (previousController) {
      previousController.hide();
      previousController.cleanup();
      controllers.delete(slot);
    }

    slot.generation += 1;
    const currentGeneration = slot.generation;
    clearHideTimeout(slot);
    slot.anchor = anchor;
    slot.tooltip = tooltip;
    slot.state = 'opening';
    slot.lastActivatedAt = Date.now();

    await nextTick();

    if (slot.generation !== currentGeneration) {
      return;
    }

    const tooltipElement = getTooltipElement(slot);
    if (!tooltipElement || !anchor.isConnected) {
      cleanupSlot(slot);
      return;
    }

    const controller = setupTooltip(
      anchor,
      {
        target: tooltipElement,
        interactive: false,
        placement: 'top',
        popoverType: 'hint',
        triggerAria: 'describedby',
      },
      { anchorName: slot.anchorName, manual: true, triggerAria: 'describedby' },
    );
    controllers.set(slot, controller);
    controller.show();
    slot.state = 'open';
  };

  const updateSlotTooltip = (slot: DelegatedTooltipSlot<T>, anchor: HTMLElement, tooltip: T) => {
    const generation = slot.generation;
    slot.tooltip = tooltip;
    void nextTick().then(() => {
      if (slot.generation !== generation || slot.anchor !== anchor || slot.state === 'idle') {
        return;
      }

      controllers.get(slot)?.reposition();
    });
  };

  const syncTooltipForAnchor = (anchor: HTMLElement | null) => {
    if (!anchor) {
      if (activeSlot) {
        startHideSlot(activeSlot);
        activeSlot = null;
      }
      return;
    }

    const tooltip = resolveTooltip(anchor);
    if (tooltip === null) {
      if (activeSlot) {
        startHideSlot(activeSlot);
        activeSlot = null;
      }
      return;
    }

    if (activeSlot?.anchor === anchor && activeSlot.state !== 'closing') {
      if (activeSlot.tooltip !== tooltip) {
        updateSlotTooltip(activeSlot, anchor, tooltip);
      }
      return;
    }

    if (activeSlot && activeSlot.anchor !== anchor) {
      startHideSlot(activeSlot);
      activeSlot = null;
    }

    const slot = pickSlot(anchor);
    if (slot !== activeSlot && slot.state !== 'idle') {
      startHideSlot(slot);
    }

    activeSlot = slot;
    void showSlot(slot, anchor, tooltip);
  };

  const scheduleTooltipForPointerAnchor = (anchor: HTMLElement | null) => {
    const view = getView();
    if (!view) {
      return;
    }

    if (!anchor) {
      clearPendingHover();
      syncTooltipForAnchor(null);
      return;
    }

    if (activeSlot?.anchor === anchor && activeSlot.state !== 'closing') {
      clearPendingHover();
      return;
    }

    if (!activeSlot || activeSlot.state === 'closing') {
      clearPendingHover();
      syncTooltipForAnchor(anchor);
      return;
    }

    if (pendingHoverAnchor === anchor) {
      return;
    }

    clearPendingHover();
    pendingHoverAnchor = anchor;
    hoverTimeout = view.setTimeout(() => {
      hoverTimeout = 0;
      const nextAnchor = pendingHoverAnchor;
      pendingHoverAnchor = null;
      const currentContainer = container.value;

      if (!nextAnchor || !currentContainer?.contains(nextAnchor) || !nextAnchor.isConnected) {
        return;
      }

      syncTooltipForAnchor(nextAnchor);
    }, TOOLTIP_POINTER_SWITCH_DELAY_MS);
  };

  const refreshTooltip = () => {
    if (!activeSlot?.anchor) {
      return;
    }

    const currentContainer = container.value;
    if (!currentContainer || !currentContainer.contains(activeSlot.anchor) || !activeSlot.anchor.isConnected) {
      startHideSlot(activeSlot);
      activeSlot = null;
      return;
    }

    const nextTooltip = resolveTooltip(activeSlot.anchor);
    if (nextTooltip === null) {
      startHideSlot(activeSlot);
      activeSlot = null;
      return;
    }

    updateSlotTooltip(activeSlot, activeSlot.anchor, nextTooltip);
  };

  watch(
    container,
    (element, previousElement) => {
      cleanupContainerListeners?.();
      cleanupContainerListeners = null;
      clearPendingHover();

      if (!element) {
        for (const slot of tooltipSlots) {
          cleanupSlot(slot);
        }
        activeSlot = null;
        return;
      }

      if (previousElement && previousElement !== element) {
        for (const slot of tooltipSlots) {
          cleanupSlot(slot);
        }
        activeSlot = null;
      }

      const onPointerOver = (event: PointerEvent) => {
        scheduleTooltipForPointerAnchor(getAnchorElement(event.target));
      };

      const onPointerLeave = () => {
        scheduleTooltipForPointerAnchor(null);
      };

      const onFocusIn = (event: FocusEvent) => {
        clearPendingHover();
        syncTooltipForAnchor(getAnchorElement(event.target));
      };

      const onFocusOut = (event: FocusEvent) => {
        clearPendingHover();
        syncTooltipForAnchor(getAnchorElement(event.relatedTarget));
      };

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          syncTooltipForAnchor(null);
        }
      };

      element.addEventListener('pointerover', onPointerOver);
      element.addEventListener('pointerleave', onPointerLeave);
      element.addEventListener('focusin', onFocusIn);
      element.addEventListener('focusout', onFocusOut);
      element.addEventListener('keydown', onKeyDown);

      cleanupContainerListeners = () => {
        element.removeEventListener('pointerover', onPointerOver);
        element.removeEventListener('pointerleave', onPointerLeave);
        element.removeEventListener('focusin', onFocusIn);
        element.removeEventListener('focusout', onFocusOut);
        element.removeEventListener('keydown', onKeyDown);
      };
    },
    { immediate: true },
  );

  useElementEnvironment(container, (document) => {
    boundView = document.defaultView;
    return () => {
      // Timers belong to the previous view even after ownerDocument changes.
      clearPendingHover();
      for (const slot of tooltipSlots) cleanupSlot(slot);
      activeSlot = null;
      boundView = null;
    };
  });

  onBeforeUnmount(() => {
    cleanupContainerListeners?.();
    clearPendingHover();
    for (const slot of tooltipSlots) {
      cleanupSlot(slot);
    }
    activeSlot = null;
  });

  return {
    tooltipSlots,
    refreshTooltip,
  };
}

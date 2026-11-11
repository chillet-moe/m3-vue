import { useElementEnvironment, bindElementEnvironment } from '@/internal/elementEnvironment';
import {
  computed,
  defineComponent,
  h,
  nextTick,
  shallowReactive,
  shallowRef,
  triggerRef,
  useTemplateRef,
  watch,
  type FunctionalComponent,
  type PropType,
  type ShallowRef,
  type VNodeChild,
} from 'vue';
import {
  showOverlayEntry,
  type OverlayHostController,
  type OverlayEntryHandle,
} from '@/internal/overlayHost/overlayHost';
import './PopoverStackHost.css';

type PopoverStackItemRecord = {
  id: number;
  closing: ShallowRef<boolean>;
  render: () => VNodeChild;
  onHostUnmounted?: (error: Error) => void;
};

type PopoverStackConfig = {
  popoverClass?: string;
  stackClass?: string;
  itemClass?: string;
  role?: string;
  ariaLive?: 'off' | 'polite' | 'assertive';
  ariaAtomic?: 'true' | 'false';
  dataAttributes?: Record<string, string | undefined>;
};

type PopoverStackState = {
  items: ShallowRef<PopoverStackItemRecord[]>;
  config: PopoverStackConfig;
};

type PopoverStackController = {
  getHost: () => HTMLDivElement | null;
  overlayHandle: OverlayEntryHandle;
  state: PopoverStackState;
};

export type ShowPopoverStackItemOptions = PopoverStackConfig & {
  stackId: string;
  render: () => VNodeChild;
  onHostUnmounted?: (error: Error) => void;
};

export type PopoverStackItemHandle = {
  close: () => void;
};

const stacks = new WeakMap<OverlayHostController, Map<string, PopoverStackController>>();
function controllers(host: OverlayHostController) {
  let value = stacks.get(host);
  if (!value) {
    value = new Map();
    stacks.set(host, value);
  }
  return value;
}
let nextItemId = 0;

function parseTimeValue(value: string): number {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  if (trimmed.endsWith('ms')) {
    return Number.parseFloat(trimmed);
  }

  if (trimmed.endsWith('s')) {
    return Number.parseFloat(trimmed) * 1000;
  }

  return 0;
}

function getMaxTimingValue(values: string): number {
  return values
    .split(',')
    .map(parseTimeValue)
    .reduce((max, current) => Math.max(max, current), 0);
}

function getExitDuration(element: HTMLElement | null): number {
  if (!element) {
    return 0;
  }

  const style = element.ownerDocument.defaultView!.getComputedStyle(element);
  const transitionDuration = getMaxTimingValue(style.transitionDuration);
  const transitionDelay = getMaxTimingValue(style.transitionDelay);
  const animationDuration = getMaxTimingValue(style.animationDuration);
  const animationDelay = getMaxTimingValue(style.animationDelay);

  return Math.max(transitionDuration + transitionDelay, animationDuration + animationDelay);
}

function updatePopoverState(element: HTMLElement, open: boolean) {
  if (open) {
    element.hidden = false;
    element.dataset.popoverOpen = 'true';
    return;
  }

  delete element.dataset.popoverOpen;
  element.hidden = true;
}

function showPopoverElement(element: HTMLElement) {
  updatePopoverState(element, true);

  if (typeof (element as HTMLElement & { showPopover?: () => void }).showPopover !== 'function') {
    return;
  }

  try {
    (element as HTMLElement & { showPopover: () => void }).showPopover();
  } catch {}
}

function hidePopoverElement(element: HTMLElement) {
  if (typeof (element as HTMLElement & { hidePopover?: () => void }).hidePopover === 'function') {
    try {
      (element as HTMLElement & { hidePopover: () => void }).hidePopover();
    } catch {}
  }

  updatePopoverState(element, false);
}

// Isolate each item's render so a staggered timeout only updates the affected item.
const PopoverStackItem: FunctionalComponent<{ item: PopoverStackItemRecord; itemClass?: string }> = ({
  item,
  itemClass,
}) =>
  h(
    'div',
    {
      'data-stack-item-id': item.id,
      'data-state': item.closing.value ? 'closing' : 'open',
      class: ['m3-popover-stack-item', itemClass],
    },
    [item.render()],
  );

PopoverStackItem.props = ['item', 'itemClass'];

const PopoverStackHost = defineComponent({
  name: 'PopoverStackHost',
  props: {
    state: {
      type: Object as PropType<PopoverStackState>,
      required: true,
    },
  },
  setup(props, { expose }) {
    const popoverRef = useTemplateRef<HTMLDivElement>('popover');
    const hasVisibleContent = computed(() => props.state.items.value.length > 0);

    useElementEnvironment(popoverRef, () => {
      if (hasVisibleContent.value) showPopoverElement(popoverRef.value!);
    });

    expose({
      popoverRef,
    });

    watch(
      [popoverRef, hasVisibleContent],
      async ([popover, nextVisible]) => {
        if (!popover) {
          return;
        }

        await nextTick();

        if (nextVisible) {
          showPopoverElement(popover);
          return;
        }

        hidePopoverElement(popover);
      },
      {
        immediate: true,
        flush: 'post',
      },
    );

    return () =>
      h(
        'div',
        {
          ref: 'popover',
          popover: 'manual',
          hidden: hasVisibleContent.value ? undefined : true,
          class: ['m3-popover-stack-popover', props.state.config.popoverClass],
          role: props.state.config.role,
          'aria-live': props.state.config.ariaLive,
          'aria-atomic': props.state.config.ariaAtomic,
          ...props.state.config.dataAttributes,
        },
        [
          h(
            'div',
            {
              class: ['m3-popover-stack', props.state.config.stackClass],
            },
            props.state.items.value.map((item) =>
              h(PopoverStackItem, { key: item.id, item, itemClass: props.state.config.itemClass }),
            ),
          ),
        ],
      );
  },
});

function teardownPopoverStack(host: OverlayHostController, stackId: string) {
  const stackControllers = controllers(host);
  const controller = stackControllers.get(stackId);

  if (!controller) {
    return;
  }

  controller.overlayHandle.remove();
  stackControllers.delete(stackId);
}

function ensurePopoverStack(owner: OverlayHostController, options: ShowPopoverStackItemOptions) {
  const { stackId } = options;
  const stackControllers = controllers(owner);
  const existing = stackControllers.get(stackId);

  if (existing) {
    existing.state.config.popoverClass = options.popoverClass;
    existing.state.config.stackClass = options.stackClass;
    existing.state.config.itemClass = options.itemClass;
    existing.state.config.role = options.role;
    existing.state.config.ariaLive = options.ariaLive;
    existing.state.config.ariaAtomic = options.ariaAtomic;
    existing.state.config.dataAttributes = options.dataAttributes;
    return existing;
  }

  const state: PopoverStackState = {
    items: shallowRef([]),
    config: shallowReactive({
      popoverClass: options.popoverClass,
      stackClass: options.stackClass,
      itemClass: options.itemClass,
      role: options.role,
      ariaLive: options.ariaLive,
      ariaAtomic: options.ariaAtomic,
      dataAttributes: options.dataAttributes,
    }),
  };

  let host: HTMLDivElement | null = null;

  const overlayHandle = showOverlayEntry(owner, {
    onHostUnmounted: (error) => {
      stackControllers.delete(stackId);

      const pending = state.items.value;
      state.items.value = [];
      for (const item of pending) item.onHostUnmounted?.(error);
    },
    render: () =>
      h(PopoverStackHost, {
        ref: (instance: unknown) => {
          host = (instance as { popoverRef?: HTMLDivElement | null } | null)?.popoverRef ?? null;
        },
        state,
      }),
  });

  const controller = {
    getHost: () => host,
    overlayHandle,
    state,
  };

  stackControllers.set(stackId, controller);
  return controller;
}

export function showPopoverStackItem(
  owner: OverlayHostController,
  options: ShowPopoverStackItemOptions,
): PopoverStackItemHandle {
  if (typeof document === 'undefined') {
    throw new Error('showPopoverStackItem requires a browser environment.');
  }

  const controller = ensurePopoverStack(owner, options);
  const itemId = ++nextItemId;
  let disposed = false;
  let releaseExit: (() => void) | undefined;

  const item: PopoverStackItemRecord = {
    id: itemId,
    closing: shallowRef(false),
    render: options.render,
    onHostUnmounted: (error) => {
      disposed = true;
      releaseExit?.();
      options.onHostUnmounted?.(error);
    },
  };
  controller.state.items.value.push(item);
  triggerRef(controller.state.items);

  const removeItem = () => {
    if (disposed) return;
    disposed = true;
    releaseExit?.();
    const items = controller.state.items.value;
    const index = items.indexOf(item);
    if (index !== -1) items.splice(index, 1);
    triggerRef(controller.state.items);

    if (controller.state.items.value.length > 0) {
      return;
    }

    queueMicrotask(() => {
      if (controller.state.items.value.length > 0) {
        return;
      }

      if (controllers(owner).get(options.stackId) === controller) teardownPopoverStack(owner, options.stackId);
    });
  };

  const close = () => {
    if (item.closing.value) {
      return;
    }

    item.closing.value = true;

    void nextTick(() => {
      if (disposed) return;
      const itemElement = controller.getHost()?.querySelector(`[data-stack-item-id="${itemId}"]`) as HTMLElement | null;
      const exitDuration = getExitDuration(itemElement);

      if (exitDuration === 0) {
        queueMicrotask(removeItem);
        return;
      }

      if (!itemElement) {
        removeItem();
        return;
      }
      releaseExit = bindElementEnvironment(itemElement, (document) => {
        const view = document.defaultView!;
        const timer = view.setTimeout(removeItem, exitDuration + 50);
        return () => view.clearTimeout(timer);
      });
    });
  };

  return { close };
}

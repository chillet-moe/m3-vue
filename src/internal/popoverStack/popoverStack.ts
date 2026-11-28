import { useElementEnvironment, bindElementEnvironment } from '@/internal/elementEnvironment';
import {
  computed,
  defineComponent,
  h,
  nextTick,
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

type PopoverStackItemOptions = {
  /** Ordered items precede unordered items. Equal orders retain insertion order. */
  order?: number;
  itemClass?: string;
  render: () => VNodeChild;
  onHostUnmounted?: (error: Error) => void;
};

type PopoverStackItemRecord = PopoverStackItemOptions & {
  id: number;
  closing: ShallowRef<boolean>;
};

type PopoverStackConfig = {
  stackId: string;
  popoverClass?: string;
  stackClass?: string;
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

export type PopoverStackItemHandle = {
  close: () => void;
};

// A caller can keep close (including a destructured copy) beyond the item's lifetime.
function createCloseHandle(startExit: (() => void) | undefined) {
  return {
    close: () => startExit?.(),
    release: () => {
      startExit = undefined;
    },
  };
}

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

// Isolate each item's render so a staggered timeout only updates the affected item.
const PopoverStackItem: FunctionalComponent<{ item: PopoverStackItemRecord }> = ({ item }) =>
  h(
    'div',
    {
      'data-stack-item-id': item.id,
      'data-state': item.closing.value ? 'closing' : 'open',
      class: ['m3-popover-stack-item', item.itemClass],
    },
    [item.render()],
  );

PopoverStackItem.props = ['item'];

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

    const syncVisibility = (popover: HTMLElement) => {
      if (hasVisibleContent.value) popover.showPopover();
      else popover.hidePopover();
    };
    useElementEnvironment(popoverRef, (_, popover) => syncVisibility(popover));

    expose({
      popoverRef,
    });

    watch(
      hasVisibleContent,
      () => {
        if (popoverRef.value) syncVisibility(popoverRef.value);
      },
      { flush: 'post' },
    );

    return () =>
      h(
        'div',
        {
          ref: 'popover',
          popover: 'manual',
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
            props.state.items.value.map((item) => h(PopoverStackItem, { key: item.id, item })),
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

function ensurePopoverStack(owner: OverlayHostController, config: PopoverStackConfig) {
  const { stackId } = config;
  const stackControllers = controllers(owner);
  const existing = stackControllers.get(stackId);

  if (existing) return existing;

  const state: PopoverStackState = {
    items: shallowRef([]),
    config,
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
  config: PopoverStackConfig,
  options: PopoverStackItemOptions,
): PopoverStackItemHandle {
  if (typeof document === 'undefined') {
    throw new Error('showPopoverStackItem requires a browser environment.');
  }

  const controller = ensurePopoverStack(owner, config);
  const itemId = ++nextItemId;
  let disposed = false;
  let releaseExit: (() => void) | undefined;
  const { close, release } = createCloseHandle(startExit);

  const dispose = () => {
    disposed = true;
    release();
    releaseExit?.();
  };

  const item: PopoverStackItemRecord = {
    ...options,
    id: itemId,
    closing: shallowRef(false),
    onHostUnmounted: (error) => {
      dispose();
      options.onHostUnmounted?.(error);
    },
  };
  const items = controller.state.items.value;
  const { order } = item;
  const insertBefore =
    order === undefined ? -1 : items.findIndex((other) => other.order === undefined || other.order > order);
  if (insertBefore === -1) items.push(item);
  else items.splice(insertBefore, 0, item);
  triggerRef(controller.state.items);

  const removeItem = () => {
    if (disposed) return;
    dispose();
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

      if (controllers(owner).get(config.stackId) === controller) teardownPopoverStack(owner, config.stackId);
    });
  };

  function startExit() {
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
  }

  return { close };
}

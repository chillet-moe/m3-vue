import {
  computed,
  createApp,
  defineComponent,
  h,
  nextTick,
  shallowReactive,
  shallowRef,
  useTemplateRef,
  watch,
  type App,
  type PropType,
  type ShallowRef,
  type VNodeChild,
} from 'vue';
import './PopoverStackHost.css';

type PopoverStackItemRecord = {
  id: number;
  closing: boolean;
  render: () => VNodeChild;
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
  host: HTMLDivElement;
  app: App;
  state: PopoverStackState;
};

export type ShowPopoverStackItemOptions = PopoverStackConfig & {
  stackId: string;
  render: () => VNodeChild;
};

export type PopoverStackItemHandle = {
  close: () => void;
};

const stackControllers = new Map<string, PopoverStackController>();
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

  const style = window.getComputedStyle(element);
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

const PopoverStackHost = defineComponent({
  name: 'PopoverStackHost',
  props: {
    state: {
      type: Object as PropType<PopoverStackState>,
      required: true,
    },
  },
  setup(props) {
    const popoverRef = useTemplateRef<HTMLDivElement>('popover');
    const hasVisibleContent = computed(() => props.state.items.value.length > 0);

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
              h(
                'div',
                {
                  key: item.id,
                  'data-stack-item-id': item.id,
                  'data-state': item.closing ? 'closing' : 'open',
                  class: ['m3-popover-stack-item', props.state.config.itemClass],
                },
                [item.render()],
              ),
            ),
          ),
        ],
      );
  },
});

function teardownPopoverStack(stackId: string) {
  const controller = stackControllers.get(stackId);

  if (!controller) {
    return;
  }

  controller.app.unmount();
  controller.host.remove();
  stackControllers.delete(stackId);
}

function ensurePopoverStack(options: ShowPopoverStackItemOptions) {
  const existing = stackControllers.get(options.stackId);

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

  const host = document.createElement('div');
  document.body.appendChild(host);

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

  const app = createApp(PopoverStackHost, { state });
  app.mount(host);

  const controller = {
    host,
    app,
    state,
  };

  stackControllers.set(options.stackId, controller);
  return controller;
}

export function showPopoverStackItem(options: ShowPopoverStackItemOptions): PopoverStackItemHandle {
  if (typeof document === 'undefined') {
    throw new Error('showPopoverStackItem requires a browser environment.');
  }

  const controller = ensurePopoverStack(options);
  const itemId = ++nextItemId;
  let closed = false;

  controller.state.items.value = [
    ...controller.state.items.value,
    {
      id: itemId,
      closing: false,
      render: options.render,
    },
  ];

  const removeItem = () => {
    controller.state.items.value = controller.state.items.value.filter((item) => item.id !== itemId);

    if (controller.state.items.value.length > 0) {
      return;
    }

    queueMicrotask(() => {
      if (controller.state.items.value.length > 0) {
        return;
      }

      teardownPopoverStack(options.stackId);
    });
  };

  const close = () => {
    if (closed) {
      return;
    }

    closed = true;
    controller.state.items.value = controller.state.items.value.map((item) =>
      item.id === itemId
        ? {
            ...item,
            closing: true,
          }
        : item,
    );

    void nextTick(() => {
      const itemElement = controller.host.querySelector(`[data-stack-item-id="${itemId}"]`) as HTMLElement | null;
      const exitDuration = getExitDuration(itemElement);

      if (exitDuration === 0) {
        queueMicrotask(removeItem);
        return;
      }

      window.setTimeout(removeItem, exitDuration + 50);
    });
  };

  return { close };
}

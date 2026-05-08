import type { ObjectDirective } from 'vue';

export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';

export type TooltipConfig = {
  /** Existing tooltip element to control. */
  target?: string | HTMLElement;
  /** Text used when the directive creates the tooltip element. */
  content?: string;
  /**
   * Logical placement around the trigger.
   * @default top
   */
  placement?: Placement;
  /**
   * Applied through CSS translate.
   * @default 0.25rem
   */
  offset?: string;
  /**
   * Uses dialog semantics when true, tooltip semantics when false.
   * @default true
   */
  interactive?: boolean;
  /**
   * Popover mode of the tooltip element.
   * @default hint
   */
  popoverType?: 'hint' | 'auto' | 'manual';
  /**
   * Delay before showing on hover, in milliseconds.
   * @default 60
   */
  openDelay?: number;
  /**
   * Delay before closing on pointer leave, in milliseconds.
   * @default 80
   */
  closeDelay?: number;
  /**
   * Touch long-press delay, in milliseconds.
   * @default 450
   */
  longpressDelay?: number;
};

export type VTooltipBinding = string | HTMLElement | TooltipConfig | undefined;
export type TooltipBindingValue = Exclude<VTooltipBinding, undefined>;

export type NormalizedTooltipOptions = {
  placement: Placement;
  offset: string;
  interactive: boolean;
  popoverType: 'hint' | 'auto' | 'manual';
  openDelay: number;
  closeDelay: number;
  longpressDelay: number;
  animDuration: number;
  target?: string | HTMLElement;
  content?: string;
};

export type State = {
  tip: HTMLElement;
  usesAnchorPositioning: boolean;
  cleanup: () => void;
  update: (next: TooltipBindingValue) => void;
  show: () => void;
  hide: () => void;
  reposition: () => void;
};

export type TooltipDirective = ObjectDirective<HTMLElement, VTooltipBinding>;

import type { ObjectDirective } from 'vue';

export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';

export type TooltipConfig = {
  target?: string | HTMLElement;
  content?: string;
  placement?: Placement;
  offset?: string;
  interactive?: boolean;
  popoverType?: 'hint' | 'auto' | 'manual';
  openDelay?: number;
  closeDelay?: number;
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
  cleanup: () => void;
  update: (next: TooltipBindingValue) => void;
  show: () => void;
  hide: () => void;
  reposition: () => void;
};

export type TooltipDirective = ObjectDirective<HTMLElement, VTooltipBinding>;

import type { App, Directive, Plugin } from 'vue';
import type { DropdownTargetBinding } from '@/directives/Dropdown';
import { vContextMenu, vDropdown, vDropdownMenu } from './directives/Menu';
import type { MenuTargetBinding } from './directives/Menu/helpers';
import type { TooltipDirective } from './directives/Tooltip/types';
import vTooltip from './directives/Tooltip/vTooltip';
import { initStateLayer } from '@/components/StateLayer/state-layer.ts';

export const m3VueDirectives = {
  tooltip: vTooltip,
  dropdown: vDropdown,
  dropdownMenu: vDropdownMenu,
  contextMenu: vContextMenu,
} as const satisfies Record<string, Directive>;

export const m3VueDirectiveNames = Object.freeze(Object.keys(m3VueDirectives) as Array<keyof typeof m3VueDirectives>);

export const M3VuePlugin = {
  install(app: App) {
    for (const name of m3VueDirectiveNames) {
      app.directive(name, m3VueDirectives[name] as Directive);
    }

    initStateLayer();
  },
} satisfies Plugin;

declare module 'vue' {
  export interface GlobalDirectives {
    vTooltip: TooltipDirective;
    vDropdown: Directive<HTMLElement, DropdownTargetBinding>;
    vDropdownMenu: Directive<HTMLElement, DropdownTargetBinding>;
    vContextMenu: Directive<HTMLElement, MenuTargetBinding>;
  }
}

import type { M3Preset } from './presets/types';
import type { App, Directive, Plugin } from 'vue';
import { installM3InteractionDefaults, type M3ComponentDefaultsOptions } from './defaults';
import type { DropdownTargetBinding } from '@/directives/Dropdown';
import { vContextMenu, vDropdown, vDropdownMenu } from './directives/Menu';
import type { MenuTargetBinding } from './directives/Menu/helpers';
import type { TooltipDirective } from './directives/Tooltip/types';
import vTooltip from './directives/Tooltip/vTooltip';
import { installM3Snackbar, type M3SnackbarOptions } from '@/components/Snackbar/config';
import { installM3Locale } from '@/locales/context';
import type { M3LocaleOptions } from '@/locales/types';
import { installM3StyleDefaults, type M3FieldOptions, type M3ShapeOptions } from './styles/context';

export const m3VueDirectives = {
  tooltip: vTooltip,
  dropdown: vDropdown,
  dropdownMenu: vDropdownMenu,
  contextMenu: vContextMenu,
} as const satisfies Record<string, Directive>;

export const m3VueDirectiveNames = Object.freeze(Object.keys(m3VueDirectives) as Array<keyof typeof m3VueDirectives>);

export type M3VuePluginOptions = M3LocaleOptions &
  M3ShapeOptions &
  M3FieldOptions &
  M3SnackbarOptions &
  M3ComponentDefaultsOptions & {
    preset?: M3Preset;
    /** Register the global directives. Component defaults are installed independently. */
    directives?: boolean;
  };

/** Merge only defaults objects; refs remain intact and undefined inherits the preset. */
function resolveM3Preset(options: M3VuePluginOptions): M3VuePluginOptions {
  const { preset, ...overrides } = options;
  const resolved = { ...preset?.defaults } as M3VuePluginOptions;
  const groups = new Set([
    'buttonDefaults',
    'listItemDefaults',
    'sliderDefaults',
    'selectDefaults',
    'datePickerDefaults',
    'timePickerDefaults',
  ]);
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    if (groups.has(key)) {
      const base = (resolved as Record<string, unknown>)[key] as object | undefined;
      (resolved as Record<string, unknown>)[key] = {
        ...base,
        ...Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined)),
      };
    } else {
      (resolved as Record<string, unknown>)[key] = value;
    }
  }
  return resolved;
}

export const M3VuePlugin = {
  install(app: App, options: M3VuePluginOptions = {}) {
    if (options.directives !== false) {
      for (const name of m3VueDirectiveNames) app.directive(name, m3VueDirectives[name] as Directive);
    }

    options = resolveM3Preset(options);
    installM3Locale(app, options);
    installM3StyleDefaults(app, options);
    installM3InteractionDefaults(app, options);
    installM3Snackbar(app, options);
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

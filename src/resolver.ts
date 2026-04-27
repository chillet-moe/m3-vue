import type { ComponentResolver } from 'unplugin-vue-components/types';

/**
 * Keep this list in sync with component entry `src/components/<Component>/index.ts`.
 *
 * When you add a new component, update this list so auto-import keeps working.
 */
export const m3VueComponentNames = [
  'Badge',
  'Button',
  'ButtonGroup',
  'ButtonGroupItem',
  'Card',
  'CheckBox',
  'Chip',
  'ChipGroup',
  'Combobox',
  'Dialog',
  'Icon',
  'IconButton',
  'InputOtp',
  'ListItem',
  'Menu',
  'MenuContainer',
  'MenuDivider',
  'MenuGap',
  'MenuItem',
  'MenuLabel',
  'MenuSubMenu',
  'NavigationRail',
  'NavigationRailItem',
  'Pagination',
  'PaginationContent',
  'PaginationEllipsis',
  'PaginationItem',
  'PaginationLink',
  'PaginationNext',
  'PaginationPrevious',
  'ProgressIndicator',
  'Radio',
  'Slider',
  'Snackbar',
  'Select',
  'SelectionGroup',
  'Switch',
  'Tab',
  'TabList',
  'TabPanel',
  'Tabs',
  'TextField',
  'Tooltip',
] as const;

const m3VueComponentNameSet = new Set<string>(m3VueComponentNames);

export interface M3VueResolverOptions {
  prefix?: string;
}

export function M3VueResolver(options: M3VueResolverOptions = {}): ComponentResolver {
  const { prefix = '' } = options;

  return {
    type: 'component',
    resolve: (name) => {
      if (prefix && !name.startsWith(prefix)) {
        return;
      }

      const normalizedName = prefix ? name.slice(prefix.length) : name;

      if (!m3VueComponentNameSet.has(normalizedName)) {
        return;
      }

      return {
        name: normalizedName,
        from: '@chillet/m3-vue',
      };
    },
  };
}

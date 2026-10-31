/** Data shared by preset entry points, the docs editor and theme generation. */
export const presets = {
  default: { name: 'default', typography: 'default', density: 0, defaults: {} },
  compact: {
    name: 'compact',
    typography: 'compact',
    density: -2,
    defaults: {
      switchSize: 'small',
      fieldSize: 'small',
      fieldLabelBehavior: 'external',
      rowSize: 'small',
      buttonDefaults: { size: 'small' },
      iconButtonSize: 'extra-small',
      listItemDefaults: { size: 'small' },
    },
  },
} as const;

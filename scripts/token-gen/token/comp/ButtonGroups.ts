export const ButtonGroupStandard = {
    xsmall: {
      height: '32dp',
      betweenSpace: '18dp',
    },
    small: {
      height: '40dp',
      betweenSpace: '12dp',
    },
    medium: {
      height: '56dp',
      betweenSpace: '8dp',
    },
    large: {
      height: '96dp',
      betweenSpace: '8dp',
    },
    xlarge: {
      height: '136dp',
      betweenSpace: '8dp',
    },
} as const;

export const ButtonGroupConnected = {
    xsmall: {
      ...ButtonGroupStandard.xsmall,
      betweenSpace: '2dp',
      innerCornerSize: '8dp',
      pressedInnerCornerSize: '4dp',
      selectedCornerSize: '50%',
    },
    small: {
      ...ButtonGroupStandard.small,
      betweenSpace: '2dp',
      innerCornerSize: '8dp',
      pressedInnerCornerSize: '4dp',
      selectedCornerSize: '50%',
    },
    medium: {
      ...ButtonGroupStandard.medium,
      innerCornerSize: '8dp',
      pressedInnerCornerSize: '4dp',
      selectedCornerSize: '50%',
    },
    large: {
      ...ButtonGroupStandard.large,
      betweenSpace: '2dp',
      innerCornerSize: '16dp',
      pressedInnerCornerSize: '12dp',
      selectedCornerSize: '50%',
    },
    xlarge: {
      ...ButtonGroupStandard.xlarge,
      betweenSpace: '2dp',
      innerCornerSize: '20dp',
      pressedInnerCornerSize: '16dp',
      selectedCornerSize: '50%',
    },
} as const;

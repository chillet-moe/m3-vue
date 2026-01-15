export const sys = {
  color: {
    primary: 'primary',
    onPrimary: 'onPrimary',

    primaryContainer: 'primaryContainer',
    onPrimaryContainer: 'onPrimaryContainer',

    secondary: 'secondary',
    onSecondary: 'onSecondary',

    secondaryContainer: 'secondaryContainer',
    onSecondaryContainer: 'onSecondaryContainer',

    tertiary: 'tertiary',
    onTertiary: 'onTertiary',

    tertiaryContainer: 'tertiaryContainer',
    onTertiaryContainer: 'onTertiaryContainer',

    error: 'error',
    onError: 'onError',

    errorContainer: 'errorContainer',
    onErrorContainer: 'onErrorContainer',

    outline: 'outline',
    background: 'background',
    onBackground: 'onBackground',

    surface: 'surface',
    onSurface: 'onSurface',

    surfaceContainerHighest: 'surfaceContainerHighest',
    surfaceContainerHigh: 'surfaceContainerHigh',
    surfaceContainer: 'surfaceContainer',
    surfaceContainerLow: 'surfaceContainerLow',
    surfaceContainerLowest: 'surfaceContainerLowest',

    surfaceVariant: 'surfaceVariant',
    onSurfaceVariant: 'onSurfaceVariant',

    inverseSurface: 'inverseSurface',
    inverseOnSurface: 'inverseOnSurface',
    inversePrimary: 'inversePrimary',

    shadow: 'shadow',
    surfaceTint: 'surfaceTint',
    outlineVariant: 'outlineVariant',

    scrim: 'scrim',

    errorVariant: 'errorVariant',
    errorVariantContainer: 'errorVariantContainer',

    onErrorVariant: 'onErrorVariant',
    onErrorVariantContainer: 'onErrorVariantContainer',
  },
  shape: {
    corner: {
      none: 0,
      extraSmall: '4dp',
      small: '8dp',
      medium: '12dp',
      large: '16dp',
      largeIncreased: '20dp',
      extraLarge: '28dp',
      full: 'calc(infinity * 1px)',
    },
  },
  motion: {
    duration: {
      short1: '50ms',
      short2: '100ms',
      short3: '150ms',
      short4: '200ms',
      medium1: '250ms',
      medium2: '300ms',
      medium3: '350ms',
      medium4: '400ms',
      long1: '450ms',
      long2: '500ms',
      long3: '550ms',
      long4: '600ms',
      extraLong1: '700ms',
      extraLong2: '800ms',
      extraLong3: '900ms',
      extraLong4: '1000ms',
    },
  },
} as const;

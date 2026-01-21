import { withThemeByClassName } from '@storybook/addon-themes';
import type { Renderer } from 'storybook/internal/csf';

export const storyDarkModeDecorator = withThemeByClassName<Renderer>({
  themes: {
    light: 'story-light',
    dark: 'story-dark',
  },
  defaultTheme: 'light',
})
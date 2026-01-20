import type { Preview } from '@storybook/vue3-vite';
import { themes } from 'storybook/theming';
import { storyDarkModeDecorator } from './decorator.ts';

import '../src';

const preview: Preview = {
  decorators: [storyDarkModeDecorator],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    darkMode: {
      dark: { ...themes.dark },
      light: { ...themes.normal },
    },
  },
  tags: ['autodocs'],
};

export default preview;

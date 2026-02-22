import type { Preview } from '@storybook/vue3-vite';
import { setup } from '@storybook/vue3-vite';
import { themes } from 'storybook/theming';
import { storyDarkModeDecorator } from './decorator.ts';

import '../src';
import './theme/preview.css';
import './theme/manager.css';
import './lib.css';
import { initStateLayer, vTooltip } from "@/index.ts";

export default {
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
      stylePreview: true,
      darkClass: 'dark',
      lightClass: 'light',
    },
  },
  tags: ['autodocs'],
} as Preview;

/* Reload the page on the error "Failed to fetch dynamically imported module..." */
window.addEventListener("error", (ev) => onFailedToFetchModule(ev.message));
window.addEventListener("unhandledrejection", (ev) => onFailedToFetchModule(ev?.reason?.message));

function onFailedToFetchModule(message: string) {
  const isProd = import.meta.env.MODE === "production";

  if (isProd && message?.includes("Failed to fetch dynamically imported module")) {
    window.location.reload();
  }
}

let stateLayerInitialized = false;

setup((app) => {
  app.directive("tooltip", vTooltip);
  if (!stateLayerInitialized) {
    stateLayerInitialized = true;
    initStateLayer();
  }
});
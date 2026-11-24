import { generateColorThemeCss } from './theme/css.ts';

const stylesheet = 'virtual:m3-color-themes.css';

/** Expose fixed color themes as a CSS import in Vite dev and production builds. */
export function m3ColorThemes(themes: Readonly<Record<string, string>>) {
  return {
    name: 'm3-vue:color-themes',
    resolveId(id: string) {
      if (id === stylesheet) return '\0' + stylesheet;
    },
    load(id: string) {
      if (id === '\0' + stylesheet) return generateColorThemeCss(themes);
    },
  };
}

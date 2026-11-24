import { createColorTheme } from './colors.ts';
import { cssRule, namedColorRule } from './color-rules.ts';

/** Generate a stylesheet for fixed class names and their #RRGGBB seed colors. */
export function generateColorThemeCss(themes: Readonly<Record<string, string>>): string {
  const selectors: string[] = [];
  const palettes: string[] = [];
  for (const [name, seed] of Object.entries(themes)) {
    if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(name)) throw new TypeError(`Invalid theme class name: ${name}`);
    const selector = `.${name}`;
    selectors.push(selector);
    palettes.push(cssRule(selector, createColorTheme(seed).style));
  }
  if (!selectors.length) return '';
  return `@layer tokens {\n${[...palettes, namedColorRule(selectors)].join('\n\n')}\n}\n`;
}

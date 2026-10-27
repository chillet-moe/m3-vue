import type { M3VuePluginOptions } from '@/plugin';
import { themePresets, typographyPresets } from '@/theme/presets';
import type { useDocsCustomization } from './state';
import { fieldGapSettings, type defaultSettings } from './catalog';

// The panel's flat controls map to the public plugin options here.
const optionPaths = {
  rowSize: ['rowSize'],
  appearance: ['appearance'],
  shape: ['shape'],
  fieldSize: ['fieldSize'],
  buttonSize: ['buttonDefaults', 'size'],
  iconButtonSize: ['iconButtonSize'],
  listSize: ['listItemDefaults', 'size'],
  listAppearance: ['listItemDefaults', 'appearance'],
  sliderSize: ['sliderDefaults', 'size'],
  sliderAppearance: ['sliderDefaults', 'appearance'],
  menuColor: ['menuColor'],
  firstDayOfWeek: ['datePickerDefaults', 'firstDayOfWeek'],
  timeFormat: ['timePickerDefaults', 'format'],
  timeInputMode: ['timePickerDefaults', 'inputMode'],
  pressShapeMorph: ['buttonDefaults', 'pressShapeMorph'],
  sliderWheel: ['sliderDefaults', 'wheel'],
  valueIndicator: ['sliderDefaults', 'valueIndicator'],
} satisfies Record<(typeof defaultSettings)[number]['key'], [keyof M3VuePluginOptions, string?]>;

export function customizationCode(
  state: ReturnType<typeof useDocsCustomization>['state'],
  resolvedTokens: Record<string, string>,
  baseline: Record<string, string>,
) {
  // Import the stylesheet that already contains the chosen type scale.
  const theme = state.theme.typography ?? themePresets[state.theme.preset].typography;
  const defaults: Record<string, unknown> = {};
  for (const [key, path] of Object.entries(optionPaths)) {
    const raw = state.defaults[key];
    if (raw === undefined) continue;
    const value = raw === 'true' ? true : raw === 'false' ? false : key === 'firstDayOfWeek' ? Number(raw) : raw;
    const [group, property] = path;
    if (property) {
      const options = (defaults[group] ??= {}) as Record<string, unknown>;
      options[property] = value;
    } else {
      defaults[group] = value;
    }
  }
  const base: Record<string, string> = {
    ...baseline,
    ...typographyPresets[theme],
    '--md-density': String(themePresets[theme].density),
  };
  const declarations = Object.entries(resolvedTokens)
    .filter(([name, value]) => value !== base[name])
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `  ${name}: ${value};`);
  const rules = [];
  if (declarations.length) rules.push(`:root {\n${declarations.join('\n')}\n}`);
  if (fieldGapSettings.some(({ token }) => state.tokens[token] !== undefined)) {
    rules.push(
      [
        '.form-fields {',
        '  display: grid;',
        '  row-gap: var(--md-field-row-gap);',
        '  column-gap: var(--md-field-column-gap);',
        '}',
      ].join('\n'),
    );
  }
  const css = rules.length ? `${rules.join('\n\n')}\n` : '';
  const options = Object.keys(defaults).length ? `, ${JSON.stringify(defaults, null, 2)}` : '';
  const setup = [
    "import { createApp } from 'vue';",
    "import { M3VuePlugin } from '@chillet/m3-vue';",
    "import App from './App.vue';",
    "import '@chillet/m3-vue/style.css';",
    `import '@chillet/m3-vue/themes/${theme}.css';`,
    ...(css ? ["import './customization.css';"] : []),
    '',
    'const app = createApp(App);',
    `app.use(M3VuePlugin${options});`,
    "app.mount('#app');",
    '',
  ].join('\n');
  return { setup, css };
}

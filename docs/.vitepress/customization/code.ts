import { themePresets, typographyPresets } from '@/theme/presets';
import type { useDocsCustomization } from './state';
import { fieldGapSettings } from './catalog';
import { optionPaths, presetDefaultValues } from './defaults';

export function customizationCode(
  state: ReturnType<typeof useDocsCustomization>['state'],
  resolvedTokens: Record<string, string>,
  baseline: Record<string, string>,
) {
  // Keep the selected full preset; typography-only edits belong in the CSS overrides.
  const preset = state.theme.preset;
  const presetName = preset === 'compact' ? 'compact' : 'defaultPreset';
  const inherited = presetDefaultValues(preset);
  const defaults: Record<string, unknown> = {};
  for (const [key, path] of Object.entries(optionPaths)) {
    const raw = state.defaults[key];
    if (raw === undefined || raw === inherited[key]) continue;
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
    ...typographyPresets[themePresets[preset].typography],
    '--md-density': String(themePresets[preset].density),
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
  const options = JSON.stringify({ preset: '__preset__', ...defaults }, null, 2).replace('"__preset__"', presetName);
  const setup = [
    "import { createApp } from 'vue';",
    "import { M3VuePlugin } from '@chillet/m3-vue';",
    "import App from './App.vue';",
    "import '@chillet/m3-vue/style.css';",
    `import { ${presetName} } from '@chillet/m3-vue/presets/${preset}';`,
    ...(css ? ["import './customization.css';"] : []),
    '',
    'const app = createApp(App);',
    `app.use(M3VuePlugin, ${options});`,
    "app.mount('#app');",
    '',
  ].join('\n');
  return { setup, css };
}

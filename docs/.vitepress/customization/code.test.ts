import { describe, expect, it } from 'vitest';
import { typographyPresets } from '@/theme/presets';
import { customizationCode } from './code';

describe('customization code preview', () => {
  it('uses a standalone theme without redundant CSS', () => {
    const result = customizationCode(
      { theme: { preset: 'compact' }, tokens: {}, defaults: {} },
      { ...typographyPresets.compact, '--md-density': '-2' },
      {},
    );
    expect(result.setup).toContain("import '@chillet/m3-vue/themes/compact.css'");
    expect(result.setup).toContain('app.use(M3VuePlugin);');
    expect(result.setup).not.toContain("import './customization.css'");
    expect(result.css).toBe('');
  });

  it('reproduces mixed typography, density and shape edits relative to its import', () => {
    const result = customizationCode(
      { theme: { preset: 'compact', typography: 'default' }, tokens: {}, defaults: {} },
      { ...typographyPresets.default, '--md-density': '-2', '--md-shape-card': '8px' },
      { '--md-shape-card': '0.75rem' },
    );
    expect(result.setup).toContain("import '@chillet/m3-vue/themes/default.css'");
    expect(result.setup).toContain("import './customization.css'");
    expect(result.css).toBe(':root {\n  --md-density: -2;\n  --md-shape-card: 8px;\n}\n');
  });

  it('includes the opt-in parent layout even when gap values match the theme', () => {
    const result = customizationCode(
      { theme: { preset: 'default' }, tokens: { '--md-field-row-gap': '1rem' }, defaults: {} },
      { ...typographyPresets.default, '--md-density': '0', '--md-field-row-gap': '1rem' },
      { '--md-field-row-gap': '1rem', '--md-field-column-gap': '1rem' },
    );
    expect(result.css).not.toContain(':root');
    expect(result.css).toContain('.form-fields {');
    expect(result.css).toContain('row-gap: var(--md-field-row-gap);');
    expect(result.css).toContain('column-gap: var(--md-field-column-gap);');
    expect(result.setup).toContain("import './customization.css'");
  });

  it('maps controls to public plugin options and preserves false and zero', () => {
    const result = customizationCode(
      {
        theme: { preset: 'default' },
        tokens: {},
        defaults: {
          rowSize: 'extra-small',
          appearance: 'expressive',
          shape: 'minimal',
          fieldSize: 'small',
          buttonSize: 'extra-small',
          pressShapeMorph: 'false',
          iconButtonSize: 'large',
          listSize: 'small',
          listAppearance: 'standard',
          sliderSize: 'medium',
          sliderAppearance: 'expressive',
          sliderWheel: 'false',
          valueIndicator: 'true',
          menuColor: 'vibrant',
          firstDayOfWeek: '0',
          timeFormat: '24h',
          timeInputMode: 'keyboard',
        },
      },
      { ...typographyPresets.default, '--md-density': '0' },
      {},
    );
    const options = JSON.parse(result.setup.match(/app.use\(M3VuePlugin, ([\s\S]+?)\);/)![1]!);
    expect(options).toEqual({
      rowSize: 'extra-small',
      appearance: 'expressive',
      shape: 'minimal',
      fieldSize: 'small',
      buttonDefaults: { size: 'extra-small', pressShapeMorph: false },
      iconButtonSize: 'large',
      listItemDefaults: { size: 'small', appearance: 'standard' },
      sliderDefaults: { size: 'medium', appearance: 'expressive', wheel: false, valueIndicator: true },
      menuColor: 'vibrant',
      datePickerDefaults: { firstDayOfWeek: 0 },
      timePickerDefaults: { format: '24h', inputMode: 'keyboard' },
    });
  });
});

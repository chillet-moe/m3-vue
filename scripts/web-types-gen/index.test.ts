import { describe, expect, test } from 'vitest';
import { generateWebTypes } from './index.ts';

const options = {
  tsconfigPath: 'tsconfig.types.json',
  entryPoints: 'src/index.ts',
} as const;

describe('web-types generator', () => {
  test('generates modern metadata for public Vue components', async () => {
    const webTypes = await generateWebTypes(options);
    const components = webTypes.contributions.html['vue-components'];
    const componentNames = components.map((component) => component.name);

    expect(webTypes['js-types-syntax']).toBe('typescript');
    expect(componentNames).toEqual([...componentNames].sort((left, right) => left.localeCompare(right)));
    expect(componentNames).toContain('Button');
    expect(componentNames).not.toContain('MenuContentRenderer');

    const button = components.find((component) => component.name === 'Button');
    expect(button?.source).toEqual({ module: '@chillet/m3-vue', symbol: 'Button' });
    expect(button?.props.find((property) => property.name === 'variant')).toEqual({
      name: 'variant',
      description: 'The visual emphasis of the button.',
      type: '"elevated" | "filled" | "outlined" | "text" | "tonal"',
      required: false,
    });
    expect(button?.slots.find((slot) => slot.name === 'default')?.['vue-properties']).toEqual([
      { name: 'disabled', type: 'boolean', required: true },
    ]);

    const icon = components.find((component) => component.name === 'Icon');
    expect(icon?.props.find((property) => property.name === 'name')?.required).toBe(true);

    const badge = components.find((component) => component.name === 'Badge');
    expect(badge?.props.find((property) => property.name === 'variant')?.default).toBe('small');

    const select = components.find((component) => component.name === 'Select');
    expect(select?.js.events.find((event) => event.name === 'update:modelValue')?.type).toBe(
      '[value: SelectModelValue]',
    );
  }, 20_000);

  test('is deterministic', async () => {
    const first = await generateWebTypes(options);
    const second = await generateWebTypes(options);

    expect(second).toEqual(first);
  }, 30_000);
});

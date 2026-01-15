import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Button } from './token/comp/Button.ts';
import { ButtonGroupStandard, ButtonGroupConnected } from './token/comp/ButtonGroups.ts';


type TokenValue = string | number | object;
type TokenObject = Record<string, TokenValue>;

interface GenerateOptions {
  componentName: string;
  tokens: TokenObject;
  outputPath: string;
}

function toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function toCssVarName(parts: string[]): string {
  // Convert camelCase to kebab-case
  const kebabParts = parts.map(part => toKebabCase(part));
  return `--md-comp-${kebabParts.join('-')}`;
}

function resolveValue(value: TokenValue, path: string[] = []): string {
  if (typeof value === 'string') {
    // Check if it ends with 'dp' - convert to --dp() function
    if (value.endsWith('dp')) {
      return `--dp(${value.slice(0, -2)})`;
    }
    // Otherwise, it's a plain string value (like color token names)
    return value;
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return '';
}

function isVariant(obj: any): boolean {
  // A variant is an object that ONLY contains nested objects with leaf values
  // Examples:
  // - { container: { color: 'value' } } -> variant (elevated, xsmall)
  // - { height: '32dp', betweenSpace: '18dp' } -> NOT a variant (this is a base property group like 'container')
  // However, for ButtonGroups where each size IS a variant:
  // - { xs: { height: '32dp' } } -> xs is a variant

  if (typeof obj !== 'object' || obj === null) return false;

  let hasOnlyNestedObjects = true;

  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Check if this nested object has only leaf values
      for (const nestedValue of Object.values(value)) {
        if (typeof nestedValue === 'object' && nestedValue !== null && !Array.isArray(nestedValue)) {
          // Too deep, not a variant
          return false;
        }
      }
    } else {
      // Has a direct leaf value, so this is a base property group, not a variant
      hasOnlyNestedObjects = false;
    }
  }

  // A variant should ONLY have nested objects (no direct leaf values)
  return hasOnlyNestedObjects;
}

function collectProperties(
  obj: TokenObject,
  componentName: string,
  prefix: string[] = []
): string[] {
  const properties: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recurse into nested objects
      properties.push(...collectProperties(value as TokenObject, componentName, [...prefix, key]));
    } else {
      // Leaf value - create a CSS custom property
      const varName = toCssVarName([componentName, ...prefix, key]);
      const rawValue = resolveValue(value, [...prefix, key]);

      // Determine if value should be wrapped in var()
      let varValue: string;
      if (
        rawValue.startsWith('--dp(') ||
        !isNaN(Number(rawValue)) ||
        rawValue.endsWith('%') ||
        rawValue.startsWith('calc(')
      ) {
        // Function calls, numbers, percentages, or calc() - use as-is
        varValue = rawValue;
      } else {
        // It's a color token name, wrap it in var()
        varValue = `var(--md-sys-color-${rawValue.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()})`;
      }

      properties.push(`  ${varName}: ${varValue};`);
    }
  }

  return properties;
}

function generateCssProperties(
  obj: TokenObject,
  componentName: string
): string {
  let css = '';
  const baseProperties: string[] = [];
  const variants: { name: string; properties: string[] }[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (isVariant(value as TokenObject)) {
        // This is a variant (like 'elevated', 'xsmall')
        const variantProps = collectProperties(value as TokenObject, componentName, [key]);
        variants.push({ name: key, properties: variantProps });
      } else {
        // This is a base property group (like 'container') - add properties without variant prefix
        baseProperties.push(...collectProperties(value as TokenObject, componentName, [key]));
      }
    } else {
      // Top-level leaf value
      const varName = toCssVarName([componentName, key]);
      const varValue = resolveValue(value);
      baseProperties.push(`  ${varName}: ${varValue};`);
    }
  }

  // Add base properties first
  if (baseProperties.length > 0) {
    css += baseProperties.join('\n');
  }

  // Add variants with comments
  if (variants.length > 0) {
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      // Add blank line before variant if there are base properties, or if this is not the first variant
      if (baseProperties.length > 0 || i > 0) {
        css += '\n';
      }
      // Only add leading newline to comment if there are base properties or previous variants
      const commentPrefix = (baseProperties.length > 0 || i > 0) ? '\n  ' : '  ';
      css += `${commentPrefix}/* ${variant.name.charAt(0).toUpperCase() + variant.name.slice(1)} */\n`;
      css += variant.properties.join('\n');
    }
  }

  return css;
}

function generateCssModule({ componentName, tokens, outputPath }: GenerateOptions): void {
  const className = componentName;
  const properties = generateCssProperties(tokens, toKebabCase(componentName));

  const css = `@layer tokens {
.${className} {
${properties}
}
}
`;

  writeFileSync(outputPath, css, 'utf-8');
  console.log(`Generated: ${outputPath}`);
}

// Generate Button CSS
/*const buttonOutputPath = join(import.meta.dirname, '../../src/components/Button/Button.module.css');
generateCssModule({
  componentName: 'Button',
  tokens: Button,
  outputPath: buttonOutputPath,
});*/

// Generate ButtonGroup CSS
const buttonGroupOutputPath = join(import.meta.dirname, '../../src/components/Button/ButtonGroup.module.css');
generateCssModule({
  componentName: 'ButtonGroup',
  tokens: { standard: ButtonGroupStandard, connected: ButtonGroupConnected },
  outputPath: buttonGroupOutputPath,
});

console.log('All CSS files generated successfully!');


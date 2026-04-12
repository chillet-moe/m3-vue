import type { PropMeta } from '../plugins/component-meta';

export type ControlType = 'switch' | 'select' | 'text' | 'number' | 'none';

function hasTypeToken(type: string, token: string): boolean {
  return new RegExp(`\\b${token}\\b`).test(type);
}

function isPrimitiveLikeType(type: string, primitive: 'boolean' | 'string' | 'number'): boolean {
  if (/["']/.test(type)) {
    return false;
  }

  const primitiveTokens = ['boolean', 'string', 'number', 'bigint', 'symbol'] as const;
  const presentTokens = primitiveTokens.filter((token) => hasTypeToken(type, token));

  return presentTokens.length > 0 && presentTokens.every((token) => token === primitive);
}

export function getControlType(prop: Pick<PropMeta, 'type' | 'options'>): ControlType {
  const type = prop.type.toLowerCase();

  if (isPrimitiveLikeType(type, 'boolean')) {
    return 'switch';
  }

  if (prop.options?.length) {
    return 'select';
  }

  if (isPrimitiveLikeType(type, 'string')) {
    return 'text';
  }

  if (isPrimitiveLikeType(type, 'number')) {
    return 'number';
  }

  return 'none';
}

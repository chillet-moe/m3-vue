import type { PropMeta } from '../plugins/component-meta';

export type ControlType = 'switch' | 'select' | 'text' | 'number' | 'number-array' | 'none';

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

function isNumberArrayType(type: string): boolean {
  const parts = type
    .toLowerCase()
    .split('|')
    .map((part) => part.replace(/\s+/g, ''))
    .filter((part) => part && part !== 'undefined' && part !== 'null');

  return (
    parts.length > 0 &&
    parts.every((part) => part === 'number[]' || part === 'array<number>' || part === 'readonlynumber[]')
  );
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

  if (isNumberArrayType(type)) {
    return 'number-array';
  }

  if (isPrimitiveLikeType(type, 'number')) {
    return 'number';
  }

  return 'none';
}

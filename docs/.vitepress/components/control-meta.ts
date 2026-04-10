import type { PropMeta } from '../plugins/component-meta';

export type ControlType = 'switch' | 'select' | 'text' | 'number' | 'none';

export function getControlType(prop: Pick<PropMeta, 'type' | 'options'>): ControlType {
  const type = prop.type.toLowerCase();

  if (type === 'boolean' || type === 'boolean | undefined') {
    return 'switch';
  }

  if (prop.options?.length) {
    return 'select';
  }

  if (type === 'string' || type === 'string | undefined') {
    return 'text';
  }

  if (type === 'number' || type === 'number | undefined') {
    return 'number';
  }

  return 'none';
}

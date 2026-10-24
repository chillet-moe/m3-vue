import type { SelectOption } from '@/components/Select';

export const virtualOptions: SelectOption[] = Array.from({ length: 10000 }, (_, index) => ({
  value: index,
  label: index % 13 === 0 ? `Layer ${index} — a long descriptive name for a workspace resource` : `Layer ${index}`,
  disabled: index % 17 === 0,
}));

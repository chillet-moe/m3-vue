import type { UseSelectModelValue, UseSelectOption } from './selectTypes';

export type SelectOptionEntry = {
  option: UseSelectOption;
  index: number;
};

export function getSelectedOptions(
  options: UseSelectOption[],
  modelValue: UseSelectModelValue,
  multiple: boolean,
  resolveLabel?: (value: string | number) => string | undefined,
): UseSelectOption[] {
  if (modelValue === undefined || multiple !== Array.isArray(modelValue)) return [];

  const remaining = new Set(Array.isArray(modelValue) ? modelValue : [modelValue]);
  const selected: UseSelectOption[] = [];
  for (const option of options) {
    if (!remaining.has(option.value)) continue;
    selected.push(option);
    remaining.delete(option.value);
  }
  for (const value of remaining) {
    selected.push({ value, label: resolveLabel?.(value) ?? String(value) });
  }
  return selected;
}

export function formatSelectedOptions(options: UseSelectOption[], separator: string): string {
  return options.map((option) => option.label).join(separator);
}

export function getSubmittedValues(modelValue: UseSelectModelValue, multiple: boolean, disabled: boolean): string[] {
  if (disabled) {
    return [];
  }

  if (multiple) {
    return Array.isArray(modelValue) ? modelValue.map((value) => String(value)) : [];
  }

  if (modelValue === undefined || Array.isArray(modelValue)) {
    return [];
  }

  return [String(modelValue)];
}

export function getFilteredOptionEntries(
  options: UseSelectOption[],
  query: string,
  filterable: boolean,
  locale?: string,
): SelectOptionEntry[] {
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);

  return options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => {
      if (!filterable || !normalizedQuery) {
        return true;
      }

      const searchableText = [option.label, option.supportingText, option.trailingText]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase(locale);

      return searchableText.includes(normalizedQuery);
    });
}

export function isOptionSelected(modelValue: UseSelectModelValue, multiple: boolean, option: UseSelectOption): boolean {
  if (multiple) {
    return Array.isArray(modelValue) && modelValue.includes(option.value);
  }

  return modelValue === option.value;
}

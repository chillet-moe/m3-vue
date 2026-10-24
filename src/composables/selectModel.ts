import type { UseSelectModelValue, UseSelectOption } from './selectTypes';

export type SelectOptionEntry = {
  option: UseSelectOption;
  index: number;
};

export function getSelectedOptions(
  options: UseSelectOption[],
  modelValue: UseSelectModelValue,
  multiple: boolean,
  resolveLabel?: (value: UseSelectOption['value']) => string | undefined,
): UseSelectOption[] {
  const values = multiple
    ? Array.isArray(modelValue)
      ? modelValue
      : []
    : modelValue !== undefined && !Array.isArray(modelValue)
      ? [modelValue]
      : [];
  const byValue = new Map(options.map((option) => [option.value, option]));
  return values.map((value) => byValue.get(value) ?? { value, label: resolveLabel?.(value) ?? String(value) });
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

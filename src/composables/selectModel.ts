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

  const fallback = (value: string | number) => ({ value, label: resolveLabel?.(value) ?? String(value) });
  if (!Array.isArray(modelValue)) {
    for (const option of options) {
      if (option.value === modelValue) return [option];
    }
    return [fallback(modelValue)];
  }

  if (!modelValue.length) return [];

  const remaining = new Set(modelValue);
  const selected: UseSelectOption[] = [];
  for (const option of options) {
    if (!remaining.has(option.value)) continue;
    selected.push(option);
    remaining.delete(option.value);
    if (remaining.size === 0) return selected;
  }
  for (const value of remaining) {
    selected.push(fallback(value));
  }
  return selected;
}

export function formatSelectedOptions(options: UseSelectOption[], separator: string): string {
  if (options.length <= 1) return options[0]?.label ?? '';
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

function optionSearchText(option: UseSelectOption): string {
  const { label, supportingText, trailingText } = option;
  let text = label;
  if (supportingText) text = text ? `${text} ${supportingText}` : supportingText;
  if (trailingText) text = text ? `${text} ${trailingText}` : trailingText;
  return text;
}

export function getFilteredOptionEntries(
  options: UseSelectOption[],
  normalizedQuery?: string,
  locale?: string,
): SelectOptionEntry[] {
  const entries: SelectOptionEntry[] = [];
  if (!normalizedQuery || options.length < 128) {
    options.forEach((option, index) => {
      if (!normalizedQuery || optionSearchText(option).toLocaleLowerCase(locale).includes(normalizedQuery)) {
        entries.push({ option, index });
      }
    });
    return entries;
  }

  const query = normalizedQuery;
  // NUL is uncased and not case-ignorable. Its combining class of zero also
  // blocks locale-sensitive combining-mark context between option labels.
  const separator = '\0';
  const texts: string[] = [];
  const batch: UseSelectOption[] = [];
  const indices: number[] = [];
  function flush() {
    if (!texts.length) return;
    const lowered = texts.join(separator).toLocaleLowerCase(locale).split(separator);
    for (let i = 0; i < lowered.length; i++) {
      if (lowered[i]!.includes(query)) entries.push({ option: batch[i]!, index: indices[i]! });
    }
    texts.length = batch.length = indices.length = 0;
  }
  options.forEach((option, index) => {
    const text = optionSearchText(option);
    // Preserve literal NULs and keep each temporary joined string bounded.
    if (text.length > 2048 || text.includes(separator)) {
      flush();
      if (text.toLocaleLowerCase(locale).includes(query)) entries.push({ option, index });
      return;
    }
    texts.push(text);
    batch.push(option);
    indices.push(index);
    if (texts.length === 128) flush();
  });
  flush();
  return entries;
}

export function isOptionSelected(modelValue: UseSelectModelValue, multiple: boolean, option: UseSelectOption): boolean {
  if (multiple) {
    return Array.isArray(modelValue) && modelValue.includes(option.value);
  }

  return modelValue === option.value;
}

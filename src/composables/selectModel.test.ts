import { describe, expect, it } from 'vite-plus/test';
import {
  formatSelectedOptions,
  getFilteredOptionEntries,
  getSelectedOptions,
  getSubmittedValues,
  isOptionSelected,
} from './selectModel';
import type { UseSelectOption } from './selectTypes';

const options: UseSelectOption[] = [
  {
    label: 'Espresso',
    value: 'espresso',
    supportingText: 'Strong and concentrated',
  },
  {
    label: 'Pour-over',
    value: 'pour-over',
    trailingText: 'Manual brew',
  },
  {
    label: 'Cold brew',
    value: 'cold-brew',
  },
];

describe('select model helpers', () => {
  it('derives selected options and display text for single and multiple values', () => {
    const selectedSingle = getSelectedOptions(options, 'pour-over', false);
    const selectedMultiple = getSelectedOptions(options, ['espresso', 'cold-brew'], true);

    expect(selectedSingle).toEqual([options[1]]);
    expect(selectedMultiple).toEqual([options[0], options[2]]);
    expect(formatSelectedOptions(selectedMultiple, ' / ')).toBe('Espresso / Cold brew');
  });

  it('keeps form submission aligned with mode and disabled state', () => {
    expect(getSubmittedValues(42, false, false)).toEqual(['42']);
    expect(getSubmittedValues(['espresso', 42], true, false)).toEqual(['espresso', '42']);
    expect(getSubmittedValues('espresso', true, false)).toEqual([]);
    expect(getSubmittedValues('espresso', false, true)).toEqual([]);
  });

  it('filters labels and supporting text while preserving original indices', () => {
    expect(getFilteredOptionEntries(options, 'manual', true)).toEqual([{ option: options[1], index: 1 }]);
    expect(getFilteredOptionEntries(options, ' CONCENTRATED ', true)).toEqual([{ option: options[0], index: 0 }]);
    expect(getFilteredOptionEntries(options, 'missing', false)).toHaveLength(options.length);
  });

  it('uses the configured locale for case-insensitive filtering', () => {
    const turkishOptions: UseSelectOption[] = [{ label: 'IĞDIR', value: 'igdir' }];

    expect(getFilteredOptionEntries(turkishOptions, 'ığdır', true, 'tr')).toEqual([
      { option: turkishOptions[0], index: 0 },
    ]);
  });

  it('checks selection according to the active selection mode', () => {
    expect(isOptionSelected('espresso', false, options[0]!)).toBe(true);
    expect(isOptionSelected(['espresso'], true, options[0]!)).toBe(true);
    expect(isOptionSelected('espresso', true, options[0]!)).toBe(false);
  });
});

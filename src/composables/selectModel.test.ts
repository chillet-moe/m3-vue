import { describe, expect, it } from 'vitest';
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

  it('distinguishes string and numeric identifiers and resolves missing values', () => {
    const text = { value: '42', label: 'Text identifier' };
    const number = { value: 42, label: 'Numeric identifier' };
    expect(getSelectedOptions([text, number], 42, false)).toEqual([number]);
    expect(getSelectedOptions([text, number], '42', false)).toEqual([text]);
    expect(getSelectedOptions([text], 42, false, (value) => (value === 42 ? 'Resolved label' : undefined))).toEqual([
      { value: 42, label: 'Resolved label' },
    ]);
  });

  it('keeps form submission aligned with mode and disabled state', () => {
    expect(getSubmittedValues(42, false, false)).toEqual(['42']);
    expect(getSubmittedValues(['espresso', 42], true, false)).toEqual(['espresso', '42']);
    expect(getSubmittedValues('espresso', true, false)).toEqual([]);
    expect(getSubmittedValues('espresso', false, true)).toEqual([]);
  });

  it('filters labels and supporting text while preserving original indices', () => {
    expect(getFilteredOptionEntries(options, 'manual')).toEqual([{ option: options[1], index: 1 }]);
    expect(getFilteredOptionEntries(options, 'concentrated')).toEqual([{ option: options[0], index: 0 }]);
    expect(getFilteredOptionEntries(options)).toHaveLength(options.length);
  });

  it('uses the configured locale for case-insensitive filtering', () => {
    const turkishOptions: UseSelectOption[] = [{ label: 'IĞDIR', value: 'igdir' }];

    expect(getFilteredOptionEntries(turkishOptions, 'ığdır', 'tr')).toEqual([{ option: turkishOptions[0], index: 0 }]);
  });

  it('matches across optional text fields and preserves source indices across gaps', () => {
    const entries: UseSelectOption[] = [];
    const option = { label: '', supportingText: 'Manual', trailingText: 'Brew', value: 'manual' };
    entries[2] = option;

    expect(getFilteredOptionEntries(entries, 'manual brew')).toEqual([{ option, index: 2 }]);
    expect(getFilteredOptionEntries(entries)).toEqual([{ option, index: 2 }]);
  });

  it('keeps Unicode casing context inside each option in a large sparse collection', () => {
    const options: UseSelectOption[] = [];
    const latinI = { label: 'I', value: 'dotless' };
    const combiningDot = { label: '\u0307', value: 'dot' };
    const dottedI = { label: 'I\u0307', value: 'dotted' };
    const finalSigma = { label: 'AΣ', value: 'final' };
    const nextWord = { label: 'A', value: 'next' };
    const embeddedNull = { label: 'Before\0After', value: 'null' };
    const longLabel = { label: 'A'.repeat(2400) + 'Σ', value: 'long' };

    options[11] = latinI;
    options[12] = combiningDot;
    options[13] = dottedI;
    options[120] = finalSigma;
    options[121] = nextWord;
    options[175] = embeddedNull;
    options[230] = longLabel;

    expect(getFilteredOptionEntries(options, 'ı', 'tr')).toEqual([{ option: latinI, index: 11 }]);
    expect(getFilteredOptionEntries(options, 'i', 'tr')).toEqual([{ option: dottedI, index: 13 }]);
    expect(getFilteredOptionEntries(options, 'aς', 'el')).toEqual([
      { option: finalSigma, index: 120 },
      { option: longLabel, index: 230 },
    ]);
    expect(getFilteredOptionEntries(options, 'before\0after', 'en-US')).toEqual([{ option: embeddedNull, index: 175 }]);
  });

  it('checks selection according to the active selection mode', () => {
    expect(isOptionSelected('espresso', false, options[0]!)).toBe(true);
    expect(isOptionSelected(['espresso'], true, options[0]!)).toBe(true);
    expect(isOptionSelected('espresso', true, options[0]!)).toBe(false);
  });
});

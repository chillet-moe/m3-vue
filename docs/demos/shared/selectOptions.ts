import type { SelectOption } from '@/components/Select';

export const coffeeOptions: SelectOption[] = [
  {
    label: 'Espresso',
    value: 'espresso',
    leadingIcon: 'local_cafe',
    supportingText: 'Strong and concentrated',
  },
  {
    label: 'Pour-over',
    value: 'pour-over',
    leadingIcon: 'coffee_maker',
    supportingText: 'Clean and bright',
  },
  {
    label: 'Cold brew',
    value: 'cold-brew',
    leadingIcon: 'ac_unit',
    supportingText: 'Smooth and low acidity',
    trailingText: 'Seasonal',
  },
  {
    label: 'Decaf',
    value: 'decaf',
    leadingIcon: 'coffee',
    disabled: true,
    supportingText: 'Currently unavailable',
  },
];

export const coffeeOptionsWithoutIcons: SelectOption[] = [
  {
    label: 'Espresso',
    value: 'espresso',
    supportingText: 'Strong and concentrated',
  },
  {
    label: 'Pour-over',
    value: 'pour-over',
    supportingText: 'Clean and bright',
  },
  {
    label: 'Cold brew',
    value: 'cold-brew',
    supportingText: 'Smooth and low acidity',
    trailingText: 'Seasonal',
  },
  {
    label: 'Decaf',
    value: 'decaf',
    disabled: true,
    supportingText: 'Currently unavailable',
  },
];

export const stateOptions: SelectOption[] = [
  { label: 'Alabama', value: 'alabama' },
  { label: 'Alaska', value: 'alaska' },
  { label: 'Arizona', value: 'arizona' },
  { label: 'Arkansas', value: 'arkansas' },
  { label: 'California', value: 'california' },
  { label: 'Colorado', value: 'colorado' },
  { label: 'Connecticut', value: 'connecticut' },
  { label: 'Delaware', value: 'delaware' },
];

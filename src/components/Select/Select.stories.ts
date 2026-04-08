import type { Meta, StoryFn } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Select from './Select.vue';
import type { SelectModelValue, SelectOption, SelectProps } from './Select.vue';

const options: SelectOption[] = [
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

const optionsWithoutIcons: SelectOption[] = [
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

const stateOptions: SelectOption[] = [
  { label: 'Alabama', value: 'alabama' },
  { label: 'Alaska', value: 'alaska' },
  { label: 'Arizona', value: 'arizona' },
  { label: 'Arkansas', value: 'arkansas' },
  { label: 'California', value: 'california' },
  { label: 'Colorado', value: 'colorado' },
  { label: 'Connecticut', value: 'connecticut' },
  { label: 'Delaware', value: 'delaware' },
];

const meta = {
  component: Select,
  args: {
    label: 'Coffee',
    options,
    disabled: false,
    required: false,
    multiple: false,
    placeholder: 'Choose an option',
  },
} satisfies Meta<typeof Select>;

export default meta;

interface SelectArgs extends SelectProps {
  modelValue: SelectModelValue;
}

const BaseTemplate: StoryFn<SelectArgs> = (args: SelectArgs) => ({
  components: { Select },
  setup: () => ({ args }),
  template: `
    <div style="max-inline-size: 22rem;">
      <Select v-bind="args" v-model="args.modelValue" />
    </div>
  `,
});

const ConfigurationsTemplate: StoryFn<SelectArgs> = () => ({
  components: { Select },
  setup: () => ({
    single: ref<SelectModelValue>('pour-over'),
    multiple: ref<SelectModelValue>(['espresso', 'cold-brew']),
    empty: ref<SelectModelValue>(undefined),
    options,
  }),
  template: `
    <div style="display: grid; gap: 1rem; max-inline-size: 24rem;">
      <Select id="select-config-single" label="Coffee" :options="options" v-model="single" description="Single selection" />
      <Select
        id="select-config-multiple"
        label="Beans to restock"
        :options="options"
        v-model="multiple"
        multiple
        placeholder="Choose one or more"
        description="Multiple selection stays open after each pick."
      />
      <Select
        id="select-config-error"
        label="Coffee"
        :options="options"
        v-model="empty"
        placeholder="Choose an option"
        error="Selection required"
      />
    </div>
  `,
});

export const Default = BaseTemplate.bind({});
Default.args = {
  modelValue: undefined,
};

export const WithoutIcons = BaseTemplate.bind({});
WithoutIcons.args = {
  modelValue: 'pour-over',
  options: optionsWithoutIcons,
};

export const Filtering = BaseTemplate.bind({});
Filtering.args = {
  label: 'State',
  modelValue: undefined,
  options: stateOptions,
  placeholder: 'Choose a state',
  filterable: true,
  filterPlaceholder: 'Filter states',
};

export const Configurations = ConfigurationsTemplate.bind({});

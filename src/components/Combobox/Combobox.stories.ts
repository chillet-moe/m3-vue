import type { Meta, StoryFn } from '@storybook/vue3-vite';
import Combobox from './Combobox.vue';
import type { ComboboxProps } from './Combobox.vue';
import type { SelectModelValue, SelectOption } from '@/components/Select/Select.vue';

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
  component: Combobox,
  args: {
    label: 'State',
    options: stateOptions,
    disabled: false,
    required: false,
    multiple: false,
    placeholder: 'Choose a state',
    filterPlaceholder: 'Filter states',
  },
} satisfies Meta<typeof Combobox>;

export default meta;

interface ComboboxArgs extends ComboboxProps {
  modelValue: SelectModelValue;
}

const BaseTemplate: StoryFn<ComboboxArgs> = (args: ComboboxArgs) => ({
  components: { Combobox },
  setup: () => ({ args }),
  template: `
    <div style="max-inline-size: 22rem;">
      <Combobox v-bind="args" v-model="args.modelValue" />
    </div>
  `,
});

export const Default = BaseTemplate.bind({});
Default.args = {
  modelValue: undefined,
};

export const MultiSelect = BaseTemplate.bind({});
MultiSelect.args = {
  label: 'States',
  modelValue: ['california', 'colorado'],
  multiple: true,
  placeholder: 'Choose one or more states',
};

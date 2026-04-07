import type { Meta, StoryFn } from '@storybook/vue3-vite';
import TextField from './TextField.vue';
import type { TextFieldProps } from './TextField.vue';

const meta = {
  component: TextField,
  args: {
    label: 'Label',
    disabled: false,
    invalid: false,
    required: false,
  },
} satisfies Meta<typeof TextField>;

export default meta;

interface TextFieldArgs extends TextFieldProps {
  value: string;
}

const BaseTemplate: StoryFn<TextFieldArgs> = (args: TextFieldArgs) => ({
  components: { TextField },
  setup: () => ({ args }),
  template: `
    <div style="max-inline-size: 22rem;">
      <TextField v-bind="args" v-model="args.value" />
    </div>
  `,
});

const OutlinedConfigurationsTemplate: StoryFn<TextFieldArgs> = () => ({
  components: { TextField },
  setup: () => ({
    empty: '',
    input: 'Input',
    amount: '1.43',
    weight: '25',
    multiline: 'This is a long input in a multi-line text field that wraps overflow text onto a new line',
  }),
  template: `
    <div style="display: grid; gap: 1rem; max-inline-size: 24rem;">
      <TextField label="Label" v-model="empty" supporting-text="Supporting text" />
      <TextField label="Label" v-model="input" supporting-text="Supporting text" />
      <TextField label="Label" v-model="empty" leading-icon="search" />
      <TextField label="Label" v-model="input" leading-icon="search" trailing-icon="cancel" />
      <TextField label="Label" v-model="amount" prefix-text="$" />
      <TextField label="Label" v-model="weight" suffix-text="lbs" />
      <TextField label="Label" v-model="multiline" multiline :rows="4" />
    </div>
  `,
});

export const Default = BaseTemplate.bind({});
Default.args = {
  value: '',
  supportingText: 'Supporting text',
};

export const OutlinedConfigurations = OutlinedConfigurationsTemplate.bind({});

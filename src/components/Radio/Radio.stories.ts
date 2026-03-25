import type { Meta, StoryFn } from '@storybook/vue3-vite';
import Radio from './Radio.vue';
import type { RadioProps } from './Radio.vue';

const meta = {
  component: Radio,
  args: {
    checked: false,
    disabled: false,
    name: 'radio-demo',
  },
} satisfies Meta<typeof Radio>;

export default meta;

interface RadioArgs extends RadioProps {
  checked: boolean;
}

const BaseTemplate: StoryFn<RadioArgs> = (args: RadioArgs) => ({
  components: { Radio },
  setup: () => ({ args }),
  template: `
    <Radio v-bind="args" v-model:checked="args.checked">
      Option A
    </Radio>
  `,
});

const StateTemplate: StoryFn<RadioArgs> = (args: RadioArgs) => ({
  components: { Radio },
  setup: () => ({ args }),
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <Radio v-bind="args" :checked="false">Unchecked</Radio>
      <Radio v-bind="args" :checked="true">Checked</Radio>
      <Radio v-bind="args" :checked="false" disabled>Disabled unchecked</Radio>
      <Radio v-bind="args" :checked="true" disabled>Disabled checked</Radio>
    </div>
  `,
});

export const Default = BaseTemplate.bind({});

export const States = StateTemplate.bind({});

import type { Meta, StoryFn } from '@storybook/vue3-vite';
import CheckBox from './CheckBox.vue';
import type { CheckBoxProps } from './CheckBox.vue';

const meta = {
  component: CheckBox,
  args: {
    checked: false,
    disabled: false,
  },
} satisfies Meta<typeof CheckBox>;

export default meta;

interface CheckBoxArgs extends CheckBoxProps {
  checked: boolean;
}

const BaseTemplate: StoryFn<CheckBoxArgs> = (args: CheckBoxArgs) => ({
  components: { CheckBox },
  setup: () => ({ args }),
  template: `
    <CheckBox v-bind="args" v-model:checked="args.checked">
      Receive notifications
    </CheckBox>
  `,
});

const StateTemplate: StoryFn<CheckBoxArgs> = (args: CheckBoxArgs) => ({
  components: { CheckBox },
  setup: () => ({ args }),
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <CheckBox v-bind="args" :checked="false">Unchecked</CheckBox>
      <CheckBox v-bind="args" :checked="true">Checked</CheckBox>
      <CheckBox v-bind="args" :checked="false" disabled>Disabled unchecked</CheckBox>
      <CheckBox v-bind="args" :checked="true" disabled>Disabled checked</CheckBox>
    </div>
  `,
});

export const Default = BaseTemplate.bind({});

export const States = StateTemplate.bind({});

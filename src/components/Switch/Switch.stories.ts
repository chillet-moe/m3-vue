import type { Meta, StoryFn } from '@storybook/vue3-vite';
import Switch from './Switch.vue';
import type { SwitchProps } from './Switch.vue';

const meta = {
  component: Switch,
  args: {
    checked: false,
    disabled: false,
    checkedIcon: 'check',
  },
} satisfies Meta<typeof Switch>;

export default meta;

interface SwitchArgs extends SwitchProps {
  checked: boolean;
}

const BaseTemplate: StoryFn<SwitchArgs> = (args: SwitchArgs) => ({
  components: { Switch },
  setup: () => ({ args }),
  template: `
    <Switch v-bind="args" v-model:checked="args.checked">
      Airplane mode
    </Switch>
  `,
});

const StateTemplate: StoryFn<SwitchArgs> = (args: SwitchArgs) => ({
  components: { Switch },
  setup: () => ({ args }),
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <Switch v-bind="args" :checked="false">Unchecked</Switch>
      <Switch v-bind="args" :checked="true">Checked</Switch>
      <Switch v-bind="args" :checked="false" disabled>Disabled unchecked</Switch>
      <Switch v-bind="args" :checked="true" disabled>Disabled checked</Switch>
    </div>
  `,
});

export const Default = BaseTemplate.bind({});

export const WithIcon = BaseTemplate.bind({});
WithIcon.args = {
  checkedIcon: 'check',
  uncheckedIcon: 'close',
};

export const States = StateTemplate.bind({});

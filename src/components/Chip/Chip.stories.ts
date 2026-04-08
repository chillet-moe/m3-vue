import type { Meta, StoryFn, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import { ChipGroup } from '@/components/ChipGroup';
import Chip from './Chip.vue';
import type { ChipProps } from './Chip.vue';

const meta = {
  component: Chip,
  args: {
    variant: 'filter',
    elevated: false,
    disabled: false,
    leadingIcon: undefined,
    trailingIcon: undefined,
    avatarSrc: undefined,
    selectedIcon: 'check',
    default: 'Chip',
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

interface ChipArgs extends ChipProps {}

const BaseTemplate: StoryFn<ChipArgs> = (args: ChipArgs) => ({
  components: { Chip },
  setup: () => ({
    args,
    modelValue: ref(false),
  }),
  template: `
    <Chip v-bind="args" v-model="modelValue">
      {{ args.default }}
    </Chip>
  `,
});

const StatesTemplate: StoryFn<ChipArgs> = (args: ChipArgs) => ({
  components: { Chip },
  setup: () => ({
    args,
  }),
  template: `
    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <Chip v-bind="args" :model-value="false">
        Unselected
      </Chip>
      <Chip v-bind="args" :model-value="true">
        Selected
      </Chip>
    </div>
  `,
});

const GroupTemplate: StoryFn<ChipArgs> = (args: ChipArgs) => ({
  components: { ChipGroup, Chip },
  setup: () => ({
    args,
    singleValue: ref('updates'),
    multipleValue: ref(['updates']),
  }),
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <ChipGroup v-model="singleValue" name="chip-group-single">
        <Chip v-bind="args" value="updates">Updates</Chip>
        <Chip v-bind="args" value="alerts">Alerts</Chip>
        <Chip v-bind="args" value="saved">Saved</Chip>
      </ChipGroup>

      <ChipGroup v-model="multipleValue" name="chip-group-multiple" selection-mode="multiple">
        <Chip v-bind="args" value="updates">Updates</Chip>
        <Chip v-bind="args" value="alerts">Alerts</Chip>
        <Chip v-bind="args" value="saved">Saved</Chip>
      </ChipGroup>
    </div>
  `,
});

export const Default: Story = BaseTemplate.bind({});

export const States: Story = StatesTemplate.bind({});

export const Elevated: Story = StatesTemplate.bind({});
Elevated.args = { elevated: true };

export const Variants: Story = {
  render: () => ({
    components: { Chip },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <Chip variant="assist" leading-icon="add">Assist</Chip>
        <Chip variant="suggestion" leading-icon="favorite">Suggestion</Chip>
        <Chip variant="filter" :model-value="true">Filter</Chip>
        <Chip variant="input" trailing-icon="close" avatar-src="https://i.pravatar.cc/48?img=12" :model-value="true">
          Input
        </Chip>
      </div>
    `,
  }),
};

export const WithIcons: Story = BaseTemplate.bind({});
WithIcons.args = {
  leadingIcon: 'settings',
  trailingIcon: 'close',
};

export const InputWithAvatar: Story = BaseTemplate.bind({});
InputWithAvatar.args = {
  variant: 'input',
  trailingIcon: 'close',
  avatarSrc: 'https://i.pravatar.cc/48?img=12',
  default: 'Alex',
};

export const InSelectionGroup: Story = GroupTemplate.bind({});
InSelectionGroup.args = {
  variant: 'filter',
};

export const Disabled: Story = StatesTemplate.bind({});
Disabled.args = {
  disabled: true,
};

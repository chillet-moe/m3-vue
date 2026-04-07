import type { Meta, StoryFn, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import ButtonGroup from './ButtonGroup.vue';
import ButtonGroupItem from '@/components/ButtonGroup/ButtonGroupItem.vue';
import type { ButtonGroupProps } from '@/components/ButtonGroup/ButtonGroup.vue';
import { getArgs } from '@/utils/storybook.ts';

const meta = {
  title: 'Components/Button/ButtonGroup',
  component: ButtonGroup,
  args: {
    type: 'standard',
    size: 'small',
    color: 'tonal',
    disabled: false,
    selectionMode: 'single',
    name: 'button-group',
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

interface ButtonGroupArgs extends ButtonGroupProps {
  enum?: 'type' | 'size' | 'color';
}

const BaseTemplate: StoryFn<ButtonGroupArgs> = (args: ButtonGroupArgs) => ({
  components: { ButtonGroup, ButtonGroupItem },
  setup: () => ({
    args,
    modelValue: ref(args.selectionMode === 'multiple' ? ['option-1'] : 'option-1'),
  }),
  template: `
    <ButtonGroup v-bind="args" v-model="modelValue">
      <ButtonGroupItem value="option-1">Option 1</ButtonGroupItem>
      <ButtonGroupItem value="option-2">Option 2</ButtonGroupItem>
      <ButtonGroupItem value="option-3">Option 3</ButtonGroupItem>
    </ButtonGroup>
  `,
});

const EnumTemplate: StoryFn<ButtonGroupArgs> = (args: ButtonGroupArgs, { argTypes }) => ({
  components: { ButtonGroup, ButtonGroupItem },
  setup: () => ({
    args,
    argTypes,
    getArgs,
  }),
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div v-for="option in argTypes?.[args.enum]?.options" :key="option">
        <div style="font-size: 0.75rem; opacity: 0.7; margin-bottom: 0.25rem;">{{ option }}</div>
        <ButtonGroup v-bind="getArgs(args, option)" :model-value="args.selectionMode === 'multiple' ? ['option-1'] : 'option-1'">
          <ButtonGroupItem value="option-1">Option 1</ButtonGroupItem>
          <ButtonGroupItem value="option-2">Option 2</ButtonGroupItem>
          <ButtonGroupItem value="option-3">Option 3</ButtonGroupItem>
        </ButtonGroup>
      </div>
    </div>
  `,
});

export const Default: Story = BaseTemplate.bind({});

export const Types = EnumTemplate.bind({});
Types.args = { enum: 'type' };

export const Sizes = EnumTemplate.bind({});
Sizes.args = { enum: 'size' };

export const Colors = EnumTemplate.bind({});
Colors.args = { enum: 'color' };

export const Disabled = BaseTemplate.bind({});
Disabled.args = { disabled: true };

export const Multiple: Story = BaseTemplate.bind({});
Multiple.args = { selectionMode: 'multiple' };

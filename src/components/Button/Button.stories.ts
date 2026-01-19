import type { Meta, StoryFn, StoryObj } from '@storybook/vue3-vite';
import Button from './Button.vue';
import type { ButtonProps } from '@/components/Button/Button.vue';
import { getArgs } from '@/utils/storybook.ts';

const meta = {
  component: Button,
  args: {
    toggleable: false,
    color: 'filled',
    size: 'medium',
    shape: 'rounded',
    disabled: false,
    default: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

interface ButtonArgs extends ButtonProps {
  enum: 'color' | 'size' | 'shape';
  slotTemplate?: string;
}

const EnumTemplate: StoryFn<ButtonArgs> = (args: ButtonArgs, { argTypes }) => ({
  components: { Button },
  setup: () => ({ args, argTypes, getArgs }),
  template: `
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <Button
          v-for="option in argTypes?.[args.enum]?.options"
          v-bind="getArgs(args, option)"
          :key="option"
      >
        ${args.slotTemplate || '{{ option }}'}
      </Button>
    </div>
  `,
});

export const Default: Story = {};

export const Colors = EnumTemplate.bind({});
Colors.args = { enum: 'color' };

export const Sizes = EnumTemplate.bind({});
Sizes.args = { enum: 'size', color: 'tonal' };

export const Shapes = EnumTemplate.bind({});
Shapes.args = { enum: 'shape', color: 'tonal' };

export const Disabled = EnumTemplate.bind({});
Disabled.args = { enum: 'color', disabled: true };

export const Toggleable = EnumTemplate.bind({});
Toggleable.args = {
  enum: 'color',
  toggleable: true,
  slotTemplate: `
    <input type="checkbox" />
    {{ option }}
  `,
};

import type { Meta, StoryFn, StoryObj } from '@storybook/vue3-vite';
import IconButton from './IconButton.vue';
import type { IconButtonProps } from '@/components/IconButton/IconButton.vue';
import { getArgs } from '@/utils/storybook.ts';

const meta = {
  title: 'Components/Button/IconButton',
  component: IconButton,
  args: {
    toggleable: false,
    color: 'filled',
    size: 'small',
    shape: 'rounded',
    width: 'default',
    disabled: false,
    icon: 'favorite',
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

interface IconButtonArgs extends IconButtonProps {
  enum: 'color' | 'size' | 'shape' | 'width';
  slotTemplate?: string;
  outerEnum?: string;
}

const EnumTemplate: StoryFn<IconButtonArgs> = (args: IconButtonArgs, { argTypes }) => ({
  components: { IconButton },
  setup: () => ({ args, argTypes, getArgs }),
  template: `
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <IconButton
          v-for="option in argTypes?.[args.enum]?.options"
          v-bind="getArgs(args, option)"
          :key="option"
      >
        <template v-if="args.slotTemplate">
          ${args.slotTemplate}
        </template>
      </IconButton>
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

export const Widths = EnumTemplate.bind({});
Widths.args = { enum: 'width', color: 'tonal' };

export const Disabled = EnumTemplate.bind({});
Disabled.args = { enum: 'color', disabled: true };

export const Toggleable = EnumTemplate.bind({});
Toggleable.args = {
  enum: 'color',
  toggleable: true,
  slotTemplate: `
    <input type="checkbox" />
  `,
};

import type { Meta, StoryFn, StoryObj } from '@storybook/vue3-vite';
import Tooltip, { type TooltipProps } from "@/components/Tooltip/Tooltip.vue";
import { getArgs } from "@/utils/storybook.ts";

const meta = {
  component: Tooltip,
  args: {
    variant: 'plain',
    default: 'Tooltip',
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

interface TooltipArgs extends TooltipProps {
  enum: 'variant';
  slotTemplate?: string;
}

const EnumTemplate: StoryFn<TooltipArgs> = (args: TooltipArgs, { argTypes }) => ({
  components: { Tooltip },
  setup: () => ({ args, argTypes, getArgs }),
  template: `
    <Tooltip style="width: fit-content;"
             v-for="option in argTypes?.[args.enum]?.options"
             v-bind="getArgs(args, option)"
             :key="option">
      ${args.slotTemplate || '{{ option }}'}
    </Tooltip>
  `,
});

export const Default: Story = {}

export const Variants = EnumTemplate.bind({});
Variants.args = { enum: 'variant' };

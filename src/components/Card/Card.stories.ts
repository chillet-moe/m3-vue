import type { Meta, StoryFn, StoryObj } from '@storybook/vue3-vite';
import Card from './Card.vue';
import { getArgs } from '@/utils/storybook.ts';
import type { CardProps } from '@/components/Card/Card.vue';

const meta = {
  component: Card,
  args: {
    color: 'elevated',
    style: 'width: 100px; height: 100px;',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

interface CardArgs extends CardProps {
  enum: 'color';
  slotTemplate?: string;
}

const EnumTemplate: StoryFn<CardArgs> = (args: CardArgs, { argTypes }) => ({
  components: { Card },
  setup: () => ({ args, argTypes, getArgs }),
  template: `
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <Card
          v-for="option in argTypes?.[args.enum]?.options"
          v-bind="getArgs(args, option)"
          :key="option"
          style="width: 100px; height: 100px;"
      >
        <template v-if="args.slotTemplate">
          ${args.slotTemplate}
        </template>
      </Card>
    </div>
  `,
});

export const Default: Story = {};
Default.args = {};

export const Colors = EnumTemplate.bind({});
Colors.args = { enum: 'color', slotTemplate: '{{ option }}' };

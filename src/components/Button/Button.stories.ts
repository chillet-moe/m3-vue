import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Button from './Button.vue';

const meta = {
  component: Button,
  args: {
    toggleable: false,
    color: 'filled',
    size: 'medium',
    shape: 'rounded',
    disabled: false,
    default: 'Button',
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    default: 'Button',
  },
};
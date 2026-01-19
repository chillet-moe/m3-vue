import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { Button } from '.';

const meta = {
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    default: 'Button',
  },
};
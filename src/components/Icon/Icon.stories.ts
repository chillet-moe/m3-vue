import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Icon from '@/components/Icon/Icon.vue';

const meta = {
  component: Icon,
  args: {
    name: 'settings',
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { Icon },
    setup: () => ({ args }),
    template: `<Icon v-bind="args" />
    <br/>
    In the example, only 'favorite', 'home', 'search', 'settings' icons are available.
    <br/>
    For more icons, please refer to <a href="https://developers.google.com/fonts/docs/material_symbols">Material Symbols guide</a>.
    `,
  }),
};

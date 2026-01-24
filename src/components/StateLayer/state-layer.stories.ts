import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Utilities/State Layer',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    template: `<div 
      class="state-layer" 
      style="
        width: 200px;
        height: 100px;
        border: 1px solid rgb(var(--md-sys-color-outline));
        border-radius: var(--md-sys-shape-corner-full);
        --md-color-on-container: var(--md-sys-color-on-primary-container);
        --md-color-container: var(--md-sys-color-primary-container);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
      "
    >
      Click Me
    </div>`,
  }),
};

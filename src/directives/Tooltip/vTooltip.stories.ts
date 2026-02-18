import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { Button } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";

const meta = {
  title: 'Directives/Tooltip',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { Button, Tooltip },
    setup: () => ({ args }),
    template: `
      <Button
          v-tooltip="{
            target: '#tooltip',
            placement: 'bottom',
            interactive: true,
            popoverType: 'hint',
          }"
      >
        Button
      </Button>
      <Button
          v-tooltip="{
            target: '#tooltip2',
            placement: 'bottom',
            interactive: true,
            popoverType: 'hint',
          }"
      >
        Button
      </Button>

      <Tooltip id="tooltip" popover="hint">
        Hello, I'm a tooltip!
      </Tooltip>

      <Tooltip id="tooltip2" popover="hint" variant="rich">
        Hello, I'm a tooltip!
      </Tooltip>
    `
  }),
};
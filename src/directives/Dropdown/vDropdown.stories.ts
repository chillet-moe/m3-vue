import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { vDropdown } from '@/directives/Menu';

const meta = {
  title: 'Directives/Dropdown',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { Button, Card },
    directives: { dropdown: vDropdown },
    setup: () => {
      const selected = ref('None');

      const selectAction = (name: string) => {
        selected.value = name;
      };

      return { selectAction, selected };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; padding: 3rem;">
        <Button v-dropdown="'#custom-dropdown'">Open custom dropdown</Button>

        <Card
          id="custom-dropdown"
          popover="auto"
          style="inline-size: 16rem; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; position: fixed; inset: auto; inset-inline-start: anchor(start); inset-block-start: calc(anchor(bottom) + 0.25rem);"
        >
          <button type="button" style="all: unset; cursor: pointer; padding: 0.75rem; border-radius: 0.5rem;" @click="selectAction('Preview')">
            Preview
          </button>
          <button type="button" style="all: unset; cursor: pointer; padding: 0.75rem; border-radius: 0.5rem;" @click="selectAction('Share')">
            Share
          </button>
          <button type="button" style="all: unset; cursor: pointer; padding: 0.75rem; border-radius: 0.5rem;" @click="selectAction('Delete')">
            Delete
          </button>
        </Card>

        <div>Selected: {{ selected }}</div>
      </div>
    `,
  }),
};

import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { showDialog } from './showDialog';

const meta = {
  title: 'Functions/showDialog',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Programmatic convenience API for showing a dialog without manually rendering the Dialog component.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { Button },
    setup() {
      const result = ref('');

      const openDialog = async () => {
        result.value = await showDialog({
          headline: 'Delete file?',
          content: 'This action cannot be undone.',
          actions: [
            { label: 'Cancel', value: 'cancel' },
            { label: 'Delete', value: 'confirm' },
          ],
        });
      };

      return {
        result,
        openDialog,
      };
    },
    template: `
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 1rem;">
        <Button @click="openDialog">Open with showDialog()</Button>
        <div v-if="result">Result: {{ result }}</div>
      </div>
    `,
  }),
};

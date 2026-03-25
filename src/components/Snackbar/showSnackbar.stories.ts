import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { showSnackbar } from './showSnackbar';

const meta = {
  title: 'Functions/showSnackbar',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Programmatic convenience API for showing snackbars without manually rendering the Snackbar component.',
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

      const openSnackbar = async () => {
        result.value = await showSnackbar({
          message: 'Draft archived',
          dismissible: true,
          action: {
            label: 'Undo',
            value: 'undo',
          },
        });
      };

      return {
        result,
        openSnackbar,
      };
    },
    template: `
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 1rem;">
        <Button @click="openSnackbar">Open with showSnackbar()</Button>
        <div v-if="result">Result: {{ result }}</div>
      </div>
    `,
  }),
};

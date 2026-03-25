import type { Meta, StoryFn } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import Dialog from './Dialog.vue';
import type { DialogProps } from './Dialog.vue';
import { showDialog } from './showDialog';

const meta = {
  title: 'Components/Dialog/Dialog',
  component: Dialog,
  args: {
    open: false,
    closeOnBackdrop: true,
  },
} satisfies Meta<typeof Dialog>;

export default meta;

interface DialogArgs extends DialogProps {
  open: boolean;
}

const BaseTemplate: StoryFn<DialogArgs> = (args: DialogArgs) => ({
  components: { Button, Dialog },
  setup: () => ({ args }),
  template: `
    <Button @click="args.open = true">Open dialog</Button>

    <Dialog v-bind="args" v-model:open="args.open">
      <template #headline>Delete file?</template>
      The file will be permanently removed from your workspace.

      <template #actions>
        <Button color="text" @click="args.open = false">Cancel</Button>
        <Button color="text" @click="args.open = false">Delete</Button>
      </template>
    </Dialog>
  `,
});

const IconTemplate: StoryFn<DialogArgs> = (args: DialogArgs) => ({
  components: { Button, Dialog, Icon },
  setup: () => ({ args }),
  template: `
    <Button @click="args.open = true">Open dialog</Button>

    <Dialog v-bind="args" v-model:open="args.open">
      <template #icon><Icon name="info" /></template>
      <template #headline>Sync paused</template>
      Changes are saved locally and will upload automatically when the network is available again.

      <template #actions>
        <Button color="text" @click="args.open = false">Dismiss</Button>
        <Button color="text" @click="args.open = false">Retry now</Button>
      </template>
    </Dialog>
  `,
});

export const Default = BaseTemplate.bind({});

export const WithIcon = IconTemplate.bind({});

export const Programmatic: StoryFn = () => ({
  components: { Button },
  setup: () => {
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
});

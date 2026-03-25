import type { Meta, StoryFn, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Snackbar from './Snackbar.vue';
import type { SnackbarProps } from './Snackbar.vue';

const meta = {
  component: Snackbar,
  args: {
    actionLabel: 'Undo',
    actionDisabled: false,
    actionAutofocus: false,
    actionOnNewLine: false,
    dismissible: true,
    dismissButtonLabel: 'Dismiss notification',
  },
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

interface SnackbarArgs extends SnackbarProps {
  message: string;
}

const BaseTemplate: StoryFn<SnackbarArgs> = (args: SnackbarArgs) => ({
  components: { Snackbar },
  setup() {
    const lastEvent = ref('');

    return {
      args,
      lastEvent,
      handleAction() {
        lastEvent.value = 'action';
      },
      handleDismiss() {
        lastEvent.value = 'dismiss';
      },
    };
  },
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem; inline-size: min(36rem, 100%);">
      <Snackbar v-bind="args" @action="handleAction" @dismiss="handleDismiss">
        {{ args.message }}
      </Snackbar>
      <div v-if="lastEvent">Last event: {{ lastEvent }}</div>
    </div>
  `,
});

const OptionTemplate: StoryFn<SnackbarArgs> = (args: SnackbarArgs) => ({
  components: { Snackbar },
  setup: () => ({ args }),
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem; inline-size: min(36rem, 100%);">
      <Snackbar v-bind="args" :action-label="undefined" :dismissible="false">
        Supporting text only
      </Snackbar>

      <Snackbar v-bind="args" :dismissible="false">
        Action only
      </Snackbar>

      <Snackbar v-bind="args" :action-label="undefined" dismissible>
        Dismiss only
      </Snackbar>

      <Snackbar v-bind="args">
        Action and dismiss
      </Snackbar>

      <Snackbar v-bind="args" action-disabled>
        Disabled action
      </Snackbar>
    </div>
  `,
});

const CombinationTemplate: StoryFn<SnackbarArgs> = (args: SnackbarArgs) => ({
  components: { Snackbar },
  setup: () => ({ args }),
  template: `
    <div style="display: grid; gap: 1.5rem;">
      <div style="display: grid; gap: 0.75rem;">
        <div>Single-line</div>
        <Snackbar v-bind="args" :action-label="undefined" :dismissible="false">
          File moved to trash
        </Snackbar>
      </div>

      <div style="display: grid; gap: 0.75rem;">
        <div>Single-line with action</div>
        <Snackbar v-bind="args" :dismissible="false">
          File moved to trash
        </Snackbar>
      </div>

      <div style="display: grid; gap: 0.75rem;">
        <div>Two lines</div>
        <Snackbar v-bind="args" :action-label="undefined" :dismissible="false">
          Your changes were saved locally and will sync when the connection is available again.
        </Snackbar>
      </div>

      <div style="display: grid; gap: 0.75rem;">
        <div>Two lines with action</div>
        <Snackbar v-bind="args" action-label="Undo">
          Your changes were saved locally and will sync when the connection is available again.
        </Snackbar>
      </div>

      <div style="display: grid; gap: 0.75rem;">
        <div>Two lines with longer action</div>
        <Snackbar v-bind="args" action-label="Review details" action-on-new-line>
          Your changes were saved locally and will sync when the connection is available again.
        </Snackbar>
      </div>

      <div style="display: grid; gap: 0.75rem;">
        <div>Dismiss only with long text</div>
        <Snackbar v-bind="args" :action-label="undefined" dismissible>
          Download paused because the storage quota for this workspace has been reached.
        </Snackbar>
      </div>
    </div>
  `,
});

export const Default = BaseTemplate.bind({});
Default.args = {
  message: 'Message archived',
};

export const Options = OptionTemplate.bind({});
Options.args = {
  message: 'Message archived',
};

export const Combinations = CombinationTemplate.bind({});
Combinations.args = {
  message: 'Message archived',
};

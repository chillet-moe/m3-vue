<script setup lang="ts">
import { useShape, type M3Shape } from '@/styles/shape';
import { computed, useId, useSlots } from 'vue';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';

export type SnackbarProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
  /** Label for the optional action button. */
  actionLabel?: string;

  /** Whether the action button is disabled. */
  actionDisabled?: boolean;

  /** Whether the action button should autofocus when rendered. */
  actionAutofocus?: boolean;

  /** Whether the action should be placed on a separate line. */
  actionOnNewLine?: boolean;

  /** Whether to show a dismiss button. */
  dismissible?: boolean;

  /** Accessible label for the dismiss button. */
  dismissButtonLabel?: string;
};

const {
  shape: shapeProp,
  actionLabel = undefined,
  actionDisabled = false,
  actionAutofocus = false,
  actionOnNewLine = false,
  dismissible = false,
  dismissButtonLabel = 'Dismiss notification',
} = defineProps<SnackbarProps>();

const emit = defineEmits<{
  /** Fired when the action button is pressed. */
  action: [];

  /** Fired when the dismiss button is pressed. */
  dismiss: [];
}>();

defineSlots<{
  /** Supporting text content for the snackbar. */
  default(): any;

  /** Optional custom action content. */
  action(): any;

  /** Optional custom dismiss content. */
  dismiss(): any;
}>();

const slots = useSlots();
const contentId = `snackbar-content-${useId()}`;
const hasAction = computed(() => Boolean(actionLabel || slots.action));
const hasDismiss = computed(() => dismissible || Boolean(slots.dismiss));
const actionLayout = computed(() => (actionOnNewLine && hasAction.value ? 'new-line' : 'inline'));
const shape = useShape(() => shapeProp);
</script>

<template>
  <section
    :class="'m3-snackbar'"
    data-scope="snackbar"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    :data-action-layout="actionLayout"
    role="status"
    aria-live="polite"
    aria-atomic="true"
    :aria-labelledby="contentId"
  >
    <div :id="contentId" :class="'m3-snackbar-content'" data-scope="snackbar" data-part="content">
      <slot />
    </div>

    <div v-if="hasAction || hasDismiss" :class="'m3-snackbar-actions'" data-scope="snackbar" data-part="actions">
      <Button
        v-if="hasAction"
        :class="'m3-snackbar-action-button'"
        data-scope="snackbar"
        data-part="action-button"
        variant="text"
        size="small"
        :disabled="actionDisabled"
        :autofocus="actionAutofocus"
        @click="emit('action')"
      >
        <slot name="action">
          {{ actionLabel }}
        </slot>
      </Button>

      <IconButton
        v-if="hasDismiss"
        :class="'m3-snackbar-dismiss-button'"
        data-scope="snackbar"
        data-part="dismiss-button"
        variant="standard"
        size="small"
        :aria-label="dismissButtonLabel"
        :icon="slots.dismiss ? undefined : 'close'"
        @click="emit('dismiss')"
      >
        <slot name="dismiss" />
      </IconButton>
    </div>
  </section>
</template>

<style src="./Snackbar.css"></style>

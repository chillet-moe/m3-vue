<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, useId, useTemplateRef, watch } from 'vue';
import {
  ColorPicker,
  type ColorPickerLayout,
  type ColorPickerSpace,
  type ColorPickerValue,
} from '@/components/ColorPicker';
import { useHexInput } from '@/components/ColorPicker/useHexInput';
import ColorSwatch from '@/components/ColorPicker/ColorSwatch.vue';
import { Popover } from '@/components/Popover';
import { IconButton } from '@/components/IconButton';
import { TextField, type TextFieldSingleLineProps } from '@/components/TextField';
import { useM3Locale } from '@/locales/context';

defineOptions({ inheritAttrs: false });
export type ColorFieldProps = Pick<
  TextFieldSingleLineProps,
  | 'id'
  | 'label'
  | 'labelBehavior'
  | 'labelClearance'
  | 'alwaysFloatLabel'
  | 'name'
  | 'size'
  | 'shape'
  | 'placeholder'
  | 'supportingText'
  | 'error'
  | 'required'
  | 'disabled'
  | 'readonly'
> & {
  /** Show opacity controls and include alpha in the Hex display. */
  alpha?: boolean;
  /** Restore this color with the picker's reset action. */
  defaultValue?: ColorPickerValue;
};
const { alpha = true, defaultValue, disabled, readonly, label } = defineProps<ColorFieldProps>();
/** Unpremultiplied, encoded sRGB with floating-point channels in [0, 1]. */
const value = defineModel<ColorPickerValue>('value', { required: true });
const layout = defineModel<ColorPickerLayout>('layout', { default: 'sv-h' });
const space = defineModel<ColorPickerSpace>('channelSpace', { default: 'srgb' });

const { messages } = useM3Locale();
const pickerName = computed(() =>
  label ? `${messages.value.colorPicker.picker} (${label})` : messages.value.colorPicker.picker,
);
const locked = computed(() => Boolean(disabled || readonly));
const { text, commit, keydown } = useHexInput(
  value,
  () => alpha,
  () => locked.value,
);
const popoverId = useId();
const trigger = shallowRef<HTMLButtonElement>();
const picker = useTemplateRef('picker');
const open = ref(false);
// Mount on first use and retain the editor's hue and saturation across openings.
const hasOpened = ref(false);
async function toggle(event: MouseEvent) {
  if (locked.value) return;
  trigger.value = event.currentTarget as HTMLButtonElement;
  open.value = !open.value;
  if (open.value) {
    hasOpened.value = true;
    await nextTick();
    picker.value?.focus();
  }
}
function close() {
  open.value = false;
  trigger.value?.focus();
}
watch(locked, (off) => {
  if (off) open.value = false;
});
</script>

<template>
  <TextField
    class="m3-color-field"
    :aria-label="label ? undefined : 'Hex'"
    v-bind="$attrs"
    :id="id"
    :label="label"
    :label-behavior="labelBehavior"
    :label-clearance="labelClearance"
    :always-float-label="alwaysFloatLabel"
    :name="name"
    :size="size"
    :shape="shape"
    :placeholder="placeholder"
    :supporting-text="supportingText"
    :error="error"
    :required="required"
    v-model="text"
    as="input"
    type="text"
    spellcheck="false"
    autocomplete="off"
    :disabled="disabled"
    :readonly="readonly"
    @blur="commit"
    @keydown="keydown"
  >
    <template #trailing>
      <IconButton
        size="extra-small"
        data-scope="color-field"
        data-part="trigger"
        aria-haspopup="dialog"
        :title="pickerName"
        :aria-controls="popoverId"
        :aria-expanded="open"
        :disabled="locked"
        @click="toggle"
      >
        <ColorSwatch
          :value="value"
          class="m3-color-field-swatch"
          data-scope="color-field"
          data-part="preview"
          aria-hidden="true"
        />
      </IconButton>
    </template>
  </TextField>
  <Popover
    :id="popoverId"
    v-model:open="open"
    class="m3-color-field-popover"
    :anchor-element="trigger ?? undefined"
    role="dialog"
    :aria-label="pickerName"
  >
    <ColorPicker
      v-if="hasOpened"
      ref="picker"
      v-model:value="value"
      v-model:layout="layout"
      v-model:channel-space="space"
      :alpha="alpha"
      :default-value="defaultValue"
      :disabled="locked"
      @close="close"
    />
  </Popover>
</template>

<style src="./ColorField.css"></style>

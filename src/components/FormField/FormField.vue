<script setup lang="ts">
export type FormFieldProps = {
  /** Text label displayed above the control. */
  label?: string;

  /** Associates the label with a control id. */
  for?: string;

  /** Supporting text displayed below the control. */
  supportingText?: string;

  /** Error text displayed below the control. */
  errorText?: string;

  /** Whether to append required mark after label. */
  required?: boolean;
};

const props = withDefaults(defineProps<FormFieldProps>(), {
  label: undefined,
  for: undefined,
  supportingText: undefined,
  errorText: undefined,
  required: false,
});
</script>

<template>
  <div
    :class="'m3-form-field'"
    data-scope="form-field"
    data-part="root"
    :data-invalid="props.errorText ? 'true' : 'false'"
  >
    <label
      v-if="props.label || $slots.label"
      :class="'m3-form-field-label'"
      data-scope="form-field"
      data-part="label"
      :for="props.for"
    >
      <slot name="label">{{ props.label }}</slot>
      <span
        v-if="props.required"
        :class="'m3-form-field-required'"
        data-scope="form-field"
        data-part="required"
        aria-hidden="true"
        >*</span
      >
    </label>

    <div :class="'m3-form-field-control'" data-scope="form-field" data-part="control">
      <slot />
    </div>

    <div
      v-if="props.errorText || props.supportingText || $slots.supporting"
      :class="'m3-form-field-supporting'"
      data-scope="form-field"
      data-part="supporting"
    >
      <slot name="supporting">{{ props.errorText ?? props.supportingText }}</slot>
    </div>
  </div>
</template>

<style src="./FormField.css"></style>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import Select from '@/components/Select/Select.vue';
import type { SelectModelValue, SelectOption, SelectProps } from '@/components/Select/Select.vue';

export type ComboboxProps = Omit<SelectProps, 'filterable'>;

type SelectInstance = InstanceType<typeof Select> & {
  el?: unknown;
  focus?: () => void;
  blur?: () => void;
  show?: () => Promise<void>;
  hide?: () => void;
  toggle?: () => void;
};

const props = defineProps<ComboboxProps>();
const attrs = useAttrs();
const forwardedProps = computed(() => ({
  ...attrs,
  ...props,
}));

const emit = defineEmits<{
  change: [value: SelectModelValue];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

defineSlots<{
  leading(): any;
  prefix(): any;
  suffix(): any;
  trailing(): any;
  optionLeading(props: { option: SelectOption; selected: boolean }): any;
  optionTrailing(props: { option: SelectOption; selected: boolean }): any;
}>();

const modelValue = defineModel<SelectModelValue>();
const open = defineModel<boolean>('open', { default: false });

const selectRef = ref<SelectInstance>();

function focus() {
  selectRef.value?.focus?.();
}

function blur() {
  selectRef.value?.blur?.();
}

async function show() {
  await selectRef.value?.show?.();
}

function hide() {
  selectRef.value?.hide?.();
}

function toggle() {
  selectRef.value?.toggle?.();
}

defineExpose({
  el: selectRef,
  focus,
  blur,
  show,
  hide,
  toggle,
});
</script>

<template>
  <Select
    ref="selectRef"
    v-bind="forwardedProps"
    v-model="modelValue"
    v-model:open="open"
    filterable
    @change="emit('change', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <template v-if="$slots.leading" #leading>
      <slot name="leading" />
    </template>

    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>

    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix" />
    </template>

    <template v-if="$slots.trailing" #trailing>
      <slot name="trailing" />
    </template>

    <template v-if="$slots.optionLeading" #optionLeading="{ option, selected }">
      <slot name="optionLeading" :option="option" :selected="selected" />
    </template>

    <template v-if="$slots.optionTrailing" #optionTrailing="{ option, selected }">
      <slot name="optionTrailing" :option="option" :selected="selected" />
    </template>
  </Select>
</template>

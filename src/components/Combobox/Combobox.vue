<script setup lang="ts">
import { computed, ref } from 'vue';
import type { SelectListSlot } from '@/composables/selectTypes';
import Select from '@/components/Select/Select.vue';
import type { SelectModelValue, SelectOption, SelectProps } from '@/components/Select/Select.vue';

export type ComboboxProps = Omit<SelectProps, 'filterable'>;

const props = withDefaults(defineProps<ComboboxProps>(), { showSelectedIcon: undefined });
// Vue forwards attrs to Select. Cache the declared props across attribute-only updates.
const forwardedProps = computed(() => ({ ...props }));

const emit = defineEmits<{
  change: [value: SelectModelValue];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  /** Fired after the dropdown menu's visual exit finishes. */
  closed: [];
}>();

defineSlots<{
  list?(props: SelectListSlot): any;
  leading?(): any;
  prefix?(): any;
  suffix?(): any;
  trailing?(): any;
  optionLeading?(props: { option: SelectOption; selected: boolean }): any;
  optionTrailing?(props: { option: SelectOption; selected: boolean }): any;
}>();

const fieldSlots = ['leading', 'prefix', 'suffix', 'trailing'] as const;
const optionSlots = ['optionLeading', 'optionTrailing'] as const;

const modelValue = defineModel<SelectModelValue>();
const query = defineModel<string>('query', { default: '' });
const open = defineModel<boolean>('open', { default: false });

const selectRef = ref<InstanceType<typeof Select>>();

function focus() {
  selectRef.value?.focus();
}

function blur() {
  selectRef.value?.blur();
}

async function show() {
  await selectRef.value?.show();
}

function hide() {
  selectRef.value?.hide();
}

function toggle() {
  selectRef.value?.toggle();
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
    v-model:query="query"
    filterable
    @change="emit('change', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
    @closed="emit('closed')"
  >
    <template v-if="$slots.list" #list="list">
      <slot name="list" v-bind="list" />
    </template>
    <template v-for="name in fieldSlots.filter((name) => $slots[name])" #[name]>
      <slot :name="name" />
    </template>
    <template v-for="name in optionSlots.filter((name) => $slots[name])" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </Select>
</template>

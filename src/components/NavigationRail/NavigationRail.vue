<script setup lang="ts">
import { provideShape, type M3Shape } from '@/styles/shape';
import { provideRowSize, type RowSize } from '@/styles/rowSize';
import { computed, provide, toRef, type FunctionalComponent } from 'vue';
import { navigationRailContextKey } from './NavigationRailContext';

export type NavigationRailProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
  /** Row size; inherits the nearest row size or defaults to medium. */
  size?: RowSize;
  /** Accessible label for the navigation landmark. */
  ariaLabel?: string;

  /** Disable all items inside the rail. */
  disabled?: boolean;
};

const props = withDefaults(defineProps<NavigationRailProps>(), {
  ariaLabel: 'Navigation rail',
  disabled: false,
});

const modelValue = defineModel<string>();
const stateModel = defineModel<'collapsed' | 'expanded'>('state', {
  default: 'collapsed',
});

defineSlots<{
  /** Navigation destinations. Usually a list of NavigationRailItem components. */
  default(props: { value: string | undefined; disabled: boolean; state: 'collapsed' | 'expanded' }): any;

  /** Leading slot for other components, such as a header or a floating action button. */
  leading(props: { value: string | undefined; disabled: boolean; state: 'collapsed' | 'expanded' }): any;

  /** Trailing slot for other components, such as a header or a floating action button. */
  trailing(props: { value: string | undefined; disabled: boolean; state: 'collapsed' | 'expanded' }): any;
}>();

const selectedValue = computed(() => modelValue.value);
const railState = computed(() => stateModel.value ?? 'collapsed');

// Track selection in the slot only when its content reads it.
const slotProps = {
  get value() {
    return selectedValue.value;
  },
  get disabled() {
    return props.disabled;
  },
  get state() {
    return railState.value;
  },
};

const Content: FunctionalComponent = (_, { slots }) => slots.default?.();

const activate = (value: string) => {
  if (props.disabled) {
    return;
  }

  modelValue.value = value;
};

provide(navigationRailContextKey, {
  value: selectedValue,
  state: railState,
  disabled: toRef(() => props.disabled),
  activate,
});
const rowSize = provideRowSize(() => props.size);
const shape = provideShape(() => props.shape);
</script>

<template>
  <nav
    class="m3-navigation-rail"
    :data-size="rowSize"
    role="navigation"
    data-scope="navigation-rail"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    :data-state="railState"
    :data-disabled="props.disabled ? 'true' : undefined"
    :aria-label="props.ariaLabel"
  >
    <slot name="leading" v-bind="slotProps" />

    <div class="m3-navigation-rail-items" data-scope="navigation-rail" data-part="items">
      <Content><slot v-bind="slotProps" /></Content>
    </div>

    <slot name="trailing" v-bind="slotProps" />
  </nav>
</template>

<style src="./NavigationRail.css"></style>

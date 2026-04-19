<script setup lang="ts">
import { computed, provide, toRef } from 'vue';
import { navigationRailContextKey } from './NavigationRailContext';

export type NavigationRailProps = {
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
</script>

<template>
  <nav
    class="m3-navigation-rail"
    role="navigation"
    data-scope="navigation-rail"
    data-part="root"
    :data-state="railState"
    :data-disabled="props.disabled ? 'true' : undefined"
    :aria-label="props.ariaLabel"
  >
    <slot name="leading" :value="selectedValue" :disabled="props.disabled" :state="railState" />

    <div class="m3-navigation-rail-items" data-scope="navigation-rail" data-part="items">
      <slot :value="selectedValue" :disabled="props.disabled" :state="railState" />
    </div>

    <slot name="trailing" :value="selectedValue" :disabled="props.disabled" :state="railState" />
  </nav>
</template>

<style src="./NavigationRail.css"></style>

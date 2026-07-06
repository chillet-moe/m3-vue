<script setup lang="ts">
import { computed, provide, toRef } from 'vue';
import { navigationDrawerContextKey } from './NavigationDrawerContext';

export type NavigationDrawerIconSpace = 'none' | 'root' | 'all';

export type NavigationDrawerProps = {
  /** Accessible label for the navigation landmark. */
  ariaLabel?: string;

  /** Disable all items inside the drawer. */
  disabled?: boolean;

  /** Controls where leading icon space is reserved for items and sections that do not render an icon. */
  iconSpace?: NavigationDrawerIconSpace;
};

const props = withDefaults(defineProps<NavigationDrawerProps>(), {
  ariaLabel: 'Navigation drawer',
  disabled: false,
  iconSpace: 'none',
});

const modelValue = defineModel<string>();
const selectedValue = computed(() => modelValue.value);

defineSlots<{
  /** Optional header content above navigation items. */
  header(props: { value: string | undefined; disabled: boolean }): any;

  /** Navigation destinations. Usually NavigationDrawerItem and NavigationDrawerSection components. */
  default(props: { value: string | undefined; disabled: boolean }): any;

  /** Optional footer content below navigation items. */
  footer(props: { value: string | undefined; disabled: boolean }): any;
}>();

const activate = (value: string) => {
  if (props.disabled) {
    return;
  }

  modelValue.value = value;
};

provide(navigationDrawerContextKey, {
  value: selectedValue,
  disabled: toRef(() => props.disabled),
  activate,
});
</script>

<template>
  <nav
    class="m3-navigation-drawer"
    role="navigation"
    data-scope="navigation-drawer"
    data-part="root"
    :data-disabled="props.disabled ? 'true' : undefined"
    :data-icon-space="props.iconSpace"
    :aria-label="props.ariaLabel"
  >
    <div v-if="$slots.header" class="m3-navigation-drawer-header" data-scope="navigation-drawer" data-part="header">
      <slot name="header" :value="selectedValue" :disabled="props.disabled" />
    </div>

    <div class="m3-navigation-drawer-items" data-scope="navigation-drawer" data-part="items">
      <slot :value="selectedValue" :disabled="props.disabled" />
    </div>

    <div v-if="$slots.footer" class="m3-navigation-drawer-footer" data-scope="navigation-drawer" data-part="footer">
      <slot name="footer" :value="selectedValue" :disabled="props.disabled" />
    </div>
  </nav>
</template>

<style src="./NavigationDrawer.css"></style>

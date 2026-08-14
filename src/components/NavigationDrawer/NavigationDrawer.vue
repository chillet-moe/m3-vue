<script setup lang="ts">
import { computed, provide, toRef } from 'vue';
import { navigationDrawerContextKey } from './NavigationDrawerContext';

export type NavigationDrawerIconSpace = 'none' | 'root' | 'all';
export type NavigationDrawerShape = 'rounded' | 'square';

export type NavigationDrawerProps = {
  /** Accessible label for the navigation landmark. */
  ariaLabel?: string;

  /** Disable all items inside the drawer. */
  disabled?: boolean;

  /** Controls where leading icon space is reserved for items and sections that do not render an icon. */
  iconSpace?: NavigationDrawerIconSpace;

  /** Show only leading icons while keeping labels available to assistive technologies. */
  iconOnly?: boolean;

  /** Default shape for items and section triggers inside the drawer. */
  shape?: NavigationDrawerShape;
};

const props = withDefaults(defineProps<NavigationDrawerProps>(), {
  ariaLabel: 'Navigation drawer',
  disabled: false,
  iconSpace: 'none',
  iconOnly: false,
  shape: 'rounded',
});

const modelValue = defineModel<string>();
const selectedValue = computed(() => modelValue.value);
const slotProps = computed(() => ({
  value: selectedValue.value,
  disabled: props.disabled,
  iconOnly: props.iconOnly,
}));

defineSlots<{
  /** Optional header content above navigation items. */
  header(props: { value: string | undefined; disabled: boolean; iconOnly: boolean }): any;

  /** Navigation destinations. Usually NavigationDrawerItem and NavigationDrawerSection components. */
  default(props: { value: string | undefined; disabled: boolean; iconOnly: boolean }): any;

  /** Optional footer content below navigation items. */
  footer(props: { value: string | undefined; disabled: boolean; iconOnly: boolean }): any;
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
  iconOnly: toRef(() => props.iconOnly),
  shape: toRef(() => props.shape),
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
    :data-icon-only="props.iconOnly ? 'true' : undefined"
    :aria-label="props.ariaLabel"
  >
    <div v-if="$slots.header" class="m3-navigation-drawer-header" data-scope="navigation-drawer" data-part="header">
      <slot name="header" v-bind="slotProps" />
    </div>

    <div class="m3-navigation-drawer-items" data-scope="navigation-drawer" data-part="items">
      <slot v-bind="slotProps" />
    </div>

    <div v-if="$slots.footer" class="m3-navigation-drawer-footer" data-scope="navigation-drawer" data-part="footer">
      <slot name="footer" v-bind="slotProps" />
    </div>
  </nav>
</template>

<style src="./NavigationDrawer.css"></style>

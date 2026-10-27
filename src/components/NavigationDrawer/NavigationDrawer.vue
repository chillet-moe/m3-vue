<script setup lang="ts">
import { useShape, type M3Shape } from '@/styles/shape';
import { provideRowSize, type RowSize } from '@/styles/rowSize';
import { computed, inject, provide, toRef, unref } from 'vue';
import { navigationDrawerContextKey, navigationDrawerShapeContextKey } from './NavigationDrawerContext';

export type NavigationDrawerIconSpace = 'none' | 'root' | 'all';
export type NavigationDrawerShape = M3Shape;

export type NavigationDrawerProps = {
  /** Row size; inherits the nearest row size or defaults to medium. */
  size?: RowSize;
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
  shape: undefined,
});

const modelValue = defineModel<string>();
const selectedValue = computed(() => modelValue.value);
const globalShape = inject(navigationDrawerShapeContextKey, undefined);
const shape = useShape(() => props.shape ?? unref(globalShape?.shape));
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
  shape,
  activate,
});
const rowSize = provideRowSize(() => props.size);
</script>

<template>
  <nav
    class="m3-navigation-drawer"
    :data-size="rowSize"
    role="navigation"
    data-scope="navigation-drawer"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
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

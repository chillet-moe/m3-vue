<script setup lang="ts">
import { Icon } from '@/components/Icon';
import vTooltip from '@/directives/Tooltip/vTooltip';
import type { VTooltipBinding } from '@/directives/Tooltip/types';
import { computed, inject, provide, useId, useSlots } from 'vue';
import { navigationDrawerContextKey } from './NavigationDrawerContext';

export type NavigationDrawerSectionProps = {
  /** Default icon name (Material Symbols Outlined). */
  icon?: string;

  /** Fallback label text when label slot is not provided. */
  label?: string;

  /** Disable the section trigger and all nested content. */
  disabled?: boolean;

  /** Accessible label for the expand trigger. */
  ariaLabel?: string;
};

const props = withDefaults(defineProps<NavigationDrawerSectionProps>(), {
  icon: undefined,
  label: undefined,
  disabled: false,
  ariaLabel: undefined,
});

const expanded = defineModel<boolean>('expanded', {
  default: false,
});

defineSlots<{
  /** Nested navigation destinations. */
  default(props: { expanded: boolean; disabled: boolean; iconOnly: boolean }): any;

  /** Section label content. */
  label(props: { expanded: boolean; disabled: boolean; iconOnly: boolean }): any;

  /** Icon content. */
  icon(props: { expanded: boolean; disabled: boolean; iconOnly: boolean }): any;
}>();

const slots = useSlots();
const drawer = inject(navigationDrawerContextKey, null);
const contentId = `navigation-drawer-section-content-${useId()}`;

const isIconOnly = computed(() => drawer?.iconOnly.value ?? false);
const mergedDisabled = computed(() => props.disabled || drawer?.disabled.value || false);
const hasLabel = computed(() => Boolean(props.label || slots.label));

const resolvedAriaLabel = computed(() => {
  if (props.ariaLabel) {
    return props.ariaLabel;
  }

  if (isIconOnly.value && props.label) {
    return props.label;
  }

  if (hasLabel.value) {
    return undefined;
  }

  return props.label;
});

const slotProps = computed(() => ({
  expanded: expanded.value,
  disabled: mergedDisabled.value,
  iconOnly: isIconOnly.value,
}));

const tooltipContent = computed(() => props.label ?? props.ariaLabel);
const tooltip = computed<VTooltipBinding>(() => {
  if (!isIconOnly.value || !tooltipContent.value) {
    return undefined;
  }

  return {
    content: tooltipContent.value,
    placement: 'end',
    interactive: false,
    triggerAria: 'describedby',
  };
});

provide(navigationDrawerContextKey, {
  value: computed(() => drawer?.value.value),
  disabled: mergedDisabled,
  iconOnly: isIconOnly,
  activate: (value) => drawer?.activate(value),
});

const toggle = () => {
  if (mergedDisabled.value) {
    return;
  }

  expanded.value = !expanded.value;
};
</script>

<template>
  <section
    class="m3-navigation-drawer-section"
    data-scope="navigation-drawer-section"
    data-part="root"
    :data-expanded="expanded ? 'true' : undefined"
    :data-disabled="mergedDisabled ? 'true' : undefined"
  >
    <button
      class="m3-navigation-drawer-section-trigger m3-state-layer"
      data-scope="navigation-drawer-section"
      data-part="trigger"
      type="button"
      :disabled="mergedDisabled"
      :aria-expanded="expanded ? 'true' : 'false'"
      :aria-controls="contentId"
      :aria-label="resolvedAriaLabel"
      v-tooltip="tooltip"
      @click="toggle"
    >
      <span
        v-if="props.icon || $slots.icon"
        class="m3-navigation-drawer-section-leading"
        data-scope="navigation-drawer-section"
        data-part="leading"
      >
        <slot name="icon" v-bind="slotProps">
          <Icon v-if="props.icon" :name="props.icon" class="m3-navigation-drawer-section-icon m3-icon-morph" />
        </slot>
      </span>

      <span
        v-if="hasLabel"
        class="m3-navigation-drawer-section-label m3-text-morph"
        data-scope="navigation-drawer-section"
        data-part="label"
      >
        <slot name="label" v-bind="slotProps">{{ props.label }}</slot>
      </span>

      <Icon
        name="keyboard_arrow_down"
        class="m3-navigation-drawer-section-chevron"
        data-scope="navigation-drawer-section"
        data-part="chevron"
        aria-hidden="true"
      />
    </button>

    <div
      :id="contentId"
      class="m3-navigation-drawer-section-content"
      data-scope="navigation-drawer-section"
      data-part="content"
      :aria-hidden="expanded ? undefined : 'true'"
    >
      <div
        class="m3-navigation-drawer-section-content-inner"
        data-scope="navigation-drawer-section"
        data-part="content-inner"
      >
        <slot v-bind="slotProps" />
      </div>
    </div>
  </section>
</template>

<style src="./NavigationDrawerItem.css"></style>

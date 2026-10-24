<script setup lang="ts">
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { listItemContextKey } from './ListItemContext';
import { buttonContextKey } from '@/components/Button/ButtonContext.ts';
import { Icon } from '@/components/Icon';
import { useLinkTag } from '@/composables/useLinkTag';
import { usePressShapeMorph } from '@/composables/usePressShapeMorph';
import { computed, inject, unref, useSlots } from 'vue';
import type { ButtonProps } from '@/components/Button';

type ListItemButtonProps = Omit<ButtonProps, 'toggleable' | 'variant' | 'size' | 'pressShapeMorph'>;

export type ListItemProps = ListItemButtonProps & {
  /** Standard fixed highlight or expressive expanding indicator and press morph. */
  appearance?: 'standard' | 'expressive';

  /** Whether the whole item is an interactive action or link. */
  interactive?: boolean;

  /** Highlight the item as active/selected. */
  active?: boolean;

  /** Fallback title when default slot is not provided. */
  title?: string;

  /** Fallback description when description slot is not provided. */
  description?: string;
};

const props = withDefaults(defineProps<ListItemProps>(), {
  appearance: undefined,
  interactive: true,
  active: false,
  href: undefined,
  size: undefined,
  shape: undefined,
  leadingIcon: undefined,
  trailingIcon: undefined,
  disabled: undefined,
  title: undefined,
  description: undefined,
});

const context = inject(buttonContextKey, undefined);
const defaults = inject(listItemContextKey, undefined);
const appearance = computed(() => props.appearance ?? unref(defaults?.appearance) ?? 'standard');
const interactive = computed(() => props.interactive);
const shape = computed(() => props.shape ?? unref(context?.shape) ?? 'rounded');
const disabled = computed(() => props.disabled ?? unref(context?.disabled) ?? false);

const { tag, nativeDisabled, ariaDisabled, href, tabIndex, type } = useLinkTag({
  defaultTag: computed(() => (interactive.value ? 'button' : 'div')),
  href: computed(() => (interactive.value ? props.href : undefined)),
  disabled,
});

const { pressShapeMorphAttrs } = usePressShapeMorph({
  enabled: computed(() => interactive.value && appearance.value === 'expressive'),
  disabled,
});

defineSlots<{
  /** Optional content above the main row. */
  header(props: { active: boolean; disabled: boolean }): any;

  /** Optional leading content. */
  leading(props: { active: boolean; disabled: boolean }): any;

  /** Main title content. */
  default(props: { active: boolean; disabled: boolean }): any;

  /** Optional description below the title. */
  description(props: { active: boolean; disabled: boolean }): any;

  /** Optional trailing content. */
  trailing(props: { active: boolean; disabled: boolean }): any;

  /** Optional content below the main row. */
  footer(props: { active: boolean; disabled: boolean }): any;
}>();

const slots = useSlots();

const hasHeader = computed(() => Boolean(slots.header));
const hasFooter = computed(() => Boolean(slots.footer));
const hasTitle = computed(() => Boolean(props.title || slots.default));
const hasDescription = computed(() => Boolean(props.description || slots.description));
const hasTrailing = computed(() => !props.trailingIcon && Boolean(slots.trailing));
const isSelected = computed(() => props.active);
const slotProps = computed(() => ({
  active: props.active,
  disabled: disabled.value,
}));
</script>

<template>
  <component
    v-state-layer
    :is="tag"
    :class="[
      'm3-item',
      appearance === 'expressive' && 'm3-morph-host',
      {
        'm3-state-layer': interactive,
        'm3-button': interactive,
      },
    ]"
    data-scope="item"
    data-part="root"
    :data-appearance="appearance"
    data-list-group-item
    data-variant="text"
    data-size="small"
    :data-shape="shape"
    :data-interactive="interactive ? 'true' : 'false'"
    :data-active="isSelected ? 'true' : undefined"
    :data-selected="isSelected ? 'true' : undefined"
    :href="href"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
    :aria-current="interactive && isSelected ? 'page' : undefined"
    :tabindex="tabIndex"
    :type="type"
    v-bind="interactive ? pressShapeMorphAttrs : undefined"
  >
    <Icon
      v-if="props.leadingIcon"
      :name="props.leadingIcon"
      :class="['m3-item-leading', 'm3-item-icon', appearance === 'expressive' && 'm3-icon-morph']"
      data-scope="item"
      data-part="leading"
      :disabled="disabled"
    />
    <span v-else-if="$slots.leading" class="m3-item-leading-slot" data-scope="item" data-part="leading">
      <slot name="leading" v-bind="slotProps" />
    </span>

    <span class="m3-item-main" data-scope="item" data-part="main">
      <span
        v-if="hasHeader"
        :class="['m3-item-header', appearance === 'expressive' && 'm3-text-morph']"
        data-scope="item"
        data-part="header"
      >
        <slot name="header" v-bind="slotProps" />
      </span>

      <span
        v-if="hasTitle"
        :class="['m3-item-title', appearance === 'expressive' && 'm3-text-morph']"
        data-scope="item"
        data-part="title"
      >
        <slot v-bind="slotProps">{{ props.title }}</slot>
      </span>

      <span
        v-if="hasDescription"
        :class="['m3-item-description', appearance === 'expressive' && 'm3-text-morph']"
        data-scope="item"
        data-part="description"
      >
        <slot name="description" v-bind="slotProps">{{ props.description }}</slot>
      </span>

      <span
        v-if="hasFooter"
        :class="['m3-item-footer', appearance === 'expressive' && 'm3-text-morph']"
        data-scope="item"
        data-part="footer"
      >
        <slot name="footer" v-bind="slotProps" />
      </span>
    </span>

    <Icon
      v-if="props.trailingIcon"
      :name="props.trailingIcon"
      :class="['m3-item-trailing', 'm3-item-icon', appearance === 'expressive' && 'm3-icon-morph']"
      data-scope="item"
      data-part="trailing"
      :disabled="disabled"
    />
    <span v-else-if="hasTrailing" class="m3-item-trailing-slot" data-scope="item" data-part="trailing">
      <slot name="trailing" v-bind="slotProps" />
    </span>
  </component>
</template>

<style src="./ListItem.css"></style>

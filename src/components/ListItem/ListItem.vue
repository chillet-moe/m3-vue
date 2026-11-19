<script setup lang="ts">
import { vFocusRing } from '@/directives/FocusRing';
import { useShape } from '@/styles/shape';
import { appearanceContextKey } from '@/styles/appearance';
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { listItemContextKey } from './ListItemContext';
import { buttonContextKey } from '@/components/Button/ButtonContext.ts';
import { Icon } from '@/components/Icon';
import { useLinkTag } from '@/composables/useLinkTag';
import { usePressShapeMorphAttrs } from '@/composables/usePressShapeMorph';
import { computed, inject, unref } from 'vue';
import type { ButtonProps } from '@/components/Button';
import '@/styles/icon-morph.css';

export type ListItemSize = NonNullable<ButtonProps['size']>;

type ListItemButtonProps = Omit<ButtonProps, 'toggleable' | 'variant' | 'size' | 'pressShapeMorph'>;

export type ListItemProps = ListItemButtonProps & {
  /** Row geometry preset. Public item tokens override individual dimensions. */
  size?: ListItemSize;

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
const appearanceDefaults = inject(appearanceContextKey, undefined);
const appearance = computed(
  () => props.appearance ?? unref(defaults?.appearance) ?? unref(appearanceDefaults?.appearance) ?? 'standard',
);
const size = computed(() => props.size ?? unref(defaults?.size) ?? 'medium');
const shape = useShape(() => props.shape ?? unref(context?.shape), 'rounded');
const disabled = computed(() => props.disabled ?? unref(context?.disabled) ?? false);

const link = useLinkTag({
  defaultTag: () => (props.interactive ? 'button' : 'div'),
  href: () => (props.interactive ? props.href : undefined),
  disabled,
});

const pressShapeMorphAttrs = usePressShapeMorphAttrs({
  enabled: computed(() => props.interactive && appearance.value === 'expressive'),
  disabled,
});

type ListItemSlotProps = { active: boolean; disabled: boolean };

defineSlots<{
  /** Optional content above the main row. */
  header(props: ListItemSlotProps): any;

  /** Optional leading content. */
  leading(props: ListItemSlotProps): any;

  /** Main title content. */
  default(props: ListItemSlotProps): any;

  /** Optional description below the title. */
  description(props: ListItemSlotProps): any;

  /** Optional trailing content. */
  trailing(props: ListItemSlotProps): any;

  /** Optional content below the main row. */
  footer(props: ListItemSlotProps): any;
}>();

const slotProps = computed(() => ({
  active: props.active,
  disabled: disabled.value,
}));
</script>

<template>
  <component
    v-state-layer
    :is="link.tag"
    v-focus-ring
    :class="['m3-item', appearance === 'expressive' && 'm3-morph-host', interactive && 'm3-state-layer']"
    data-scope="item"
    data-part="root"
    :data-appearance="appearance"
    data-list-group-item
    :data-size="size"
    :data-shape="shape"
    data-m3-shape
    :data-interactive="interactive ? 'true' : 'false'"
    :data-selected="active ? 'true' : undefined"
    :href="link.href"
    :disabled="link.nativeDisabled"
    :aria-disabled="link.ariaDisabled"
    :aria-current="interactive && active ? 'page' : undefined"
    :tabindex="link.tabIndex"
    :type="link.type"
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
        v-if="$slots.header"
        :class="['m3-item-header', appearance === 'expressive' && 'm3-text-morph']"
        data-scope="item"
        data-part="header"
      >
        <slot name="header" v-bind="slotProps" />
      </span>

      <span
        v-if="props.title || $slots.default"
        :class="['m3-item-title', appearance === 'expressive' && 'm3-text-morph']"
        data-scope="item"
        data-part="title"
      >
        <slot v-bind="slotProps">{{ props.title }}</slot>
      </span>

      <span
        v-if="props.description || $slots.description"
        :class="['m3-item-description', appearance === 'expressive' && 'm3-text-morph']"
        data-scope="item"
        data-part="description"
      >
        <slot name="description" v-bind="slotProps">{{ props.description }}</slot>
      </span>

      <span
        v-if="$slots.footer"
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
    <span v-else-if="$slots.trailing" class="m3-item-trailing-slot" data-scope="item" data-part="trailing">
      <slot name="trailing" v-bind="slotProps" />
    </span>
  </component>
</template>

<style src="./ListItem.css"></style>

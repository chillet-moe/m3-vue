<script setup lang="ts">
import { buttonContextKey } from '@/components/Button/ButtonContext.ts';
import { Icon } from '@/components/Icon';
import { useLinkTag } from '@/composables/useLinkTag';
import { usePressedState } from '@/composables/pressedState';
import { computed, inject, unref, useSlots } from 'vue';
import type { ButtonProps } from '@/components/Button';

type ItemButtonProps = Omit<ButtonProps, 'toggleable'>;

export type ItemProps = ItemButtonProps & {
  /** Highlight the item as active/selected. */
  active?: boolean;

  /** Fallback title when default slot is not provided. */
  title?: string;

  /** Fallback description when description slot is not provided. */
  description?: string;
};

const props = withDefaults(defineProps<ItemProps>(), {
  active: false,
  href: undefined,
  color: undefined,
  size: undefined,
  shape: undefined,
  leadingIcon: undefined,
  trailingIcon: undefined,
  disabled: undefined,
  title: undefined,
  description: undefined,
});

const context = inject(buttonContextKey, undefined);
const size = computed(() => props.size ?? unref(context?.size) ?? 'small');
const shape = computed(() => props.shape ?? unref(context?.shape) ?? 'rounded');
const disabled = computed(() => props.disabled ?? unref(context?.disabled) ?? false);

const { tag, nativeDisabled, ariaDisabled, href, tabIndex, type } = useLinkTag({
  defaultTag: 'button',
  href: computed(() => props.href),
  disabled,
});

const { pressed, onPointerDown, onPointerUp, onPointerCancel } = usePressedState();

const guardDisabledInteraction = (event: Event) => {
  if (!disabled.value) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  return true;
};

const handlePointerDown = (event: PointerEvent) => {
  if (guardDisabledInteraction(event)) return;
  onPointerDown(event);
};

const handlePointerUp = (event: PointerEvent) => {
  if (guardDisabledInteraction(event)) return;
  onPointerUp(event);
};

const handlePointerCancel = (event: PointerEvent) => {
  if (guardDisabledInteraction(event)) return;
  onPointerCancel(event);
};

const handleClick = (event: MouseEvent) => {
  guardDisabledInteraction(event);
};

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
const hasLeading = computed(() => !props.leadingIcon && Boolean(slots.leading));
const hasTrailing = computed(() => !props.trailingIcon && Boolean(slots.trailing));
const isSelected = computed(() => props.active);
const slotProps = computed(() => ({
  active: props.active,
  disabled: disabled.value,
}));
</script>

<template>
  <component
    :is="tag"
    class="state-layer m3-button m3-item m3-morph-host"
    data-scope="item"
    data-part="root"
    data-color="text"
    :data-size="size"
    :data-shape="shape"
    :data-pressed="!disabled && pressed ? 'true' : 'false'"
    :data-active="isSelected ? 'true' : undefined"
    :data-selected="isSelected ? 'true' : undefined"
    :href="href"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
    :aria-current="isSelected ? 'page' : undefined"
    :tabindex="tabIndex"
    :type="type"
    @click="handleClick"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
  >
    <Icon
      v-if="props.leadingIcon"
      :name="props.leadingIcon"
      :class="['m3-item-leading', 'm3-item-icon', 'm3-icon-morph']"
      data-scope="item"
      data-part="leading"
      :disabled="disabled"
    />
    <span v-else-if="hasLeading" class="m3-item-leading-slot" data-scope="item" data-part="leading">
      <slot name="leading" v-bind="slotProps" />
    </span>

    <span class="m3-item-main" data-scope="item" data-part="main">
      <span v-if="hasHeader" class="m3-item-header m3-text-morph" data-scope="item" data-part="header">
        <slot name="header" v-bind="slotProps" />
      </span>

      <span v-if="hasTitle" class="m3-item-title m3-text-morph" data-scope="item" data-part="title">
        <slot v-bind="slotProps">{{ props.title }}</slot>
      </span>

      <span v-if="hasDescription" class="m3-item-description m3-text-morph" data-scope="item" data-part="description">
        <slot name="description" v-bind="slotProps">{{ props.description }}</slot>
      </span>

      <span v-if="hasFooter" class="m3-item-footer m3-text-morph" data-scope="item" data-part="footer">
        <slot name="footer" v-bind="slotProps" />
      </span>
    </span>

    <Icon
      v-if="props.trailingIcon"
      :name="props.trailingIcon"
      :class="['m3-item-trailing', 'm3-item-icon', 'm3-icon-morph']"
      data-scope="item"
      data-part="trailing"
      :disabled="disabled"
    />
    <span v-else-if="hasTrailing" class="m3-item-trailing-slot" data-scope="item" data-part="trailing">
      <slot name="trailing" v-bind="slotProps" />
    </span>
  </component>
</template>

<style src="./Item.css"></style>

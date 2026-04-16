<script setup lang="ts">
import { useLinkTag } from '@/composables/useLinkTag';
import { usePressedState } from '@/composables/pressedState';
import { Icon } from '@/components/Icon';
import { computed, useSlots } from 'vue';

export type ItemProps = {
  /** Visual style variant. */
  variant?: 'default' | 'outline' | 'muted';

  /** Size variant. */
  size?: 'default' | 'sm';

  /** Disable interaction. */
  disabled?: boolean;

  /** Whether the item should be interactive like a button. */
  clickable?: boolean;

  /** Highlight the item as active/selected. */
  active?: boolean;

  /** Optional href. When provided, the item renders as an anchor. */
  href?: string;

  /** Name of the leading media icon. */
  mediaIcon?: string;

  /** Name of the trailing action icon. */
  actionIcon?: string;

  /** Fallback title when default slot is not provided. */
  title?: string;

  /** Fallback description when description slot is not provided. */
  description?: string;
};

const props = withDefaults(defineProps<ItemProps>(), {
  variant: 'default',
  size: 'default',
  disabled: false,
  clickable: true,
  active: false,
  href: undefined,
  mediaIcon: undefined,
  actionIcon: undefined,
  title: undefined,
  description: undefined,
});

defineSlots<{
  /** Optional content above the main row. */
  header(props: { active: boolean; disabled: boolean; clickable: boolean }): any;

  /** Optional leading media content. */
  media(props: { active: boolean; disabled: boolean; clickable: boolean }): any;

  /** Main title content. */
  default(props: { active: boolean; disabled: boolean; clickable: boolean }): any;

  /** Optional description below the title. */
  description(props: { active: boolean; disabled: boolean; clickable: boolean }): any;

  /** Optional trailing actions content. */
  actions(props: { active: boolean; disabled: boolean; clickable: boolean }): any;

  /** Optional content below the main row. */
  footer(props: { active: boolean; disabled: boolean; clickable: boolean }): any;
}>();

const slots = useSlots();

const interactive = computed(() => props.clickable || Boolean(props.href));
const { tag, nativeDisabled, href, ariaDisabled, tabIndex, type } = useLinkTag({
  defaultTag: computed(() => (interactive.value ? 'button' : 'div')),
  href: computed(() => props.href),
  disabled: computed(() => props.disabled),
  ariaDisabledMode: 'non-button',
  disabledTabIndexMode: 'anchor',
});

const hasHeader = computed(() => Boolean(slots.header));
const hasFooter = computed(() => Boolean(slots.footer));
const hasMedia = computed(() => Boolean(props.mediaIcon || slots.media));
const hasActions = computed(() => Boolean(props.actionIcon || slots.actions));
const hasTitle = computed(() => Boolean(props.title || slots.default));
const hasDescription = computed(() => Boolean(props.description || slots.description));

const slotProps = computed(() => ({
  active: props.active,
  disabled: props.disabled,
  clickable: interactive.value,
}));

const { pressed, onPointerDown, onPointerUp, onPointerCancel } = usePressedState();
const isPressed = computed(() => interactive.value && !props.disabled && pressed.value);

const guardBlockedInteraction = (event: Event) => {
  if (!interactive.value) {
    return true;
  }

  if (!props.disabled) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  return true;
};

const handlePointerDown = (event: PointerEvent) => {
  if (guardBlockedInteraction(event)) return;
  onPointerDown(event);
};

const handlePointerUp = (event: PointerEvent) => {
  if (guardBlockedInteraction(event)) return;
  onPointerUp(event);
};

const handlePointerCancel = (event: PointerEvent) => {
  if (guardBlockedInteraction(event)) return;
  onPointerCancel(event);
};

const handleClick = (event: MouseEvent) => {
  guardBlockedInteraction(event);
};
</script>

<template>
  <component
    :is="tag"
    :class="[{ 'state-layer': interactive }, 'm3-item']"
    data-scope="item"
    data-part="root"
    :data-variant="props.variant"
    :data-size="props.size"
    :data-clickable="interactive ? 'true' : 'false'"
    :data-disabled="props.disabled ? 'true' : 'false'"
    :data-active="props.active ? 'true' : undefined"
    :data-pressed="isPressed ? 'true' : 'false'"
    :href="href"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
    :tabindex="tabIndex"
    :type="type"
    @click="handleClick"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
  >
    <span v-if="hasHeader" class="m3-item-header" data-scope="item" data-part="header">
      <slot name="header" v-bind="slotProps" />
    </span>

    <span class="m3-item-main" data-scope="item" data-part="main">
      <span v-if="hasMedia" class="m3-item-media" data-scope="item" data-part="media">
        <Icon
          v-if="props.mediaIcon"
          :name="props.mediaIcon"
          class="m3-item-icon"
          data-scope="item"
          data-part="media-icon"
          :disabled="props.disabled"
        />
        <slot v-else name="media" v-bind="slotProps" />
      </span>

      <span class="m3-item-content" data-scope="item" data-part="content">
        <span v-if="hasTitle" class="m3-item-title" data-scope="item" data-part="title">
          <slot v-bind="slotProps">{{ props.title }}</slot>
        </span>

        <span v-if="hasDescription" class="m3-item-description" data-scope="item" data-part="description">
          <slot name="description" v-bind="slotProps">{{ props.description }}</slot>
        </span>
      </span>

      <span v-if="hasActions" class="m3-item-actions" data-scope="item" data-part="actions">
        <Icon
          v-if="props.actionIcon"
          :name="props.actionIcon"
          class="m3-item-icon"
          data-scope="item"
          data-part="action-icon"
          :disabled="props.disabled"
        />
        <slot v-else name="actions" v-bind="slotProps" />
      </span>
    </span>

    <span v-if="hasFooter" class="m3-item-footer" data-scope="item" data-part="footer">
      <slot name="footer" v-bind="slotProps" />
    </span>
  </component>
</template>

<style src="./Item.css"></style>

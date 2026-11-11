<script setup lang="ts">
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { isHTMLElement } from '@/internal/elementEnvironment';

import { useLinkTag } from '@/composables/useLinkTag';
import { computed, inject } from 'vue';
import { tabsContextKey } from './TabsContext';

export type TabProps = {
  /** The value that identifies this tab. */
  value: string;

  /** Optional href. When provided, the tab trigger renders as an anchor. */
  href?: string;

  /** Whether this tab is disabled. */
  disabled?: boolean;
};

const props = withDefaults(defineProps<TabProps>(), {
  href: undefined,
  disabled: false,
});

defineSlots<{
  /** Tab label content. */
  default(props: { active: boolean }): any;

  /** Optional icon slot. */
  icon(props: { active: boolean }): any;
}>();

const tabs = inject(tabsContextKey);

const active = computed(() => tabs?.value.value === props.value);
const triggerAttrs = computed<Record<string, unknown>>((previous) => {
  const value = props.value;
  const selected = active.value;
  if (previous?.['data-tab-value'] === value && previous['aria-selected'] === selected) return previous;
  return tabs?.getTriggerAttrs(value) ?? {};
});
const triggerDomAttrs = computed(() => {
  const { onClick, onKeydown, tabindex, ...domAttrs } = triggerAttrs.value;
  return domAttrs;
});

const link = useLinkTag({
  defaultTag: 'button',
  href: () => props.href,
  disabled: () => props.disabled,
});

const resolvedTabIndex = computed(() => {
  if (props.disabled) {
    return link.value.tabIndex;
  }

  return triggerAttrs.value.tabindex as number | undefined;
});

const guardDisabledInteraction = (event: Event) => {
  if (!props.disabled) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  return true;
};

const handleClick = (event: MouseEvent) => {
  if (guardDisabledInteraction(event)) {
    return;
  }

  const onClick = triggerAttrs.value.onClick as ((event: MouseEvent) => void) | undefined;
  onClick?.(event);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (guardDisabledInteraction(event)) {
    return;
  }

  const onKeydown = triggerAttrs.value.onKeydown as ((event: KeyboardEvent) => void) | undefined;
  onKeydown?.(event);

  if (event.defaultPrevented || link.value.tag !== 'a' || event.key !== ' ') {
    return;
  }

  event.preventDefault();

  const currentTarget = event.currentTarget;
  if (isHTMLElement(currentTarget)) {
    currentTarget.click();
  }
};
</script>

<template>
  <component
    v-state-layer
    :is="link.tag"
    class="m3-state-layer m3-tab"
    data-scope="tabs"
    data-part="trigger"
    :data-with-icon="$slots.icon ? 'true' : undefined"
    :data-disabled="props.disabled ? 'true' : undefined"
    :href="link.href"
    :disabled="link.nativeDisabled"
    :aria-disabled="link.ariaDisabled"
    :tabindex="resolvedTabIndex"
    :type="link.type"
    v-bind="triggerDomAttrs"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <span class="m3-tab-content" data-scope="tabs" data-part="trigger-content">
      <span v-if="$slots.icon" class="m3-tab-icon" data-scope="tabs" data-part="trigger-icon">
        <slot name="icon" :active="active" />
      </span>
      <span class="m3-tab-label" data-scope="tabs" data-part="trigger-label">
        <slot :active="active" />
      </span>
    </span>
  </component>
</template>

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

const triggerAttrs = computed(() => tabs?.getTriggerAttrs(props.value) ?? {});
const triggerDomAttrs = computed(() => {
  const { onClick, onKeydown, tabindex, ...domAttrs } = triggerAttrs.value;
  return domAttrs;
});

const active = computed(() => tabs?.value.value === props.value);

const { tag, isAnchorTag, nativeDisabled, ariaDisabled, href, tabIndex, type } = useLinkTag({
  defaultTag: 'button',
  href: computed(() => props.href),
  disabled: computed(() => props.disabled),
});

const resolvedTabIndex = computed(() => {
  if (props.disabled) {
    return tabIndex.value;
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

  if (event.defaultPrevented || !isAnchorTag.value || event.key !== ' ') {
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
    :is="tag"
    class="m3-state-layer m3-tab"
    data-scope="tabs"
    data-part="trigger"
    :data-disabled="props.disabled ? 'true' : undefined"
    :href="href"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
    :tabindex="resolvedTabIndex"
    :type="type"
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

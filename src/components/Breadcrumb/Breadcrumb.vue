<script setup lang="ts">
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { computed, useSlots } from 'vue';

import { Icon } from '@/components/Icon';

export type BreadcrumbItem = {
  /** Item label. */
  label: string;

  /** Optional href. Items without href render as buttons unless they are current. */
  href?: string;

  /** Marks this item as the current page. Defaults to the last item. */
  current?: boolean;

  /** Shows the item as a collapsed breadcrumb marker. */
  ellipsis?: boolean;

  /** Disables link or button interaction. */
  disabled?: boolean;
};

export type BreadcrumbProps = {
  /** Accessible label for the breadcrumb navigation landmark. */
  ariaLabel?: string;

  /** Breadcrumb items. The last item is treated as the current page by default. */
  items?: BreadcrumbItem[];

  /** Material Symbols icon used between items. */
  separatorIcon?: string;

  /** Accessible label for ellipsis items. */
  ellipsisLabel?: string;
};

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  ariaLabel: 'Breadcrumb',
  items: () => [],
  separatorIcon: 'chevron_right',
  ellipsisLabel: 'More items',
});

const emit = defineEmits<{
  /** Fired when a non-current breadcrumb item is clicked. */
  itemClick: [event: MouseEvent, item: BreadcrumbItem, index: number];
}>();

const slots = useSlots();

const renderedItems = computed(() =>
  props.items.map((item, index) => ({
    ...item,
    current: item.current ?? index === props.items.length - 1,
  })),
);

function getItemTag(item: BreadcrumbItem & { current: boolean }) {
  if (item.current) {
    return 'span';
  }

  return item.href ? 'a' : 'button';
}

function getItemHref(item: BreadcrumbItem & { current: boolean }) {
  if (item.current || item.disabled) {
    return undefined;
  }

  return item.href;
}

function getItemType(item: BreadcrumbItem & { current: boolean }) {
  return !item.current && !item.href ? 'button' : undefined;
}

function handleItemClick(event: MouseEvent, item: BreadcrumbItem & { current: boolean }, index: number) {
  if (item.current || item.disabled) {
    event.preventDefault();
    return;
  }

  emit('itemClick', event, item, index);
}

defineSlots<{
  /** Fully custom breadcrumb content. When provided, items are not rendered. */
  default(): any;

  /** Custom item content. */
  item(props: { item: BreadcrumbItem; index: number; current: boolean; disabled: boolean }): any;

  /** Custom separator content. */
  separator(props: { index: number }): any;

  /** Custom ellipsis content. */
  ellipsis(props: { item: BreadcrumbItem; index: number }): any;
}>();
</script>

<template>
  <nav class="m3-breadcrumb" role="navigation" data-scope="breadcrumb" data-part="root" :aria-label="ariaLabel">
    <slot v-if="slots.default" />

    <ol v-else class="m3-breadcrumb-list" data-scope="breadcrumb" data-part="list">
      <template v-for="(item, index) in renderedItems" :key="`${item.label}-${index}`">
        <li class="m3-breadcrumb-item" data-scope="breadcrumb" data-part="item">
          <span
            v-if="item.ellipsis"
            class="m3-breadcrumb-ellipsis"
            data-scope="breadcrumb"
            data-part="ellipsis"
            role="img"
            :aria-label="ellipsisLabel"
          >
            <slot name="ellipsis" :item="item" :index="index">
              <Icon class="m3-breadcrumb-ellipsis-icon" name="more_horiz" variant="inline" />
            </slot>
          </span>

          <component
            v-state-layer
            :is="getItemTag(item)"
            v-else
            :class="['m3-state-layer', item.current ? 'm3-breadcrumb-page' : 'm3-breadcrumb-link']"
            data-scope="breadcrumb"
            :data-part="item.current ? 'page' : 'link'"
            :data-disabled="item.disabled ? 'true' : 'false'"
            :href="getItemHref(item)"
            :type="getItemType(item)"
            :disabled="!item.current && !item.href && item.disabled ? true : undefined"
            :aria-current="item.current ? 'page' : undefined"
            :aria-disabled="!item.current && item.href && item.disabled ? 'true' : undefined"
            :tabindex="!item.current && item.href && item.disabled ? -1 : undefined"
            @click="handleItemClick($event, item, index)"
          >
            <slot name="item" :item="item" :index="index" :current="item.current" :disabled="item.disabled ?? false">
              {{ item.label }}
            </slot>
          </component>
        </li>

        <li v-if="index < renderedItems.length - 1" class="m3-breadcrumb-item" data-scope="breadcrumb" data-part="item">
          <span class="m3-breadcrumb-separator" data-scope="breadcrumb" data-part="separator" aria-hidden="true">
            <slot name="separator" :index="index">
              <Icon class="m3-breadcrumb-separator-icon" :name="separatorIcon" variant="inline" />
            </slot>
          </span>
        </li>
      </template>
    </ol>
  </nav>
</template>

<style src="./Breadcrumb.css"></style>

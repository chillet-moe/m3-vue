<script setup lang="ts">
import { computed } from 'vue';
import Icon from '@/components/Icon/Icon.vue';
import MenuContainer from './MenuContainer.vue';
import MenuDivider from './MenuDivider.vue';
import MenuGap from './MenuGap.vue';
import MenuItem from './MenuItem.vue';
import MenuLabel from './MenuLabel.vue';
import MenuSubMenu from './MenuSubMenu.vue';
import type {
  MenuActionContent,
  MenuContentItem,
  MenuContentKey,
  MenuGroupContent,
  MenuSubmenuContent,
} from './MenuTypes';

defineOptions({
  name: 'MenuContentRenderer',
});

const props = defineProps<{
  items: MenuContentItem[];
}>();

type RenderSegment =
  | {
      type: 'gap';
      key: MenuContentKey;
    }
  | {
      type: 'group';
      key: MenuContentKey;
      items: MenuContentItem[];
    };

const segments = computed<RenderSegment[]>(() => {
  const normalizedSegments: RenderSegment[] = [];
  let pendingItems: MenuContentItem[] = [];

  function flushPending(groupKey: MenuContentKey) {
    if (!pendingItems.length) {
      return;
    }

    normalizedSegments.push({
      type: 'group',
      key: groupKey,
      items: pendingItems,
    });
    pendingItems = [];
  }

  props.items.forEach((item, index) => {
    const key = getItemKey(item, index);

    if (item.type === 'gap') {
      flushPending(`auto-group-${index}`);
      normalizedSegments.push({
        type: 'gap',
        key,
      });
      return;
    }

    if (item.type === 'group') {
      flushPending(`auto-group-${index}`);
      normalizedSegments.push({
        type: 'group',
        key,
        items: item.items,
      });
      return;
    }

    pendingItems.push(item);
  });

  flushPending(`auto-group-${props.items.length}`);

  return normalizedSegments;
});

function getItemKey(item: MenuContentItem, index: number) {
  return item.key ?? `${item.type ?? 'item'}-${index}`;
}

function isSubmenuItem(item: MenuContentItem): item is MenuSubmenuContent {
  return item.type === 'submenu';
}

function isActionItem(item: MenuContentItem): item is MenuActionContent {
  return item.type === undefined || item.type === 'item';
}

function submenuTrailingIcon(item: MenuSubmenuContent) {
  return item.trailingIcon ?? 'chevron_right';
}

function groupKey(segment: Extract<RenderSegment, { type: 'group' }>, index: number) {
  return segment.key ?? `group-${index}`;
}

function gapKey(segment: Extract<RenderSegment, { type: 'gap' }>, index: number) {
  return segment.key ?? `gap-${index}`;
}

function contentKey(item: MenuContentItem, index: number) {
  return getItemKey(item, index);
}
</script>

<template>
  <template
    v-for="(segment, segmentIndex) in segments"
    :key="segment.type === 'gap' ? gapKey(segment, segmentIndex) : groupKey(segment, segmentIndex)"
  >
    <MenuGap v-if="segment.type === 'gap'" />

    <MenuContainer v-else>
      <template v-for="(item, itemIndex) in segment.items" :key="contentKey(item, itemIndex)">
        <MenuLabel v-if="item.type === 'label'">
          {{ item.label }}
        </MenuLabel>

        <MenuDivider v-else-if="item.type === 'divider'" />

        <MenuSubMenu v-else-if="isSubmenuItem(item)" :color="item.color" :debug-safe-triangle="item.debugSafeTriangle">
          <template #trigger="{ open }">
            <MenuItem submenu :submenu-open="open" :disabled="item.disabled">
              <template v-if="item.leadingIcon" #leading>
                <Icon :name="item.leadingIcon" />
              </template>

              {{ item.label }}

              <template v-if="item.supportingText" #supporting>
                {{ item.supportingText }}
              </template>

              <template #trailing>
                <Icon :name="submenuTrailingIcon(item)" />
              </template>

              <template v-if="item.badge" #badge>
                {{ item.badge }}
              </template>

              <template v-if="item.trailingText" #trailingText>
                {{ item.trailingText }}
              </template>
            </MenuItem>
          </template>

          <MenuContentRenderer :items="item.items" />
        </MenuSubMenu>

        <MenuItem
          v-else-if="isActionItem(item)"
          :value="item.value"
          :disabled="item.disabled"
          :close-on-select="item.closeOnSelect"
          :selected="item.selected"
          :role="item.role"
          :checked="item.checked"
        >
          <template v-if="item.leadingIcon" #leading>
            <Icon :name="item.leadingIcon" />
          </template>

          {{ item.label }}

          <template v-if="item.supportingText" #supporting>
            {{ item.supportingText }}
          </template>

          <template v-if="item.trailingIcon" #trailing>
            <Icon :name="item.trailingIcon" />
          </template>

          <template v-if="item.badge" #badge>
            {{ item.badge }}
          </template>

          <template v-if="item.trailingText" #trailingText>
            {{ item.trailingText }}
          </template>
        </MenuItem>
      </template>
    </MenuContainer>
  </template>
</template>

<script setup lang="ts">
import { computed, inject, useTemplateRef } from 'vue';
import { Icon } from '@/components/Icon';
import { triggerKeyboardRipple, vStateLayer } from '@/components/StateLayer/state-layer';
import type { TreeNode } from '@/composables/useTree';
import { treeContextKey, type TreeItemSlotProps } from './TreeContext';

export type TreeItemProps = { item: TreeNode };
const props = defineProps<TreeItemProps>();
const tree = inject(treeContextKey);
if (!tree) throw new Error('TreeItem must be used inside TreeView.');
const actions = tree;
const trailing = useTemplateRef<HTMLElement>('trailing');
const row = useTemplateRef<HTMLElement>('row');
const state = computed<TreeItemSlotProps>(() => ({
  item: props.item,
  selected: actions.value.value === props.item.value,
  expanded: actions.expanded.value.includes(props.item.value),
  focused: actions.focusedValue.value === props.item.value,
  disabled: !!actions.entries.value.get(props.item.value)?.disabled,
}));
defineSlots<{
  label(props: TreeItemSlotProps): any;
  leading(props: TreeItemSlotProps): any;
  trailing(props: TreeItemSlotProps): any;
}>();
function handleDisclosureClick(event: MouseEvent) {
  if (!props.item.children?.length) return;
  event.stopPropagation();
  actions.focus(props.item.value);
  actions.toggle(props.item.value);
}

function handleActionKey(event: KeyboardEvent) {
  if (event.target === event.currentTarget && row.value) {
    if (event.key === 'Enter' || (event.key === ' ' && props.item.selectable !== false)) {
      triggerKeyboardRipple(event, row.value);
    }
  }
  if (event.defaultPrevented) return;
  if (event.key === 'F2' && event.target === event.currentTarget && !state.value.disabled) {
    const controls = trailing.value?.querySelectorAll<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]',
    );
    const control = Array.from(controls ?? []).find(
      (candidate) => !candidate.matches(':disabled, [aria-disabled="true"]') && !candidate.closest('[hidden], [inert]'),
    );
    if (!control) return;
    event.preventDefault();
    event.stopPropagation();
    control.focus();
  } else if (event.key === 'Escape' && trailing.value?.contains(event.target as Node)) {
    event.preventDefault();
    event.stopPropagation();
    actions.focus(props.item.value);
  }
}
</script>

<template>
  <div
    v-bind="actions.getItemAttrs(item.value)"
    class="m3-tree-item"
    data-scope="tree-item"
    data-part="root"
    :data-selected="state.selected"
    :style="{ '--_tree-level': actions.entries.value.get(item.value)?.level ?? 1 }"
    @keydown="handleActionKey"
  >
    <div
      v-state-layer
      ref="row"
      class="m3-tree-row m3-state-layer"
      data-scope="tree-item"
      data-part="row"
      @click="
        actions.focus(item.value);
        actions.activate(item.value);
      "
    >
      <span
        class="m3-tree-disclosure"
        data-scope="tree-item"
        data-part="disclosure"
        aria-hidden="true"
        @click="handleDisclosureClick"
      >
        <svg v-if="item.children?.length" viewBox="0 0 24 24" data-scope="tree-item" data-part="arrow">
          <path
            d="m9 6 6 6-6 6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            data-scope="tree-item"
            data-part="arrow-path"
          />
        </svg>
      </span>
      <span
        v-if="$slots.leading || item.icon"
        class="m3-tree-leading"
        data-scope="tree-item"
        data-part="leading"
        aria-hidden="true"
        ><slot name="leading" v-bind="state"><Icon v-if="item.icon" :name="item.icon" /></slot
      ></span>
      <span class="m3-tree-label" data-scope="tree-item" data-part="label"
        ><slot name="label" v-bind="state">{{ item.label }}</slot></span
      >
      <span
        v-if="item.count !== undefined"
        class="m3-tree-count"
        data-scope="tree-item"
        data-part="count"
        aria-hidden="true"
        >{{ item.count }}</span
      >
      <span
        v-if="$slots.trailing"
        ref="trailing"
        class="m3-tree-trailing"
        data-scope="tree-item"
        data-part="trailing"
        :inert="state.disabled || undefined"
        @click.stop
        ><slot name="trailing" v-bind="state"
      /></span>
    </div>
    <div
      v-if="item.children?.length"
      v-bind="actions.getGroupAttrs(item.value)"
      data-scope="tree-item"
      data-part="group"
    >
      <TreeItem v-for="child in item.children" :key="child.value" :item="child">
        <template v-if="$slots.label" #label="childState"><slot name="label" v-bind="childState" /></template>
        <template v-if="$slots.leading" #leading="childState"><slot name="leading" v-bind="childState" /></template>
        <template v-if="$slots.trailing" #trailing="childState"><slot name="trailing" v-bind="childState" /></template>
      </TreeItem>
    </div>
  </div>
</template>

<style src="./TreeView.css"></style>

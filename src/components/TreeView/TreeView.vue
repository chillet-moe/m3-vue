<script setup lang="ts">
import { provideShape, type M3Shape } from '@/styles/shape';
import { provideRowSize, type RowSize } from '@/styles/rowSize';
import { provide } from 'vue';
import { useTree, type TreeNode, type UseTreeReturn } from '@/composables/useTree';
import { treeContextKey, type TreeItemSlotProps } from './TreeContext';
import TreeItem from './TreeItem.vue';

export type TreeViewProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
  /** Row size; inherits the nearest row size or defaults to medium. */
  size?: RowSize;
  items: readonly TreeNode[];
  selectWhenFocused?: boolean;
  dir?: 'ltr' | 'rtl';
};

const props = withDefaults(defineProps<TreeViewProps>(), { selectWhenFocused: false });
const value = defineModel<string>();
const expanded = defineModel<string[]>('expanded', { default: () => [] });
const emit = defineEmits<{ activate: [item: TreeNode]; focusRequest: [value: string] }>();
defineSlots<{
  default(props: { tree: UseTreeReturn }): any;
  label(props: TreeItemSlotProps): any;
  leading(props: TreeItemSlotProps): any;
  trailing(props: TreeItemSlotProps): any;
}>();
const tree = useTree({
  items: () => props.items,
  value: () => value.value,
  expanded: () => expanded.value,
  onValueChange: (next) => {
    value.value = next;
  },
  onExpandedChange: (next) => {
    expanded.value = next;
  },
  onActivate: (item) => emit('activate', item),
  onFocusRequest: (value) => emit('focusRequest', value),
  selectWhenFocused: () => props.selectWhenFocused,
  dir: () => props.dir,
});
provide(treeContextKey, tree);
defineExpose({ focus: tree.focus });
const rowSize = provideRowSize(() => props.size);
const shape = provideShape(() => props.shape);
</script>

<template>
  <div
    v-bind="tree.rootAttrs.value"
    class="m3-tree"
    :data-size="rowSize"
    data-scope="tree-view"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    :dir="dir"
  >
    <slot :tree="tree">
      <TreeItem v-for="entry in tree.visibleItems.value" :key="entry.node.value" :item="entry.node">
        <template v-if="$slots.label" #label="state"><slot name="label" v-bind="state" /></template>
        <template v-if="$slots.leading" #leading="state"><slot name="leading" v-bind="state" /></template>
        <template v-if="$slots.trailing" #trailing="state"><slot name="trailing" v-bind="state" /></template>
      </TreeItem>
    </slot>
  </div>
</template>

<style src="./TreeView.css"></style>

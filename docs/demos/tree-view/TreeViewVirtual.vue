<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { TreeView } from '@/components/TreeView';
import TreeVirtualRows from './TreeVirtualRows.vue';
import type { TreeNode } from '@/composables/useTree';

const scrollElement = useTemplateRef<HTMLElement>('scrollElement');
const rows = useTemplateRef<InstanceType<typeof TreeVirtualRows>>('rows');
const expanded = ref(['files']);
const selected = ref<string>();
const items: TreeNode[] = [
  {
    value: 'files',
    label: 'Project files',
    count: 10000,
    children: Array.from({ length: 10000 }, (_, index) => ({
      value: `file-${index}`,
      label: `File ${String(index + 1).padStart(5, '0')}`,
    })),
  },
];
</script>

<template>
  <div ref="scrollElement" class="tree-virtual-scroll">
    <TreeView
      v-model="selected"
      v-model:expanded="expanded"
      :items="items"
      aria-label="Large project"
      @focus-request="(value) => rows?.reveal(value)"
    >
      <template #default="{ tree }"
        ><TreeVirtualRows ref="rows" :tree="tree" :scroll-element="scrollElement"
      /></template>
    </TreeView>
  </div>
</template>

<style scoped>
.tree-virtual-scroll {
  block-size: 256px;
  inline-size: min(100%, 28rem);
  overflow: auto;
  overflow-anchor: none;
}
</style>

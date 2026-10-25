<script setup lang="ts">
import { ref } from 'vue';
import { TreeView, TreeItem } from '@/components/TreeView';
import type { TreeNode } from '@/composables/useTree';

const selected = ref('appearance');
const expanded = ref(['application']);
const items: TreeNode[] = [
  {
    value: 'application',
    label: 'Application',
    selectable: false,
    children: [
      { value: 'appearance', label: 'Appearance', icon: 'palette' },
      { value: 'shortcuts', label: 'Keyboard shortcuts', icon: 'keyboard' },
    ],
  },
  {
    value: 'account',
    label: 'Account',
    selectable: false,
    children: [
      { value: 'profile', label: 'Profile', icon: 'person' },
      { value: 'notifications', label: 'Notifications', icon: 'notifications' },
    ],
  },
];
</script>

<template>
  <TreeView
    v-model="selected"
    v-model:expanded="expanded"
    class="tree-settings-demo"
    :items="items"
    aria-label="Settings categories"
  >
    <template #default="{ tree }">
      <TreeItem v-for="entry in tree.visibleItems.value" :key="entry.node.value" :item="entry.node" />
    </template>
  </TreeView>
</template>

<style scoped>
.tree-settings-demo {
  inline-size: min(100%, 22rem);
  --md-tree-indent: 20px;
}
</style>

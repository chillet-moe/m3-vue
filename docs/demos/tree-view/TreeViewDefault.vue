<script setup lang="ts">
import { ref } from 'vue';
import { TreeView } from '@/components/TreeView';
import { IconButton } from '@/components/IconButton';
import type { TreeNode } from '@/composables/useTree';

defineProps<{ density?: 'compact' | 'comfortable'; selectWhenFocused?: boolean }>();
const selected = ref('overview');
const expanded = ref(['project', 'documents']);
const pinned = ref<string[]>([]);
const items: TreeNode[] = [
  {
    value: 'project',
    label: 'Sample project',
    icon: 'folder',
    count: 3,
    children: [
      {
        value: 'documents',
        label: 'Documents',
        icon: 'folder',
        children: [
          { value: 'overview', label: 'Overview', icon: 'description' },
          { value: 'specification', label: 'Specification', icon: 'description' },
        ],
      },
      {
        value: 'source',
        label: 'Source',
        icon: 'folder',
        children: [{ value: 'main', label: 'main.ts', icon: 'code' }],
      },
      { value: 'notes', label: 'Notes', icon: 'description' },
    ],
  },
  { value: 'archive', label: 'Archived project', icon: 'folder', disabled: true },
];
function togglePin(value: string) {
  pinned.value = pinned.value.includes(value) ? pinned.value.filter((key) => key !== value) : [...pinned.value, value];
}
</script>

<template>
  <TreeView
    v-model="selected"
    v-model:expanded="expanded"
    class="tree-project-demo"
    :items="items"
    :density="density"
    :select-when-focused="selectWhenFocused"
    aria-label="Project files"
  >
    <template #trailing="{ item, focused, disabled }">
      <IconButton
        v-if="!item.children"
        size="extra-small"
        variant="standard"
        :icon="pinned.includes(item.value) ? 'keep_off' : 'keep'"
        :aria-label="`${pinned.includes(item.value) ? 'Unpin' : 'Pin'} ${item.label}`"
        :aria-pressed="pinned.includes(item.value)"
        :tabindex="focused ? 0 : -1"
        :disabled="disabled"
        @click="togglePin(item.value)"
      />
    </template>
  </TreeView>
</template>

<style scoped>
.tree-project-demo {
  inline-size: min(100%, 24rem);
}
</style>

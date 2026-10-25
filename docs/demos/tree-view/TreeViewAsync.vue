<script setup lang="ts">
import { onScopeDispose, ref, useTemplateRef, watch } from 'vue';
import { TreeView } from '@/components/TreeView';
import { IconButton } from '@/components/IconButton';
import { CircularProgressIndicator } from '@/components/CircularProgressIndicator';
import { Button } from '@/components/Button';
import type { TreeNode } from '@/composables/useTree';

const expanded = ref<string[]>([]);
const view = useTemplateRef<InstanceType<typeof TreeView>>('view');
const items = ref<TreeNode[]>([{ value: 'remote', label: 'Remote files', hasChildren: true, icon: 'folder' }]);
const error = ref(false);
const failNext = ref(false);
let request: AbortController | undefined;

async function load() {
  const node = items.value[0]!;
  if (request || node.children !== undefined) return;
  const controller = new AbortController();
  request = controller;
  node.busy = true;
  error.value = false;
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 400);
      controller.signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(controller.signal.reason);
        },
        { once: true },
      );
    });
    if (controller.signal.aborted) return;
    if (failNext.value) {
      failNext.value = false;
      throw new Error('Demo request failed');
    }
    node.children = [
      { value: 'readme', label: 'README.md', icon: 'description' },
      { value: 'config', label: 'project.json', icon: 'code' },
    ];
  } catch {
    if (!controller.signal.aborted) error.value = true;
  } finally {
    if (request === controller) {
      request = undefined;
      node.busy = false;
    }
  }
}
watch(expanded, (values) => {
  if (values.includes('remote')) void load();
  else {
    request?.abort();
    request = undefined;
    items.value[0]!.busy = false;
  }
});
onScopeDispose(() => request?.abort());
</script>

<template>
  <div class="tree-async-demo">
    <Button :disabled="items[0]!.children !== undefined || items[0]!.busy || failNext" @click="failNext = true"
      >Fail next request</Button
    >
    <TreeView ref="view" v-model:expanded="expanded" :items="items" aria-label="Remote project">
      <template #trailing="{ item, focused, busy }">
        <CircularProgressIndicator v-if="busy" indeterminate size="18px" :aria-label="`Loading ${item.label}`" />
        <IconButton
          v-else-if="item.value === 'remote' && error"
          icon="refresh"
          size="extra-small"
          variant="standard"
          aria-label="Retry loading Remote files"
          :tabindex="focused ? 0 : -1"
          @click="
            view?.focus(item.value);
            load();
          "
        />
      </template>
    </TreeView>
    <span v-if="error" role="status">Could not load Remote files.</span>
  </div>
</template>

<style scoped>
.tree-async-demo {
  inline-size: min(100%, 24rem);
}
</style>

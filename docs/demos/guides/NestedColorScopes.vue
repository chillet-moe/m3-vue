<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { Button, Dialog } from '@chillet/m3-vue';

const open = ref(false);
const warningRegion = useTemplateRef<HTMLDivElement>('warningRegion');
</script>

<template>
  <div class="draft teal-theme">
    <span>Draft settings</span>
    <div ref="warningRegion" class="draft-warning warning-theme">
      <Button @click="open = true">Discard draft…</Button>
    </div>

    <Teleport v-if="warningRegion" :to="warningRegion">
      <Dialog v-model:open="open">
        <template #headline>Discard draft?</template>
        Your unsaved edits will be lost.
        <template #actions>
          <Button @click="open = false">Keep editing</Button>
          <Button @click="open = false">Discard</Button>
        </template>
      </Dialog>
    </Teleport>
  </div>
</template>

<style scoped>
.draft,
.draft-warning {
  display: grid;
  justify-items: start;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--md-sys-color-surface-container);
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Dialog } from '@/components/Dialog';
import { Switch } from '@/components/Switch';
import { TextField } from '@/components/TextField';

const open = ref(false);
const preserveVisualOverflow = ref(true);
const workspaceName = ref('Analytical Engine');
const items = Array.from({ length: 8 }, (_, index) => `Elevated item ${index + 1}`);
</script>

<template>
  <div class="visual-overflow-demo">
    <Switch v-model:checked="preserveVisualOverflow">Preserve visual overflow</Switch>
    <Button variant="outlined" @click="open = true">Open scrollable dialog</Button>
  </div>

  <Dialog
    class="vp-raw visual-overflow-demo__dialog"
    :style="{
      '--md-dialog-content-visual-overflow-inset': preserveVisualOverflow ? '0.5rem' : '0px',
    }"
    v-model:open="open"
  >
    <template #headline>Scrollable content</template>

    <div class="visual-overflow-demo__content">
      <TextField v-model="workspaceName" label="Workspace name" />

      <Card v-for="item in items" :key="item" class="visual-overflow-demo__card" variant="elevated">
        {{ item }}
      </Card>
    </div>

    <template #actions>
      <Button variant="text" @click="open = false">Close</Button>
    </template>
  </Dialog>
</template>

<style scoped>
.visual-overflow-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.visual-overflow-demo__dialog {
  --md-dialog-container-width: 26rem;
}

.visual-overflow-demo__content {
  display: grid;
  gap: 1rem;
}

.visual-overflow-demo__card {
  padding: 1rem;
}
</style>

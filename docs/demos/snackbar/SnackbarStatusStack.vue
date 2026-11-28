<script setup lang="ts">
import { h, ref, useCssModule, watch, type Ref } from 'vue';
import { Button, CheckBox, useOverlays } from '@chillet/m3-vue';

const { showSnackbar, showSnackbarStatus } = useOverlays();
const preparingPreview = ref(false);
const readOnly = ref(false);
const styles = useCssModule();

function bindStatus(active: Ref<boolean>, order: number, message: string) {
  watch(active, (visible, _, onCleanup) => {
    if (!visible) return;
    const status = showSnackbarStatus({
      position: 'top-end',
      order,
      render: () => h('div', { class: styles.status, role: 'status' }, message),
    });
    onCleanup(status.close);
  });
}

bindStatus(preparingPreview, 0, 'Preparing preview…');
bindStatus(readOnly, 1, 'Read-only mode');
</script>

<template>
  <div :class="$style.controls">
    <CheckBox v-model:checked="preparingPreview">Preparing preview</CheckBox>
    <CheckBox v-model:checked="readOnly">Read-only mode</CheckBox>
    <Button @click="showSnackbar({ position: 'top-end', message: 'Link copied' })">Show snackbar</Button>
  </div>
</template>

<style module>
.controls {
  display: grid;
  justify-items: start;
  gap: 0.5rem;
}

.status {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  color: var(--md-sys-color-on-secondary-container);
  background: var(--md-sys-color-secondary-container);
}
</style>

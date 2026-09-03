<script setup lang="ts">
import { defineComponent, inject, onBeforeUnmount, shallowRef, type PropType } from 'vue';
import { registerSnackbarDefaults, snackbarDefaultsContextKey } from '@/components/Snackbar/config';
import { registerOverlayHost, type OverlayEntry } from '@/internal/overlayHost/overlayHost';

const entries = shallowRef<OverlayEntry[]>([]);
const snackbarDefaults = inject(snackbarDefaultsContextKey, undefined);
const unregisterOverlayHost = typeof document === 'undefined' ? undefined : registerOverlayHost(entries);
const unregisterSnackbarDefaults =
  typeof document === 'undefined' ? undefined : registerSnackbarDefaults(() => snackbarDefaults?.value);

const OverlayEntryRenderer = defineComponent({
  name: 'OverlayEntryRenderer',
  props: {
    entry: {
      type: Object as PropType<OverlayEntry>,
      required: true,
    },
  },
  setup(props) {
    return () => props.entry.render();
  },
});

onBeforeUnmount(() => {
  unregisterSnackbarDefaults?.();
  unregisterOverlayHost?.();
});
</script>

<template>
  <div :class="'m3-overlay-host'" data-scope="overlay-host" data-part="root">
    <OverlayEntryRenderer v-for="entry in entries" :key="entry.id" :entry="entry" />
  </div>
</template>

<style src="./OverlayHost.css"></style>

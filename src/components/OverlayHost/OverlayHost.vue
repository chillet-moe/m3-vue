<script setup lang="ts">
import { defineComponent, onBeforeUnmount, shallowRef, type PropType } from 'vue';
import { registerOverlayHost, type OverlayEntry } from '@/internal/overlayHost/overlayHost';

const entries = shallowRef<OverlayEntry[]>([]);
const unregister = typeof document === 'undefined' ? undefined : registerOverlayHost(entries);

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
  unregister?.();
});
</script>

<template>
  <div :class="'m3-overlay-host'" data-scope="overlay-host" data-part="root">
    <OverlayEntryRenderer v-for="entry in entries" :key="entry.id" :entry="entry" />
  </div>
</template>

<style src="./OverlayHost.css"></style>

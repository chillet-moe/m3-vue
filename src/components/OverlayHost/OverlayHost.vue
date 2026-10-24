<script setup lang="ts">
import { defineComponent, inject, onBeforeUnmount, watch, shallowRef, useTemplateRef, type PropType } from 'vue';
import { useElementEnvironment } from '@/internal/elementEnvironment';
import { snackbarDefaultsContextKey } from '@/components/Snackbar/config';
import {
  registerOverlayHost,
  provideOverlayHost,
  type OverlayHostController,
  type OverlayEntry,
} from '@/internal/overlayHost/overlayHost';

const props = defineProps<{ host: OverlayHostController }>();
provideOverlayHost(props.host);
const root = useTemplateRef<HTMLElement>('root');
const entries = shallowRef<OverlayEntry[]>([]);
const snackbarDefaults = inject(snackbarDefaultsContextKey, undefined);
let unregister: (() => void) | undefined;
watch(
  root,
  (element, _, onCleanup) => {
    if (!element) return;
    unregister = registerOverlayHost(props.host, entries, element, () => snackbarDefaults?.value);
    onCleanup(unregister);
  },
  { flush: 'sync' },
);
onBeforeUnmount(() => unregister?.());
useElementEnvironment(root, (document, element) => {
  return () => {
    if (element.ownerDocument === document) unregister?.();
  };
});

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
</script>

<template>
  <div ref="root" :class="'m3-overlay-host'" data-scope="overlay-host" data-part="root">
    <slot />
    <OverlayEntryRenderer v-for="entry in entries" :key="entry.id" :entry="entry" />
  </div>
</template>

<style src="./OverlayHost.css"></style>

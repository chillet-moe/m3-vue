<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import {
  Button,
  Menu,
  MenuItem,
  MenuSubMenu,
  Slider,
  OverlayHost,
  createOverlayHost,
  createOverlayService,
} from '@/index';
import { vDropdown } from '@/directives/Menu';
import vTooltip from '@/directives/Tooltip/vTooltip';
const host = createOverlayHost();
const { showDialog, showSnackbar } = createOverlayService(host);
const value = ref(25);
const selected = ref('');
const results = ref<string[]>([]);
const record = (promise: Promise<string>) => {
  void promise.then(
    (value) => results.value.push(value),
    (error) => results.value.push(error.message),
  );
};
let unmounted = false;
onUnmounted(() => {
  unmounted = true;
});
defineExpose({ host, results, isUnmounted: () => unmounted });
</script>
<template>
  <section class="panel">
    <OverlayHost :host="host" />
    <Button
      class="dialog-trigger"
      @click="record(showDialog({ headline: 'Window dialog', actions: [{ label: 'Finish', value: 'done' }] }))"
      >Dialog</Button
    >
    <Button
      class="snackbar-trigger"
      @click="
        record(
          showSnackbar({
            message: 'Window snackbar',
            duration: null,
            action: { label: 'Finish', value: 'snack' },
          }),
        )
      "
      >Snackbar</Button
    >
    <Button class="menu-trigger" v-dropdown="'#window-menu'">Menu</Button>
    <Menu id="window-menu" popover="manual">
      <MenuItem @click="selected = 'first'">First</MenuItem>
      <MenuItem @click="selected = 'second'">Second</MenuItem>
      <MenuSubMenu
        ><template #trigger><MenuItem submenu>More</MenuItem></template
        ><MenuItem @click="selected = 'nested'">Nested</MenuItem></MenuSubMenu
      >
    </Menu>
    <Button class="tooltip-trigger" v-tooltip="{ content: 'Window tooltip', interactive: false, openDelay: 0 }"
      >Tooltip</Button
    >
    <Slider v-model:value="value" :step="1" :min="0" :max="100" value-indicator />
    <output class="value">{{ value }}</output
    ><output class="selected">{{ selected }}</output
    ><output class="results">{{ results.join('|') }}</output>
  </section>
</template>
<style scoped>
.panel {
  padding: 24px;
}
</style>

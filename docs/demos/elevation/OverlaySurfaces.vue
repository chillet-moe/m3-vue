<script setup lang="ts">
import { ref } from 'vue';
import { Button, Menu, Select, Combobox, Popover, Dialog } from '@/index';
import { vDropdown } from '@/directives/Menu';
import type { MenuContentItem } from '@/components/Menu';
const modal = ref(false);
const native = ref<HTMLDialogElement>();
const menu = ref<{ menuRef?: HTMLDivElement }>();
const popover = ref<{ popoverEl?: HTMLDivElement }>();
const selected = ref('2');
const options = Array.from({ length: 40 }, (_, i) => ({ label: `Workspace ${i + 1}`, value: String(i + 1) }));
const items: MenuContentItem[] = [
  {
    type: 'group',
    items: [
      { label: 'Open', value: 'open' },
      { label: 'Pin workspace', value: 'pin' },
      {
        type: 'submenu',
        label: 'Move to',
        items: [
          { label: 'Personal', value: 'personal' },
          { label: 'Team', value: 'team' },
        ],
      },
    ],
  },
];
</script>
<template>
  <div class="overlay-examples">
    <Button v-dropdown="menu?.menuRef">Menu</Button>
    <Menu ref="menu" :items="items" model-value="pin" />
    <Select v-model="selected" label="Workspace" :options="options" />
    <Combobox v-model="selected" label="Find workspace" :options="options" />
    <Button v-dropdown="popover?.popoverEl">Popover</Button>
    <Popover ref="popover" aria-label="Workspace details"
      ><p>Workspace details</p>
      <Button>Manage workspace</Button></Popover
    >
    <Button @click="modal = true">Dialog</Button>
    <Dialog v-model:open="modal">
      <template #headline>Workspace settings</template>
      <div class="dialog-fields">
        <Select v-model="selected" label="Active workspace" :options="options" />
        <p v-for="i in 12" :key="i">Workspace {{ i }} settings</p>
      </div>
      <template #actions
        ><Button @click="modal = false">Cancel</Button><Button @click="modal = false">Save</Button></template
      >
    </Dialog>
    <Button @click="native?.showModal()">Native dialog</Button>
    <dialog ref="native" class="native-overlay">
      <p class="native-overlay-title" role="heading" aria-level="2">Workspace settings</p>
      <p>A custom surface using the shared tokens.</p>
      <Button @click="native?.close()">Close</Button>
    </dialog>
  </div>
</template>
<style scoped>
.overlay-examples {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
}
.dialog-fields {
  display: grid;
  gap: 1.5rem;
  padding-block: 0.5rem;
}
.native-overlay {
  background: var(--md-overlay-modal-color);
  color: var(--md-overlay-on-container-color);
  border: var(--md-overlay-border-width) solid var(--md-overlay-border-color);
  border-radius: var(--md-shape-overlay);
  box-shadow: var(--md-overlay-modal-elevation);
  padding: 1.5rem;
}
.native-overlay-title {
  font: var(--md-sys-typescale-title-large);
}
.native-overlay::backdrop {
  background: rgb(0 0 0 / 30%);
}
</style>
